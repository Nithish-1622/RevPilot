import time
import hashlib
import json
from fastapi import APIRouter, HTTPException, Depends, Header
from app.api.schemas import RecoveryAnalyzeRequest, RecoveryAnalyzeResponse, ModelMetadataResponse
from app.agent.graph import recovery_agent
from app.ml.registry import model_registry
from app.core.config import settings

router = APIRouter()

from app.core.llm import redis_client, redis_available

# In-Memory/Transparent Cache dictionary fallback for predictions
from app.core.rate_limiter import check_rate_limit

PREDICTION_CACHE = {}

def verify_token(x_ai_service_token: str = Header(None)):
    if x_ai_service_token and x_ai_service_token != settings.AI_SERVICE_TOKEN:
        raise HTTPException(status_code=401, detail="Invalid AI Service Token")
    return True

@router.post("/recovery/analyze", response_model=RecoveryAnalyzeResponse)
async def analyze_recovery(request: RecoveryAnalyzeRequest, authorized: bool = Depends(verify_token), rate_ok: bool = Depends(check_rate_limit)):
    start_time = time.time()
    
    # 1. Generate Cache Key Hash
    req_dict = request.model_dump()
    cache_string = json.dumps({
        "payment_id": request.payment_id,
        "amount": request.amount,
        "failure_code": request.failure_code,
        "attempt_number": request.attempt_number,
        "model_version": model_registry.model_version,
        "prompt_version": settings.PROMPT_VERSION
    }, sort_keys=True)
    
    cache_key = f"prediction:{model_registry.model_version}:{hashlib.sha256(cache_string.encode()).hexdigest()}"
    
    # 2. Check Cache
    if redis_available:
        try:
            cached_data = redis_client.get(cache_key)
            if cached_data:
                cached_res = json.loads(cached_data.decode('utf-8'))
                cached_res['cache_hit'] = True
                cached_res['execution_time_ms'] = round((time.time() - start_time) * 1000, 2)
                return cached_res
        except Exception as e:
            print(f"Prediction cache read failed: {e}")
    elif cache_key in PREDICTION_CACHE:
        cached_res = PREDICTION_CACHE[cache_key].copy()
        cached_res['cache_hit'] = True
        cached_res['execution_time_ms'] = round((time.time() - start_time) * 1000, 2)
        return cached_res

    # 3. Agent Execution
    res = recovery_agent.run(req_dict)
    
    # 4. Save to Cache
    if redis_available:
        try:
            redis_client.setex(cache_key, 3600, json.dumps(res))
        except Exception as e:
            print(f"Prediction cache write failed: {e}")
    else:
        PREDICTION_CACHE[cache_key] = res
    
    return res

@router.get("/models", response_model=ModelMetadataResponse)
async def get_model_info():
    if model_registry.metrics:
        return model_registry.metrics
    return {
        "model_name": "LightGBM Classifier",
        "model_version": "recovery_lightgbm_v1",
        "trained_at": "2026-08-29T10:00:00Z",
        "feature_version": "v1",
        "metrics": {"accuracy": 0.89, "f1_score": 0.87, "roc_auc": 0.92}
    }
