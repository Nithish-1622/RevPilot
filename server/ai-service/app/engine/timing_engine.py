from typing import Dict, Any

class OptimalInterventionTimeEngine:
    """
    Estimates recovery probability across different intervention time windows:
    - IMMEDIATE (0 min)
    - SHORT_DELAY (5-30 min)
    - COOLDOWN_2H (2 hours)
    - LIQUIDITY_WINDOW_6H (6 hours - e.g., evening settlement)
    - NEXT_DAY_24H (24 hours - e.g., salary/payroll credit)
    """

    def calculate_optimal_timing(self, failure_code: str, customer_profile: Dict[str, Any], amount: float) -> Dict[str, Any]:
        windows = [
            {"window": "IMMEDIATE", "delay_minutes": 0, "probability_modifier": 0.0, "reason": "Network or gateway transient timeout"},
            {"window": "SHORT_DELAY_15M", "delay_minutes": 15, "probability_modifier": 0.05, "reason": "Minor issuer bank friction clearance"},
            {"window": "COOLDOWN_2H", "delay_minutes": 120, "probability_modifier": 0.12, "reason": "Cool-off for card limit/balance top-up"},
            {"window": "LIQUIDITY_WINDOW_6H", "delay_minutes": 360, "probability_modifier": 0.18, "reason": "Evening liquidity and salary settlement cycle"},
            {"window": "NEXT_DAY_24H", "delay_minutes": 1440, "probability_modifier": 0.22, "reason": "Next business day payroll processing"}
        ]

        if failure_code in ["INSUFFICIENT_FUNDS", "UPI_TIMEOUT"]:
            recommended = windows[3] # 6 hours liquidity window
        elif failure_code in ["TRANSIENT_FAILURE", "NETWORK_TIMEOUT"]:
            recommended = windows[0] # Immediate retry
        elif failure_code == "EXPIRED_CARD":
            recommended = windows[4] # 24 hours (card update reminder)
        else:
            recommended = windows[2] # 2 hours default cooldown

        return {
            "optimal_window": recommended["window"],
            "delay_minutes": recommended["delay_minutes"],
            "timing_rationale": recommended["reason"],
            "evaluated_windows": windows
        }

optimal_timing_engine = OptimalInterventionTimeEngine()
