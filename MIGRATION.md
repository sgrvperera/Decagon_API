# Migration Guide: Old Framework → New Enterprise Framework

## Overview

This guide helps you migrate from the Excel-driven "one API = one test" framework to the new scenario-driven enterprise framework.

---

## Phase 1: Immediate Improvements (Week 1)

### ✅ **Completed Setup**

The new structure is ready:
- ✅ Config management with environment support
- ✅ Test data management system
- ✅ Tag-based filtering
- ✅ Enhanced API client with retry
- ✅ Schema validation infrastructure
- ✅ Sample scenarios for GSM and HBB

### **What You Need to Do**

1. **Install dependencies** (if not done):
   ```bash
   npm ci
   ```

2. **Test the new structure**:
   ```bash
   npm run test:smoke
   ```

3. **Review sample scenarios**:
   - Open `data/scenarios/gsm-packages.scenarios.json`
   - See how multiple scenarios are defined per API

---

## Phase 2: Migrate Your APIs (Week 2-3)

### **Step 1: Identify API Domains**

Group your APIs by domain:
- GSM packages (get, eligibility, activate)
- HBB packages (get, eligibility, activate)
- DTV packages (get, eligibility, activate)
- Data usage (summary, detailed)
- Balance check
- Connection status
- etc.

### **Step 2: Create Scenario Files**

For each domain, create a scenario file:

**Example: Data Usage**

Create `data/scenarios/data-usage.scenarios.json`:

```json
[
  {
    "id": "data-usage-summary-hbb-smoke",
    "name": "Get Data Usage Summary - HBB (Smoke)",
    "description": "Verify HBB data usage summary",
    "tags": ["@smoke", "@regression", "@hbb"],
    "apiId": "data-usage-summary",
    "method": "POST",
    "path": "/dia-api-engine/api/data-usage/v1/data-usage-summary",
    "body": {
      "msisdn": "{{account.postpaid.hbb.msisdn}}",
      "sbu": "HBB"
    },
    "expectedStatus": 200,
    "assertions": [
      {
        "type": "status",
        "expected": 200
      },
      {
        "type": "field",
        "field": "status",
        "expected": "success"
      }
    ]
  },
  {
    "id": "data-usage-summary-gsm",
    "name": "Get Data Usage Summary - GSM",
    "description": "Verify GSM data usage summary",
    "tags": ["@regression", "@gsm"],
    "apiId": "data-usage-summary",
    "method": "POST",
    "path": "/dia-api-engine/api/data-usage/v1/data-usage-summary",
    "body": {
      "msisdn": "{{account.postpaid.gsm.msisdn}}",
      "sbu": "GSM"
    },
    "expectedStatus": 200,
    "assertions": [
      {
        "type": "status",
        "expected": 200
      }
    ]
  },
  {
    "id": "data-usage-invalid-sbu",
    "name": "Get Data Usage Summary - Invalid SBU (Negative)",
    "description": "Verify error handling for invalid SBU",
    "tags": ["@negative"],
    "apiId": "data-usage-summary",
    "method": "POST",
    "path": "/dia-api-engine/api/data-usage/v1/data-usage-summary",
    "body": {
      "msisdn": "763290602",
      "sbu": "INVALID"
    },
    "expectedStatus": [400, 422],
    "assertions": [
      {
        "type": "status",
        "expected": [400, 422]
      }
    ]
  }
]
```

### **Step 3: Create Test Files**

Create `tests/scenarios/data-usage.spec.ts`:

```typescript
import { test } from '@playwright/test';
import { ApiClient } from '../../src/api/client/api-client';
import { scenarioLoader, ApiScenario } from '../../src/helpers/scenario-loader';
import { dataProvider } from '../../src/helpers/data-provider';
import { responseValidator } from '../../src/validators/response-validator';
import { matchesFilter } from '../../src/helpers/test-tags';

test.describe('Data Usage API - Scenario-Driven Tests', () => {
  let client: ApiClient;
  const scenarios = scenarioLoader.loadScenarios('data-usage');

  test.beforeAll(async () => {
    client = await ApiClient.create();
  });

  test.afterAll(async () => {
    await client.dispose();
  });

  scenarios.forEach((scenario: ApiScenario) => {
    if (!matchesFilter(scenario.tags) || scenario.skip) return;

    test(`${scenario.name} ${scenario.tags.join(' ')}`, async () => {
      const body = interpolateData(scenario.body);
      const queryParams = interpolateData(scenario.queryParams);
      const headers = scenario.headers || {};

      let response;
      switch (scenario.method) {
        case 'GET':
          response = await client.get(scenario.path, { queryParams, headers });
          break;
        case 'POST':
          response = await client.post(scenario.path, { body, queryParams, headers });
          break;
        case 'PUT':
          response = await client.put(scenario.path, { body, queryParams, headers });
          break;
        case 'DELETE':
          response = await client.delete(scenario.path, { queryParams, headers });
          break;
      }

      await responseValidator.validate(response, scenario.assertions);
    });
  });
});

function interpolateData(data: any): any {
  if (!data) return data;
  const dataStr = JSON.stringify(data);
  const interpolated = dataStr.replace(/\{\{([^}]+)\}\}/g, (match, path) => {
    const parts = path.trim().split('.');
    if (parts[0] === 'account') {
      const account = dataProvider.getAccount({
        type: parts[1].toUpperCase() as any,
        sbu: parts[2].toUpperCase() as any
      });
      return account[parts[3] as keyof typeof account] as string;
    }
    if (parts[0] === 'package') {
      const pkg = dataProvider.getPackage({
        type: `${parts[1].toUpperCase()}_${parts[2].toUpperCase()}`
      });
      return pkg[parts[3] as keyof typeof pkg] as string;
    }
    if (parts[0] === 'common') {
      return dataProvider.getCommonData(parts[1]);
    }
    return match;
  });
  return JSON.parse(interpolated);
}
```

### **Step 4: Add Test Data**

Update `data/test-data/accounts.data.json` with real test accounts for your environment.

### **Step 5: Run and Verify**

```bash
npx playwright test tests/scenarios/data-usage.spec.ts
```

---

## Phase 3: Production Hardening (Week 4)

### **1. Add Schema Validation**

For critical APIs, create JSON schemas:

`src/validators/schemas/data-usage-summary.schema.json`:

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["status", "data"],
  "properties": {
    "status": { "type": "string" },
    "data": {
      "type": "object",
      "required": ["totalUsage", "remainingData"],
      "properties": {
        "totalUsage": { "type": "number" },
        "remainingData": { "type": "number" }
      }
    }
  }
}
```

Add to scenario:

```json
{
  "assertions": [
    {
      "type": "schema",
      "schemaFile": "data-usage-summary"
    }
  ]
}
```

### **2. Environment-Specific Data**

Create environment configs:

`config/environments/staging.env`:
```
BASE_URL=https://staging.dialog.lk
TRACE_ID=STAGING_TRACE
```

`config/environments/prod.env`:
```
BASE_URL=https://api.dialog.lk
TRACE_ID=PROD_TRACE
```

### **3. Add Auth Scenarios**

Create scenarios for auth failures:

```json
{
  "id": "api-missing-auth",
  "name": "API Call - Missing Authorization (Negative)",
  "tags": ["@negative", "@auth"],
  "method": "POST",
  "path": "/api/v1/secure-endpoint",
  "headers": {
    "Authorization": ""
  },
  "expectedStatus": [401, 403],
  "assertions": [
    {
      "type": "status",
      "expected": [401, 403]
    }
  ]
}
```

---

## Phase 4: CI/CD & Maintainability (Week 5)

### **1. Update CI Workflow**

Update `.github/workflows/ci.yml`:

```yaml
name: API Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  smoke-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 18
      - run: npm ci
      - name: Run Smoke Tests
        env:
          TEST_ENV: staging
          BASE_URL: ${{ secrets.STAGING_BASE_URL }}
        run: npm run test:smoke

  regression-tests:
    runs-on: ubuntu-latest
    needs: smoke-tests
    if: github.event_name == 'pull_request'
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 18
      - run: npm ci
      - name: Run Regression Tests
        env:
          TEST_ENV: staging
          BASE_URL: ${{ secrets.STAGING_BASE_URL }}
        run: npm run test:regression
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: playwright-report
```

### **2. Parallel Execution**

Update `playwright.config.ts`:

```typescript
workers: process.env.CI ? 4 : 8,
```

### **3. Add Reporting**

Install Allure (optional):

```bash
npm install -D allure-playwright
```

Update config:

```typescript
reporter: [
  ['list'],
  ['html'],
  ['allure-playwright']
],
```

---

## Checklist: Migration Complete

- [ ] All API domains have scenario files
- [ ] Test data is externalized
- [ ] Schemas created for critical APIs
- [ ] Negative scenarios added
- [ ] Tags applied to all scenarios
- [ ] Environment configs created
- [ ] CI workflow updated
- [ ] Old test files archived
- [ ] Team trained on new structure
- [ ] Documentation updated

---

## Common Pitfalls

### ❌ **Hardcoding Test Data**

**Bad:**
```json
{
  "body": {
    "accountNumber": "763290602"
  }
}
```

**Good:**
```json
{
  "body": {
    "accountNumber": "{{account.postpaid.gsm.accountNumber}}"
  }
}
```

### ❌ **One Scenario Per API**

**Bad:** Only positive test

**Good:** Positive + negative + boundary tests

### ❌ **No Tags**

**Bad:** Can't run smoke tests separately

**Good:** Tag with `@smoke`, `@regression`, `@negative`

### ❌ **Generic Assertions**

**Bad:**
```json
{
  "assertions": [
    { "type": "status", "expected": 200 }
  ]
}
```

**Good:**
```json
{
  "assertions": [
    { "type": "status", "expected": 200 },
    { "type": "schema", "schemaFile": "my-response" },
    { "type": "field", "field": "eligible", "expected": true }
  ]
}
```

---

## Next Steps

1. **Start with one API domain** (e.g., GSM packages)
2. **Create 5-10 scenarios** (positive, negative, boundary)
3. **Run and verify** tests pass
4. **Repeat for other domains**
5. **Add schemas** for critical APIs
6. **Update CI** to run new tests
7. **Archive old tests** once migration complete

---

## Support

Questions? Check:
- `ARCHITECTURE.md` - Framework design
- `README.md` - Original documentation
- Sample files in `tests/scenarios/` and `data/scenarios/`
