# Resilience Scoring Dashboard v2

A comprehensive web application for assessing landscape resilience to climate hazards including drought, extreme temperatures, riverine flooding, and wildfire.

## 🎯 Features

### Multi-Section Application
- **Intro/Landing Section**: Welcome page with overview and call-to-action
- **How to Use**: Step-by-step guide for using the dashboard
- **Dashboard Tool**: Interactive mapping and analysis tool for resilience scoring
- **Survey**: User feedback collection form
- **Spotlight**: Case studies and real-world applications

### Dashboard Tool Capabilities
- **Hazard Selection**: Choose from 4 hazard types (drought, extreme temp, riverine flooding, wildfire)
- **Boundary Layer Upload**: Define study area with shapefile or GeoJSON
- **Data Inputs**: Upload multiple spatial datasets (vector/raster)
- **Analysis Configuration**: Select and configure analytical metrics
- **Metric Weighting**: Adjust relative importance of each metric
- **Interactive Mapping**: View results on Leaflet map with legend
- **Attribute Tables**: Review detailed scoring data
- **Export**: Download results for further analysis

## 📁 Project Structure

```
resilience-app-v2/
├── backend/
│   ├── main.py              # Python backend (Flask/FastAPI)
│   └── requirements.txt
├── frontend/
│   ├── index.html          # Main HTML with all sections
│   ├── app.js              # JavaScript for tool + survey
│   ├── style.css           # Styling for all sections
│   └── assets/
│       ├── SL_logo.png
│       └── CRSL_logo.png
├── Dockerfile
└── README.md
```

## 🎨 Sections Overview

### 1. Intro Section
- Hero layout with branding
- Key messaging about tool purpose
- Call-to-action buttons to tool and documentation

### 2. How to Use
- 6-step visual guide
- Card-based layout for easy scanning
- Tips for best results

### 3. Dashboard Tool
- Original resilience scoring dashboard
- Full workflow from hazard selection to results
- Interactive map and data visualization

### 4. Survey
- User feedback collection
- Organization and role information
- Usefulness and ease-of-use ratings
- Feature usage tracking
- Open-ended suggestions

### 5. Spotlight
- Case study showcases
- Real-world applications
- Geographic diversity examples
- Call-to-action for user contributions

## 🛠️ Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **UI Framework**: Bootstrap 5.3
- **Icons**: Bootstrap Icons
- **Mapping**: Leaflet.js
- **Backend**: Python (Flask/FastAPI)
- **Geospatial**: GDAL, Rasterio, Geopandas

## 📝 Customization

### Adding New Hazards
Edit the `HAZARDS` object in `app.js` to add new hazard types with their specific inputs and analyses.

### Styling
Modify CSS variables in `style.css` to change colors, fonts, and layout:

```css
:root {
  --primary: #007ac2;
  --nav1: #007ac2;
  --nav2: #0b5a8e;
  /* etc. */
}
```

### Survey Backend Integration
Uncomment and modify the fetch call in `handleSurveySubmit()` in `app.js` to connect to your backend endpoint:

```javascript
const response = await fetch(`${window.API_BASE}/survey`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(formData)
});
```

## 🤝 Contributing

This tool was developed for Sentinel Landscapes. For questions, suggestions, or contributions, please contact the development team.

## 📄 License

[Add your license information here]

## 🙏 Acknowledgments

Built for Sentinel Landscapes to support landscape resilience assessment and natural infrastructure conservation.
