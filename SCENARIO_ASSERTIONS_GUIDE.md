# Scenario-Driven Assertions Framework - Implementation Guide

## Overview

This framework implements **scenario-driven assertions** where:
- **Assertions live in scenario JSON files** (source of truth)
- **Response capture is a reference tool** (not the source of truth)
- **Test specs are generic** (read assertions from JSON)
- **Workflow is capture → analyze → define → test**

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    WORKFLOW                                  │
└─────────────────────────────────────────────────────────────┘

Step 1: Capture Responses (Optional, Reference Only)
  ↓
  Run tests with CAPTURE_API_RESPONSES=true
  ↓
  Responses saved to: test-results/api-captures/

Step 2: Consolidate Responses (One-time or as needed)
  ↓
  Run: npm run consolidate-responses
  ↓
  Creates: reference-responses.json with suggested assertions

Step 3: Update Scenario JSON Files (Manual, Based on Analysis)
  ↓
  Edit: data/scenarios/*.json
  ↓
  Add assertions to each scenario based on captured responses

Step 4: Run Tests (Normal Operation)
  ↓
  Tests read assertions from scenario JSON
  ↓
  No dependency on captured responses
```

---

## Files Created

### Core Framework
1. **src/helpers/response-consolidator.ts** - Consolidates captured responses into reference file
2. **src/helpers/assertion-executor.ts** - Generic assertion executor (reads from JSON)
3. **src/helpers/scenario-runner.ts** - Generic test spec template

### Updated Specs (All domains now use generic runner)
- tests/e2e/gsm-packages.spec.ts
- tests/e2e/hbb-packages.spec.ts
- tests/e2e/dtv-packages.spec.ts
- tests/e2e/mbb-packages.spec.ts
- tests/e2e/mbb-addons.spec.ts
- tests/e2e/hbb-addons.spec.ts
- tests/e2e/dtv-channels.spec.ts

---

## Step-by-Step Usage

### Step 1: Capture API Responses

```bash
# Enable response capture
set CAPTURE_API_RESPONSES=true

# Run all tests to capture responses
npx playwright test tests/e2e/

# Or run specific domain
npx playwright test tests/e2e/gsm-packages.spec.ts
```

**Result**: Responses saved to `test-results/api-captures/YYYY-MM-DD/session-HH-MM-SS/`

### Step 2: Consolidate Responses into Reference File

```bash
# Run consolidator
npx ts-node src/helpers/response-consolidator.ts
```

**Result**: Creates `reference-responses.json` with:
- All captured responses
- Suggested assertions per scenario
- Analysis of response patterns

### Step 3: Analyze Reference File

Open `test-results/api-captures/.../reference-responses.json`

Example structure:
```json
{
  "generatedAt": "2024-01-15T10:30:00.000Z",
  "totalResponses": 42,
  "domains": ["gsm-packages", "hbb-packages", ...],
  "responses": [
    {
      "domain": "gsm-packages",
      "scenarioId": "gsm-get-packages-postpaid-smoke",
      "scenarioName": "Get GSM Packages - Postpaid (Smoke)",
      "mifeApi": "SS-DIA-Get-Gsm-Packages-Query - v1.0.0",
      "request": { ... },
      "response": {
        "status": 200,
        "body": {
          "executionStatus": "00",
          "executionMessage": "Success",
          "responseData": [...]
        }
      },
      "duration": 1234,
      "suggestedAssertions": {
        "status": 200,
        "responseTime": 1851,
        "bodyNotEmpty": true,
        "requiredFields": ["executionStatus", "executionMessage", "responseData"],
        "fieldValues": {
          "executionStatus": "00"
        },
        "arrayFields": ["responseData"]
      }
    }
  ]
}
```

### Step 4: Update Scenario JSON Files

Based on the reference file, update each scenario in `data/scenarios/*.json`:

**Before** (minimal assertions):
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

**After** (comprehensive assertions):
```json
{
  "id": "gsm-get-packages-postpaid-smoke",
  "name": "Get GSM Packages - Postpaid (Smoke)",
  "assertions": {
    "status": 200,
    "responseTime": 3000,
    "bodyNotEmpty": true,
    "requiredFields": ["executionStatus", "executionMessage", "responseData"],
    "fieldValues": {
      "executionStatus": "00"
    },
    "arrayFields": ["responseData"]
  }
}
```

### Step 5: Run Tests with New Assertions

```bash
# Normal test run (no capture needed)
npx playwright test tests/e2e/

# Assertions are read from scenario JSON files
```

---

## Assertion Types Supported

### 1. Status Code
```json
"assertions": {
  "status": 200
}
```
or multiple:
```json
"assertions": {
  "status": [200, 201]
}
```

### 2. Response Time
```json
"assertions": {
  "responseTime": 5000
}
```

### 3. Body Not Empty
```json
"assertions": {
  "bodyNotEmpty": true
}
```

### 4. Required Fields
```json
"assertions": {
  "requiredFields": ["executionStatus", "executionMessage", "responseData"]
}
```

### 5. Field Values
```json
"assertions": {
  "fieldValues": {
    "executionStatus": "00",
    "executionMessage": "Success"
  }
}
```

### 6. Field Matches (Regex)
```json
"assertions": {
  "fieldMatches": {
    "accountNumber": "^\\d{9}$",
    "traceId": "^[A-Z]{3}\\d{12}$"
  }
}
```

### 7. Body Contains
```json
"assertions": {
  "bodyContains": ["success", "eligible"]
}
```

### 8. Array Fields
```json
"assertions": {
  "arrayFields": ["responseData", "packages"]
}
```

### 9. Array Min Length
```json
"assertions": {
  "arrayMinLength": {
    "responseData": 1,
    "packages": 5
  }
}
```

---

## Example: Complete Scenario with Assertions

```json
{
  "id": "gsm-check-eligibility-postpaid-valid",
  "name": "Check GSM Package Eligibility - Valid Postpaid (Smoke)",
  "mifeApi": "SS-DIA-Gsm-Package-Change-Eligibility-Query - v1.0.0",
  "tags": ["@smoke", "@regression", "@postpaid", "@gsm"],
  "method": "POST",
  "endpoint": "/dia-api-engine/api/gsm-package/v1/check-the-eligibility-for-package",
  "headers": {
    "traceId": "{{traceId}}",
    "Content-Type": "application/json"
  },
  "body": {
    "accountNumber": "{{number}}",
    "packageCode": "SPM_2700"
  },
  "numberResolution": {
    "apiDomain": "gsm-packages",
    "operation": "eligibility",
    "connectionType": "POSTPAID",
    "serviceType": "GSM",
    "scenarioType": "positive"
  },
  "expectedStatus": 200,
  "assertions": {
    "status": 200,
    "responseTime": 4000,
    "bodyNotEmpty": true,
    "requiredFields": ["executionStatus", "executionMessage", "eligible"],
    "fieldValues": {
      "executionStatus": "00",
      "eligible": true
    }
  }
}
```

---

## Negative Scenario Example

```json
{
  "id": "gsm-check-eligibility-invalid-account",
  "name": "Check GSM Package Eligibility - Invalid Account (Negative)",
  "mifeApi": "SS-DIA-Gsm-Package-Change-Eligibility-Query - v1.0.0",
  "tags": ["@negative", "@gsm"],
  "method": "POST",
  "endpoint": "/dia-api-engine/api/gsm-package/v1/check-the-eligibility-for-package",
  "headers": {
    "traceId": "{{traceId}}",
    "Content-Type": "application/json"
  },
  "body": {
    "accountNumber": "{{number}}",
    "packageCode": "SPM_2700"
  },
  "numberResolution": {
    "apiDomain": "gsm-packages",
    "operation": "eligibility",
    "connectionType": "POSTPAID",
    "serviceType": "GSM",
    "scenarioType": "negative"
  },
  "expectedStatus": 200,
  "assertions": {
    "status": 200,
    "bodyNotEmpty": true,
    "requiredFields": ["executionStatus", "executionMessage"],
    "bodyContains": ["eligible", "false"]
  }
}
```

---

## NPM Scripts to Add

Add to `package.json`:

```json
{
  "scripts": {
    "capture-responses": "set CAPTURE_API_RESPONSES=true && npx playwright test tests/e2e/",
    "consolidate-responses": "npx ts-node src/helpers/response-consolidator.ts",
    "test:with-capture": "set CAPTURE_API_RESPONSES=true && npx playwright test",
    "test:normal": "npx playwright test tests/e2e/"
  }
}
```

---

## Workflow in Real Company

### Initial Setup (One-time)
1. Run tests with capture enabled
2. Consolidate responses into reference file
3. Analyze reference file
4. Update all scenario JSON files with proper assertions
5. Commit scenario JSON files to version control

### Normal Development
1. Run tests normally (no capture)
2. Tests read assertions from scenario JSON
3. Fast execution, no file I/O overhead

### When API Changes
1. Re-enable capture for affected domains
2. Consolidate new responses
3. Compare with previous reference file
4. Update scenario assertions if needed
5. Commit updated scenario JSON files

### Adding New Scenarios
1. Add scenario to JSON file with minimal assertions
2. Run with capture enabled
3. Review captured response
4. Update scenario with proper assertions
5. Commit updated scenario file

---

## Benefits of This Approach

### ✅ Scenario JSON is Source of Truth
- Assertions live with scenario definitions
- Easy to review and update
- Version controlled
- Self-documenting

### ✅ Test Specs are Generic
- No hardcoded assertions in code
- Reusable across all domains
- Easy to maintain
- Consistent behavior

### ✅ Response Capture is Reference Tool
- Optional (only when needed)
- Helps discover correct assertions
- Useful for debugging
- Not required for normal test runs

### ✅ Scalable and Maintainable
- Add new domains easily
- Update assertions without code changes
- Clear separation of concerns
- Enterprise-grade design

---

## Files Modified Summary

### New Files (3)
1. `src/helpers/response-consolidator.ts` - Response consolidation utility
2. `src/helpers/assertion-executor.ts` - Generic assertion executor
3. `src/helpers/scenario-runner.ts` - Generic test spec template

### Modified Files (7 spec files)
All test specs now use generic runner:
- `tests/e2e/gsm-packages.spec.ts`
- `tests/e2e/hbb-packages.spec.ts`
- `tests/e2e/dtv-packages.spec.ts`
- `tests/e2e/mbb-packages.spec.ts`
- `tests/e2e/mbb-addons.spec.ts`
- `tests/e2e/hbb-addons.spec.ts`
- `tests/e2e/dtv-channels.spec.ts`

### Unchanged Files
- All scenario JSON files (will be updated manually based on captured responses)
- Response capture helper (already existed)
- API client (already has capture integration)
- All other framework files

---

## Next Steps

1. **Run tests with capture**:
   ```bash
   set CAPTURE_API_RESPONSES=true && npx playwright test tests/e2e/
   ```

2. **Consolidate responses**:
   ```bash
   npx ts-node src/helpers/response-consolidator.ts
   ```

3. **Review reference file**:
   - Open `test-results/api-captures/.../reference-responses.json`
   - Analyze suggested assertions
   - Note response patterns

4. **Update scenario JSON files**:
   - Start with GSM (already has basic assertions)
   - Add comprehensive assertions based on reference file
   - Repeat for all domains

5. **Test with new assertions**:
   ```bash
   npx playwright test tests/e2e/
   ```

6. **Iterate as needed**:
   - Refine assertions based on test results
   - Add more assertion types if needed
   - Document domain-specific patterns

---

## Design Principles

1. **Scenario JSON is the source of truth** - Not the captured responses
2. **Capture is optional** - Only for analysis and debugging
3. **Specs are generic** - No domain-specific logic in test files
4. **Assertions are data-driven** - Defined in JSON, executed by framework
5. **Maintainable and scalable** - Easy to add domains and scenarios
6. **Enterprise-grade** - Professional, production-ready design

---

## Troubleshooting

### Capture not working
- Check `CAPTURE_API_RESPONSES=true` is set
- Verify response-capture.ts is working
- Check test-results/api-captures directory exists

### Consolidator not finding responses
- Run tests with capture first
- Check session directory exists
- Verify JSON files are in session directory

### Assertions failing
- Review reference-responses.json
- Check actual vs expected values
- Verify field paths are correct
- Consider Dialog API soft-fail pattern (200 with error in body)

### Need to update assertions
- Re-run with capture enabled
- Consolidate new responses
- Compare with previous reference
- Update scenario JSON files

---

This framework provides a professional, maintainable, and scalable approach to API test assertions that aligns with enterprise best practices.
