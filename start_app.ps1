# AquaSmart AI — Local Launch Script for Windows PowerShell
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "   AquaSmart AI — Aquaculture Feeding & Telemetry Core    " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

$env:Path += ";$env:LOCALAPPDATA\Programs\nodejs"

# 1. Start FastAPI Backend on port 8000
Write-Host "[1/2] Starting FastAPI Backend on http://127.0.0.1:8000..." -ForegroundColor Green
$backendProcess = Start-Process -FilePath "python" -ArgumentList "-m uvicorn app.main:app --host 127.0.0.1 --port 8000" -WorkingDirectory "$PSScriptRoot\backend" -PassThru

Start-Sleep -Seconds 2

# 2. Start Vite React Frontend on port 5173
Write-Host "[2/2] Starting Vite Frontend on http://127.0.0.1:5173..." -ForegroundColor Green
$frontendProcess = Start-Process -FilePath "npm.cmd" -ArgumentList "run dev -- --host 127.0.0.1 --port 5173" -WorkingDirectory "$PSScriptRoot\frontend" -PassThru

Write-Host "`nSystem is running!" -ForegroundColor Cyan
Write-Host "Frontend URL: http://127.0.0.1:5173" -ForegroundColor Yellow
Write-Host "Backend API:  http://127.0.0.1:8000/docs" -ForegroundColor Yellow
Write-Host "Press Ctrl+C or close the terminal to stop." -ForegroundColor Gray
