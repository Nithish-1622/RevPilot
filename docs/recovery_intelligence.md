# RevPilot Recovery Intelligence & Mathematical Optimization Framework

## 1. Overview

RevPilot's recovery engine replaces static retry schedules with a machine-learned, mathematically optimal recovery decision pipeline.

---

## 2. Mathematical Net Expected Value (NEV) Formulation

For any candidate recovery strategy $S_i$, the Net Expected Value is defined as:

$$\text{NEV}(S_i) = P(\text{Recovery} \mid S_i, \mathbf{x}) \cdot \text{Revenue} - \text{Cost}(S_i) - \text{ChurnRiskCost}(\mathbf{x})$$

Where:
- $\mathbf{x}$: Customer and payment feature vector (Tenure, LTV, Failure Code, Gateway latency, Preferred Instrument).
- $P(\text{Recovery} \mid S_i, \mathbf{x})$: Calibrated machine learning prediction probability derived from XGBoost/LightGBM model scoring.
- $\text{Revenue}$: Net recoverable transaction amount minus gateway processing fees.
- $\text{Cost}(S_i)$: Financial cost of execution (Communication costs, retry gateway charges, incentive discounts).
- $\text{ChurnRiskCost}(\mathbf{x})$: Estimated long-term customer friction penalty induced by aggressive retries.

---

## 3. Optimal Intervention Time Engine

Payment failures are evaluated across 5 temporal liquidity windows:

1. `IMMEDIATE`: Triggered for transient network failures or gateway timeouts (0 - 5 minutes delay).
2. `SHORT_DELAY_15M`: Triggered for issuer processing spikes (15 - 30 minutes delay).
3. `COOLDOWN_2H`: Triggered for rate-limiting or soft authentication declines (2 - 4 hours delay).
4. `LIQUIDITY_WINDOW_6H`: Triggered for insufficient funds near end-of-day salary credits (6 - 12 hours delay).
5. `NEXT_DAY_24H`: Triggered for weekend processing windows or recurring billing cycles (24 - 48 hours delay).

---

## 4. Multi-Step Recovery Strategy Planner

The strategy planner generates structured multi-step fallback execution plans:

```json
{
  "strategy_id": "SMART_RETRY_SMART_SCHEDULE",
  "expected_recovery_probability": 0.82,
  "expected_revenue": 3690.00,
  "intervention_cost": 50.00,
  "expected_value": 3640.00,
  "steps": [
    {
      "step_number": 1,
      "action_type": "SCHEDULE_RETRY",
      "delay_seconds": 21600,
      "parameters": { "timing_window": "LIQUIDITY_WINDOW_6H" }
    },
    {
      "step_number": 2,
      "action_type": "SEND_WHATSAPP_REMINDER",
      "delay_seconds": 3600,
      "parameters": { "template": "INSUFFICIENT_FUNDS_LINK" }
    }
  ],
  "fallback_strategy": "COMMUNICATION_AND_DISCOUNT_OFFER"
}
```
