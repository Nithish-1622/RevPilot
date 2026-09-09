# RevPilot System Architecture & Technical Design Specification

## 1. Executive Summary & Core Architectural Invariant

RevPilot is an **Autonomous AI Revenue Recovery Platform** engineered for subscription business models and digital payment platforms. It converts failed transaction events into recovered revenue using a **Dual-Plane Architecture**:

$$\text{Intelligence Plane (FastAPI)} \quad \iff \quad \text{Financial Control Plane (Spring Boot)}$$

### Core Architectural Invariants
1. **Dual-Plane Isolation**: The FastAPI AI service NEVER directly executes payments or mutates ledger states. Spring Boot strictly owns authorization, policy enforcement, idempotency, state transitions, financial transaction execution, and transactional outbox event publishing.
2. **Deterministic Financial Optimization**: Strategy selection is governed by deterministic Net Expected Value (NEV) formulas. The LLM acts purely as an explainer and reasoning component, never as an unconstrained financial execution engine.
3. **Zero Fake Data**: All dashboard metrics, predictions, and audit feeds originate from real backend REST APIs and persistent database records.

---

## 2. Platform Architecture Diagram

```
                              +-------------------------+
                              | React 18 SaaS Dashboard |
                              | (Razorpay Light Theme)  |
                              +------------+------------+
                                           |
                                   HTTPS / REST APIs
                                           |
                                           v
+-----------------------------------------------------------------------------------+
|                           SPRING BOOT FINANCIAL CONTROL PLANE                      |
|                                     (Port 8080)                                   |
|                                                                                   |
|  +-------------------+   +--------------------+   +----------------------------+  |
|  | Customer Intel    |   | Policy Enforcement |   | Idempotency & Safety       |  |
|  | Engine            |   | & HITL (> ₹5,000)  |   | Machine                    |  |
|  +---------+---------+   +---------+----------+   +--------------+-------------+  |
|            |                       |                             |                |
|            +-----------------------+-----------------------------+                |
|                                    |                                              |
|                    +---------------+---------------+                              |
|                    | Payment State Machine          |                              |
|                    | CREATED -> FAILED -> RECOVERED|                              |
|                    +---------------+---------------+                              |
|                                    |                                              |
|            +-----------------------+-----------------------+                      |
|            |                                               |                      |
|            v                                               v                      |
|  +-------------------+                           +--------------------+           |
|  | Transactional     |                           | Razorpay Test Mode |           |
|  | Outbox (Kafka)    |                           | Gateway Adapter    |           |
|  +---------+---------+                           +---------+----------+           |
+------------|-----------------------------------------------+----------------------+
             |                                               |
             | Kafka Events                                  | Payment API
             v                                               v
+------------------------+                       +-----------------------+
| Apache Kafka Streaming |                       | Razorpay Sandbox API  |
+------------------------+                       +-----------------------+
             ^
             | REST Decision Requests
             v
+-----------------------------------------------------------------------------------+
|                               FASTAPI AI SERVICE                                  |
|                                   (Port 8000)                                     |
|                                                                                   |
|  +-------------------+   +--------------------+   +----------------------------+  |
|  | Timing Window     |   | Multi-Step Strategy|   | Deterministic NEV          |  |
|  | Engine            |   | Planner & Simulator|   | Optimization Engine        |  |
|  +---------+---------+   +---------+----------+   +--------------+-------------+  |
|            |                       |                             |                |
|            +-----------------------+-----------------------------+                |
|                                    |                                              |
|                                    v                                              |
|                        +-----------------------+                                  |
|                        | LangGraph Autonomous  |                                  |
|                        | Decision Graph        |                                  |
|                        +-----------+-----------+                                  |
|                                    |                                              |
|                                    v                                              |
|                        +-----------------------+                                  |
|                        | Ollama / Llama 3      |                                  |
|                        | Natural Explainer     |                                  |
|                        +-----------------------+                                  |
+-----------------------------------------------------------------------------------+
```

---

## 3. Database Schema Topology

RevPilot utilizes a PostgreSQL schema with 16 core tables enforcing relational integrity, merchant isolation, and auditability:

1. `merchants`: Merchant profile, API credentials, and notification webhooks.
2. `customers`: Customer tenure, LTV, preferred instrument, historical failure rate, and recovery profile.
3. `payments`: Primary ledger for payment attempts, gateway references, and amounts.
4. `payment_failures`: Raw error codes, decline reasons, and issuer decline parameters.
5. `recovery_cases`: Active autonomous recovery workflows with state tracking.
6. `recovery_predictions`: Model-predicted recovery probabilities and predicted value.
7. `recovery_actions`: Individual step executions, timing windows, and outcomes.
8. `recovery_policies`: Merchant-configured policy rules (max retry count, discount cap, HITL threshold).
9. `audit_events`: Immutable security and financial state change logs.
10. `agent_decisions`: LangGraph decision state machine checkpoints and explanations.
11. `api_idempotency_keys`: Strict deduplication and double-execution prevention.
12. `model_predictions`: Feature vectors and ML model scoring records.
13. `llm_cache_entries`: Redis/DB backed LLM explanation cache.
14. `notifications`: Multi-channel customer communication logs (Email/SMS/WhatsApp).
15. `webhook_events`: Event outbox payload history for merchant webhooks.
16. `event_outbox`: Transactional outbox pattern implementation for reliable Kafka publishing.

---

## 4. Operational Control Flow & Fallback Architecture

### High-Availability Fallback Chain
```
Level 1: FastAPI AI Service + ML + LangGraph + Llama 3 LLM (Full Autonomous Reasoning)
   |
   +---> [Failure / Timeout > 2000ms]
   |
Level 2: FastAPI AI Service + ML + Rule-Based Planner (Fast Deterministic Recovery)
   |
   +---> [FastAPI Unreachable / Redis Down]
   |
Level 3: Spring Boot Emergency Rule Engine (Zero-Downtime Conservative Policy Fallback)
```

---

## 5. Payment & Case State Machine

```
               [Payment Triggered]
                        |
                        v
               +-----------------+
               | CREATED / INIT  |
               +--------+--------+
                        |
            +-----------+-----------+
            |                       |
            v                       v
     +--------------+       +---------------+
     |  SUCCESSFUL  |       |    FAILED     |
     +--------------+       +-------+-------+
                                    |
                                    v
                            +---------------+
                            | RECOVERY_     |
                            | ELIGIBLE      |
                            +-------+-------+
                                    |
                        +-----------+-----------+
                        |                       |
                        v                       v
               +-----------------+     +-----------------+
               |   RECOVERY_IN_  |     |     BLOCKED     |
               |    PROGRESS     |     | (HITL / Policy) |
               +--------+--------+     +-----------------+
                        |
            +-----------+-----------+
            |                       |
            v                       v
     +--------------+       +---------------+
     |  RECOVERED   |       |   EXHAUSTED   |
     +--------------+       +---------------+
```
