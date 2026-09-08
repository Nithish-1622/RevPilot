# PowerShell Script to Test All RevPilot REST Endpoints
$CONTROL_PLANE_URL = "http://localhost:8080"
$AI_SERVICE_URL = "http://localhost:8000"
$AI_SERVICE_TOKEN = "revpilot_ai_service_secret_token_12345"

Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "  RevPilot PowerShell API Verification Suite       " -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host ""

$Passed = 0
$Failed = 0

function Test-Endpoint {
    param (
        [string]$Name,
        [int]$ExpectedCode,
        [string]$Method,
        [string]$Url,
        [hashtable]$Headers = @{},
        [object]$Body = $null
    )

    try {
        $params = @{
            Uri = $Url
            Method = $Method
            Headers = $Headers
            UseBasicParsing = $true
        }
        if ($Body) {
            $params["Body"] = ($Body | ConvertTo-Json -Depth 5)
            $params["ContentType"] = "application/json"
        }

        $res = Invoke-WebRequest @params
        $statusCode = [int]$res.StatusCode
    } catch {
        if ($_.Exception.Response) {
            $statusCode = [int]$_.Exception.Response.StatusCode
        } else {
            $statusCode = 0
        }
    }

    if ($statusCode -eq $ExpectedCode) {
        Write-Host "[PASS] $Name (HTTP $statusCode)" -ForegroundColor Green
        $script:Passed++
    } else {
        Write-Host "[FAIL] $Name (Expected HTTP $ExpectedCode, Got HTTP $statusCode)" -ForegroundColor Red
        $script:Failed++
    }
}

# 1. System Health
Test-Endpoint -Name "Control Plane Actuator Health" -ExpectedCode 200 -Method "GET" -Url "$CONTROL_PLANE_URL/actuator/health"
Test-Endpoint -Name "FastAPI AI Service Health" -ExpectedCode 200 -Method "GET" -Url "$AI_SERVICE_URL/health"
Test-Endpoint -Name "ML Models Metadata API" -ExpectedCode 200 -Method "GET" -Url "$CONTROL_PLANE_URL/api/v1/models"

# 2. Demo Simulator
Test-Endpoint -Name "Generate Demo Failure Batch" -ExpectedCode 200 -Method "POST" -Url "$CONTROL_PLANE_URL/api/v1/demo/generate-batch?count=5"
Test-Endpoint -Name "Run Autopilot Recovery Loop" -ExpectedCode 200 -Method "POST" -Url "$CONTROL_PLANE_URL/api/v1/demo/run-recovery"

# 3. Dashboard Metrics
Test-Endpoint -Name "Get Dashboard Summary Metrics" -ExpectedCode 200 -Method "GET" -Url "$CONTROL_PLANE_URL/api/v1/dashboard/summary"
Test-Endpoint -Name "Get Recent Audit Activity" -ExpectedCode 200 -Method "GET" -Url "$CONTROL_PLANE_URL/api/v1/dashboard/activity"

# 4. Merchant Policy
Test-Endpoint -Name "Get Merchant Policy Config" -ExpectedCode 200 -Method "GET" -Url "$CONTROL_PLANE_URL/api/v1/policy/merch_demo_101"
$policyPayload = @{
    merchantId = "merch_demo_101"
    maxRetryAttempts = 3
    maxDiscountPercent = 15.00
    approvalThreshold = 5000.00
    maxIncentiveCount = 2
    minimumRecoveryProbability = 0.4000
    coolOffPeriodMinutes = 120
}
Test-Endpoint -Name "Update Merchant Policy Config" -ExpectedCode 200 -Method "POST" -Url "$CONTROL_PLANE_URL/api/v1/policy/merch_demo_101" -Body $policyPayload

# 5. Direct FastAPI Intelligence Engine
$aiPayload = @{
    payment_id = "pay_ps_100"
    customer_id = "cust_100"
    merchant_id = "merch_demo_101"
    amount = 1800.0
    failure_code = "TRANSIENT_FAILURE"
    attempt_number = 1
}
Test-Endpoint -Name "FastAPI Direct AI StateGraph Analysis" -ExpectedCode 200 -Method "POST" -Url "$AI_SERVICE_URL/api/v1/recovery/analyze" -Headers @{"X-AI-Service-Token"=$AI_SERVICE_TOKEN} -Body $aiPayload
Test-Endpoint -Name "FastAPI AI Unauthorized Check" -ExpectedCode 401 -Method "POST" -Url "$AI_SERVICE_URL/api/v1/recovery/analyze" -Headers @{"X-AI-Service-Token"="invalid_token"} -Body $aiPayload

# 6. Recovery Cases & Human Approval
$sampleCase = "REC-pay_test_1"
Test-Endpoint -Name "Analyze Specific Recovery Case" -ExpectedCode 200 -Method "POST" -Url "$CONTROL_PLANE_URL/api/v1/recovery/cases/$sampleCase/analyze" -Body @{failureCode="TRANSIENT_FAILURE"}
Test-Endpoint -Name "Execute Recovery Case with Idempotency" -ExpectedCode 200 -Method "POST" -Url "$CONTROL_PLANE_URL/api/v1/recovery/cases/$sampleCase/execute" -Headers @{"Idempotency-Key"="ps-key-1001"} -Body @{failureCode="TRANSIENT_FAILURE"}
Test-Endpoint -Name "Approve Recovery Case Endpoint" -ExpectedCode 200 -Method "POST" -Url "$CONTROL_PLANE_URL/api/v1/recovery/cases/$sampleCase/approve"
Test-Endpoint -Name "Reject Recovery Case Endpoint" -ExpectedCode 200 -Method "POST" -Url "$CONTROL_PLANE_URL/api/v1/recovery/cases/$sampleCase/reject"
Test-Endpoint -Name "Stop Recovery Intervention Endpoint" -ExpectedCode 200 -Method "POST" -Url "$CONTROL_PLANE_URL/api/v1/recovery/cases/$sampleCase/stop"
Test-Endpoint -Name "Get Audit Events Timeline" -ExpectedCode 200 -Method "GET" -Url "$CONTROL_PLANE_URL/api/v1/recovery/cases/$sampleCase/audit"

Write-Host ""
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "  Verification Complete: Passed=$Passed, Failed=$Failed" -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan
