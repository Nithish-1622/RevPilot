from typing import Dict, Any, List

class StrategyPlanner:
    """
    Generates multi-step Recovery Plans with fallback strategies and financial simulation metrics.
    """

    def generate_recovery_plan(self, failure_code: str, amount: float, p_recovery: float) -> Dict[str, Any]:
        plans = []

        # Strategy A: Immediate Retry
        plans.append({
            "strategy_id": "STRAT_A_IMMEDIATE_RETRY",
            "name": "Immediate Automated Gateway Retry",
            "steps": [
                {"step": 1, "action": "RETRY_NOW", "delay_minutes": 0, "description": "Execute instant retry via primary payment gateway"}
            ],
            "expected_recovery_probability": round(min(0.95, p_recovery * 0.9), 4),
            "expected_revenue": round(amount * min(0.95, p_recovery * 0.9), 2),
            "intervention_cost": 5.00,
            "expected_value": round((amount * min(0.95, p_recovery * 0.9)) - 5.00, 2),
            "risk_score": 0.20,
            "confidence": 0.85,
            "fallback_strategy": "STRAT_B_DELAYED_LIQUIDITY"
        })

        # Strategy B: Delayed Liquidity Retry
        plans.append({
            "strategy_id": "STRAT_B_DELAYED_LIQUIDITY",
            "name": "Liquidity Window Retry (6h Cooldown)",
            "steps": [
                {"step": 1, "action": "SEND_PAYMENT_REMINDER", "delay_minutes": 0, "description": "Dispatch SMS/Email notification to customer"},
                {"step": 2, "action": "RETRY_LATER", "delay_minutes": 360, "description": "Retry payment at peak evening bank liquidity window"}
            ],
            "expected_recovery_probability": round(min(0.95, p_recovery * 1.15), 4),
            "expected_revenue": round(amount * min(0.95, p_recovery * 1.15), 2),
            "intervention_cost": 3.00,
            "expected_value": round((amount * min(0.95, p_recovery * 1.15)) - 3.00, 2),
            "risk_score": 0.12,
            "confidence": 0.90,
            "fallback_strategy": "STRAT_C_CARD_UPDATE"
        })

        # Strategy C: Incentive & Payment Update
        plans.append({
            "strategy_id": "STRAT_C_CARD_UPDATE",
            "name": "Payment Method Update + 5% Voucher",
            "steps": [
                {"step": 1, "action": "OFFER_INCENTIVE", "delay_minutes": 0, "description": "Attach 5% checkout voucher to payment recovery link"},
                {"step": 2, "action": "REQUEST_PAYMENT_UPDATE", "delay_minutes": 60, "description": "Prompt customer to update card or UPI ID"}
            ],
            "expected_recovery_probability": round(min(0.95, p_recovery * 1.25), 4),
            "expected_revenue": round(amount * min(0.95, p_recovery * 1.25), 2),
            "intervention_cost": round(amount * 0.05 + 2.00, 2),
            "expected_value": round((amount * min(0.95, p_recovery * 1.25)) - (amount * 0.05 + 2.00), 2),
            "risk_score": 0.08,
            "confidence": 0.92,
            "fallback_strategy": "HUMAN_ESCALATION"
        })

        # Rank plans deterministically by expected_value
        ranked_plans = sorted(plans, key=lambda p: p["expected_value"], reverse=True)

        return {
            "recommended_plan": ranked_plans[0],
            "candidate_plans": ranked_plans
        }

strategy_planner = StrategyPlanner()
