# RevPilot System Walkthrough & Architectural Specification

RevPilot is an enterprise fintech AI platform designed to diagnose payment failures, predict recovery probabilities, score bounded recovery interventions, enforce merchant business policies, execute permitted recovery actions, and maintain complete audit trails.

---

## 1. Dual-Plane Architecture & Core Invariant

```
FastAPI AI Service (LangGraph StateGraph)
        ↓ AI Recommendation
Spring Boot Control Plane
        ↓ Policy Engine Bounds Validation
        ↓ Idempotency & Rate Limit Check
        ↓ Authorization & Human Gating
Razorpay Gateway (Test Mode)
        ↓
PostgreSQL DB & Audit Trail & Kafka Outbox
```

**Non-Negotiable Core Rule**: The Intelligence Plane (FastAPI/LLM) CANNOT directly execute financial transactions against Razorpay or mutate database state. The Financial Control Plane (Spring Boot) is the sole authoritative gateway.

---

## 2. Intelligence Plane (FastAPI + LightGBM + LangGraph)

- **LangGraph StateGraph Pipeline (`app/agent/graph.py`)**:
  Defines a strongly typed state workflow (`RecoveryState`) using `langgraph.graph.StateGraph`:
  1. `load_context`: Normalizes inputs and payment parameters.
  2. `diagnose_failure`: Maps failure codes to root cause classifications.
  3. `get_ml_prediction`: Queries loaded LightGBM model binary for $P(\text{recovery})$.
  4. `generate_candidate_actions`: Assembles permissible recovery intervention types.
  5. `score_actions_deterministically`: Calculates Net Expected Value (NEV) scores in deterministic Python arithmetic ($P_{\text{recovery}} \times \text{amount} - \text{cost}$).
  6. `llm_reasoning`: Generates structured explanations using configured provider abstraction with prompt versioning (`RECOVERY_DECISION_PROMPT_V1`).
  7. `validate_decision`: Enforces output contract validation.

- **LLM Provider Abstraction (`app/core/llm.py`)**:
  Implements `LLMProvider` abstract base class with concrete providers: `GroqProvider`, `OpenAICompatibleProvider`, and `FallbackProvider`.

- **Redis Caching & Rate Limiting (`app/core/rate_limiter.py`)**:
  - ML Prediction Cache: `prediction:{model_version}:{feature_hash}`
  - LLM Response Cache: `llm:{provider}:{prompt_version}:{context_hash}`
  - Rate Limiter: Redis sliding window sliding log per IP.

---

## 3. Financial Control Plane (Spring Boot)

- **Payment State Machine (`PaymentStateMachine.java`)**:
  Enforces state transitions (`CREATED` $\rightarrow$ `PENDING` $\rightarrow$ `FAILED` $\rightarrow$ `RECOVERY_ELIGIBLE` $\rightarrow$ `RECOVERY_IN_PROGRESS` $\rightarrow$ `RECOVERED` / `EXHAUSTED` / `BLOCKED`). Rejects invalid transition attempts.

- **Policy Engine & Human-in-the-Loop Gating (`PolicyEngine.java` & `RecoveryService.java`)**:
  Enforces merchant business policies (`maxRetryAttempts`, `maxDiscountPercent`, `minimumRecoveryProbability`, `approvalThreshold`). Transactions exceeding approval threshold (e.g. > ₹5,000) are assigned status `PENDING_APPROVAL`, gating automatic execution until approved via `POST /api/v1/recovery/cases/{id}/approve` or rejected via `POST /api/v1/recovery/cases/{id}/reject`.

- **Idempotency & Concurrency Safety (`IdempotencyService.java`)**:
  Persists idempotency keys in `api_idempotency_keys` table using `REQUIRES_NEW` transaction propagation level. Entity optimistic locking (`@Version`) prevents race conditions.

- **Razorpay Webhooks (`RazorpayWebhookController.java`)**:
  Verifies `X-Razorpay-Signature` HMAC-SHA256 headers and prevents duplicate webhook event processing using `webhook_events`.

- **Transactional Outbox (`OutboxPublisher.java`)**:
  Inserts outbox events in the same database transaction as domain changes and asynchronously broadcasts events (`payment.recovered.v1`, `recovery.action.blocked.v1`) to Kafka.

---

## 4. Database Schema & Flyway Migrations
PostgreSQL tables are initialized via Flyway migration `V1__init_schema.sql`:
- `payments`, `recovery_cases`, `recovery_policies`, `audit_events`, `api_idempotency_keys`, `webhook_events`, `event_outbox`.
- Financial amounts use high-precision `DECIMAL(15,2)`.
