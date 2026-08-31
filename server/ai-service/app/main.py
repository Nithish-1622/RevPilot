import sys
import os

# Ensure parent directory is in sys.path for app.* package resolution
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import router as api_router
from app.ml.registry import model_registry
from app.core.config import settings

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_event():
    print("Starting Revpilot AI Service...")
    model_registry.load_models(settings.MODEL_PATH, settings.METRICS_PATH)

@app.get("/health")
def health_check():
    return {
        "status": "HEALTHY",
        "service": "revpilot-ai-service",
        "model_loaded": model_registry.is_loaded,
        "model_version": model_registry.model_version
    }

app.include_router(api_router, prefix=settings.API_V1_STR)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
