# Revpilot — Autonomous AI Revenue Recovery Platform

Revpilot is an enterprise fintech AI system designed to detect payment failures, diagnose loss causes, predict recovery probabilities, score bounded recovery interventions, enforce merchant policy compliance, execute permitted recovery actions, and record complete audit trails.

---

## Non-Negotiable Architecture Principle

Revpilot separates the system into two distinct planes:

1. **Financial Control Plane (Spring Boot)**: Single source of financial truth. Authorizes actions against merchant business policies, checks idempotency keys, manages payment state machine transitions, executes Razorpay Test Mode transactions, logs audit events, and writes to transactional event outboxes.
2. **Intelligence Plane (FastAPI)**: Serves ML predictions, executes LangGraph reasoning graphs, scores intervention candidates, and generates explanations. **FastAPI or the LLM cannot directly execute financial transactions.**

```
FastAPI AI Service -> AI Recommendation -> Spring Boot -> Policy Validation -> Idempotency Check -> Authorization -> Razorpay -> PostgreSQL & Audit
```

---

## Complete Directory Tree Structure

```
Revpilot/
├── client/                              # React Single Page Application (SPA)
│   ├── public/                          # Static web assets
│   ├── src/
│   │   ├── components/
│   │   │   └── Navigation.jsx           # Command center navigation bar header
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx            # KPI cards & Recharts recovery funnel
│   │   │   ├── RecoveryCases.jsx        # Recovery case list & quick actions
│   │   │   ├── DecisionInspector.jsx    # AI decision breakdown & audit timeline
│   │   │   ├── PolicyConfig.jsx         # Merchant policy bounds config page
│   │   │   ├── ModelMetrics.jsx         # ML accuracy, precision, F1, ROC-AUC, confusion matrix
│   │   │   └── DemoSimulator.jsx        # One-click batch generation & recovery run simulator
│   │   ├── App.jsx                      # Client router configuration
│   │   ├── index.css                    # Tailwind CSS base and glassmorphism styles
│   │   └── main.jsx                     # React DOM application entry point
│   ├── index.html                       # HTML5 shell with Google Fonts Inter & JetBrains Mono
│   ├── package.json                     # Node.js dependencies (React, Recharts, Lucide, Tailwind)
│   ├── postcss.config.js                # PostCSS configuration
│   ├── tailwind.config.js               # Tailwind CSS theme & dark palette config
│   └── vite.config.js                   # Vite configuration with /api proxy to Spring Boot
│
├── server/
│   ├── control-plane/                   # Authoritative Spring Boot Financial Backend
│   │   ├── src/
│   │   │   └── main/
│   │   │       ├── java/com/recovery/autopilot/
│   │   │       │   ├── analytics/
│   │   │       │   │   ├── DashboardController.java   # Aggregated financial metric APIs
│   │   │       │   │   └── DemoController.java        # Batch synthesis & demo execution APIs
│   │   │       │   ├── audit/
│   │   │       │   │   ├── ActorType.java             # System actor classifications
│   │   │       │   │   ├── AuditEvent.java            # Audit event JPA entity
│   │   │       │   │   ├── AuditEventRepository.java  # Repository for audit event records
│   │   │       │   │   └── AuditService.java          # Audit logging helper service
│   │   │       │   ├── customer/
│   │   │       │   │   ├── Customer.java              # Customer JPA entity (LTV, tenure, segment)
│   │   │       │   │   └── CustomerRepository.java    # Customer persistence repository
│   │   │       │   ├── event/
│   │   │       │   │   ├── EventOutbox.java           # Transactional Outbox JPA entity
│   │   │       │   │   ├── EventOutboxRepository.java # Outbox event repository
│   │   │       │   │   └── OutboxService.java         # Outbox event publisher service
│   │   │       │   ├── infrastructure/
│   │   │       │   │   └── ai/
│   │   │       │   │       └── AiServiceClient.java   # HTTP REST client to FastAPI microservice
│   │   │       │   ├── merchant/
│   │   │       │   │   ├── Merchant.java              # Merchant JPA entity
│   │   │       │   │   └── MerchantRepository.java    # Merchant persistence repository
│   │   │       │   ├── payment/
│   │   │       │   │   ├── FailureCode.java           # Failure code classification enums
│   │   │       │   │   ├── Payment.java               # Financial Payment entity (BigDecimal)
│   │   │       │   │   ├── PaymentRepository.java     # Payment persistence repository
│   │   │       │   │   ├── PaymentStateMachine.java   # Authoritative payment state transition service
│   │   │       │   │   └── PaymentStatus.java         # Payment state machine enums
│   │   │       │   ├── policy/
│   │   │       │   │   ├── PolicyDecision.java        # ALLOW / BLOCK policy outcomes
│   │   │       │   │   ├── PolicyEngine.java          # Deterministic policy validation engine
│   │   │       │   │   ├── RecoveryPolicy.java        # Merchant bounds policy entity
│   │   │       │   │   └── RecoveryPolicyRepository.java # Policy repository
│   │   │       │   ├── razorpay/
│   │   │       │   │   └── RazorpayClientService.java # Razorpay Test Mode execution client
│   │   │       │   ├── recovery/
│   │   │       │   │   ├── FallbackRecoveryService.java # Rule-based fallback if AI is offline
│   │   │       │   │   ├── RecoveryActionType.java    # Allowed intervention action enums
│   │   │       │   │   ├── RecoveryCase.java          # Recovery case JPA entity
│   │   │       │   │   ├── RecoveryCaseRepository.java# Recovery case repository
│   │   │       │   │   ├── RecoveryCaseStatus.java    # Recovery case state enums
│   │   │       │   │   ├── RecoveryController.java    # Recovery cases & audit REST endpoints
│   │   │       │   │   └── RecoveryService.java       # Central domain recovery orchestrator
│   │   │       │   └── RevpilotApplication.java       # Spring Boot main application class
│   │   │       └── resources/
│   │   │           ├── application.yml                # Configuration (Postgres, Redis, Kafka, FastAPI)
│   │   │           └── db/migration/
│   │   │               └── V1__init_schema.sql        # Flyway DDL script for 16 PostgreSQL tables
│   │   └── pom.xml                                    # Maven build configuration
│   │
│   └── ai-service/                      # FastAPI + LightGBM + LangGraph Intelligence Engine
│       ├── app/
│       │   ├── agent/
│       │   │   └── graph.py             # Controlled LangGraph decision pipeline
│       │   ├── api/
│       │   │   ├── routes.py            # FastAPI REST routes (/analyze, /models)
│       │   │   └── schemas.py           # Strongly-typed Pydantic request & response schemas
│       │   ├── core/
│       │   │   └── config.py            # Microservice configuration and settings
│       │   ├── ml/
│       │   │   └── registry.py          # ModelRegistry loading LightGBM binaries on startup
│       │   └── main.py                  # FastAPI application entry point
│       ├── datasets/
│       │   └── synthetic_recovery_data.csv # 50,000 synthetic transaction failure records
│       ├── models/
│       │   ├── metrics_v1.json          # Test metrics JSON (Accuracy, F1, ROC-AUC, Confusion Matrix)
│       │   └── recovery_lightgbm_v1.joblib # Trained LightGBM model pipeline binary
│       ├── scripts/
│       │   ├── generate_dataset.py      # Synthetic dataset generator script
│       │   └── train_pipeline.py        # ML training & holdout evaluation script
│       └── requirements.txt             # Python runtime dependencies
│
├── infrastructure/
│   └── docker-compose.yml               # Docker configuration (PostgreSQL 15, Redis 7, Kafka)
│
├── docs/
│   └── architecture/
│       └── system_design.md             # System design specification & dual-plane model
│
├── .env.example                         # Environment configuration template
├── .gitignore                           # Git ignore rules for Java, Python, Node, Docker
└── README.md                            # Main project documentation
```

---

## Technology Stack

- **Frontend**: React, Vite, Tailwind CSS, Recharts, Lucide Icons, React Router
- **Financial Control Plane**: Java 17, Spring Boot 3.2, Spring Data JPA, Flyway, PostgreSQL Driver, Spring Cache (Redis), Spring Kafka
- **Intelligence Plane**: Python 3.10+, FastAPI, Pydantic, Scikit-Learn, LightGBM, LangGraph, Redis, Groq / OpenAI Provider Abstraction
- **Data & Caching**: PostgreSQL 15, Redis 7
- **Event Streaming**: Apache Kafka + Zookeeper / KRaft
- **Infrastructure**: Docker & Docker Compose

---

## Quick Setup Instructions

1. **Start Infrastructure Services**:
   ```bash
   cd infrastructure
   docker compose up -d
   ```

2. **Start FastAPI Intelligence Microservice**:
   ```bash
   cd server/ai-service
   pip install -r requirements.txt
   python scripts/train_pipeline.py
   python app/main.py
   ```

3. **Start Spring Boot Financial Control Plane**:
   ```bash
   cd server/control-plane
   mvn spring-boot:run
   ```

4. **Launch React SPA Client**:
   ```bash
   cd client
   npm install
   npm run dev
   ```

5. **Run Simulator & Verify Workflow**:
   - Open `http://localhost:3000/simulator`.
   - Click **Generate Batch** to synthesize 10 failed payments.
   - Click **Run Recovery** to observe AI decisioning, policy validation, Razorpay Test Mode execution, and live dashboard metrics updates.