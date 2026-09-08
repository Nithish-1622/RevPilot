# PowerShell Script to Start RevPilot Ecosystem
$PSScriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Definition

Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "  RevPilot Platform - Autonomous AI Revenue Recovery" -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Docker Containers
Write-Host "[1/4] Starting Docker Infrastructure (PostgreSQL, Redis, Kafka)..." -ForegroundColor Yellow
docker compose -f "$PSScriptRoot\infrastructure\docker-compose.yml" up -d
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Docker Compose failed to start. Ensure Docker Desktop is running." -ForegroundColor Red
    Exit $LASTEXITCODE
}
Write-Host "[OK] Docker infrastructure started." -ForegroundColor Green
Write-Host ""

# 2. FastAPI Service
Write-Host "[2/4] Launching FastAPI AI Intelligence Service (Port 8000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$PSScriptRoot\server\ai-service'; if (Test-Path 'venv\Scripts\Activate.ps1') { . .\venv\Scripts\Activate.ps1 }; uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"

# 3. Spring Boot Backend
Write-Host "[3/4] Launching Spring Boot Control Plane (Port 8080)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$PSScriptRoot\server\control-plane'; mvn spring-boot:run"

# 4. React Vite Frontend
Write-Host "[4/4] Launching React Vite Frontend (Port 5173)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$PSScriptRoot\client'; npm run dev"

Write-Host ""
Write-Host "===================================================" -ForegroundColor Green
Write-Host "  All RevPilot Services Successfully Started!" -ForegroundColor Green
Write-Host "===================================================" -ForegroundColor Green
Write-Host "  - Docker Infra   : PostgreSQL (5432), Redis (6379), Kafka (9092)" -ForegroundColor White
Write-Host "  - AI Service API : http://localhost:8000 (Docs: http://localhost:8000/docs)" -ForegroundColor White
Write-Host "  - Control Plane  : http://localhost:8080 (Health: http://localhost:8080/actuator/health)" -ForegroundColor White
Write-Host "  - React Client   : http://localhost:5173" -ForegroundColor White
Write-Host "===================================================" -ForegroundColor Green
