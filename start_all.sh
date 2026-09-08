#!/usr/bin/env bash
set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

echo "==================================================="
echo "  RevPilot Platform - Autonomous AI Revenue Recovery"
echo "==================================================="
echo

echo "[1/4] Starting Docker Infrastructure (PostgreSQL, Redis, Kafka)..."
docker compose -f "$SCRIPT_DIR/infrastructure/docker-compose.yml" up -d

echo "[2/4] Starting FastAPI AI Intelligence Service (Port 8000)..."
(cd "$SCRIPT_DIR/server/ai-service" && (if [ -f "venv/Scripts/activate" ]; then source venv/Scripts/activate; elif [ -f "venv/bin/activate" ]; then source venv/bin/activate; fi) && uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload) &

echo "[3/4] Starting Spring Boot Control Plane (Port 8080)..."
(cd "$SCRIPT_DIR/server/control-plane" && mvn spring-boot:run) &

echo "[4/4] Starting React SPA Frontend (Port 5173)..."
(cd "$SCRIPT_DIR/client" && npm run dev) &

echo
echo "==================================================="
echo "  All RevPilot Services Started in Background!"
echo "==================================================="
echo "  - Docker Infra   : PostgreSQL (5432), Redis (6379), Kafka (9092)"
echo "  - AI Service API : http://localhost:8000 (Docs: http://localhost:8000/docs)"
echo "  - Control Plane  : http://localhost:8080 (Health: http://localhost:8080/actuator/health)"
echo "  - Frontend Client: http://localhost:5173"
echo "==================================================="

wait
