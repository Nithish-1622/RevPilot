import os
import sys
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.api.schemas import RecoveryAnalyzeRequest, RecoveryAnalyzeResponse
from app.agent.graph import recovery_agent
from app.ml.registry import model_registry
from app.core.llm import llm_service, GroqProvider, OpenAICompatibleProvider, FallbackProvider

client = TestClient(app)

# 1. API Health & Models Endpoint Tests
def test_health_check_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "HEALTHY"
    assert "service" in data

def test_models_metadata_endpoint():
    response = client.get("/api/v1/models")
    assert response.status_code == 200
    data = response.json()
    assert "model_name" in data
    assert "model_version" in data
    assert "metrics" in data

# 2. Security & Token Verification Tests
def test_invalid_auth_token():
    response = client.post(
        "/api/v1/recovery/analyze",
        headers={"X-AI-Service-Token": "invalid_secret_token"},
        json={"payment_id": "p1", "customer_id": "c1", "merchant_id": "m1", "amount": 500}
    )
    assert response.status_code == 401

def test_valid_auth_token():
    response = client.post(
        "/api/v1/recovery/analyze",
        headers={"X-AI-Service-Token": "revpilot_ai_service_secret_token_12345"},
        json={"payment_id": "p1", "customer_id": "c1", "merchant_id": "m1", "amount": 500}
    )
    assert response.status_code == 200

# 3. Request Harness Validation & Safety Tests
def test_negative_amount_validation():
    response = client.post(
        "/api/v1/recovery/analyze",
        json={"payment_id": "p1", "customer_id": "c1", "merchant_id": "m1", "amount": -100}
    )
    assert response.status_code == 422  # Pydantic validation error

def test_zero_amount_validation():
    response = client.post(
        "/api/v1/recovery/analyze",
        json={"payment_id": "p1", "customer_id": "c1", "merchant_id": "m1", "amount": 0}
    )
    assert response.status_code == 422

# 4. ML Registry & Inference Tests
def test_ml_registry_fallback_prediction():
    prob_transient = model_registry.predict_probability({"failure_code": "TRANSIENT_FAILURE"})
    assert 0.0 <= prob_transient <= 1.0

def test_ml_registry_fraud_prediction():
    prob_fraud = model_registry.predict_probability({"failure_code": "FRAUD_SUSPECTED"})
    assert prob_fraud < 0.20

def test_ml_registry_insufficient_funds():
    prob_funds = model_registry.predict_probability({"failure_code": "INSUFFICIENT_FUNDS"})
    assert 0.0 <= prob_funds <= 1.0

# 5. LLM Provider Abstraction Tests
def test_fallback_provider():
    provider = FallbackProvider()
    res = provider.generate("test prompt")
    assert res == ""

def test_groq_provider_missing_key():
    provider = GroqProvider(api_key="")
    with pytest.raises(ValueError):
        provider.generate("test prompt")

def test_openai_provider_missing_key():
    provider = OpenAICompatibleProvider(api_key="")
    with pytest.raises(ValueError):
        provider.generate("test prompt")

def test_llm_service_explanation():
    exp = llm_service.generate_explanation("TRANSIENT_FAILURE", 0.88, "RETRY_NOW", 1500)
    assert isinstance(exp, str)
    assert len(exp) > 0

# 6. LangGraph Workflow & State Graph Node Tests
def test_langgraph_transient_failure_execution():
    res = recovery_agent.run({
        "payment_id": "pay_test_001",
        "amount": 2500.0,
        "failure_code": "TRANSIENT_FAILURE",
        "attempt_number": 1
    })
    assert res["case_id"] == "REC-pay_test_001"
    assert 0.0 <= res["risk_score"] <= 1.0
    assert 0.0 <= res["recovery_probability"] <= 1.0
    assert res["recommended_action"] in ['RETRY_NOW', 'RETRY_LATER', 'SEND_PAYMENT_REMINDER', 'REQUEST_PAYMENT_UPDATE', 'OFFER_INCENTIVE', 'HUMAN_ESCALATION', 'STOP_RECOVERY']

def test_langgraph_fraud_suspected_execution():
    res = recovery_agent.run({
        "payment_id": "pay_test_002",
        "amount": 10000.0,
        "failure_code": "FRAUD_SUSPECTED",
        "attempt_number": 1
    })
    assert res["recommended_action"] == "STOP_RECOVERY"

def test_langgraph_attempt_limit_execution():
    res = recovery_agent.run({
        "payment_id": "pay_test_003",
        "amount": 1200.0,
        "failure_code": "TRANSIENT_FAILURE",
        "attempt_number": 3
    })
    # Retry now/later ineligible after 3 attempts
    for candidate in res["candidate_scores"]:
        if candidate["action_type"] in ["RETRY_NOW", "RETRY_LATER"]:
            assert candidate["eligible"] is False

# 7. Candidate Scoring & Net Value Math Tests
def test_candidate_scoring_eligibility():
    dummy_state = {
        "amount": 500.0,
        "recovery_probability": 0.85,
        "failure_code": "EXPIRED_CARD",
        "attempt_number": 1,
        "candidates": recovery_agent._node_generate_candidate_actions({"amount": 500.0})["candidates"]
    }
    res = recovery_agent._node_score_actions_deterministically(dummy_state)
    card_update = next(c for c in res["candidates"] if c["action_type"] == "REQUEST_PAYMENT_UPDATE")
    assert card_update["eligible"] is True

def test_incentive_amount_threshold():
    dummy_small = {
        "amount": 500.0,
        "recovery_probability": 0.90,
        "failure_code": "TRANSIENT_FAILURE",
        "attempt_number": 1,
        "candidates": recovery_agent._node_generate_candidate_actions({"amount": 500.0})["candidates"]
    }
    res_small = recovery_agent._node_score_actions_deterministically(dummy_small)
    incentive_small = next(c for c in res_small["candidates"] if c["action_type"] == "OFFER_INCENTIVE")
    assert incentive_small["eligible"] is False

    dummy_large = {
        "amount": 2000.0,
        "recovery_probability": 0.90,
        "failure_code": "TRANSIENT_FAILURE",
        "attempt_number": 1,
        "candidates": recovery_agent._node_generate_candidate_actions({"amount": 2000.0})["candidates"]
    }
    res_large = recovery_agent._node_score_actions_deterministically(dummy_large)
    incentive_large = next(c for c in res_large["candidates"] if c["action_type"] == "OFFER_INCENTIVE")
    assert incentive_large["eligible"] is True

# 8. End-to-End API Analyze Flow & Cache Test
import uuid

def test_analyze_endpoint_e2e():
    unique_pay_id = f"pay_e2e_{uuid.uuid4()}"
    payload = {
        "payment_id": unique_pay_id,
        "customer_id": "cust_100",
        "merchant_id": "merch_100",
        "amount": 1800.0,
        "failure_code": "INSUFFICIENT_FUNDS",
        "attempt_number": 1
    }
    res1 = client.post("/api/v1/recovery/analyze", json=payload).json()
    assert res1["payment_id"] == unique_pay_id
    assert res1["cache_hit"] is False

    # Second call should return cache hit
    res2 = client.post("/api/v1/recovery/analyze", json=payload).json()
    assert res2["payment_id"] == unique_pay_id
    assert res2["cache_hit"] is True
