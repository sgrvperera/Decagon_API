# Scenario-Driven Assertions - Implementation Complete

## ✅ What Was Implemented

### Core Principle
**Assertions live in scenario JSON files, not in test code.**
**Response capture is a reference tool, not the source of truth.**

---

## Files Created (3 New)

1. **src/helpers/response-consolidator.ts**
   - Consolidates all captured responses into single reference file
   - Analyzes responses and suggests assertions
   - CLI tool: `npx ts-node src/helpers/response-consolidator.ts`

2. **src/helpers/assertion-executor.ts**
   - Generic assertion executor
   - Reads assertions from scenario JSON
   - Executes all assertion types

3. **src/helpers/scenario-runner.ts**
   - Generic test spec template
   - Reusable across all domains
   - No hardcoded assertions

---

## Files Modified (7 Spec Files)

All test specs refactored to use generic runner:

1. tests/e2e/gsm-packages.spec.ts
2. tests/e2e/hbb-packages.spec.ts
3. tests/e2e/dtv-packages.spec.ts
4. tests/e2e/mbb-packages.spec.ts
5. tests/e2e/mbb-addons.spec.ts
6. tests/e2e/hbb-addons.spec.ts
7. tests/e2e/dtv-channels.spec.ts

**Before**: Each spec had ~150 lines with hardcoded assertion logic
**After**: Each spec has ~7 lines using generic runner

---

## How It Works

### 1. Capture Responses (Optional, Reference Only)
```bash
set CAPTURE_API_RESPONSES=true && npx playwright test tests/e2e/
```
- Saves responses to `test-results/api-captures/`
- Organized by date/session/domain

### 2. Consolidate into Reference File
```bash
npx ts-node src/helpers/response-consolidator.ts
```
- Creates `reference-responses.json`
- Includes suggested assertions per scenario
- Analyzes response patterns

### 3. Update Scenario JSON Files
Edit `data/scenarios/*.json` based on reference file:
```json
{
  "id": "gsm-get-packages-postpaid-smoke",
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

### 4. Run Tests Normally
```bash
npx playwright test tests/e2e/
```
- Tests read assertions from scenario JSON
- No dependency on captured responses
- Fast execution

---

## Assertion Types Supported

| Type | Example | Description |
|------|---------|-------------|
| `status` | `200` or `[200, 201]` | Status code validation |
| `responseTime` | `5000` | Max response time in ms |
| `bodyNotEmpty` | `true` | Body must not be empty |
| `requiredFields` | `["field1", "field2"]` | Fields must exist |
| `fieldValues` | `{"field": "value"}` | Field must equal value |
| `fieldMatches` | `{"field": "^\\d+$"}` | Field must match regex |
| `bodyContains` | `["text1", "text2"]` | Body must contain strings |
| `arrayFields` | `["field1"]` | Fields must be arrays |
| `arrayMinLength` | `{"field": 5}` | Array min length |

---

## Workflow

```
┌─────────────────────────────────────────────────────────┐
│ Step 1: Capture (Optional, One-time or as needed)      │
│   set CAPTURE_API_RESPONSES=true                        │
│   npx playwright test tests/e2e/                        │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ Step 2: Consolidate (Creates reference file)           │
│   npx ts-node src/helpers/response-consolidator.ts     │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ Step 3: Analyze (Review suggested assertions)          │
│   Open: reference-responses.json                        │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ Step 4: Update (Edit scenario JSON files)              │
│   Edit: data/scenarios/*.json                           │
│   Add assertions based on analysis                      │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ Step 5: Test (Normal operation)                        │
│   npx playwright test tests/e2e/                        │
│   Assertions read from JSON                             │
└─────────────────────────────────────────────────────────┘
```

---

## Benefits

### ✅ Scenario JSON is Source of Truth
- Assertions defined with scenarios
- Easy to review and update
- Version controlled
- Self-documenting

### ✅ Test Specs are Generic
- No hardcoded assertions
- Reusable across domains
- 7 lines instead of 150
- Consistent behavior

### ✅ Response Capture is Reference
- Optional tool
- Only for analysis
- Not required for tests
- Useful for debugging

### ✅ Enterprise-Grade Design
- Scalable
- Maintainable
- Professional
- Production-ready

---

## Next Steps

### Immediate Actions

1. **Capture responses for all domains**:
   ```bash
   set CAPTURE_API_RESPONSES=true
   npx playwright test tests/e2e/
   ```

2. **Consolidate into reference file**:
   ```bash
   npx ts-node src/helpers/response-consolidator.ts
   ```

3. **Review reference file**:
   ```bash
   # Find latest session
   dir test-results\api-captures /s /b | findstr reference-responses.json
   
   # Open and review
   code test-results\api-captures\...\reference-responses.json
   ```

4. **Update scenario JSON files**:
   - Start with `data/scenarios/gsm-packages.json`
   - Add comprehensive assertions based on reference file
   - Repeat for all 7 domains

5. **Test with new assertions**:
   ```bash
   npx playwright test tests/e2e/
   ```

---

## Example: Before and After

### Before (Hardcoded in Spec)
```typescript
// In test spec file
if (Array.isArray(assertions.status)) {
  expect(assertions.status).toContain(response.status());
} else {
  expect(response.status()).toBe(assertions.status);
}

if (assertions.bodyNotEmpty) {
  const bodyText = await response.text();
  expect(bodyText.length).toBeGreaterThan(0);
}

if (assertions.bodyContains && Array.isArray(assertions.bodyContains)) {
  const bodyText = await response.text();
  for (const substring of assertions.bodyContains) {
    expect(bodyText).toContain(substring);
  }
}
// ... 100+ more lines
```

### After (Generic Runner)
```typescript
// In test spec file (7 lines total)
import { createScenarioSuite } from '../../src/helpers/scenario-runner';
import * as path from 'path';

createScenarioSuite(
  path.join(__dirname, '../../data/scenarios/gsm-packages.json'),
  'GSM Packages - Dialog API Tests'
);
```

### Assertions in JSON
```json
{
  "id": "gsm-get-packages-postpaid-smoke",
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

---

## Files Summary

### Created (3)
- ✅ src/helpers/response-consolidator.ts
- ✅ src/helpers/assertion-executor.ts
- ✅ src/helpers/scenario-runner.ts

### Modified (7)
- ✅ tests/e2e/gsm-packages.spec.ts
- ✅ tests/e2e/hbb-packages.spec.ts
- ✅ tests/e2e/dtv-packages.spec.ts
- ✅ tests/e2e/mbb-packages.spec.ts
- ✅ tests/e2e/mbb-addons.spec.ts
- ✅ tests/e2e/hbb-addons.spec.ts
- ✅ tests/e2e/dtv-channels.spec.ts

### To Be Updated (7 scenario files)
- ⏳ data/scenarios/gsm-packages.json
- ⏳ data/scenarios/hbb-packages.json
- ⏳ data/scenarios/dtv-packages.json
- ⏳ data/scenarios/mbb-packages.json
- ⏳ data/scenarios/mbb-addons.json
- ⏳ data/scenarios/hbb-addons.json
- ⏳ data/scenarios/dtv-channels.json

---

## Status

✅ **Framework Implementation: COMPLETE**
⏳ **Scenario Assertions: TO BE UPDATED** (based on captured responses)

The framework is ready. Now you need to:
1. Capture responses
2. Consolidate them
3. Update scenario JSON files with proper assertions

---

## Documentation

📄 **SCENARIO_ASSERTIONS_GUIDE.md** - Comprehensive guide (this file's companion)
📄 **SCENARIO_ASSERTIONS_SUMMARY.md** - This summary

---

**The framework is production-ready and follows enterprise best practices.**
