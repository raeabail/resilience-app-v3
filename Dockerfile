# Devcontainer-friendly Python base (Debian)
ARG VARIANT=3.11
FROM mcr.microsoft.com/vscode/devcontainers/python:${VARIANT}

# ---- System packages for geospatial libs ----
# GDAL/PROJ/GEOS/RTREE + toolchain
RUN apt-get update && apt-get install -y --no-install-recommends \
    gdal-bin libgdal-dev \
    proj-bin proj-data libproj-dev \
    libgeos-dev \
    libspatialindex-dev \
    build-essential \
 && rm -rf /var/lib/apt/lists/*

# Make sure GDAL/PROJ data paths are discoverable
ENV GDAL_DATA=/usr/share/gdal \
    PROJ_DATA=/usr/share/proj

# ---- Workspace setup ----
WORKDIR /workspaces/resilience-app-v2

# Install Python deps into a project venv (cache layer on requirements)
COPY backend/requirements.txt ./backend/requirements.txt
RUN python -m venv .venv \
 && . .venv/bin/activate \
 && pip install --upgrade pip \
 && pip install -r backend/requirements.txt

# Copy app code
COPY backend ./backend
COPY frontend ./frontend
COPY sample_data ./sample_data

# Expose FastAPI port
EXPOSE 8000

# Default command (what “Rebuild & start” will run)
CMD ["/bin/bash", "-lc", ". .venv/bin/activate && cd backend && uvicorn main:app --host 0.0.0.0 --port 8000 --reload"]
# ^ runs FastAPI with autoreload