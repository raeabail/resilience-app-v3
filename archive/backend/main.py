# --- top of main.py ---
import json, os, tempfile, zipfile, pathlib
from typing import Optional, Dict, List
import numpy as np
import pandas as pd
import geopandas as gpd
import rasterio
from rasterstats import zonal_stats
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Codespaces frontend typically looks like: https://<name>-3000.app.github.dev
# Allow any codespaces host on port 3000 (and you can add others if you use Vite/LiveServer, etc.)
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"https://.*-3000\.app\.github\.dev",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def _save_upload_to_temp(upload: UploadFile) -> str:
    """
    Save an UploadFile to a temporary path and return that path.
    Caller is responsible for cleanup (temp files will be removed at container restart).
    """
    suffix = pathlib.Path(upload.filename).suffix.lower()
    fd, path = tempfile.mkstemp(suffix=suffix)
    with os.fdopen(fd, "wb") as out:
        out.write(upload.file.read())
    return path

def read_boundary(boundary_upload: UploadFile) -> gpd.GeoDataFrame:
    """
    Accepts a .zip shapefile or .geojson/.json and returns a GeoDataFrame.
    Ensures it has a CRS (defaults to EPSG:4326 if missing).
    """
    path = _save_upload_to_temp(boundary_upload)
    try:
        ext = pathlib.Path(path).suffix.lower()
        if ext == ".zip":
            # Read zipped shapefile
            gdf = gpd.read_file(f"zip://{path}")
        elif ext in [".geojson", ".json"]:
            gdf = gpd.read_file(path)
        else:
            raise ValueError("Unsupported boundary format. Use .zip (shp) or .geojson/.json")

        if gdf.crs is None:
            # Assume WGS84 if nothing declared
            gdf.set_crs(epsg=4326, inplace=True)

        # Make sure we have a unique index for joining results
        if not gdf.index.is_unique:
            gdf = gdf.reset_index(drop=True)

        # Optional: dissolve multipart, or keep features as-is. We keep as-is.
        return gdf
    finally:
        # keep the temp file – geopandas holds GDAL virtual refs after reading;
        # if you want to clean up immediately for GeoJSON (not zip), you can safely os.remove(path)
        pass

def normalize_0_1(series: pd.Series, method: str = "robust") -> pd.Series:
    """
    Normalize to 0..1. Robust method clips to 1st–99th percentiles to reduce outliers.
    """
    s = series.astype(float)
    if method == "robust":
        lo, hi = s.quantile([0.01, 0.99])
        if hi <= lo:  # degenerate, fall back to min/max
            lo, hi = float(s.min()), float(s.max())
    else:  # minmax
        lo, hi = float(s.min()), float(s.max())

    if np.isfinite(lo) and np.isfinite(hi) and hi > lo:
        s = (s - lo) / (hi - lo)
    else:
        s = pd.Series(0.0, index=series.index)
    return s.clip(0.0, 1.0)

def metric_wri(gdf: gpd.GeoDataFrame, wri_raster: UploadFile) -> pd.Series:
    """
    Compute mean WRI value per polygon using zonal_stats, normalize to [0..1], return Series aligned to gdf.index.
    """
    if wri_raster is None:
        # Nothing uploaded -> all zeros
        return pd.Series(0.0, index=gdf.index)

    # Save raster to temp, open, and ensure polygon CRS matches raster CRS
    tif_path = _save_upload_to_temp(wri_raster)
    with rasterio.open(tif_path) as src:
        rast_crs = src.crs
        nodata = src.nodata

    # Reproject polygons to raster CRS
    work = gdf.to_crs(rast_crs)

    # Compute zonal stats (mean). all_touched=True is often good for coarse pixels on small polygons.
    zs = zonal_stats(
        work["geometry"],
        tif_path,
        stats=["mean"],
        nodata=nodata,
        all_touched=True,
        raster_out=False  # just stats
    )

    # Convert to Series, index aligned to gdf
    means = pd.Series([d.get("mean", np.nan) for d in zs], index=gdf.index)
    means = means.fillna(0.0)

    # Normalize to 0..1 for weighting
    return normalize_0_1(means, method="robust")

def metric_lc_conv(gdf: gpd.GeoDataFrame, lc_change_raster: UploadFile, change_threshold: float = 1.0) -> pd.Series:
    """
    Example metric from an NLCD change raster where "changed" is any pixel value >= threshold.
    Returns proportion of changed pixels per polygon, normalized to [0..1] (already 0..1 by definition).
    """
    if lc_change_raster is None:
        return pd.Series(0.0, index=gdf.index)

    tif_path = _save_upload_to_temp(lc_change_raster)
    with rasterio.open(tif_path) as src:
        rast_crs = src.crs
        nodata = src.nodata

    work = gdf.to_crs(rast_crs)

    # We’ll compute two stats in one pass using categorical=True
    zs = zonal_stats(
        work["geometry"],
        tif_path,
        categorical=True,
        nodata=nodata,
        all_touched=True
    )

    # For categorical rasters, zonal_stats returns counts per value
    props = []
    for d in zs:
        total = sum(v for k, v in d.items() if isinstance(v, (int, float)))
        changed = sum(v for k, v in d.items() if isinstance(k, (int, float)) and k >= change_threshold)
        p = (changed / total) if total else 0.0
        props.append(p)

    series = pd.Series(props, index=gdf.index).fillna(0.0)
    # already 0..1; clip just in case
    return series.clip(0.0, 1.0)

METRIC_FUNS = {
    "wri":      metric_wri,
    "lc_conv":  metric_lc_conv,
    # add more as you implement them:
    # "prox_wet": metric_proximity_to_wetlands,
    # "soil_hsg": metric_hsg, ...
}
@app.post("/score/run")
async def score_run(
    hazard: str = Form(...),
    analyses: str = Form(...),
    weights: str = Form(...),
    boundary_file: UploadFile = File(...),

    # Raster/vector inputs as optional UploadFiles:
    wri_file: Optional[UploadFile] = File(None),
    lc_change_file: Optional[UploadFile] = File(None),
    # ... add the rest here following your IDs with '_file'
):
    selected: List[str] = json.loads(analyses)
    w: Dict[str, float] = json.loads(weights)

    gdf = read_boundary(boundary_file)

    # Map from id -> uploaded file object
    files_by_id = {
        "wri": wri_file,
        "lc_conv": lc_change_file,
        # ...
    }

    metric_cols = {}
    for mid in selected:
        fn = METRIC_FUNS.get(mid)
        if fn:
            metric_cols[mid] = fn(gdf, files_by_id.get(mid))

    df = pd.DataFrame(metric_cols, index=gdf.index).fillna(0.0)

    # Normalize weights defensively (for whatever metrics actually came through)
    w_norm = {k: w.get(k, 0.0) for k in df.columns}
    total_w = sum(w_norm.values()) or 1.0
    w_norm = {k: (v / total_w) for k, v in w_norm.items()}

    final_score = sum(df[c] * w_norm[c] for c in df.columns)

    # Classify 1..5 (equal widths on 0..1 range)
    bins = [0, .2, .4, .6, .8, 1.000001]
    classes = (final_score.clip(0,1)
               .apply(lambda v: 1 if v<.2 else 2 if v<.4 else 3 if v<.6 else 4 if v<.8 else 5))

    # Attach props
    gdf["FINAL_SCORE"] = final_score
    gdf["SCORE_CLASS"] = classes
    for c in df.columns:
        gdf[f"{c.upper()}_NORM"] = df[c]
        gdf[f"W_{c.upper()}"] = w_norm[c]

    # Return GeoJSON
    return json.loads(gdf.to_json())
