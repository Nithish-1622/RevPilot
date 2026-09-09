# RevPilot Hackathon Demo Runbook (5-Minute Judging Script)

This runbook guides hackathon judges and evaluators through a complete 5-minute interactive demonstration of RevPilot's autonomous revenue recovery platform.

---

## 1. Quick Start / Environment Setup

Ensure the platform services are running:
```powershell
# Run automated system launch script
.\start_all.ps1
```
Verify services:
- **Frontend Dashboard**: `http://localhost:5173`
- **Spring Boot Control Plane**: `http://localhost:8080/actuator/health`
- **FastAPI AI Service**: `http://localhost:8000/health`

---

## 2. Step-by-Step 5-Minute Judging Script

### Minute 1: The Problem & High-Converting Landing Page (`/`)
1. Open `http://localhost:5173`.
2. Observe the **Razorpay-grade Light UI**: Clean `#FFFFFF` cards, `#F8FAFC` background, `#02042B` Navy headings, and `#0C6FEE` Razorpay Blue primary CTAs.
3. Highlight key features: Autonomous Recovery Engine, Multi-Step Planner, Customer Intelligence Engine, Optimal Timing Windows, and HITL Policy Protection.
4. Click **Launch Platform** to navigate to the SaaS Control Center (`/dashboard`).

---

### Minute 2: Real-Time Revenue Intelligence Dashboard (`/dashboard`)
1. View the **Revenue Recovered Metric Cards**:
   - **Revenue at Risk**: Total value of failed payments.
   - **Recovered Revenue**: Total payment value successfully collected.
   - **Recovery Rate**: Real-time percentage conversion.
   - **Net ROI**: Recovered Revenue minus Intervention Costs.
2. Click **View Customer Profile** on an active case:
   - Observe customer tenure, LTV, historical failure rate, churn risk, and preferred instrument (`RAZORPAY_UPI`).
3. View the **Strategy Comparison Panel**:
   - Compare strategy candidates (`SMART_RETRY_SMART_SCHEDULE`, `COMMUNICATION_AND_DISCOUNT_OFFER`, `INTERACTION_GATEWAY_SWITCH`, `MANUAL_HITL_REVIEW`).
   - Observe side-by-side **Recovery Probability**, **Intervention Cost**, **Expected Revenue**, and **Net Expected Value (NEV)** calculations.

---

### Minute 3: Interactive Demo Simulator & Chaos Injection (`/simulator`)
1. Navigate to **Demo Simulator** (`/simulator`).
2. Select a pre-configured failure scenario:
   - Scenario A: **Insufficient Funds (Soft Decline)** -> AI selects Liquidity Window delay + Smart Retry.
   - Scenario B: **High Value Transaction (> ₹5,000)** -> AI flags for **Human-in-the-Loop (HITL)** approval.
3. **Trigger Chaos / Failure-Injection Mode**:
   - Click **Simulate LLM Failure**: Platform gracefully falls back to ML Model + Rule Planner (L2 Recovery).
   - Click **Simulate Redis Failure**: Platform relies on direct PostgreSQL query resolution.
   - Click **Simulate Payment Gateway Decline**: State machine safely transitions to `FAILED` with retry exhaustion tracking.
4. Click **Run End-to-End Recovery Simulation** to see live state transitions and Razorpay Test Mode execution.

---

### Minute 4: Policy Enforcement & Governance (`/policies`)
1. Navigate to **Policy Management** (`/policies`).
2. Show merchant control knobs:
   - **HITL Threshold**: Default `₹5,000.00`. Any payment exceeding this amount is automatically gated.
   - **Max Retry Count**: Enforced by Spring Boot state machine.
   - **Discount Cap**: Maximum allowed incentive discount (`10%`).
3. Adjust a threshold and save; observe immediate policy re-evaluation in Spring Boot.

---

### Minute 5: Model Performance & Closed-Loop Attribution (`/analytics`)
1. Navigate to **Model Metrics & Attribution** (`/analytics`).
2. View **Closed-Loop Attribution**:
   - Predicted vs. Actual Recovery Rate.
   - Financial Net Expected Value accuracy across payment methods (UPI, Cards, NetBanking).
3. Review audit trail showing end-to-end event chain:
   $$\text{Payment Decline} \longrightarrow \text{Customer Profile} \longrightarrow \text{NEV Optimization} \longrightarrow \text{Spring Authorization} \longrightarrow \text{Razorpay Execution} \longrightarrow \text{Revenue Recovered}$$

---

## 3. Key Takeaway for Judges
RevPilot isn't a simple chatbot wrapper or static dashboard. It is a **financially resilient, dual-plane autonomous engine** that operates strictly within merchant policies, guarantees idempotency, handles chaos gracefully, and delivers measurable ROI.
