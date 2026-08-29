# Revpilot System Design & Architecture Specification

## 1. Dual-Plane Core Architecture

Revpilot enforces a strict separation between intelligence and execution:

- **Intelligence Plane (FastAPI)**: Serves ML predictions, runs LangGraph reasoning workflows, scores intervention candidates, and generates decision explanations. It has **no access** to execute financial transactions directly.
- **Financial Control Plane (Spring Boot)**: Acts as the single source of truth. Authorizes actions against merchant business policies, checks idempotency keys, manages payment state transitions, invokes Razorpay Test Mode execution, writes audit logs, and streams transactional outbox events to Kafka.

```
                    React Client
                         |
                         v
                Spring Boot Control Plane
                         |
          +--------------+--------------+
          |              |              |
          v              v              v
     Payment Module  Recovery Module  Audit Module
          |              |
          +------+-------+
                 | REST
                 v
          FastAPI AI Service
                 |
       +---------+----------+
       |         |          |
       v         v          v
    Feature    ML Model   LangGraph Agent
```

## 2. Core Financial Safety Rule
AI proposes → ML predicts → Rules constrain → Spring Boot authorizes → Razorpay executes → PostgreSQL records → Audit explains → Redis accelerates → Kafka distributes.

## 3. Database Schema Overview
1. `merchants`
2. `customers`
3. `payments`
4. `payment_failures`
5. `recovery_cases`
6. `recovery_predictions`
7. `recovery_actions`
8. `recovery_policies`
9. `audit_events`
10. `agent_decisions`
11. `api_idempotency_keys`
12. `model_predictions`
13. `llm_cache_entries`
14. `notifications`
15. `webhook_events`
16. `event_outbox`

## 4. Payment State Machine
Transitions allowed:
- `CREATED` -> `PENDING`, `FAILED`
- `FAILED` -> `RECOVERY_ELIGIBLE`, `EXHAUSTED`, `BLOCKED`
- `RECOVERY_ELIGIBLE` -> `RECOVERY_IN_PROGRESS`, `BLOCKED`
- `RECOVERY_IN_PROGRESS` -> `RECOVERED`, `FAILED`, `EXHAUSTED`, `BLOCKED`
