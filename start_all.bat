@echo off
echo ===================================================
echo   RevPilot Platform - Autonomous AI Revenue Recovery
echo ===================================================
echo.

echo 1. Starting Docker Containers (PostgreSQL, Redis, Kafka)...
docker compose -f infrastructure/docker-compose.yml up -d
if %errorlevel% neq 0 (
    echo [ERROR] Docker compose failed to start. Please ensure Docker Desktop is running.
    pause
    exit /b %errorlevel%
)
echo [OK] Docker containers started.
echo.

echo 2. Launching FastAPI AI Intelligence Service (Port 8000)...
start "RevPilot - FastAPI AI Engine (Port 8000)" cmd /k "cd /d %~dp0server\ai-service && (if exist venv\Scripts\activate.bat call venv\Scripts\activate.bat) && uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"

echo 3. Launching Spring Boot Control Plane (Port 8080)...
start "RevPilot - Spring Boot Backend (Port 8080)" cmd /k "cd /d %~dp0server\control-plane && mvn spring-boot:run"

echo 4. Launching React Vite Frontend (Port 5173)...
start "RevPilot - React SPA Frontend (Port 5173)" cmd /k "cd /d %~dp0client && npm run dev"

echo.
echo ===================================================
echo   All RevPilot services initiated!
echo ===================================================
echo   - Docker Infrastructure : PostgreSQL (5432), Redis (6379), Kafka (9092)
echo   - AI Service API        : http://localhost:8000 (Docs: http://localhost:8000/docs)
echo   - Control Plane API     : http://localhost:8080 (Health: http://localhost:8080/actuator/health)
echo   - Frontend Client       : http://localhost:5173
echo ===================================================
echo.
pause
