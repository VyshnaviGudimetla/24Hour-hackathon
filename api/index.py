"""
Vercel Serverless Function Entry Point for AquaSmart AI FastAPI Backend
Handles all /api/* routes through Vercel's Python Serverless Runtime.
"""
import os
import sys

# Ensure repository root and backend directory are on sys.path
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = os.path.dirname(CURRENT_DIR)
BACKEND_DIR = os.path.join(ROOT_DIR, "backend")

for directory in [ROOT_DIR, BACKEND_DIR]:
    if directory not in sys.path:
        sys.path.insert(0, directory)

from app.main import app
