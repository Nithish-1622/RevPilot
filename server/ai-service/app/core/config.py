import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Revpilot AI Intelligence Service"
    API_V1_STR: str = "/api/v1"
    
    # Service Security
    AI_SERVICE_TOKEN: str = os.getenv("AI_SERVICE_TOKEN", "revpilot_ai_service_secret_token_12345")
    
    # Redis
    REDIS_HOST: str = os.getenv("REDIS_HOST", "localhost")
    REDIS_PORT: int = int(os.getenv("REDIS_PORT", 6379))
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379")
    
    # LLM Providers
    LLM_PROVIDER: str = os.getenv("LLM_PROVIDER", "groq")
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    
    # Model Settings
    MODEL_PATH: str = os.getenv("MODEL_PATH", "server/ai-service/models/recovery_lightgbm_v1.joblib")
    METRICS_PATH: str = os.getenv("METRICS_PATH", "server/ai-service/models/metrics_v1.json")
    
    # Prompts
    PROMPT_VERSION: str = "RECOVERY_DECISION_PROMPT_V1"

settings = Settings()
