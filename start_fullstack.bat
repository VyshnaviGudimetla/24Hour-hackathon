@echo off
title AquaSmart AI — Unified Full-Stack Runner
color 0B

echo ==========================================================
echo    AquaSmart AI — Unified Full-Stack Application
echo ==========================================================
echo.

set PATH=%PATH%;%LOCALAPPDATA%\Programs\nodejs

echo [1/2] Building frontend if dist does not exist...
if not exist "frontend\dist" (
    echo Building React production bundle...
    npm --prefix frontend install && npm --prefix frontend run build
)

echo [2/2] Starting unified server on http://localhost:8000...
echo.
echo  - Web Application: http://localhost:8000/
echo  - API Docs:        http://localhost:8000/docs
echo  - Health Check:    http://localhost:8000/api/health
echo.
python run.py
pause
