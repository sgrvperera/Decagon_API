# Response Capture & Assertion Framework

## Overview

This framework provides two key capabilities:
1. **Response Capture**: Safely capture all API responses for analysis and debugging
2. **Domain-Specific Assertions**: Professional, maintainable assertion rules per API domain

Both features are **optional** and **non-breaking** - existing tests continue to work unchanged.

---

## Part 1: Response Capture

### What It Does

Captures every API request/response with full details:
- Request: method, endpoint, headers, body, query params
- Response: status, headers, body, timing
- Context: test name, scenario ID, domain, MIFE API
- Metadata: timestamp, duration

### How to Enable

Set environment variable:
```bash
# Windows CMD
set CAPTURE_API_RESPONSES=true && npx playwright test

# Windows PowerShell
$env:CAPTURE_API_RESPONSES="true"; npx playwright test

# Linux/Mac
CAPTURE_API_RESPONSES=true npx playwright test
```

### Where Responses Are Saved

```
test-results/
└── api-captures/
    └── 2024-01-15/
        └── session-10-30-45/
            ├── _summary.json                    # Quick overview of all captures
            ├── gsm-packages/                    # Domain-specific folder
            │   ├── get-gsm-packages-postpaid-smoke-1705315845123.json
            │   ├── check-eligibility-postpaid-valid-1705315846234.json
            │   └── activate-package-postpaid-1705315847345.json
            ├── hbb-packages/
            │   └── ...
            └── dtv-packages/
                └── ...
```

### Captured Data Structure

Each capture file contains:
```json
{
  "timestamp": "2024-01-15T10:30:45.123Z",
  "testName": "Get GSM Packages - Postpaid (Smoke) [SS-DIA-Get-Gsm-Packages-Query - v1.0.0] @smoke @regression @postpaid @gsm",
  "scenarioId": "gsm-get-packages-postpaid-smoke",
  "scenarioName": "Get GSM Packages - Postpaid (Smoke)",
  "domain": "gsm-packages",
  "mifeApi": "SS-DIA-Get-Gsm-Packages-Query - v1.0.0",
  "request": {
    "method": "GET",
    "endpoint": "/dia-api-engine/api/gsm-package/v1/packages?connectionType=POSTPAID",
    "headers": {
      "traceId": "DIA123456789012",
      "Content-Type": "application/json"
    },
    "body": null,
    "queryParams": {
      "connectionType": "POSTPAID"
    }
  },
  "response": {
    "status": 200,
    "statusText": "OK",
    "headers": {
      "content-type": "application/json",
      "content-length": "1234"
    },
    "body": {
      "executionStatus": "00",
      "executionMessage": "Success",
      "responseData": [...]
    },
    "bodyText": "{\"executionStatus\":\"00\",...}",
    "isJson": true
  },
  "duration": 1234
}
```

### Summary File

`_summary.json` provides quick overview:
```json
[
  {
    "timestamp": "2024-01-15T10:30:45.123Z",
    "testName": "Get GSM Packages - Postpaid (Smoke)",
    "scenarioId": "gsm-get-packages-postpaid-smoke",
    "domain": "gsm-packages",
    "method": "GET",
    "endpoint": "/dia-api-engine/api/gsm-package/v1/packages",
    "status": 200,
    "duration": 1234
  }
]
```

### Integration in Tests

Response capture is **automatically integrated** when you pass `captureContext` to API client:

```typescript
const captureContext = {
  testName: testInfo.title,
  scenarioId: scenario.id,
  scenarioName: scenario.name,
  domain: 'gsm-packages',
  mifeApi: scenario.mifeApi
};

const response = await client.post(endpoint, { 
  headers, 
  body, 
  captureContext  // <-- Add this
});
```

**Already integrated in**: `tests/e2e/gsm-packages.spec.ts`

**To integrate in other tests**: Follow the same pattern (see example below)

### Benefits

1. **Debugging**: See exact request/response for failed tests
2. **Documentation**: Understand actual API behavior
3. **Assertion Design**: Use captured responses to build correct assertions
4. **Regression Testing**: Compare responses over time
5. **API Contract Validation**: Verify API consistency

---

## Part 2: Domain-Specific Assertions

### Architecture

```
src/validators/
├── assertion-builder.ts           # Core assertion building blocks
├── assertion-registry.ts          # Central registry for all domains
└── domains/
    ├── gsm-assertions.ts          # GSM-specific rules
    ├── hbb-assertions.ts          # HBB-specific rules
    ├── dtv-assertions.ts          # DTV-specific rules
    ├── mbb-assertions.ts          # MBB-specific rules
    └── dtv-channels-assertions.ts # DTV Channels-specific rules
```

### Assertion Builder

Provides reusable assertion building blocks:

```typescript
import { AssertionBuilder } from '../validators/assertion-builder';

// Status code
AssertionBuilder.status(200)
AssertionBuilder.status([200, 201])

// Response time
AssertionBuilder.responseTime(5000)

// Field validations
AssertionBuilder.fieldExists('executionStatus')
AssertionBuilder.fieldEquals('executionStatus', '00')
AssertionBuilder.fieldMatches('accountNumber', /^\d{9}$/)
AssertionBuilder.fieldIsArray('responseData', 1)

// Body validations
AssertionBuilder.bodyIsJson()
AssertionBuilder.bodyNotEmpty()
AssertionBuilder.bodyContains('success')
AssertionBuilder.bodyContains(['eligible', 'true'])

// Dialog API specific
AssertionBuilder.dialogExecutionStatus('00')
AssertionBuilder.dialogEligible(true)
```

### Domain-Specific Rules

Each domain has tailored assertions based on API behavior:

#### GSM Packages
```typescript
import { getGsmAssertions } from '../validators/domains/gsm-assertions';

// Get assertions for specific API
const rules = getGsmAssertions('SS-DIA-Get-Gsm-Packages-Query - v1.0.0', false);

// For negative scenarios
const negativeRules = getGsmAssertions('SS-DIA-Gsm-Package-Change-Eligibility-Query - v1.0.0', true);
```

#### HBB Packages
```typescript
import { getHbbAssertions } from '../validators/domains/hbb-assertions';
const rules = getHbbAssertions('SS-DIA-HBB-Pack-Change-Get-Packages-Query - v1.0.0', false);
```

#### DTV Packages
```typescript
import { getDtvAssertions } from '../validators/domains/dtv-assertions';
const rules = getDtvAssertions('SS-DIA-Get-Dtv-Packages-Query - v1.0.0', false);
```

#### MBB Packages
```typescript
import { getMbbAssertions } from '../validators/domains/mbb-assertions';
const rules = getMbbAssertions('SS-DIA-Mbb-Pkg-Change-Get-Pkg-Query - v1.0.0', false);
```

#### DTV Channels
```typescript
import { getDtvChannelsAssertions } from '../validators/domains/dtv-channels-assertions';
const rules = getDtvChannelsAssertions('SS-DIA-DTV-Get-Channel-List-Query - v1.0.0', false);
```

### Using Assertion Registry

Centralized access to all domain assertions:

```typescript
import { assertionRegistry } from '../validators/assertion-registry';

// Get assertions by domain and API
const rules = assertionRegistry.getAssertions(
  'gsm-packages',
  'SS-DIA-Get-Gsm-Packages-Query - v1.0.0',
  false  // isNegative
);

// Check if domain has custom assertions
if (assertionRegistry.hasDomain('gsm-packages')) {
  // Use custom assertions
}

// Get all registered domains
const domains = assertionRegistry.getDomains();
// ['gsm-packages', 'hbb-packages', 'dtv-packages', ...]
```

### Executing Assertions

```typescript
import { assertionExecutor } from '../validators/assertion-builder';
import { assertionRegistry } from '../validators/assertion-registry';

// Get assertions for domain
const rules = assertionRegistry.getAssertions(domain, mifeApi, isNegative);

// Execute assertions (throws on failure)
await assertionExecutor.execute(response, rules, { duration: 1234 });

// Or execute safely (doesn't throw, returns results)
const results = await assertionExecutor.executeSafe(response, rules);
results.forEach(result => {
  console.log(`${result.ruleName}: ${result.passed ? 'PASS' : 'FAIL'}`);
  if (!result.passed) {
    console.log(`  Error: ${result.error}`);
  }
});
```

### Dialog API Patterns

All Dialog APIs follow "soft fail" pattern:
- **Always return HTTP 200** (even for business failures)
- **executionStatus** indicates success/failure:
  - `"00"` = Success
  - `"01"` = Pending
  - `"02"` or other = Failure
- **executionMessage** contains human-readable message
- **responseData** contains actual data (if successful)

Assertions are designed around this pattern:
```typescript
// Common for all Dialog APIs
AssertionBuilder.status(200),
AssertionBuilder.fieldExists('executionStatus'),
AssertionBuilder.fieldExists('executionMessage')

// For successful operations
AssertionBuilder.dialogExecutionStatus('00')

// For eligibility checks
AssertionBuilder.dialogEligible(true)  // positive
AssertionBuilder.dialogEligible(false) // negative
```

---

## Integration Guide

### Step 1: Enable Response Capture (Optional)

```bash
set CAPTURE_API_RESPONSES=true
```

### Step 2: Add Capture Context to Tests

Update your test spec file:

```typescript
import { responseCapture } from '../../src/helpers/response-capture';

test(`${scenario.name}`, async ({ }, testInfo) => {  // Add testInfo
  // ... existing code ...

  const captureContext = {
    testName: testInfo.title,
    scenarioId: scenario.id,
    scenarioName: scenario.name,
    domain: scenarioFile.domain,
    mifeApi: scenario.mifeApi
  };

  // Pass captureContext to API calls
  const response = await client.post(endpoint, { 
    headers, 
    body, 
    captureContext 
  });

  // ... existing assertions ...
});
```

### Step 3: Add Domain Assertions (Optional)

```typescript
import { assertionRegistry } from '../../src/validators/assertion-registry';
import { assertionExecutor } from '../../src/validators/assertion-builder';

test(`${scenario.name}`, async ({ }, testInfo) => {
  // ... make API call ...

  // Get domain-specific assertions
  const isNegative = scenario.tags.includes('@negative');
  const rules = assertionRegistry.getAssertions(
    scenarioFile.domain,
    scenario.mifeApi,
    isNegative
  );

  // Execute assertions
  await assertionExecutor.execute(response, rules, { duration: Date.now() - startTime });

  // ... existing assertions still work ...
});
```

---

## Files Changed

### New Files Created

1. **Response Capture**:
   - `src/helpers/response-capture.ts` - Core capture logic

2. **Assertion Framework**:
   - `src/validators/assertion-builder.ts` - Assertion building blocks
   - `src/validators/assertion-registry.ts` - Central registry
   - `src/validators/domains/gsm-assertions.ts` - GSM rules
   - `src/validators/domains/hbb-assertions.ts` - HBB rules
   - `src/validators/domains/dtv-assertions.ts` - DTV rules
   - `src/validators/domains/mbb-assertions.ts` - MBB rules
   - `src/validators/domains/dtv-channels-assertions.ts` - DTV Channels rules

3. **Documentation**:
   - `RESPONSE_CAPTURE_AND_ASSERTIONS.md` - This file

### Modified Files

1. **API Client Integration**:
   - `src/api/client/api-client.ts` - Added capture integration
   - `src/api/client/request-builder.ts` - Added CaptureContext interface

2. **Test Integration (Example)**:
   - `tests/e2e/gsm-packages.spec.ts` - Added capture context

### Unchanged Files

- All scenario JSON files
- All other test spec files (until you integrate)
- Number resolver
- Test data files
- Existing validators

---

## Safety Guarantees

✅ **Non-Breaking**: Capture is optional (env flag)
✅ **Backward Compatible**: Tests work without capture
✅ **No Performance Impact**: Capture only when enabled
✅ **Fail-Safe**: Capture errors don't fail tests
✅ **Modular**: Add assertions incrementally per domain
✅ **Flexible**: Use existing assertions or new ones

---

## Next Steps

### Immediate Actions

1. **Run with capture enabled**:
   ```bash
   set CAPTURE_API_RESPONSES=true && npx playwright test tests/e2e/gsm-packages.spec.ts
   ```

2. **Review captured responses**:
   - Check `test-results/api-captures/`
   - Analyze response structures
   - Identify patterns

3. **Refine assertions**:
   - Update domain assertion files based on real responses
   - Add API-specific validations
   - Handle edge cases

### Gradual Rollout

1. **Phase 1**: GSM (already integrated)
   - Run tests with capture
   - Review responses
   - Refine GSM assertions

2. **Phase 2**: HBB & DTV
   - Integrate capture context
   - Run tests
   - Update assertion rules

3. **Phase 3**: MBB & Add-ons
   - Same process
   - Reuse patterns from Phase 1 & 2

4. **Phase 4**: DTV Channels
   - Complete integration
   - Final assertion refinement

### Assertion Refinement Process

1. **Capture responses** for each API
2. **Analyze patterns**:
   - What fields are always present?
   - What values indicate success/failure?
   - What varies between calls?
3. **Update assertion rules**:
   - Add required field checks
   - Add value validations
   - Add business rule checks
4. **Test assertions**:
   - Run tests
   - Verify assertions pass for valid cases
   - Verify assertions fail for invalid cases
5. **Document findings**:
   - Update assertion comments
   - Note any API quirks
   - Document expected behaviors

---

## Troubleshooting

### Capture Not Working

**Check**:
- Environment variable is set: `echo %CAPTURE_API_RESPONSES%`
- CaptureContext is passed to API client
- Test has `testInfo` parameter

**Debug**:
```typescript
console.log('Capture enabled:', responseCapture.isEnabled());
console.log('Session dir:', responseCapture.getSessionDir());
```

### Assertions Failing

**Check**:
- Response structure matches expectations
- Field paths are correct (case-sensitive)
- Dialog API soft-fail pattern (200 with error in body)

**Debug**:
```typescript
const body = await response.json();
console.log('Response body:', JSON.stringify(body, null, 2));
```

### Performance Issues

**Solution**:
- Disable capture for CI: Don't set `CAPTURE_API_RESPONSES`
- Enable only for debugging: Set flag only when needed
- Clean old captures: Delete old session folders

---

## Summary

This framework provides:

1. **Safe Response Capture**:
   - Optional (env flag)
   - Non-breaking
   - Comprehensive data
   - Organized storage

2. **Professional Assertions**:
   - Domain-specific
   - Reusable building blocks
   - Dialog API aware
   - Maintainable structure

3. **Gradual Adoption**:
   - Start with one domain
   - Expand incrementally
   - No forced changes

4. **Analysis Tools**:
   - Captured responses for review
   - Summary files for overview
   - Assertion results for validation

**Result**: Professional, maintainable, safe assertion framework that helps build correct validations without breaking existing tests.
