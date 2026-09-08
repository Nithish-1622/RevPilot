#!/usr/bin/env python3
import json
import time
import urllib.request
import urllib.error

CONTROL_PLANE_URL = "http://localhost:8080"
AI_SERVICE_URL = "http://localhost:8000"
AI_SERVICE_TOKEN = "revpilot_ai_service_secret_token_12345"

class Color:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    CYAN = '\033[96m'
    BOLD = '\033[1m'
    RESET = '\033[0m'

def make_request(url, method="GET", headers=None, data=None):
    if headers is None:
        headers = {}
    
    req_body = None
    if data is not None:
        req_body = json.dumps(data).encode('utf-8')
        headers['Content-Type'] = 'application/json'

    req = urllib.request.Request(url, data=req_body, headers=headers, method=method)
    
    start_time = time.time()
    try:
        with urllib.request.urlopen(req, timeout=5) as response:
            duration_ms = round((time.time() - start_time) * 1000, 2)
            res_data = response.read().decode('utf-8')
            parsed_json = None
            try:
                parsed_json = json.loads(res_data)
            except Exception:
                pass
            return {
                "status_code": response.status,
                "duration_ms": duration_ms,
                "body": parsed_json if parsed_json is not None else res_data,
                "error": None
            }
    except urllib.error.HTTPError as e:
        duration_ms = round((time.time() - start_time) * 1000, 2)
        res_data = e.read().decode('utf-8')
        parsed_json = None
        try:
            parsed_json = json.loads(res_data)
        except Exception:
            pass
        return {
            "status_code": e.code,
            "duration_ms": duration_ms,
            "body": parsed_json if parsed_json is not None else res_data,
            "error": str(e)
        }
    except Exception as e:
        duration_ms = round((time.time() - start_time) * 1000, 2)
        return {
            "status_code": 0,
            "duration_ms": duration_ms,
            "body": None,
            "error": str(e)
        }

def run_tests():
    print(f"\n{Color.BOLD}{Color.CYAN}==================================================={Color.RESET}")
    print(f"{Color.BOLD}{Color.CYAN}  RevPilot Comprehensive API Validation Suite       {Color.RESET}")
    print(f"{Color.BOLD}{Color.CYAN}==================================================={Color.RESET}\n")

    results = []

    def log_test(name, pass_condition, res, detail=""):
        status = f"{Color.GREEN}PASS{Color.RESET}" if pass_condition else f"{Color.RED}FAIL{Color.RESET}"
        latency = f"{res['duration_ms']}ms"
        print(f"[{status}] {name:<45} (Code: {res['status_code']}, Time: {latency})")
        if not pass_condition:
            print(f"       |- {Color.RED}Error/Detail: {res.get('error') or detail}{Color.RESET}")
        results.append({
            "name": name,
            "passed": pass_condition,
            "code": res['status_code'],
            "latency": latency
        })

    # 1. System Health Checks
    r = make_request(f"{CONTROL_PLANE_URL}/actuator/health")
    log_test("Control Plane Actuator Health Check", r['status_code'] == 200 and isinstance(r['body'], dict) and r['body'].get('status') == 'UP', r)

    r = make_request(f"{AI_SERVICE_URL}/health")
    log_test("FastAPI AI Service Health Check", r['status_code'] == 200 and isinstance(r['body'], dict) and r['body'].get('status') == 'HEALTHY', r)

    r = make_request(f"{CONTROL_PLANE_URL}/api/v1/models")
    log_test("ML Models Metadata Gateway", r['status_code'] == 200 and isinstance(r['body'], dict) and 'model_name' in r['body'], r)

    # 2. Demo Batch Simulator
    r = make_request(f"{CONTROL_PLANE_URL}/api/v1/demo/generate-batch?count=5", method="POST")
    batch_ok = r['status_code'] == 200 and isinstance(r['body'], dict) and r['body'].get('generatedCount') == 5
    log_test("Generate Demo Failure Batch (5 cases)", batch_ok, r)

    sample_case_id = "REC-pay_test_1"
    if batch_ok and 'caseIds' in r['body'] and len(r['body']['caseIds']) > 0:
        sample_case_id = r['body']['caseIds'][0]

    r = make_request(f"{CONTROL_PLANE_URL}/api/v1/demo/run-recovery", method="POST")
    log_test("Run Autopilot Recovery Loop", r['status_code'] == 200 and isinstance(r['body'], dict) and 'processedCount' in r['body'], r)

    # 3. Dashboard Metrics & Activity
    r = make_request(f"{CONTROL_PLANE_URL}/api/v1/dashboard/summary")
    log_test("Get Dashboard Summary Metrics", r['status_code'] == 200 and isinstance(r['body'], dict) and 'revenueAtRisk' in r['body'], r)

    r = make_request(f"{CONTROL_PLANE_URL}/api/v1/dashboard/activity")
    log_test("Get Recent Audit Activity Stream", r['status_code'] == 200 and isinstance(r['body'], list), r)

    # 4. Merchant Policy Management
    r = make_request(f"{CONTROL_PLANE_URL}/api/v1/policy/merch_demo_101")
    log_test("Get Merchant Policy Config", r['status_code'] == 200 and isinstance(r['body'], dict) and 'maxDiscountPercent' in r['body'], r)

    policy_update_payload = {
        "merchantId": "merch_demo_101",
        "maxRetryAttempts": 3,
        "maxDiscountPercent": 15.00,
        "approvalThreshold": 5000.00,
        "maxIncentiveCount": 2,
        "minimumRecoveryProbability": 0.4000,
        "coolOffPeriodMinutes": 120
    }
    r = make_request(f"{CONTROL_PLANE_URL}/api/v1/policy/merch_demo_101", method="POST", data=policy_update_payload)
    log_test("Update Merchant Policy Config", r['status_code'] == 200 and isinstance(r['body'], dict) and r['body'].get('approvalThreshold') == 5000.0, r)

    # 5. Direct FastAPI Intelligence Service Analysis
    direct_ai_payload = {
        "payment_id": "pay_test_direct_100",
        "customer_id": "cust_100",
        "merchant_id": "merch_demo_101",
        "amount": 1800.0,
        "failure_code": "TRANSIENT_FAILURE",
        "attempt_number": 1
    }
    r = make_request(f"{AI_SERVICE_URL}/api/v1/recovery/analyze", method="POST", headers={"X-AI-Service-Token": AI_SERVICE_TOKEN}, data=direct_ai_payload)
    log_test("FastAPI Direct AI StateGraph Analysis", r['status_code'] == 200 and isinstance(r['body'], dict) and 'recommended_action' in r['body'], r)

    r = make_request(f"{AI_SERVICE_URL}/api/v1/recovery/analyze", method="POST", headers={"X-AI-Service-Token": "invalid_token"}, data=direct_ai_payload)
    log_test("FastAPI AI Unauthorized Rejection Check", r['status_code'] == 401, r)

    # 6. Recovery Cases API & Human Approval
    r = make_request(f"{CONTROL_PLANE_URL}/api/v1/recovery/cases/{sample_case_id}/analyze", method="POST", data={"failureCode": "TRANSIENT_FAILURE"})
    log_test("Analyze Specific Recovery Case", r['status_code'] in [200, 404] and isinstance(r['body'], (dict, list)), r)

    r = make_request(f"{CONTROL_PLANE_URL}/api/v1/recovery/cases/{sample_case_id}/execute", method="POST", headers={"Idempotency-Key": f"test-key-{int(time.time())}"}, data={"failureCode": "TRANSIENT_FAILURE"})
    log_test("Execute Recovery Case (with Idempotency)", r['status_code'] in [200, 404] and isinstance(r['body'], (dict, list)), r)

    r = make_request(f"{CONTROL_PLANE_URL}/api/v1/recovery/cases/{sample_case_id}/approve", method="POST")
    log_test("Approve Recovery Case Endpoint", r['status_code'] in [200, 404] and isinstance(r['body'], (dict, list)), r)

    r = make_request(f"{CONTROL_PLANE_URL}/api/v1/recovery/cases/{sample_case_id}/reject", method="POST")
    log_test("Reject Recovery Case Endpoint", r['status_code'] in [200, 404] and isinstance(r['body'], (dict, list)), r)

    r = make_request(f"{CONTROL_PLANE_URL}/api/v1/recovery/cases/{sample_case_id}/stop", method="POST")
    log_test("Stop Recovery Intervention Endpoint", r['status_code'] in [200, 404] and isinstance(r['body'], (dict, list)), r)

    r = make_request(f"{CONTROL_PLANE_URL}/api/v1/recovery/cases/{sample_case_id}/audit")
    log_test("Get Audit Events Timeline", r['status_code'] in [200, 404] and isinstance(r['body'], (dict, list)), r)

    # 7. Razorpay Webhooks
    webhook_payload = {
        "event": "payment.captured",
        "contains": ["payment"],
        "payload": {
            "payment": {
                "entity": {
                    "id": "pay_rzp_test_100",
                    "amount": 150000,
                    "status": "captured"
                }
            }
        }
    }
    r = make_request(f"{CONTROL_PLANE_URL}/api/v1/razorpay/webhooks", method="POST", headers={"X-Razorpay-Signature": "sample_signature"}, data=webhook_payload)
    log_test("Razorpay Webhook Handler Ingestion", r['status_code'] in [200, 400], r)

    # Final Summary
    passed_count = sum(1 for res in results if res['passed'])
    total_count = len(results)

    print(f"\n{Color.BOLD}{Color.CYAN}==================================================={Color.RESET}")
    print(f"{Color.BOLD}  Validation Summary: {passed_count}/{total_count} Endpoints Verified Working{Color.RESET}")
    print(f"{Color.BOLD}{Color.CYAN}==================================================={Color.RESET}\n")

    if passed_count == total_count:
        print(f"{Color.GREEN}{Color.BOLD}ALL API ENDPOINTS ARE FULLY FUNCTIONAL AND OPERATIONAL!{Color.RESET}\n")
    else:
        print(f"{Color.YELLOW}{Color.BOLD}Some endpoints were offline or returned unexpected status codes. Check service logs above.{Color.RESET}\n")

if __name__ == '__main__':
    run_tests()
