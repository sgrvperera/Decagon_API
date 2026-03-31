# Response Capture and Assertion Workflow

## Overview

This document describes the **exact workflow** for capturing API responses and deriving scenario-specific assertions. This is a **temporary workflow** used only when you need to update or verify assertions. Normal test execution does NOT require response capture.

---

## Architecture Summary

### Current State (Already Implemented)

1. **Response Capture Layer** (`src/helpers/response-capture.ts`)
   - Captures all API requests/responses when `CAPTURE_API_RESPONSES=true`
   - Saves to `test-results/api-captures/YYYY-MM-DD/session-*/`
   - Organized by domain (gsm-packages, hbb-packages, etc.)
   - Includes full request/response details + timing

2. **Response Consolidator** (`src/helpers/response-consolidator.ts`)
   - Reads all captured responses from a session
   - Consolidates into single `reference-responses.json` file
   - Analyzes responses and suggests assertions
   - CLI tool: `npx ts-node src/helpers/response-consolidator.ts`

3. **Assertion Executor** (`src/helpers/assertion-executor.ts`)
   - Generic assertion engine
   - Reads assertions from scenario JSON files
   - Supports 9 assertion types (status, responseTime, bodyNotEmpty, requiredFields, fieldValues, fieldMatches, bodyContains, arrayFields, arrayMinLength)

4. **Scenario Runner** (`src/helpers/scenario-runner.ts`)
   - Generic test runner
   - Loads scenarios from JSON
   - Executes requests with capture context
   - Runs assertions from scenario JSON

5. **API Client** (`src/api/client/api-client.ts`)
   - Integrated with response capture
   - Passes captureContext to response-capture layer
   - Works normally when capture is disabled

---

## The Three-Phase Workflow

### PHASE 1: Capture API Responses (Temporary)

**Purpose**: Collect real API responses for analysis

**Command**:
```bash
# Capture all tests
set CAPTURE_API_RESPONSES=true && npx playwright test tests/e2e

# Capture specific tag only
set CAPTURE_API_RESPONSES=true && set TEST_TAG=@smoke && npx playwright test tests/e2e

# Capture specific domain
set CAPTURE_API_RESPONSES=true && npx playwright test tests/e2e/gsm-packages.spec.ts
```

**What Happens**:
- Tests run normally
- Every API call is captured to `test-results/api-captures/YYYY-MM-DD/session-HH-MM-SS/`
- Each capture includes:
  - Domain, scenario ID, scenario name, MIFE API
  - Request: method, endpoint, headers, body, queryParams
  - Response: status, headers, body, timing
  - Timestamp and duration

**Output Structure**:
```
test-results/api-captures/
└── 2024-01-15/
    └── session-10-30-45/
        ├── gsm-packages/
        │   ├── get-gsm-packages-postpaid-smoke-1234567890.json
        │   ├── check-gsm-package-eligibility-valid-postpaid-smoke-1234567891.json
        │   └── ...
        ├── hbb-packages/
        │   └── ...
        ├── dtv-packages/
        │   └── ...
        └── _summary.json
```

---

### PHASE 2: Consolidate and Analyze

**Purpose**: Create single reference file with suggested assertions

**Command**:
```bash
# Consolidate latest session
npx ts-node src/helpers/response-consolidator.ts

# Or use the workflow script
npx ts-node scripts/capture-and-consolidate.ts consolidate
```

**What Happens**:
- Finds latest capture session
- Reads all captured responses
- Analyzes each response and suggests assertions
- Creates `reference-responses.json` in the session directory

**Suggested Assertions Include**:
- `status`: Actual HTTP status code
- `responseTime`: 150% of actual duration (min 3000ms)
- `bodyNotEmpty`: true if response has body
- `requiredFields`: All top-level JSON keys
- `fieldValues`: Dialog-specific fields (executionStatus, executionMessage)
- `arrayFields`: Fields that are arrays
- `bodyContains`: Patterns for negative scenarios (error, fail, invalid, etc.)

**Output**:
```json
{
  "generatedAt": "2024-01-15T10:35:00.000Z",
  "totalResponses": 42,
  "domains": ["gsm-packages", "hbb-packages", "dtv-packages", ...],
  "responses": [
    {
      "domain": "gsm-packages",
      "scenarioId": "gsm-get-packages-postpaid-smoke",
      "scenarioName": "Get GSM Packages - Postpaid (Smoke)",
      "mifeApi": "SS-DIA-Get-Gsm-Packages-Query - v1.0.0",
      "request": { ... },
      "response": { ... },
      "duration": 1234,
      "suggestedAssertions": {
        "status": 200,
        "responseTime": 3000,
        "bodyNotEmpty": true,
        "requiredFields": ["executionStatus", "executionMessage", "packages"],
        "fieldValues": {
          "executionStatus": "00"
        },
        "arrayFields": ["packages"]
      }
    },
    ...
  ]
}
```

---

### PHASE 3: Update Scenario JSON Files

**Purpose**: Add comprehensive assertions to scenario definitions

**Process**:
1. Open `reference-responses.json`
2. For each response, find the matching scenario in `data/scenarios/*.json`
3. Update the `assertions` block with appropriate validations
4. Customize based on scenario type (positive vs negative)

**Example - Before**:
```json
{
  "id": "gsm-get-packages-postpaid-smoke",
  "name": "Get GSM Packages - Postpaid (Smoke)",
  "assertions": {
    "status": 200,
    "bodyNotEmpty": true
  }
}
```

**Example - After** (using captured response):
```json
{
  "id": "gsm-get-packages-postpaid-smoke",
  "name": "Get GSM Packages - Postpaid (Smoke)",
  "assertions": {
    "status": 200,
    "responseTime": 3000,
    "bodyNotEmpty": true,
    "requiredFields": ["executionStatus", "executionMessage", "packages"],
    "fieldValues": {
      "executionStatus": "00",
      "executionMessage": "Success"
    },
    "arrayFields": ["packages"],
    "arrayMinLength": {
      "packages": 1
    }
  }
}
```

**Assertion Types Reference**:

| Assertion | Type | Description | Example |
|-----------|------|-------------|---------|
| `status` | `number \| number[]` | HTTP status code(s) | `200` or `[200, 201]` |
| `responseTime` | `number` | Max response time in ms | `3000` |
| `bodyNotEmpty` | `boolean` | Response body must not be empty | `true` |
| `requiredFields` | `string[]` | Fields that must exist | `["executionStatus", "packages"]` |
| `fieldValues` | `Record<string, any>` | Exact field values | `{"executionStatus": "00"}` |
| `fieldMatches` | `Record<string, string>` | Regex patterns | `{"traceId": "^DIA\\d{12}$"}` |
| `bodyContains` | `string[]` | Substrings in response | `["error", "invalid"]` |
| `arrayFields` | `string[]` | Fields that must be arrays | `["packages", "addons"]` |
| `arrayMinLength` | `Record<string, number>` | Min array lengths | `{"packages": 1}` |

**Guidelines**:
- **Positive scenarios**: Assert success patterns (executionStatus: "00", required fields, array lengths)
- **Negative scenarios**: Assert failure patterns (bodyContains: ["error", "invalid"], executionStatus != "00")
- **GET requests**: Focus on data structure and array validations
- **POST requests**: Focus on executionStatus and response messages
- **Smoke tests**: Add responseTime assertions
- **Regression tests**: Add comprehensive field validations

---

## Normal Test Execution (After Assertions Are Added)

Once scenario JSON files have proper assertions:

```bash
# Run all tests (NO capture)
npx playwright test tests/e2e

# Run specific tag
set TEST_TAG=@smoke && npx playwright test tests/e2e

# Run specific domain
npx playwright test tests/e2e/gsm-packages.spec.ts
```

**What Happens**:
- Tests run normally
- Assertions are read from scenario JSON files
- Assertion executor validates responses
- No capture overhead
- Fast execution

---

## When to Re-Capture

Re-run the capture workflow when:
- API behavior changes
- New scenarios are added
- Assertions need to be updated
- Debugging test failures
- Validating API contract changes

---

## File Locations

| File | Purpose | Permanent? |
|------|---------|------------|
| `data/scenarios/*.json` | Scenario definitions with assertions | ✅ Yes (source of truth) |
| `test-results/api-captures/` | Captured responses | ❌ No (temporary reference) |
| `reference-responses.json` | Consolidated analysis | ❌ No (temporary reference) |
| `src/helpers/response-capture.ts` | Capture infrastructure | ✅ Yes (framework code) |
| `src/helpers/response-consolidator.ts` | Analysis tool | ✅ Yes (framework code) |
| `src/helpers/assertion-executor.ts` | Assertion engine | ✅ Yes (framework code) |
| `src/helpers/scenario-runner.ts` | Test runner | ✅ Yes (framework code) |

---

## Quick Reference Commands

```bash
# Full workflow (capture + consolidate)
npx ts-node scripts/capture-and-consolidate.ts full

# Capture only
npx ts-node scripts/capture-and-consolidate.ts capture

# Capture with tag filter
npx ts-node scripts/capture-and-consolidate.ts capture @smoke

# Consolidate only
npx ts-node scripts/capture-and-consolidate.ts consolidate

# Normal test run (no capture)
npx playwright test tests/e2e
```

---

## Summary

1. **Response capture is OPTIONAL** - controlled by `CAPTURE_API_RESPONSES=true`
2. **Scenario JSON files are the source of truth** - assertions live there
3. **Captured responses are temporary references** - used only for analysis
4. **Normal tests don't depend on captures** - they read assertions from JSON
5. **The framework is already complete** - no redesign needed
6. **Workflow is simple**: capture → consolidate → update JSON → run tests

