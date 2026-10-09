# AquaSmart AI — Smart Aquaculture Feeding Optimizer

**AquaSmart AI** is a precision aquaculture telemetry and feeding optimization platform that turns raw sensor data, fish population estimates, and computer vision counts into optimal biological feeding decisions.

---

## 🚀 Key Capabilities

- **Farm Dashboard**: Fleet KPI strip showing active registered ponds, total biomass (kg), daily feed required (kg/day), daily feeding budget (₹), and real-time basin water health status.
- **Feeding & Cost Optimizer**: Interactive calculation engine implementing exact double-precision biological formulas for biomass, daily feeding requirements, daily costs, and 30-day budget projections.
- **Water Quality & Telemetry Bus**: Continuous monitoring of Dissolved Oxygen (mg/L), pH, Temperature (°C), Salinity (ppt), and Ammonia NH3/NH4 (mg/L) with configurable alert thresholds and 2-point sensor calibration against standard NIST buffers.
- **Pond Fleet Management**: Complete CRUD supporting **Rectangular**, **Circular**, and **Irregular** pond geometries with real-time water-volume calculation in $m^3$ and Litres.
- **AI Fish Counting Engine**: Optical computer vision pipeline using OpenCV adaptive bilateral CLAHE segmentation and contour blob analysis, with annotated bounding-box visual previews, confidence metrics, and operator manual count override.
- **Alerts & Historical Reports**: Recharts 14-day feeding trends, cost expenditure bar charts, active and resolved alert audit logs, and RFC-4180 compliant CSV export.
- **Pond Activity & Feeding History**: Complete audit trail of past feeding estimates, AI computer vision scans, and water sensor incidents with pond filtering, instant search, and CSV download.
- **Interactive User Guide & Glossary**: Built-in 3-step beginner tour, visual feature guides, and plain-English definitions of core aquaculture parameters (Biomass, FCR, DO, Ammonia).

---

## 🏗️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS, Lucide React, Recharts |
| **Backend** | Python 3.14, FastAPI, Pydantic v2, SQLAlchemy, Uvicorn |
| **Database** | SQLite (persistent `aquasmart.db`) / PostgreSQL ready |
| **AI / Vision** | OpenCV (`opencv-python-headless`), Pillow, NumPy |
| **Automated Testing** | Pytest, FastAPI TestClient (53/53 tests passing) |
| **Deployment** | Docker, Docker Compose, Multi-stage Nginx SPA container |

---

## 🏃 Quick Start (Local Development)

### Prerequisites
- Node.js (v20+) and npm
- Python (3.11+)

### Option 1: Double-Click or Batch Run (Windows)
```cmd
start_app.bat
```
or via PowerShell:
```powershell
.\start_app.ps1
```
This automatically starts both the FastAPI backend on `http://127.0.0.1:8000` and the Vite frontend on `http://127.0.0.1:5173`.

### Option 2: Manual Launch

#### 1. Start Backend:
```powershell
$env:PYTHONPATH="backend"
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
- Interactive Swagger API Docs: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- Health Check: [http://127.0.0.1:8000/api/health](http://127.0.0.1:8000/api/health)

#### 2. Start Frontend:
```powershell
cd frontend
npm install
npm run dev -- --host 127.0.0.1 --port 5173
```
- Open browser at [http://127.0.0.1:5173](http://127.0.0.1:5173)

---

## 🚀 Unified Full-Stack Deployment (Frontend + Backend Together)

The frontend and backend are now completely clubbed together into a single unified deployable service! FastAPI serves both the production React SPA and all `/api/...` endpoints from the same origin and port, eliminating CORS issues and proxy overhead.

### Option 1: 1-Command Local Unified Run
```bash
# 1. Build frontend & start fullstack
npm run build
python run.py
```
Or simply double click **`start_fullstack.bat`** on Windows.
- Full Web Application: [http://localhost:8000](http://localhost:8000)
- Swagger API Documentation: [http://localhost:8000/docs](http://localhost:8000/docs)
- System Health: [http://localhost:8000/api/health](http://localhost:8000/api/health)

### Option 2: Production Cloud Deployment (Render / Railway / Heroku / Fly.io)
Deploy this repository as a single Web Service:
- **Build Command**: `npm run build && pip install -r backend/requirements.txt`
- **Start Command**: `python run.py` (or `web: python run.py` via included `Procfile`)
- Pre-configured `render.yaml` and `Procfile` are included for zero-config deployments.

### Option 3: Docker & Docker Compose
```bash
docker compose up -d --build
```
Builds the unified multi-stage Docker image and exposes the complete application on `http://localhost:8000`.

---

## 🧪 Running Automated Tests

Run the complete backend test suite covering CALC-01..16, VOL-01..10, POND-01..14, WQ-01..14, AI-01..14, and REP-01..11:

```powershell
$env:PYTHONPATH="backend"
python -m pytest backend/tests/ -v
```

Build the frontend production bundle:
```powershell
cd frontend
npm run build
```

---

## 📐 Mathematical Formulas

1. **Biomass (kg)**:
   $$\text{Biomass} = \frac{\text{Fish Count} \times \text{Average Fish Weight (g)}}{1000}$$
2. **Daily Feed Quantity (kg)**:
   $$\text{Daily Feed} = \frac{\text{Biomass} \times \text{Feeding Rate \%}}{100}$$
3. **Daily Feed Cost (₹)**:
   $$\text{Daily Cost} = \text{Daily Feed} \times \text{Feed Price per kg}$$
4. **30-Day Cost Projection (₹)**:
   $$\text{30-Day Cost} = \text{Daily Cost} \times 30$$
5. **Rectangular Pond Volume**:
   $$V = \text{Length} \times \text{Width} \times \text{Depth} \quad (\text{Litres} = V \times 1000)$$
6. **Circular Pond Volume**:
   $$V = \pi \times \left(\frac{\text{Diameter}}{2}\right)^2 \times \text{Depth} \quad (\text{Litres} = V \times 1000)$$
7. **Irregular Pond Volume**:
   $$V = \text{Surface Area} \times \text{Depth} \quad (\text{Litres} = V \times 1000)$$
