# Response Capture & Assertions - Quick Reference

## Enable Response Capture

```bash
# Windows CMD
set CAPTURE_API_RESPONSES=true && npx playwright test

# Windows PowerShell  
$env:CAPTURE_API_RESPONSES="true"; npx playwright test

# Linux/Mac
CAPTURE_API_RESPONSES=true npx playwright test
```

## Captured Files Location

```
test-results/api-captures/YYYY-MM-DD/session-HH-MM-SS/
├── _summary.json
├── gsm-packages/
├── hbb-packages/
├── dtv-packages/
├── mbb-packages/
└── dtv-channels/
```

## Add Capture to Test

```typescript
import { responseCapture } from '../../src/helpers/response-capture';

test(`${scenario.name}`, async ({ }, testInfo) => {  // Add testInfo
  const captureContext = {
    testName: testInfo.title,
    scenarioId: scenario.id,
    scenarioName: scenario.name,
    domain: scenarioFile.domain,
    mifeApi: scenario.mifeApi
  };

  const response = await client.post(endpoint, { 
    headers, 
    body, 
    captureContext  // Add this
  });
});
```

## Use Domain Assertions

```typescript
import { assertionRegistry } from '../../src/validators/assertion-registry';
import { assertionExecutor } from '../../src/validators/assertion-builder';

// Get assertions
const isNegative = scenario.tags.includes('@negative');
const rules = assertionRegistry.getAssertions(
  scenarioFile.domain,
  scenario.mifeApi,
  isNegative
);

// Execute
await assertionExecutor.execute(response, rules);
```

## Build Custom Assertions

```typescript
import { AssertionBuilder } from '../validators/assertion-builder';

const rules = [
  AssertionBuilder.status(200),
  AssertionBuilder.bodyIsJson(),
  AssertionBuilder.fieldExists('executionStatus'),
  AssertionBuilder.fieldEquals('executionStatus', '00'),
  AssertionBuilder.fieldIsArray('responseData', 1),
  AssertionBuilder.dialogEligible(true)
];
```

## Available Domains

- `gsm-packages`
- `hbb-packages`
- `dtv-packages`
- `mbb-packages`
- `mbb-addons`
- `hbb-addons`
- `dtv-channels`

## Common Assertion Builders

| Builder | Example | Description |
|---------|---------|-------------|
| `status()` | `status(200)` | Check status code |
| `status()` | `status([200, 201])` | Check multiple codes |
| `bodyIsJson()` | `bodyIsJson()` | Validate JSON response |
| `bodyNotEmpty()` | `bodyNotEmpty()` | Check body exists |
| `bodyContains()` | `bodyContains('success')` | Check text in body |
| `fieldExists()` | `fieldExists('executionStatus')` | Check field exists |
| `fieldEquals()` | `fieldEquals('status', 'OK')` | Check field value |
| `fieldMatches()` | `fieldMatches('id', /^\d+$/)` | Check field pattern |
| `fieldIsArray()` | `fieldIsArray('data', 1)` | Check array field |
| `responseTime()` | `responseTime(5000)` | Check response time |
| `dialogExecutionStatus()` | `dialogExecutionStatus('00')` | Dialog API status |
| `dialogEligible()` | `dialogEligible(true)` | Dialog eligibility |

## Files Modified

✅ `src/api/client/api-client.ts` - Capture integration
✅ `src/api/client/request-builder.ts` - CaptureContext interface
✅ `tests/e2e/gsm-packages.spec.ts` - Example integration

## Files Created

✅ `src/helpers/response-capture.ts`
✅ `src/validators/assertion-builder.ts`
✅ `src/validators/assertion-registry.ts`
✅ `src/validators/domains/*.ts` (5 files)

## Safety

- ✅ Optional (env flag)
- ✅ Non-breaking
- ✅ No performance impact when disabled
- ✅ Capture errors don't fail tests
- ✅ Existing assertions still work

## Next Steps

1. Run GSM tests with capture enabled
2. Review captured responses in `test-results/api-captures/`
3. Refine assertion rules based on real responses
4. Integrate capture in other domain tests
5. Update domain assertion files as needed
