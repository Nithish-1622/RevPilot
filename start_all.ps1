# PowerShell Script to Start RevPilot Ecosystem
$PSScriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Definition

Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "  RevPilot Platform - Autonomous AI Revenue Recovery" -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Docker Containers
Write-Host "[1/4] Checking Docker Engine status..." -ForegroundColor Yellow
docker info > $null 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "[INFO] Docker Desktop is not running. Launching Docker Desktop..." -ForegroundColor Cyan
    $dockerPath = "C:\Program Files\Docker\Docker\Docker Desktop.exe"
    if (Test-Path $dockerPath) {
        Start-Process $dockerPath
    } else {
        try {
            Start-Process "docker-desktop:" -ErrorAction SilentlyContinue
        } catch {
            Write-Host "[WARNING] Could not locate Docker Desktop executable automatically." -ForegroundColor Yellow
        }
    }

    Write-Host "Waiting for Docker Engine to initialize..." -ForegroundColor Yellow
    $waited = 0
    $maxWait = 60
    while ($waited -lt $maxWait) {
        Start-Sleep -Seconds 3
        $waited += 3
        docker info > $null 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "[OK] Docker Engine is ready!" -ForegroundColor Green
            break
        }
        Write-Host "Waiting for Docker Engine... (${waited}s / ${maxWait}s)" -ForegroundColor Yellow
    }
}

Write-Host "Starting Docker Infrastructure (PostgreSQL, Redis, Kafka)..." -ForegroundColor Yellow
docker compose -f "$PSScriptRoot\infrastructure\docker-compose.yml" up -d --remove-orphans
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
