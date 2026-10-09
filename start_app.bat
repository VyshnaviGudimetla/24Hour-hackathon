@echo off
title AquaSmart AI — Aquaculture Feeding Optimizer
color 0B

echo ==========================================================
echo    AquaSmart AI — Precision Aquaculture Optimizer
echo ==========================================================
echo.

set PATH=%PATH%;%LOCALAPPDATA%\Programs\nodejs

echo [1/2] Starting FastAPI Backend on http://127.0.0.1:8000...
start "AquaSmart Backend (FastAPI)" cmd /c "cd /d "%~dp0backend" && python -m uvicorn app.main:app --host 127.0.0.1 --port 8000"

timeout /t 2 /nobreak >nul

echo [2/2] Starting Vite Frontend on http://127.0.0.1:5173...
start "AquaSmart Frontend (Vite)" cmd /c "cd /d "%~dp0frontend" && npm run dev -- --host 127.0.0.1 --port 5173"

echo.
echo ==========================================================
echo    AquaSmart AI is running!
echo ==========================================================
echo  - Frontend Web App:  http://127.0.0.1:5173
echo  - Backend API Docs:  http://127.0.0.1:8000/docs
echo.
echo Press any key to open the application in your browser...
pause >nul
start http://127.0.0.1:5173
