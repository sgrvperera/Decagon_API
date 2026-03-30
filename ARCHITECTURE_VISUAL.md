# Framework Architecture - Visual Guide

## 🏗️ High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                     ENTERPRISE API FRAMEWORK                         │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                         CONFIGURATION LAYER                          │
├─────────────────────────────────────────────────────────────────────┤
│  config/test-config.ts                                              │
│  config/environments/dev.env, staging.env, prod.env                 │
│                                                                      │
│  Provides: BASE_URL, TRACE_ID, TIMEOUT, RETRIES, MOCK_MODE         │
└─────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────┐
│                          DATA MANAGEMENT LAYER                       │
├─────────────────────────────────────────────────────────────────────┤
│  data/test-data/                                                    │
│    ├── accounts.data.json    (Test accounts by type/SBU)           │
│    ├── packages.data.json    (Package codes and details)           │
│    └── common.data.json      (Shared test values)                  │
│                                                                      │
│  src/helpers/data-provider.ts                                       │
│    - getAccount(filters)                                            │
│    - getPackage(filters)                                            │
│    - getCommonData(key)                                             │
└─────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────┐
│                         SCENARIO DEFINITION LAYER                    │
├─────────────────────────────────────────────────────────────────────┤
│  data/scenarios/                                                    │
│    ├── gsm-packages.scenarios.json                                  │
│    ├── hbb-packages.scenarios.json                                  │
│    ├── dtv-packages.scenarios.json                                  │
│    └── ...                                                          │
│                                                                      │
│  Each scenario defines:                                             │
│    - id, name, description                                          │
│    - tags (@smoke, @regression, @negative)                          │
│    - method, path, headers, body, queryParams                       │
│    - expectedStatus                                                 │
│    - assertions (status, schema, field, contains)                   │
│                                                                      │
│  src/helpers/scenario-loader.ts                                     │
│    - loadScenarios(domain)                                          │
│    - getScenariosByTag(tag)                                         │
└─────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────┐
│                           TEST EXECUTION LAYER                       │
├─────────────────────────────────────────────────────────────────────┤
│  tests/scenarios/                                                   │
│    ├── gsm-packages.spec.ts                                         │
│    ├── hbb-packages.spec.ts                                         │
│    └── ...                                                          │
│                                                                      │
│  Test Flow:                                                         │
│    1. Load scenarios from JSON                                      │
│    2. Filter by tags (if TEST_TAG set)                              │
│    3. Interpolate data placeholders                                 │
│    4. Build request                                                 │
│    5. Execute via API client                                        │
│    6. Validate response                                             │
└─────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────┐
│                          REQUEST BUILDING LAYER                      │
├─────────────────────────────────────────────────────────────────────┤
│  src/api/client/request-builder.ts                                  │
│    - buildHeaders(options)                                          │
│    - buildQueryString(params)                                       │
│    - buildUrl(path, params)                                         │
│                                                                      │
│  src/api/auth/auth-handler.ts                                       │
│    - getAuthHeaders()                                               │
│    - setToken(token)                                                │
│    - Support: Bearer, Basic, API Key                                │
└─────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────┐
│                          API CLIENT LAYER                            │
├─────────────────────────────────────────────────────────────────────┤
│  src/api/client/api-client.ts                                       │
│                                                                      │
│  Features:                                                          │
│    ✓ HTTP Methods: GET, POST, PUT, DELETE                           │
│    ✓ Retry Logic: Exponential backoff                               │
│    ✓ Mock Mode: Return fake responses                               │
│    ✓ Logging: Request/response logging                              │
│    ✓ Timeout: Configurable per request                              │
│    ✓ Error Handling: Graceful failures                              │
└─────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────┐
│                              API UNDER TEST                          │
├─────────────────────────────────────────────────────────────────────┤
│  https://chatbot.dialog.lk/dia-api-engine/api/...                  │
└─────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────┐
│                          VALIDATION LAYER                            │
├─────────────────────────────────────────────────────────────────────┤
│  src/validators/response-validator.ts                               │
│    - validate(response, assertions)                                 │
│    - validateStatus(expected)                                       │
│    - validateField(field, expected)                                 │
│    - validateContains(field, expected)                              │
│    - validateSchema(schemaFile)                                     │
│                                                                      │
│  src/validators/schema-validator.ts                                 │
│    - loadSchema(schemaName)                                         │
│    - validate(schemaName, data)                                     │
│                                                                      │
│  src/validators/schemas/                                            │
│    ├── gsm-packages.schema.json                                     │
│    ├── eligibility.schema.json                                      │
│    └── ...                                                          │
└─────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────┐
│                            REPORTING LAYER                           │
├─────────────────────────────────────────────────────────────────────┤
│  Playwright Reports:                                                │
│    - HTML Report (playwright-report/)                               │
│    - JSON Report (test-results/results.json)                        │
│    - Console Output (list reporter)                                 │
│                                                                      │
│  Test Results Include:                                              │
│    - Scenario name and tags                                         │
│    - Pass/Fail status                                               │
│    - Execution time                                                 │
│    - Error details                                                  │
│    - Request/response logs                                          │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Data Flow Diagram

```
┌──────────────┐
│  Test Start  │
└──────┬───────┘
       │
       ↓
┌─────────────────────────────────────┐
│  Load Scenario from JSON            │
│  (scenario-loader.ts)               │
└──────┬──────────────────────────────┘
       │
       ↓
┌─────────────────────────────────────┐
│  Filter by Tags                     │
│  (test-tags.ts)                     │
│  Skip if doesn't match TEST_TAG     │
└──────┬──────────────────────────────┘
       │
       ↓
┌─────────────────────────────────────┐
│  Interpolate Data Placeholders      │
│  {{account.postpaid.gsm.msisdn}}    │
│  → "763290602"                      │
│  (data-provider.ts)                 │
└──────┬──────────────────────────────┘
       │
       ↓
┌─────────────────────────────────────┐
│  Build Request                      │
│  - Headers (with auth)              │
│  - Query params                     │
│  - Body                             │
│  (request-builder.ts)               │
└──────┬──────────────────────────────┘
       │
       ↓
┌─────────────────────────────────────┐
│  Execute Request                    │
│  - Check mock mode                  │
│  - Retry on failure                 │
│  - Log request/response             │
│  (api-client.ts)                    │
└──────┬──────────────────────────────┘
       │
       ↓
┌─────────────────────────────────────┐
│  Validate Response                  │
│  - Status code                      │
│  - JSON schema                      │
│  - Field values                     │
│  - Contains checks                  │
│  (response-validator.ts)            │
└──────┬──────────────────────────────┘
       │
       ↓
┌─────────────────────────────────────┐
│  Report Result                      │
│  - Pass/Fail                        │
│  - Logs                             │
│  - Screenshots (if failure)         │
└──────┬──────────────────────────────┘
       │
       ↓
┌──────────────┐
│   Test End   │
└──────────────┘
```

---

## 🎯 Scenario Execution Flow

```
Scenario JSON
    │
    ├─ id: "gsm-packages-postpaid-smoke"
    ├─ name: "Get GSM Packages - Postpaid (Smoke)"
    ├─ tags: ["@smoke", "@regression", "@postpaid", "@gsm"]
    ├─ method: "GET"
    ├─ path: "/api/gsm-package/v1/packages"
    ├─ queryParams: { "connectionType": "POSTPAID" }
    ├─ expectedStatus: 200
    └─ assertions: [
         { type: "status", expected: 200 },
         { type: "schema", schemaFile: "gsm-packages" },
         { type: "field", field: "status", expected: "success" }
       ]
    
    ↓ Load Scenario
    
Test File (gsm-packages.spec.ts)
    │
    ├─ Load scenarios from JSON
    ├─ Filter by tags
    └─ For each scenario:
         │
         ├─ Interpolate data
         ├─ Build request
         ├─ Execute via client
         └─ Validate response
    
    ↓ Execute
    
API Client
    │
    ├─ Check mock mode
    ├─ Build full URL
    ├─ Add headers (auth, traceId)
    ├─ Execute with retry
    └─ Log response
    
    ↓ Response
    
Response Validator
    │
    ├─ Check status: 200 ✓
    ├─ Validate schema: gsm-packages.schema.json ✓
    └─ Check field: response.status === "success" ✓
    
    ↓ Result
    
Test Report
    │
    └─ ✓ Get GSM Packages - Postpaid (Smoke) @smoke @regression @postpaid @gsm
       Duration: 1.2s
       Status: PASSED
```

---

## 🏷️ Tag-Based Filtering

```
All Scenarios (290 total)
    │
    ├─ @smoke (58 scenarios)
    │   └─ Critical path tests
    │       Run on: Every commit
    │       Duration: ~5 minutes
    │
    ├─ @regression (174 scenarios)
    │   └─ Full test suite
    │       Run on: Pull requests
    │       Duration: ~15 minutes
    │
    ├─ @negative (58 scenarios)
    │   └─ Error handling tests
    │       Run on: Nightly builds
    │       Duration: ~8 minutes
    │
    ├─ @gsm (45 scenarios)
    │   └─ GSM service tests
    │       Run on: GSM feature changes
    │
    ├─ @hbb (30 scenarios)
    │   └─ HBB service tests
    │       Run on: HBB feature changes
    │
    └─ @dtv (25 scenarios)
        └─ DTV service tests
            Run on: DTV feature changes

Filter by tag:
    npm run test:smoke      → Run @smoke only
    npm run test:regression → Run @regression only
    npm run test:negative   → Run @negative only
    TEST_TAG=@gsm npm test  → Run @gsm only
```

---

## 🌍 Environment Switching

```
┌─────────────────────────────────────────────────────────────┐
│                    Environment Configs                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  config/environments/dev.env                                │
│    BASE_URL=https://dev.dialog.lk                           │
│    TRACE_ID=DEV_TRACE                                       │
│                                                              │
│  config/environments/staging.env                            │
│    BASE_URL=https://staging.dialog.lk                       │
│    TRACE_ID=STAGING_TRACE                                   │
│                                                              │
│  config/environments/prod.env                               │
│    BASE_URL=https://api.dialog.lk                           │
│    TRACE_ID=PROD_TRACE                                      │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    Environment Selection                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  TEST_ENV=dev npm test      → Load dev.env                  │
│  TEST_ENV=staging npm test  → Load staging.env              │
│  TEST_ENV=prod npm test     → Load prod.env                 │
│                                                              │
│  Default: dev                                               │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    Test Execution                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  All requests use:                                          │
│    - BASE_URL from selected environment                     │
│    - TRACE_ID from selected environment                     │
│    - Test data from data/test-data/                         │
│                                                              │
│  Same tests, different environments!                        │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔐 Authentication Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    Auth Handler                              │
│                    (auth-handler.ts)                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Supports:                                                  │
│    - Bearer Token                                           │
│    - Basic Auth                                             │
│    - API Key                                                │
│    - None                                                   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    Request Builder                           │
│                    (request-builder.ts)                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  buildHeaders(options):                                     │
│    1. Add default headers (Content-Type, traceId)          │
│    2. Add auth headers (if auth provided)                  │
│    3. Add custom headers (from scenario)                   │
│    4. Return merged headers                                │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    API Request                               │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Headers:                                                   │
│    Content-Type: application/json                           │
│    traceId: DIA123456789012                                 │
│    Authorization: Bearer <token>  (if auth enabled)         │
│    Custom-Header: value           (if in scenario)          │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 Validation Flow

```
API Response
    │
    ↓
┌─────────────────────────────────────────────────────────────┐
│              Response Validator                              │
│              (response-validator.ts)                         │
└─────────────────────────────────────────────────────────────┘
    │
    ├─ Assertion 1: Status Check
    │   ├─ Expected: 200
    │   ├─ Actual: 200
    │   └─ Result: ✓ PASS
    │
    ├─ Assertion 2: Schema Validation
    │   ├─ Schema: gsm-packages.schema.json
    │   ├─ Validator: schema-validator.ts
    │   ├─ Check: Response matches schema
    │   └─ Result: ✓ PASS
    │
    ├─ Assertion 3: Field Validation
    │   ├─ Field: response.status
    │   ├─ Expected: "success"
    │   ├─ Actual: "success"
    │   └─ Result: ✓ PASS
    │
    └─ Assertion 4: Contains Check
        ├─ Field: response.data.packages
        ├─ Expected: Contains "SPM_2700"
        ├─ Actual: ["SPM_2700", "SPM_3000", ...]
        └─ Result: ✓ PASS

All Assertions Pass → Test PASSED
Any Assertion Fails → Test FAILED
```

---

## 🚀 CI/CD Pipeline

```
┌─────────────────────────────────────────────────────────────┐
│                    GitHub Push/PR                            │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    Smoke Tests Job                           │
├─────────────────────────────────────────────────────────────┤
│  Trigger: Every push                                        │
│  Command: npm run test:smoke                                │
│  Duration: ~5 minutes                                       │
│  Environment: Staging                                       │
│  Parallel: 4 workers                                        │
└─────────────────────────────────────────────────────────────┘
                            ↓
                    ✓ Smoke Tests Pass
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    Regression Tests Job                      │
├─────────────────────────────────────────────────────────────┤
│  Trigger: Pull requests only                                │
│  Command: npm run test:regression                           │
│  Duration: ~15 minutes                                      │
│  Environment: Staging                                       │
│  Parallel: 4 workers                                        │
└─────────────────────────────────────────────────────────────┘
                            ↓
                    ✓ Regression Tests Pass
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    Upload Artifacts                          │
├─────────────────────────────────────────────────────────────┤
│  - HTML Report                                              │
│  - JSON Results                                             │
│  - Screenshots (if failures)                                │
│  - Traces (if failures)                                     │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    Merge Approved                            │
└─────────────────────────────────────────────────────────────┘
```

---

## 📈 Scalability Model

```
Current: 58 APIs
    │
    ├─ Old Framework: 58 tests (1 per API)
    │   └─ Time to add 1 API: 30 minutes
    │
    └─ New Framework: 174-290 tests (3-5 per API)
        └─ Time to add 1 API: 5 minutes

Future: 200 APIs
    │
    ├─ Old Framework: 200 tests
    │   ├─ Maintenance: Nightmare
    │   ├─ Execution: 2 hours
    │   └─ Coverage: Basic
    │
    └─ New Framework: 600-1000 tests
        ├─ Maintenance: Easy (JSON only)
        ├─ Execution: 20 minutes (parallel)
        └─ Coverage: Comprehensive

Scalability Factor: 10x better
```

---

**This visual guide shows how all components work together to create a robust, scalable, enterprise-grade API testing framework.**
