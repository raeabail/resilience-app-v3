// =================== ANIMATED COUNTER ===================
// Counter animation for hero stats
function animateCounter(element, target, duration = 2000) {
  const start = 0;
  const increment = target / (duration / 16); // 60fps
  let current = start;
  
  const updateCounter = () => {
    current += increment;
    if (current < target) {
      element.textContent = Math.floor(current);
      requestAnimationFrame(updateCounter);
    } else {
      element.textContent = target;
    }
  };
  
  updateCounter();
}

// Initialize counter animation when stats come into view
function initCounterAnimation() {
  const statsSection = document.querySelector('.hero-stats');
  if (!statsSection) return;
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const statNumbers = entry.target.querySelectorAll('.stat-number');
        statNumbers.forEach((el, index) => {
          const target = parseInt(el.getAttribute('data-target'));
          // Stagger the start of each counter slightly
          setTimeout(() => {
            animateCounter(el, target);
          }, index * 100);
        });
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  
  observer.observe(statsSection);
}

// Initialize on DOM load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCounterAnimation);
} else {
  initCounterAnimation();
}

// =================== CONFIG ===================
const HAZARDS = {
  drought: {
    label: "Drought",
    inputs: [
      { id: "nwi",  label: "Existing Wetlands (NWI) – vector", accept: ".zip,.geojson,.json",
        hint: "Existing wetlands indicate local moisture retention and drought buffering." },
      { id: "wri",  label: "Wetland Restorable Index – raster", accept: ".tif,.tiff",
        hint: "Restoration potential for wetland function; higher values can reduce drought vulnerability." },
      { id: "hsg",  label: "Hydrologic Soil Group – raster", accept: ".tif,.tiff",
        hint: "Soil infiltration/runoff behavior; influences water storage and recharge potential." },
      { id: "droughtveg", label: "Drought-tolerant Vegetation – raster/vector", accept: ".tif,.tiff,.zip,.geojson,.json",
        hint: "Vegetation types adapted to low moisture conditions improve drought resilience." },
      { id: "recharge_polys", label: "High Recharge Areas – vector", accept: ".zip,.geojson,.json",
        hint: "High groundwater recharge capacity areas act as hydrologic refugia." },
      { id: "recharge_rate", label: "Groundwater Recharge Rate – raster", accept: ".tif,.tiff",
        hint: "Estimated recharge intensity; supports baseflows and drought buffering." },
      { id: "lc_change", label: "Land Cover Conversion (NLCD change) – raster", accept: ".tif,.tiff",
        hint: "Recent conversion may reduce water retention and increase stress under drought." },
      { id: "stream_perm", label: "Streamflow Permanence (HUC / table)", accept: ".zip,.geojson,.json,.csv",
        hint: "Perennial/intermittent classification used as context/multiplier for scoring." }
    ],
    analyses: [
      { id: "prox_wet",  label: "Proximity to Wetlands" },
      { id: "wri",       label: "Wetland Restorable Index" },
      { id: "soil_hsg",  label: "Hydrologic Soil Group" },
      { id: "veg_tol",   label: "Drought-Tolerant Vegetation" },
      { id: "prox_rech", label: "Proximity to High Recharge Areas" },
      { id: "rech_rate", label: "Groundwater Recharge Rate" },
      { id: "lc_conv",   label: "Land Cover Conversion" },
      { id: "perm",      label: "Streamflow Permanence (context)" }
    ]
  },

  extreme_temp: {
    label: "Extreme Temperature",
    inputs: [
      { id: "dem", label: "DEM (Elevation/Slope/Aspect) – raster", accept: ".tif,.tiff",
        hint: "Topography modifies heat exposure; north slopes & higher elevations mitigate extremes." },
      { id: "canopy", label: "Tree Canopy Cover – raster", accept: ".tif,.tiff",
        hint: "Shade reduces surface heating and nighttime heat retention." },
      { id: "aws", label: "Available Water Storage (gSSURGO) – raster", accept: ".tif,.tiff",
        hint: "Soils with higher storage moderate heat stress on vegetation." },
      { id: "waterbods", label: "Water Bodies – vector", accept: ".zip,.geojson,.json",
        hint: "Nearby water moderates microclimate; proximity can lower heat exposure." },
      { id: "imperv", label: "Impervious Surface – raster", accept: ".tif,.tiff",
        hint: "Urban surfaces trap heat and elevate local temperatures (UHI effect)." },
      { id: "lc_change", label: "Land Cover Conversion (NLCD change) – raster", accept: ".tif,.tiff",
        hint: "Loss of canopy/greenspace increases exposure to extreme temperatures." },
      { id: "stream_perm", label: "Streamflow Permanence (HUC / table)", accept: ".zip,.geojson,.json,.csv",
        hint: "Context for cooling influence along perennial corridors." }
    ],
    analyses: [
      { id: "topo",     label: "Combined Topographic Factor (Elev., Slope, Aspect)" },
      { id: "canopy",   label: "Mean Tree Canopy Cover" },
      { id: "aws",      label: "Available Water Storage" },
      { id: "prox_wb",  label: "Proximity to Water Body" },
      { id: "imperv",   label: "Impervious Surface" },
      { id: "lc_conv",  label: "Land Cover Conversion" },
      { id: "perm",     label: "Streamflow Permanence (context)" }
    ]
  },

  riverine: {
    label: "Riverine Flooding",
    inputs: [
      { id: "nwi",  label: "Existing Wetlands (NWI) – vector", accept: ".zip,.geojson,.json",
        hint: "Wetlands can attenuate flood peaks and store overbank flows." },
      { id: "wri",  label: "Wetland Restorable Index – raster", accept: ".tif,.tiff",
        hint: "Restoration opportunities that improve floodwater storage and connectivity." },
      { id: "hsg",  label: "Hydrologic Soil Group – raster", accept: ".tif,.tiff",
        hint: "Runoff potential; lower infiltration increases flood susceptibility." },
      { id: "riparian", label: "Riparian Connectivity Index – raster/vector", accept: ".tif,.tiff,.zip,.geojson,.json",
        hint: "Connectivity of riparian corridors supporting floodplain function." },
      { id: "twi",  label: "Topographic Wetness Index – raster", accept: ".tif,.tiff",
        hint: "Relative soil moisture accumulation; proxies saturation and flow convergence." },
      { id: "imperv", label: "Impervious Surface – raster", accept: ".tif,.tiff",
        hint: "Increases runoff and peak flows." },
      { id: "lc_change", label: "Land Cover Conversion (NLCD change) – raster", accept: ".tif,.tiff",
        hint: "Recent conversion can elevate runoff and reduce storage." },
      { id: "fema", label: "FEMA 100/500-yr Floodplains – vector", accept: ".zip,.geojson,.json",
        hint: "Reference extent for flood hazard exposure." },
      { id: "stream_perm", label: "Streamflow Permanence (HUC / table)", accept: ".zip,.geojson,.json,.csv",
        hint: "Context for flow regime; affects flood behavior." }
    ],
    analyses: [
      { id: "prox_wet", label: "Proximity to Wetlands" },
      { id: "wri",      label: "Wetland Restorable Index" },
      { id: "soil_hsg", label: "Hydrologic Soil Group" },
      { id: "riparian", label: "Riparian Connectivity" },
      { id: "twi",      label: "Topographic Wetness Index" },
      { id: "imperv",   label: "Impervious Surface" },
      { id: "lc_conv",  label: "Land Cover Conversion" },
      { id: "fema",     label: "FEMA Floodplain Extent" },
      { id: "perm",     label: "Streamflow Permanence (context)" }
    ]
  },

  wildfire: {
    label: "Wildfire",
    inputs: [
      { id: "rps",    label: "Risk to Potential Structures (RPS) – raster", accept: ".tif,.tiff",
        hint: "Expected annual structures lost; integrates hazard & exposure." },
      { id: "crps",   label: "Conditional RPS (cRPS) – raster", accept: ".tif,.tiff",
        hint: "Expected loss given a fire occurs." },
      { id: "exposure", label: "Exposure Type (Direct/Indirect/None) – raster", accept: ".tif,.tiff",
        hint: "Mode of exposure to structures or values at risk." },
      { id: "bp",     label: "Burn Probability – raster", accept: ".tif,.tiff",
        hint: "Annual likelihood of burning." },
      { id: "cfl",    label: "Conditional Flame Length – raster", accept: ".tif,.tiff",
        hint: "Intensity proxy given a fire occurs." },
      { id: "flep4",  label: "Flame Length Exceedance Probability (4 ft) – raster", accept: ".tif,.tiff",
        hint: "Probability flame length exceeds 4 ft (initial attack threshold)." },
      { id: "flep8",  label: "Flame Length Exceedance Probability (8 ft) – raster", accept: ".tif,.tiff",
        hint: "Probability flame length exceeds 8 ft (crown/torching threshold)." },
      { id: "whp",    label: "Wildfire Hazard Potential – raster", accept: ".tif,.tiff",
        hint: "Composite hazard surface derived from fuels, weather, and topography." }
    ],
    analyses: [
      { id: "rps",   label: "Risk to Potential Structures (RPS)" },
      { id: "crps",  label: "Conditional RPS (cRPS)" },
      { id: "expos", label: "Exposure Type" },
      { id: "bp",    label: "Burn Probability" },
      { id: "cfl",   label: "Conditional Flame Length" },
      { id: "flep4", label: "Flame Length Exceedance – 4 ft" },
      { id: "flep8", label: "Flame Length Exceedance – 8 ft" },
      { id: "whp",   label: "Wildfire Hazard Potential" }
    ]
  },

  land_deg: {
    label: "Land Degradation",
    inputs: [
      { id: "aridity", label: "Aridity Index – raster", accept: ".tif,.tiff",
        hint: "Climatic dryness; higher aridity increases degradation risk." },
      { id: "vegstab", label: "Vegetation Stability Class – raster", accept: ".tif,.tiff",
        hint: "Stability of plant communities under disturbance and climate stress." },
      { id: "lc_change", label: "Land Cover Conversion (NLCD change) – raster", accept: ".tif,.tiff",
        hint: "Recent conversion indicates pressure on ecosystem function." },
      { id: "kfactor", label: "Soil Erodibility K (gSSURGO) – raster", accept: ".tif,.tiff",
        hint: "Intrinsic susceptibility of soils to detachment and transport." },
      { id: "slope", label: "Slope (from DEM) – raster", accept: ".tif,.tiff",
        hint: "Steeper slopes increase erosion potential." },
      { id: "imperv", label: "Impervious Surface – raster", accept: ".tif,.tiff",
        hint: "Fragmentation and runoff driver; reduces infiltration." },
      { id: "droughtfreq", label: "Drought Frequency – table/vector", accept: ".csv,.zip,.geojson,.json",
        hint: "Historical drought occurrence for contextual weighting." }
    ],
    analyses: [
      { id: "aridity", label: "Aridity Index" },
      { id: "vegstab", label: "Vegetation Stability Class" },
      { id: "lc_conv", label: "Land Cover Conversion" },
      { id: "kfactor", label: "Soil Erodibility (K)" },
      { id: "slope",   label: "Slope" },
      { id: "imperv",  label: "Impervious Surface" },
      { id: "drfreq",  label: "Drought Frequency (context)" }
    ]
  }
};

// === WIRES: which inputs feed which analyses, and how to name files for the API ===

// analysis id -> required input ids (by their HAZARDS[].inputs[].id)
const ANALYSIS_TO_INPUTS = {
  // backend metric_wri()
  wri: ["wri"],
  // backend metric_lc_conv()
  lc_conv: ["lc_change"],
  // add more as you implement metrics in METRIC_FUNS
};

// input id -> form field name expected by backend (/score/run)
const INPUT_TO_FORMFIELD = {
  wri: "wri_file",
  lc_change: "lc_change_file",
  // add more as you add parameters in main.py
};

// Theme colors from CSS
const COLORS = [css('--c1'), css('--c2'), css('--c3'), css('--c4'), css('--c5')];
function css(name){ return getComputedStyle(document.documentElement).getPropertyValue(name).trim(); }

// ===== Shortcuts & API base
const $ = (id) => document.getElementById(id);
function apiBase() {
  const el = document.getElementById('apiUrl');
  const val = el?.value?.trim();
  return (val && val !== '') ? val.replace(/\/$/,'') : (window.API_BASE || '');
}

// ===== Global app state
const APP = { hazard:null, boundaryFile:null, inputs:{}, analyses:[], weights:{} };
let STEP = {}; // filled after DOM is ready
const STEP_COMPLETE = { 1: false, 2: false, 3: false, 4: false, 5: false, 6: false };

// ====== Step Completion & Progress Tracking ======
function updateStepStatus(stepNum, isComplete) {
  STEP_COMPLETE[stepNum] = isComplete;
  const statusEl = document.getElementById(`status-${stepNum}`);
  if (statusEl) {
    statusEl.className = 'step-status ' + (isComplete ? 'complete' : 'incomplete');
  }
  updateProgressBar();
  saveProgress();
}

function updateProgressBar() {
  const completed = Object.values(STEP_COMPLETE).filter(v => v).length;
  const percentage = (completed / 6) * 100;
  const progressBar = document.querySelector('.progress-bar');
  const currentStepEl = document.getElementById('currentStep');
  
  if (progressBar) {
    progressBar.style.width = percentage + '%';
  }
  if (currentStepEl) {
    // Find the first incomplete step
    for (let i = 1; i <= 6; i++) {
      if (!STEP_COMPLETE[i]) {
        currentStepEl.textContent = i;
        break;
      }
    }
  }
}

function saveProgress() {
  const state = {
    hazard: APP.hazard,
    boundaryFile: APP.boundaryFile ? APP.boundaryFile.name : null,
    inputs: Object.keys(APP.inputs).map(k => APP.inputs[k]?.name || null),
    analyses: APP.analyses,
    weights: APP.weights,
    stepComplete: STEP_COMPLETE
  };
  localStorage.setItem('resilience-tool-state', JSON.stringify(state));
}

function loadProgress() {
  const saved = localStorage.getItem('resilience-tool-state');
  if (saved) {
    try {
      const state = JSON.parse(saved);
      if (state.hazard) APP.hazard = state.hazard;
      if (state.stepComplete) {
        Object.assign(STEP_COMPLETE, state.stepComplete);
      }
      return state;
    } catch (e) {
      console.warn('Could not load saved progress:', e);
    }
  }
  return null;
}

// ====== Init once DOM is ready ======
window.addEventListener('DOMContentLoaded', () => {
  // Build STEP refs now that DOM exists
  STEP = {
    1: { card: document.querySelector('#stepsAcc > .card.shadow-sm') },
    2: { card: $('s2')?.closest('.accordion-item'), body: $('s2') },
    3: { card: $('s3')?.closest('.accordion-item'), body: $('s3') },
    4: { card: $('s4')?.closest('.accordion-item'), body: $('s4') },
    5: { card: $('s5')?.closest('.accordion-item'), body: $('s5') }
  };

  // Populate the review box whenever Step 6 is opened
document.getElementById('s6')?.addEventListener('show.bs.collapse', () => {
  buildReview();
});

  // Load saved progress
  loadProgress();

  // Initial lock visuals
  setLocked(2, true); setLocked(3, true); setLocked(4, true); setLocked(5, true);
  setOk(1,false); setOk(2,false); setOk(3,false); setOk(4,false); setOk(5,false);

  // Initialize tooltips
  const tooltipElements = document.querySelectorAll('[data-bs-toggle="tooltip"]');
  tooltipElements.forEach(el => {
    new bootstrap.Tooltip(el);
  });

  // Build hazard buttons (exactly once)
  buildHazardButtons();

  // Wire boundary change
  $('boundaryFile')?.addEventListener('change', (e) => {
    APP.boundaryFile = e.target.files?.[0] || null;
    const ok = !!APP.boundaryFile;
    setOk(2, ok);
    updateStepStatus(2, ok);
    setLocked(3, !ok);
    if (ok) openStep(3);
  });

  // Save button
  $('btnSave')?.addEventListener('click', () => {
    saveProgress();
    const msg = $('runMsg');
    if (msg) {
      msg.textContent = '✓ Progress saved!';
      msg.style.color = '#10b981';
      setTimeout(() => { msg.textContent = ''; }, 2000);
    }
  });

  // Map and UI only after DOM ready
  initMap();

  // Run button
  $('btnRun')?.addEventListener('click', onRunClick);

  // Initialize progress bar
  updateProgressBar();
});

// =================== UI helpers ===================
function setLocked(stepNum, locked) {
  const card = STEP[stepNum]?.card;
  if (!card) return;
  card.classList.toggle('step-locked', !!locked);
}

function setOk(stepNum, ok) {
  if (stepNum === 1) {
    // Step 1 is not an accordion, just update the header
    const cardHeader = STEP[stepNum]?.card?.querySelector('.card-header');
    if (cardHeader) {
      cardHeader.classList.toggle('text-primary', !!ok);
    }
  } else {
    const headerBtn = STEP[stepNum]?.card?.querySelector('.accordion-button');
    if (!headerBtn) return;
    headerBtn.classList.toggle('text-primary', !!ok);
    headerBtn.classList.toggle('fw-semibold', !!ok);
    headerBtn.closest('.accordion-item').classList.toggle('step-ok', !!ok);
  }
}

function openStep(stepNum) {
  const btn = STEP[stepNum]?.card?.querySelector('.accordion-button');
  if (!btn) return;
  if (btn.classList.contains('collapsed')) btn.click();
}

// =================== Hazard buttons ===================
function buildHazardButtons() {
  const group = $('hazardGroup');
  if (!group) return;

  group.innerHTML = '';
  Object.entries(HAZARDS).forEach(([key, cfg]) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'hazard-btn btn btn-sm btn-outline-primary';
    btn.textContent = cfg.label;
    btn.addEventListener('click', () => switchHazard(key));
    group.appendChild(btn);
  });
}

function switchHazard(key){
  // declare currentHazard properly
  APP.hazard = key;

  // highlight buttons
  document.querySelectorAll('.hazard-btn').forEach(b=>b.classList.remove('active'));
  const idx = Object.keys(HAZARDS).indexOf(key);
  const groupEl = document.getElementById('hazardGroup');
  if (groupEl && groupEl.children[idx]) groupEl.children[idx].classList.add('active');

  // reset hazard-specific state
  APP.inputs = {};
  APP.analyses = [];
  APP.weights = {};

  // Build UI for steps 2–4
  renderDataInputs();
  renderAnalyses();
  renderWeights();

  // Gate the workflow
  setOk(1, true);
  updateStepStatus(1, true);
  setLocked(2, false);
  setLocked(3, true);
  setLocked(4, true);
  setLocked(5, true);
  setOk(2,false); setOk(3,false); setOk(4,false); setOk(5,false);

  // live review
  buildReview();
  openStep(2);
}

// =================== Map ===================
let map, parcelLayer, layerControl;

function initMap(){
  map = L.map('map').setView([38, -96], 5);

  map.createPane('labels');
  map.getPane('labels').style.zIndex = 650;
  map.getPane('labels').style.pointerEvents = 'none';
  map.createPane('results');
  map.getPane('results').style.zIndex = 610;

  const ESRI_IMAGERY = L.tileLayer(
    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    { attribution: 'Tiles © Esri' }
  );
  const ESRI_LABELS = L.tileLayer(
    'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
    { pane:'labels', attribution:'Labels © Esri' }
  );
  const ESRI_TOPO = L.tileLayer(
    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
    { attribution: 'Tiles © Esri' }
  );
  const OSM_STREETS = L.tileLayer(
    'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    { maxZoom:19, attribution:'© OpenStreetMap' }
  );
  const CARTO_LIGHT = L.tileLayer(
    'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    { attribution:'© Carto' }
  );
  const CARTO_DARK = L.tileLayer(
    'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    { attribution:'© Carto' }
  );

  ESRI_IMAGERY.addTo(map);
  ESRI_LABELS.addTo(map);

  layerControl = L.control.layers(
    {
      "Imagery (Esri)": ESRI_IMAGERY,
      "Topo (Esri)": ESRI_TOPO,
      "Streets (OSM)": OSM_STREETS,
      "Light (Carto)": CARTO_LIGHT,
      "Dark (Carto)": CARTO_DARK
    },
    { "Labels (Esri)": ESRI_LABELS },
    { position:'topright', collapsed:true }
  ).addTo(map);

  L.control.scale({ metric:true, imperial:true }).addTo(map);
}

// =================== Render panels ===================
function renderDataInputs(){
  const box = $('dataInputs');
  box.innerHTML = '';
  const items = HAZARDS[APP.hazard]?.inputs || [];

  items.forEach(inp=>{
    const group = document.createElement('div');
    group.className = 'mb-3';

    const infoIcon = inp.hint
      ? `<i class="bi bi-info-circle ms-1 text-muted"
            data-bs-toggle="tooltip"
            data-bs-placement="right"
            title="${inp.hint.replace(/"/g,'&quot;')}"
            style="cursor: help;"></i>` : '';

    group.innerHTML = `
      <label class="form-label d-flex align-items-center gap-2">
        <span>${inp.label}</span>
        ${inp.accept ? `<span class="badge bg-light text-dark border badge-step">${inp.accept}</span>` : ''}
        ${infoIcon}
      </label>
      <input type="file" id="file_${inp.id}" class="form-control form-control-sm" accept="${inp.accept||''}">
    `;
    box.appendChild(group);

    group.querySelector('input').addEventListener('change', (e)=>{
      const f = e.target.files?.[0] || null;
      if (f) APP.inputs[inp.id] = f; else delete APP.inputs[inp.id];

      const anyInput = Object.keys(APP.inputs).length > 0;
      setOk(3, anyInput);
      updateStepStatus(3, anyInput);
      setLocked(4, !anyInput);

      // update review
      buildReview();
    });
  });

  // Bootstrap tooltips
  [...document.querySelectorAll('[data-bs-toggle="tooltip"]')].forEach(el => new bootstrap.Tooltip(el));
}

function renderAnalyses(){
  const box = $('analysesBox');
  box.innerHTML = '';
  APP.analyses = []; // reset

  HAZARDS[APP.hazard].analyses.forEach(a=>{
    const id = `chk_${a.id}`;
    const row = document.createElement('div');
    row.className = 'form-check mb-1';
    row.innerHTML = `
      <input class="form-check-input" type="checkbox" id="${id}">
      <label class="form-check-label" for="${id}">${a.label}</label>
    `;
    box.appendChild(row);

    row.querySelector('input').addEventListener('change',(e)=>{
      if (e.target.checked) {
        if (!APP.analyses.includes(a.id)) APP.analyses.push(a.id);
      } else {
        APP.analyses = APP.analyses.filter(k => k !== a.id);
      }
      const ok = APP.analyses.length > 0;
      setOk(4, ok);
      updateStepStatus(4, ok);
      setLocked(5, !ok);      // unlock/lock Step 5 only
      renderWeights();        // keep weights panel synced
      
      buildReview();
    });
  });
}

function renderWeights(){
  const box = $('weightsBox');
  box.innerHTML = '';

  const ids = APP.analyses.slice();
  if (!ids.length) {
    setOk(5, false);
    return;
  }

  // Initialize equal weights for any *new* analysis
  ids.forEach(id => {
    if (APP.weights[id] == null) {
      const equal = 1 / ids.length;
      APP.weights[id] = equal;
    }
  });

  // Header with total only (moved Normalize to the bottom)
  const header = document.createElement('div');
  header.className = 'd-flex justify-content-between align-items-center mb-2';
  header.innerHTML = `
    <div class="small text-muted">Adjust metric importance</div>
    <div class="d-flex align-items-center gap-2">
      <span class="badge bg-light text-dark border">Total: <span id="w_total">0.00</span></span>
    </div>
  `;
  box.appendChild(header);

  // Build sliders only for selected analyses
  const byId = Object.fromEntries(HAZARDS[APP.hazard].analyses.map(a=>[a.id,a]));
  ids.forEach(id=>{
    const a = byId[id]; if (!a) return;
    const sliderId = `w_${id}`;
    const init = +APP.weights[id];

    const row = document.createElement('div');
    row.className = 'mb-3';
    row.innerHTML = `
      <label class="form-label d-flex justify-content-between align-items-center">
        <span>${a.label}</span>
        <span class="text-muted"><span id="${sliderId}_pct">${(init*100).toFixed(1)}%</span></span>
      </label>
      <input type="range" min="0" max="1" step="any" value="${isFinite(init)?init:0}" class="form-range" id="${sliderId}">
    `;
    box.appendChild(row);

    // input listener
    const inputEl = row.querySelector('input');
      inputEl.addEventListener('input', e=>{
        const v = clamp01(+e.target.value);
        APP.weights[id] = v;
        $(sliderId+'_pct').textContent = Math.round(v*100) + '%';
        updateWeightsUI();
        
        // Mark step 5 as complete if all weights are adjusted
        const allWeightsSet = ids.every(id => APP.weights[id] != null && APP.weights[id] >= 0);
        updateStepStatus(5, allWeightsSet);
        
        buildReview();
      });
  });

  // Footer with Normalize button (moved here)
  const footer = document.createElement('div');
  footer.className = 'd-flex justify-content-end mt-2';
  footer.innerHTML = `
    <button type="button" id="btnNormalize" class="btn btn-sm btn-outline-secondary">Normalize</button>
  `;
  box.appendChild(footer);

// Normalize button
$('btnNormalize').addEventListener('click', ()=>{
  normalizeWeights();
  
  // Mark step 5 as complete
  const ids = APP.analyses.slice();
  const allWeightsSet = ids.every(id => APP.weights[id] != null && APP.weights[id] >= 0);
  updateStepStatus(5, allWeightsSet);
  
  // refresh slider texts
  ids.forEach(id=>{
    const v = clamp01(APP.weights[id] ?? 0);
    const sid = `w_${id}`;
    const el = $(sid);
    if (el) el.value = v;

    const pctEl = $(sid + '_pct'); 
    if (pctEl) pctEl.textContent = Math.round(v * 100) + '%';
  });
  updateWeightsUI();
  buildReview();
});

  normalizeWeights();
  updateWeightsUI();

  setOk(5, true);
  setLocked(5, false);

};

function clamp01(x){ return Math.max(0, Math.min(1, x||0)); }
function normalizeWeights(){
  const ids = APP.analyses.slice();
  let sum = ids.reduce((s,id)=>s + clamp01(APP.weights[id] ?? 0), 0);
  if (sum <= 0) {
    const equal = 1 / Math.max(1, ids.length);
    ids.forEach(id => APP.weights[id] = equal);
    return;
  }
  ids.forEach(id => { APP.weights[id] = clamp01((APP.weights[id] ?? 0) / sum); });
}
function weightsSum(){ return APP.analyses.reduce((s,id)=>s + clamp01(APP.weights[id] ?? 0), 0); }
function updateWeightsUI(){
  const total = weightsSum();
  const tEl = $('w_total');
  if (tEl) {
    tEl.textContent = Math.round(total * 100) + '%';
    const badge = tEl.parentElement?.parentElement;
    const off = Math.abs(total - 1) > 0.001;
    if (badge) {
      badge.classList.toggle('text-danger', off);
      badge.classList.toggle('text-success', !off);
    }
  }
}

// =================== Review & Run ===================
function buildReview(){
  const cfg = HAZARDS[APP.hazard] || { label:'—', inputs:[], analyses:[] };
  const hazardLabel = cfg.label;

  // Inputs uploaded
  const selectedInputs = Object.entries(APP.inputs || {})
    .map(([id, f]) => {
      const label = (cfg.inputs || []).find(inp => inp.id === id)?.label || id;
      return `<li>${escapeHtml(label)}: <em>${escapeHtml(f.name)}</em></li>`;
    }).join('');

  // Analyses + weights
  const rows = APP.analyses.map(id => ({
    id,
    label: (cfg.analyses.find(a=>a.id===id)?.label) || id,
    w: APP.weights[id] ?? 0
  }));

  // ✅ declare once
  const wTotal = weightsSum();
  const totalPct = Math.round(wTotal * 100);
  const totalOk = Math.abs(wTotal - 1) <= 1e-3;

  const analysesHtml = rows.length
    ? `
      <table class="table table-sm align-middle mb-1">
        <thead>
          <tr><th>Metric</th><th class="text-end">Weight</th></tr>
        </thead>
        <tbody>
          ${rows.map(r => `
            <tr>
              <td>${escapeHtml(r.label)}</td>
              <td class="text-end">${Math.round(r.w * 100)}%</td>
            </tr>`).join('')}
        </tbody>
      </table>
      <div class="small ${totalOk ? 'text-success' : 'text-danger'}">
        Total: ${totalPct}% ${totalOk ? '' : '(must equal 100%)'}
      </div>
    `
    : '—';

  $('reviewBox').innerHTML = `
    <div class="mb-2"><strong>Hazard:</strong> ${escapeHtml(hazardLabel)}</div>
    <div class="mb-2"><strong>Boundary:</strong> ${escapeHtml(APP.boundaryFile?.name || '—')}</div>
    ${selectedInputs ? `<div class="mb-2"><strong>Inputs</strong><ul class="mb-0">${selectedInputs}</ul></div>` : ''}
    <div class="mb-2"><strong>Analyses & Weights</strong>${analysesHtml}</div>
  `;

  // Step 6 completion
  const step6Complete =
    !!APP.hazard &&
    !!APP.boundaryFile &&
    APP.analyses.length > 0 &&
    totalOk;

  updateStepStatus(6, step6Complete);
}

async function onRunClick(){
  if (!APP.hazard) { $('runMsg').textContent='Choose a hazard first.'; openStep(1); return; }
  if (!APP.boundaryFile) { $('runMsg').textContent='Upload a boundary layer.'; openStep(2); return; }
  if (!APP.analyses.length) { $('runMsg').textContent='Select at least one analysis.'; openStep(4); return; }

  const total = weightsSum();
  if (Math.abs(total - 1) > 0.001) {
    $('runMsg').textContent = `Weights must sum to 1. Current total = ${total.toFixed(2)}.`;
    openStep(5);
    return;
  }

  buildReview(); // show the review *before* we run

$('runMsg').textContent = 'Uploading…';

const fd = new FormData();
// required meta
fd.append('hazard', APP.hazard);
fd.append('analyses', JSON.stringify(APP.analyses));
fd.append('weights', JSON.stringify(APP.weights));

// required boundary -> backend expects 'boundary_file'
if (!APP.boundaryFile) {
  $('runMsg').textContent = 'Upload a boundary layer.';
  openStep(2);
  return;
}
fd.append('boundary_file', APP.boundaryFile);

// collect all inputs needed by the selected analyses
const neededInputIds = new Set();
for (const a of APP.analyses) {
  const needs = ANALYSIS_TO_INPUTS[a] || [];
  needs.forEach(id => neededInputIds.add(id));
}

// validate & append those files using the API field names
for (const inpId of neededInputIds) {
  const fileObj = APP.inputs[inpId];
  const formName = INPUT_TO_FORMFIELD[inpId];
  if (!fileObj) {
    $('runMsg').textContent = `Missing file for "${inpId}" required by your selected analyses.`;
    openStep(3);
    return;
  }
  if (!formName) {
    $('runMsg').textContent = `No form field mapping for input "${inpId}".`;
    console.error('INPUT_TO_FORMFIELD missing:', inpId);
    return;
  }
  fd.append(formName, fileObj);
}

  console.log('apiBase()', apiBase() )
  
  try {
    const resp = await fetch(apiBase() + '/score/run', { method:'POST', body: fd });
    if (!resp.ok) {
      const txt = await resp.text().catch(()=> '');
      throw new Error(`API error ${resp.status}: ${txt || 'No details'}`);
    }
    const out = await resp.json();

    // Draw results
    if (parcelLayer) { layerControl.removeLayer(parcelLayer); map.removeLayer(parcelLayer); }
    parcelLayer = L.geoJSON(out, {
      pane: 'results',
        style: f => {
          const sc = f.properties?.SCORE_CLASS || 1;
          return { color:'#333', weight:.5, fillColor: COLORS[sc-1], fillOpacity:.7 };
},

      onEachFeature: (f, layer) =>
        layer.bindPopup(`<pre class="mb-0">${escapeHtml(JSON.stringify(f.properties,null,2))}</pre>`)
    }).addTo(map);
    layerControl.addOverlay(parcelLayer, 'Results');
    try { map.fitBounds(parcelLayer.getBounds(), { padding:[20,20] }); } catch {}

    // Show legend + table
    document.getElementById('legendCard')?.classList.remove('d-none');
    drawLegend();
    drawTable(out);
    document.getElementById('tableCard')?.classList.toggle('d-none', !(out.features?.length));

    $('runMsg').textContent = 'Done.';
  } catch (e) {
    console.error(e);
    $('runMsg').textContent = 'Run failed. See console.';
  }
}

// =================== Legend & Table ===================
function drawLegend(){
  const legendCard = $('legendCard');
  const el = $('legend');
  el.innerHTML = '';

  if (!parcelLayer || !parcelLayer.getLayers().length) {
    legendCard?.classList.add('d-none');
    setTimeout(() => map.invalidateSize(), 50);
    return;
  }

  [
    ['1 (lowest)', COLORS[0]],
    ['2', COLORS[1]],
    ['3', COLORS[2]],
    ['4', COLORS[3]],
    ['5 (highest)', COLORS[4]]
  ].forEach(([t,c])=>{
    const row = document.createElement('div');
    row.className = 'mb-1';
    row.innerHTML = `<span class="swatch" style="background:${c}"></span><span>${t}</span>`;
    el.appendChild(row);
  });

  legendCard?.classList.remove('d-none');
  setTimeout(() => map.invalidateSize(), 50);
}

function drawTable(fc){
  const tableCard = $('tableCard');
  const head = $('tblHead'), body = $('tblBody');
  body.innerHTML = ''; head.innerHTML = '';

  const hasRows = Array.isArray(fc?.features) && fc.features.length > 0;
  if (!hasRows) {
    tableCard?.classList.add('d-none');
    setTimeout(() => map.invalidateSize(), 50);
    return;
  }

  const cols = Object.keys(fc.features[0].properties || {});
  head.innerHTML = `<tr>${cols.map(c=>`<th>${escapeHtml(c)}</th>`).join('')}</tr>`;
  fc.features.slice(0,200).forEach(feat=>{
    const tds = cols.map(c => `<td>${escapeHtml(String(feat.properties?.[c] ?? ''))}</td>`).join('');
    body.insertAdjacentHTML('beforeend', `<tr>${tds}</tr>`);
  });

  tableCard?.classList.remove('d-none');
  setTimeout(() => map.invalidateSize(), 50);
}

function escapeHtml(s){
  return s.replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}

/* =====================================================
   HERO EFFECTS: STATS COUNTER & PARALLAX
   ===================================================== */

// Animated Stats Counter
function animateHeroCounter(element) {
  const target = parseInt(element.getAttribute('data-target'));
  const duration = 2000;
  const increment = target / (duration / 16);
  let current = 0;

  const updateCounter = () => {
    current += increment;
    if (current < target) {
      element.textContent = Math.floor(current).toLocaleString();
      requestAnimationFrame(updateCounter);
    } else {
      element.textContent = target.toLocaleString();
    }
  };
  updateCounter();
}

// Parallax Scroll Effect
function handleParallax() {
  const heroContent = document.querySelector('[data-parallax]');
  if (!heroContent) return;

  const scrolled = window.pageYOffset;
  const rate = parseFloat(heroContent.getAttribute('data-parallax'));
  heroContent.style.transform = `translateY(${scrolled * rate}px)`;
}

// Initialize on page load
let statsAnimated = false;
const observerOptions = {
  threshold: 0.5
};

const statsObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting && !statsAnimated) {
      const statNumbers = document.querySelectorAll('.stat-number');
      statNumbers.forEach(stat => animateHeroCounter(stat));
      statsAnimated = true;
    }
  });
}, observerOptions);

const heroStats = document.querySelector('.hero-stats');
if (heroStats) {
  statsObserver.observe(heroStats);
}

// Parallax on scroll
window.addEventListener('scroll', handleParallax);

/* =====================================================
   SURVEY FORM HANDLER
   ===================================================== */
document.addEventListener('DOMContentLoaded', function() {
  const surveyForm = document.getElementById('surveyForm');
  if (surveyForm) {
    surveyForm.addEventListener('submit', function(e) {
      e.preventDefault();
      handleSurveySubmit();
    });
  }

  // Smooth scroll for navigation links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href !== '#' && href.length > 1) {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          // Close mobile menu if open
          const navCollapse = document.getElementById('navbarNav');
          if (navCollapse && navCollapse.classList.contains('show')) {
            const bsCollapse = new bootstrap.Collapse(navCollapse);
            bsCollapse.hide();
          }
        }
      }
    });
  });

  // Update active nav link on scroll
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
  
  function updateActiveNav() {
    let current = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.clientHeight;
      if (window.scrollY >= sectionTop - 100) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  }

  window.addEventListener('scroll', updateActiveNav);
  updateActiveNav(); // Initial call
});

async function handleSurveySubmit() {
  const surveyMessage = document.getElementById('surveyMessage');
  const submitBtn = document.querySelector('#surveyForm button[type="submit"]');
  
  // Collect form data
  const formData = {
    organization: document.getElementById('organization').value,
    role: document.getElementById('role').value,
    useCase: document.getElementById('useCase').value,
    usefulness: document.querySelector('input[name="usefulness"]:checked')?.value,
    easeOfUse: document.querySelector('input[name="easeOfUse"]:checked')?.value,
    hazards: Array.from(document.querySelectorAll('input[name="hazards"]:checked')).map(cb => cb.value),
    suggestions: document.getElementById('suggestions').value,
    timestamp: new Date().toISOString()
  };

  // Validate required fields
  if (!formData.organization || !formData.role || !formData.usefulness || !formData.easeOfUse) {
    surveyMessage.className = 'alert alert-warning mt-3';
    surveyMessage.textContent = 'Please fill in all required fields.';
    surveyMessage.classList.remove('d-none');
    return;
  }

  // Disable submit button
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Submitting...';

  try {
    // In a real implementation, you would send this to your backend
    // For now, we'll just simulate a successful submission
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Uncomment and modify this when you have a backend endpoint:
    // const response = await fetch(`${window.API_BASE}/survey`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(formData)
    // });
    // if (!response.ok) throw new Error('Submission failed');

    // Success
    surveyMessage.className = 'alert alert-success mt-3';
    surveyMessage.innerHTML = '<i class="bi bi-check-circle me-2"></i>Thank you for your feedback!';
    surveyMessage.classList.remove('d-none');
    
    // Reset form
    document.getElementById('surveyForm').reset();
    
    // Log to console (for development)
    console.log('Survey submitted:', formData);
    
  } catch (error) {
    // Error
    surveyMessage.className = 'alert alert-danger mt-3';
    surveyMessage.innerHTML = '<i class="bi bi-exclamation-circle me-2"></i>An error occurred. Please try again.';
    surveyMessage.classList.remove('d-none');
    console.error('Survey submission error:', error);
  } finally {
    // Re-enable submit button
    submitBtn.disabled = false;
    submitBtn.innerHTML = '<i class="bi bi-send me-2"></i>Submit Survey';
  }
}
