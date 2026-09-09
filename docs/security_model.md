# RevPilot Security, Governance & Isolation Model

## 1. Overview

RevPilot enforces strict enterprise security, merchant multi-tenancy, non-custodial financial controls, and deterministic policy boundaries across all intelligence and execution layers.

---

## 2. Core Security Invariants

### 1. Dual-Plane Execution Boundary
- The **FastAPI AI Service** is restricted to read-only feature intelligence and deterministic optimization recommendations.
- FastAPI possesses **no payment gateway credentials, private keys, or write permissions** to financial accounts.
- **Spring Boot Control Plane** acts as the sole authorized security gatekeeper for financial transactions.

### 2. Multi-Tenant Merchant Isolation
- Every database entity (`payments`, `recovery_cases`, `recovery_policies`, `customers`) requires a valid `merchant_id` field.
- Spring Boot repository methods filter queries by `merchant_id` extracted from authenticated JWT tokens or verified API keys.
- Cross-tenant data leakage is strictly prevented at the data access object (DAO) layer.

---

## 3. Financial Authorization & Idempotency Safeguards

### 1. API Idempotency Engine
- All execution requests (`/api/v1/payments/{id}/retry`, `/api/v1/recovery/cases/{id}/execute`) require an `X-Idempotency-Key` header.
- The `api_idempotency_keys` table uses atomic PostgreSQL database locks to guarantee that duplicate webhooks or network retries **never result in duplicate charges**.

### 2. Human-in-the-Loop (HITL) Gating
- High-value recovery cases exceeding merchant policy thresholds (default `> ₹5,000.00`) are automatically set to state `BLOCKED`.
- Gated cases require explicit merchant authorization via the `/api/v1/recovery/cases/{id}/approve` endpoint before execution.

---

## 4. Payment Gateway Security & Non-Custodial Architecture

- RevPilot integrates with payment gateways (e.g., Razorpay Sandbox/Production) via server-to-server API authentication using environment-injected API Keys and Secrets.
- RevPilot **never stores primary account numbers (PANs) or CVVs** on its servers. All tokenized recurring payment authorizations utilize gateway payment token identifiers (`razorpay_payment_id`, `razorpay_order_id`).

---

## 5. Auditability & Compliance

- All status changes, policy edits, manual interventions, and automated executions emit immutable records into the `audit_events` table.
- Transactional outbox events are published to Kafka for real-time compliance monitoring and external webhook delivery.
