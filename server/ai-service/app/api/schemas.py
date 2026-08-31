from typing import List, Optional
from pydantic import BaseModel, Field

class RecoveryAnalyzeRequest(BaseModel):
    payment_id: str
    customer_id: str
    merchant_id: str
    amount: float = Field(..., gt=0)
    currency: str = "INR"
    payment_method: str = "credit_card"
    failure_code: str = "TRANSIENT_FAILURE"
    attempt_number: int = 1
    prev_successful_payments: int = 5
    prev_failed_payments: int = 0
    customer_ltv: float = 5000.0
    customer_tenure_months: int = 6
    subscription_age_days: int = 90
    days_since_prev_payment: int = 15
    hour_of_day: int = 14
    day_of_week: int = 2
    customer_segment: str = "STANDARD"

class CandidateActionScore(BaseModel):
    action_type: str
    score: float
    cost: float
    friction: str
    eligible: bool

class RecoveryAnalyzeResponse(BaseModel):
    case_id: str
    payment_id: str
    risk_score: float
    recovery_probability: float
    expected_recovery_value: float
    recommended_action: str
    delay_minutes: int
    confidence: float
    reason_codes: List[str]
    explanation: str
    candidate_scores: List[CandidateActionScore]
    model_version: str
    agent_version: str
    prompt_version: str = "RECOVERY_DECISION_PROMPT_V1"
    cache_hit: bool = False
    execution_time_ms: float = 0.0

class ModelMetadataResponse(BaseModel):
    model_name: str
    model_version: str
    trained_at: str
    feature_version: str
    metrics: dict
