import json
import time
from typing import Dict, Any, List, TypedDict, Optional
from langgraph.graph import StateGraph, START, END
from app.ml.registry import model_registry
from app.core.llm import llm_service

# Define explicit, strongly-typed LangGraph state schema
class RecoveryState(TypedDict):
    input_data: Dict[str, Any]
    payment_id: str
    amount: float
    failure_code: str
    attempt_number: int
    diagnosis: str
    recovery_probability: float
    risk_score: float
    candidates: List[Dict[str, Any]]
    top_action: Dict[str, Any]
    expected_recovery_value: float
    reason_codes: List[str]
    explanation: str
    validation_status: str
    output: Dict[str, Any]

class LangGraphRecoveryAgent:
    def __init__(self):
        self.version = "langgraph_agent_v2.0"
        self.workflow = self._build_graph()

    def _build_graph(self) -> Any:
        builder = StateGraph(RecoveryState)

        # Register nodes
        builder.add_node("load_context", self._node_load_context)
        builder.add_node("diagnose_failure", self._node_diagnose_failure)
        builder.add_node("get_ml_prediction", self._node_get_ml_prediction)
        builder.add_node("generate_candidate_actions", self._node_generate_candidate_actions)
        builder.add_node("score_actions_deterministically", self._node_score_actions_deterministically)
        builder.add_node("llm_reasoning", self._node_llm_reasoning)
        builder.add_node("validate_decision", self._node_validate_decision)

        # Register edges
        builder.add_edge(START, "load_context")
        builder.add_edge("load_context", "diagnose_failure")
        builder.add_edge("diagnose_failure", "get_ml_prediction")
        builder.add_edge("get_ml_prediction", "generate_candidate_actions")
        builder.add_edge("generate_candidate_actions", "score_actions_deterministically")
        builder.add_edge("score_actions_deterministically", "llm_reasoning")
        builder.add_edge("llm_reasoning", "validate_decision")
        builder.add_edge("validate_decision", END)

        return builder.compile()

    # --- Node Implementation Functions ---

    def _node_load_context(self, state: RecoveryState) -> Dict[str, Any]:
        input_data = state["input_data"]
        return {
            "payment_id": str(input_data.get("payment_id", "unknown")),
            "amount": float(input_data.get("amount", 0.0)),
            "failure_code": str(input_data.get("failure_code", "UNKNOWN")),
            "attempt_number": int(input_data.get("attempt_number", 1))
        }

    def _node_diagnose_failure(self, state: RecoveryState) -> Dict[str, Any]:
        diagnosis_map = {
            'TRANSIENT_FAILURE': 'TRANSIENT_NETWORK_TIMEOUT',
            'INSUFFICIENT_FUNDS': 'CUSTOMER_ACCOUNT_FUNDS_INSUFFICIENT',
            'EXPIRED_CARD': 'EXPIRED_PAYMENT_INSTRUMENT',
            'INVALID_REQUEST': 'GATEWAY_PARAMETER_MISMATCH',
            'FRAUD_SUSPECTED': 'HIGH_RISK_SUSPECTED_FRAUD'
        }
        diagnosis = diagnosis_map.get(state["failure_code"], 'UNCLASSIFIED_FAILURE')
        return {"diagnosis": diagnosis}

    def _node_get_ml_prediction(self, state: RecoveryState) -> Dict[str, Any]:
        prob = model_registry.predict_probability(state["input_data"])
        risk = round(1.0 - prob, 4)
        return {
            "recovery_probability": prob,
            "risk_score": risk
        }

    def _node_generate_candidate_actions(self, state: RecoveryState) -> Dict[str, Any]:
        amount = state["amount"]
        actions = [
            {'action_type': 'RETRY_NOW', 'base_cost': 5.0, 'friction': 'LOW'},
            {'action_type': 'RETRY_LATER', 'base_cost': 2.0, 'friction': 'LOW'},
            {'action_type': 'SEND_PAYMENT_REMINDER', 'base_cost': 1.0, 'friction': 'MEDIUM'},
            {'action_type': 'REQUEST_PAYMENT_UPDATE', 'base_cost': 3.0, 'friction': 'MEDIUM'},
            {'action_type': 'OFFER_INCENTIVE', 'base_cost': amount * 0.10, 'friction': 'NONE'},
            {'action_type': 'HUMAN_ESCALATION', 'base_cost': 50.0, 'friction': 'HIGH'},
            {'action_type': 'STOP_RECOVERY', 'base_cost': 0.0, 'friction': 'NONE'}
        ]
        return {"candidates": actions}

    def _node_score_actions_deterministically(self, state: RecoveryState) -> Dict[str, Any]:
        amount = state["amount"]
        p_recovery = state["recovery_probability"]
        failure_code = state["failure_code"]
        attempts = state["attempt_number"]
        candidates = state["candidates"]

        scored_list = []
        for a in candidates:
            action_type = a['action_type']
            eligible = True
            
            if action_type == 'RETRY_NOW' and failure_code in ['INSUFFICIENT_FUNDS', 'EXPIRED_CARD', 'FRAUD_SUSPECTED']:
                eligible = False
            if action_type == 'REQUEST_PAYMENT_UPDATE' and failure_code != 'EXPIRED_CARD':
                eligible = False
            if action_type == 'OFFER_INCENTIVE' and amount < 1000:
                eligible = False
            if attempts >= 3 and action_type in ['RETRY_NOW', 'RETRY_LATER']:
                eligible = False

            if eligible:
                score = (p_recovery * amount) - a['base_cost']
            else:
                score = -999.0

            scored_list.append({
                'action_type': action_type,
                'score': round(score, 2),
                'cost': round(a['base_cost'], 2),
                'friction': a['friction'],
                'eligible': eligible
            })

        sorted_candidates = sorted(scored_list, key=lambda x: x['score'], reverse=True)
        top_action = sorted_candidates[0] if sorted_candidates else {
            'action_type': 'STOP_RECOVERY', 'score': 0.0, 'cost': 0.0, 'friction': 'LOW', 'eligible': True
        }

        expected_val = round(p_recovery * amount - top_action['score'], 2)
        if expected_val < 0:
            expected_val = 0.0

        return {
            "candidates": sorted_candidates,
            "top_action": top_action,
            "expected_recovery_value": expected_val
        }

    def _node_llm_reasoning(self, state: RecoveryState) -> Dict[str, Any]:
        failure_code = state["failure_code"]
        recovery_prob = state["recovery_probability"]
        top_action = state["top_action"]["action_type"]
        amount = state["amount"]

        reasons = [f"DIAGNOSIS_{state['diagnosis']}"]
        if failure_code == 'TRANSIENT_FAILURE':
            reasons.append('TRANSIENT_NETWORK_FAILURE')
        elif failure_code == 'INSUFFICIENT_FUNDS':
            reasons.append('INSUFFICIENT_BALANCE')
        elif failure_code == 'EXPIRED_CARD':
            reasons.append('PAYMENT_METHOD_EXPIRED')

        explanation = llm_service.generate_explanation(
            failure_code, recovery_prob, top_action, amount
        )

        return {
            "reason_codes": reasons,
            "explanation": explanation
        }

    def _node_validate_decision(self, state: RecoveryState) -> Dict[str, Any]:
        # Safety harness validation node: guarantees strict output compliance
        rec_action = state["top_action"]["action_type"]
        allowed = ['RETRY_NOW', 'RETRY_LATER', 'SEND_PAYMENT_REMINDER', 'REQUEST_PAYMENT_UPDATE', 'OFFER_INCENTIVE', 'HUMAN_ESCALATION', 'STOP_RECOVERY']
        if rec_action not in allowed:
            rec_action = 'STOP_RECOVERY'

        output_dict = {
            'case_id': f"REC-{state['payment_id']}",
            'payment_id': state['payment_id'],
            'risk_score': state['risk_score'],
            'recovery_probability': state['recovery_probability'],
            'expected_recovery_value': state['expected_recovery_value'],
            'recommended_action': rec_action,
            'delay_minutes': 120 if rec_action == 'RETRY_LATER' else 0,
            'confidence': round(min(0.99, max(0.60, state['recovery_probability'] + 0.1)), 2),
            'reason_codes': state['reason_codes'],
            'explanation': state['explanation'],
            'candidate_scores': state['candidates'],
            'model_version': model_registry.model_version,
            'agent_version': self.version,
            'prompt_version': llm_service.prompt_version
        }
        return {"validation_status": "PASSED", "output": output_dict}

    def run(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        start_time = time.time()
        initial_state: RecoveryState = {
            "input_data": input_data,
            "payment_id": "",
            "amount": 0.0,
            "failure_code": "",
            "attempt_number": 1,
            "diagnosis": "",
            "recovery_probability": 0.5,
            "risk_score": 0.5,
            "candidates": [],
            "top_action": {},
            "expected_recovery_value": 0.0,
            "reason_codes": [],
            "explanation": "",
            "validation_status": "",
            "output": {}
        }
        
        final_state = self.workflow.invoke(initial_state)
        output = final_state["output"]
        output["execution_time_ms"] = round((time.time() - start_time) * 1000, 2)
        return output

recovery_agent = LangGraphRecoveryAgent()
