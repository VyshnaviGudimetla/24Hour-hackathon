"""
AquaSmart AI — Unified Full-Stack Production & Local Runner
Runs FastAPI which serves both REST API endpoints (/api/...) and the compiled React frontend SPA.
"""
import os
import sys
import uvicorn

# Ensure backend directory is in sys.path
ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.join(ROOT_DIR, "backend")

if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    host = os.environ.get("HOST", "0.0.0.0")

    print("=" * 60)
    print("   AquaSmart AI — Precision Aquaculture Feeding Optimizer")
    print(f"   Unified Full-Stack Server Running on http://{host}:{port}")
    print("=" * 60)
    print(f"   - Frontend Web App: http://{host}:{port}/")
    print(f"   - API Documentation: http://{host}:{port}/docs")
    print(f"   - Health Check:      http://{host}:{port}/api/health")
    print("=" * 60)

    uvicorn.run("app.main:app", host=host, port=port, app_dir=BACKEND_DIR)
