#!/usr/bin/env bash
# RevPilot Automated Endpoint Test Script using curl

CONTROL_PLANE_URL="http://localhost:8080"
AI_SERVICE_URL="http://localhost:8000"
AI_SERVICE_TOKEN="revpilot_ai_service_secret_token_12345"

GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color
CYAN='\033[0;36m'

PASSED=0
FAILED=0

test_curl() {
    local name="$1"
    local expected_code="$2"
    local method="$3"
    local url="$4"
    local headers="$5"
    local data="$6"

    local cmd="curl -s -o /dev/null -w '%{http_code}' -X $method '$url'"
    if [ -n "$headers" ]; then
        cmd="$cmd $headers"
    fi
    if [ -n "$data" ]; then
        cmd="$cmd -H 'Content-Type: application/json' -d '$data'"
    fi

    local code
    code=$(eval "$cmd")

    if [ "$code" -eq "$expected_code" ]; then
        echo -e "[${GREEN}PASS${NC}] $name (HTTP $code)"
        PASSED=$((PASSED + 1))
    else
        echo -e "[${RED}FAIL${NC}] $name (Expected HTTP $expected_code, Got HTTP $code)"
        FAILED=$((FAILED + 1))
    fi
}

echo -e "\n${CYAN}===================================================${NC}"
echo -e "${CYAN}  RevPilot curl Endpoint Verification Suite        ${NC}"
echo -e "${CYAN}===================================================${NC}\n"

# 1. System Health
test_curl "Control Plane Actuator Health" 200 "GET" "$CONTROL_PLANE_URL/actuator/health"
test_curl "FastAPI AI Service Health" 200 "GET" "$AI_SERVICE_URL/health"
test_curl "ML Models Metadata API" 200 "GET" "$CONTROL_PLANE_URL/api/v1/models"

# 2. Demo Simulator
test_curl "Generate Demo Failure Batch" 200 "POST" "$CONTROL_PLANE_URL/api/v1/demo/generate-batch?count=5"
test_curl "Run Autopilot Recovery Loop" 200 "POST" "$CONTROL_PLANE_URL/api/v1/demo/run-recovery"

# 3. Dashboard Metrics
test_curl "Get Dashboard Summary Metrics" 200 "GET" "$CONTROL_PLANE_URL/api/v1/dashboard/summary"
test_curl "Get Recent Audit Activity" 200 "GET" "$CONTROL_PLANE_URL/api/v1/dashboard/activity"

# 4. Merchant Policy
test_curl "Get Merchant Policy Config" 200 "GET" "$CONTROL_PLANE_URL/api/v1/policy/merch_demo_101"
policy_payload='{"merchantId":"merch_demo_101","maxRetryAttempts":3,"maxDiscountPercent":15.00,"approvalThreshold":5000.00,"maxIncentiveCount":2,"minimumRecoveryProbability":0.4000,"coolOffPeriodMinutes":120}'
test_curl "Update Merchant Policy Config" 200 "POST" "$CONTROL_PLANE_URL/api/v1/policy/merch_demo_101" "" "$policy_payload"

# 5. Direct FastAPI Intelligence Service
ai_payload='{"payment_id":"pay_curl_100","customer_id":"cust_100","merchant_id":"merch_demo_101","amount":1800.0,"failure_code":"TRANSIENT_FAILURE","attempt_number":1}'
test_curl "FastAPI Direct AI StateGraph Analysis" 200 "POST" "$AI_SERVICE_URL/api/v1/recovery/analyze" "-H 'X-AI-Service-Token: $AI_SERVICE_TOKEN'" "$ai_payload"
test_curl "FastAPI AI Unauthorized Check" 401 "POST" "$AI_SERVICE_URL/api/v1/recovery/analyze" "-H 'X-AI-Service-Token: invalid_token'" "$ai_payload"

# 6. Recovery Cases & Human Approval
sample_case="REC-pay_test_1"
test_curl "Analyze Specific Recovery Case" 200 "POST" "$CONTROL_PLANE_URL/api/v1/recovery/cases/$sample_case/analyze" "" '{"failureCode":"TRANSIENT_FAILURE"}'
test_curl "Execute Recovery Case with Idempotency" 200 "POST" "$CONTROL_PLANE_URL/api/v1/recovery/cases/$sample_case/execute" "-H 'Idempotency-Key: curl-key-1001'" '{"failureCode":"TRANSIENT_FAILURE"}'
test_curl "Approve Recovery Case Endpoint" 200 "POST" "$CONTROL_PLANE_URL/api/v1/recovery/cases/$sample_case/approve"
test_curl "Reject Recovery Case Endpoint" 200 "POST" "$CONTROL_PLANE_URL/api/v1/recovery/cases/$sample_case/reject"
test_curl "Stop Recovery Intervention Endpoint" 200 "POST" "$CONTROL_PLANE_URL/api/v1/recovery/cases/$sample_case/stop"
test_curl "Get Audit Events Timeline" 200 "GET" "$CONTROL_PLANE_URL/api/v1/recovery/cases/$sample_case/audit"

echo -e "\n${CYAN}===================================================${NC}"
echo -e "  Verification Complete: Passed=$PASSED, Failed=$FAILED"
echo -e "${CYAN}===================================================${NC}\n"
