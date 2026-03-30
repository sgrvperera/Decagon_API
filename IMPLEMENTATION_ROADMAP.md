# Implementation Roadmap - Your Next Steps

## 🎯 Where You Are Now

✅ **Framework Redesigned** - Enterprise-grade architecture in place
✅ **Sample Code Created** - GSM and HBB examples ready
✅ **Documentation Complete** - 6 comprehensive guides
✅ **Infrastructure Ready** - All folders and base files created

---

## 📋 What You Need to Do (Prioritized)

### **PHASE 1: Validate & Learn (Day 1-2)**

#### **Step 1: Run Sample Tests** ⏱️ 15 minutes

```bash
# Install dependencies (if not done)
npm ci

# Run smoke tests
npm run test:smoke

# View report
npm run report
```

**Expected Result:** Tests run successfully (may fail if backend unavailable - that's OK, use mock mode)

**If tests fail due to network:**
```bash
npm run test:mock
```

#### **Step 2: Review Sample Scenarios** ⏱️ 30 minutes

Open and study these files:
1. `data/scenarios/gsm-packages.scenarios.json` - See scenario structure
2. `tests/scenarios/gsm-packages.spec.ts` - See how scenarios are executed
3. `data/test-data/accounts.data.json` - See test data structure

**Key Concepts to Understand:**
- Scenario JSON structure
- Data interpolation with `{{placeholder}}`
- Tag usage for filtering
- Assertion types

#### **Step 3: Read Documentation** ⏱️ 45 minutes

Priority order:
1. `QUICKSTART.md` - Get started guide (15 min)
2. `REDESIGN_SUMMARY.md` - High-level overview (15 min)
3. `ARCHITECTURE_VISUAL.md` - Visual diagrams (15 min)

---

### **PHASE 2: Create Your First Scenario (Day 3-4)**

#### **Step 1: Choose One API** ⏱️ 5 minutes

Pick a simple API from your list. Recommended: **Balance Check**

From your `api-definitions.json`:
```json
{
  "apiCommonName": "send balance bill infor endpoint",
  "method": "POST",
  "path": "/dia-api-engine/api/balance-check/v1/check-balance",
  "body": {
    "accountNo": "763290602"
  }
}
```

#### **Step 2: Create Scenario File** ⏱️ 20 minutes

Create `data/scenarios/balance-check.scenarios.json`:

```json
[
  {
    "id": "balance-check-valid-postpaid",
    "name": "Check Balance - Valid Postpaid Account (Smoke)",
    "description": "Verify balance check returns correct data for valid postpaid account",
    "tags": ["@smoke", "@regression", "@postpaid"],
    "apiId": "balance-check",
    "method": "POST",
    "path": "/dia-api-engine/api/balance-check/v1/check-balance",
    "body": {
      "accountNo": "{{account.postpaid.gsm.accountNumber}}"
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
    "id": "balance-check-invalid-account",
    "name": "Check Balance - Invalid Account (Negative)",
    "description": "Verify API returns error for invalid account number",
    "tags": ["@negative"],
    "apiId": "balance-check",
    "method": "POST",
    "path": "/dia-api-engine/api/balance-check/v1/check-balance",
    "body": {
      "accountNo": "{{common.invalidAccount}}"
    },
    "expectedStatus": [400, 404],
    "assertions": [
      {
        "type": "status",
        "expected": [400, 404]
      }
    ]
  },
  {
    "id": "balance-check-missing-account",
    "name": "Check Balance - Missing Account Number (Negative)",
    "description": "Verify API validates required fields",
    "tags": ["@negative"],
    "apiId": "balance-check",
    "method": "POST",
    "path": "/dia-api-engine/api/balance-check/v1/check-balance",
    "body": {},
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

#### **Step 3: Create Test File** ⏱️ 10 minutes

Create `tests/scenarios/balance-check.spec.ts`:

```typescript
import { test } from '@playwright/test';
import { ApiClient } from '../../src/api/client/api-client';
import { scenarioLoader, ApiScenario } from '../../src/helpers/scenario-loader';
import { dataProvider } from '../../src/helpers/data-provider';
import { responseValidator } from '../../src/validators/response-validator';
import { matchesFilter } from '../../src/helpers/test-tags';

test.describe('Balance Check API - Scenario-Driven Tests', () => {
  let client: ApiClient;
  const scenarios = scenarioLoader.loadScenarios('balance-check');

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
      const response = await client.post(scenario.path, { body });
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
    if (parts[0] === 'common') {
      return dataProvider.getCommonData(parts[1]);
    }
    return match;
  });
  return JSON.parse(interpolated);
}
```

#### **Step 4: Run Your Test** ⏱️ 5 minutes

```bash
npx playwright test tests/scenarios/balance-check.spec.ts
```

**Success Criteria:**
- 3 tests run (1 positive, 2 negative)
- Tests pass or fail with clear error messages
- You understand why each test passed/failed

---

### **PHASE 3: Migrate More APIs (Week 2-3)**

#### **Priority Order for Migration**

1. **Critical Path APIs** (Week 2)
   - Balance Check ✓ (done in Phase 2)
   - Connection Status
   - Data Usage Summary
   - Package Eligibility Check

2. **Service-Specific APIs** (Week 3)
   - GSM Packages (already has sample)
   - HBB Packages (already has sample)
   - DTV Packages
   - MBB Packages

3. **Secondary APIs** (Week 4)
   - Payment History
   - Credit Limit
   - Reconnection
   - Complaints

#### **Migration Template**

For each API domain:

1. **Create scenario file** (20 min)
   - 1 positive scenario with `@smoke` tag
   - 1-2 positive scenarios with `@regression` tag
   - 1-2 negative scenarios with `@negative` tag

2. **Create test file** (10 min)
   - Copy template from existing test
   - Update domain name

3. **Run and verify** (10 min)
   - Run tests
   - Fix any issues
   - Commit changes

**Time per API domain: 40 minutes**
**Total for 15 domains: 10 hours (spread over 2 weeks)**

---

### **PHASE 4: Add Advanced Features (Week 4)**

#### **1. Schema Validation** ⏱️ 2 hours

For critical APIs, create JSON schemas:

**Example: Balance Check Schema**

Create `src/validators/schemas/balance-check.schema.json`:

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["status", "data"],
  "properties": {
    "status": {
      "type": "string",
      "enum": ["success", "error"]
    },
    "data": {
      "type": "object",
      "required": ["balance", "currency"],
      "properties": {
        "balance": { "type": "number" },
        "currency": { "type": "string" },
        "lastUpdated": { "type": "string", "format": "date-time" }
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
      "schemaFile": "balance-check"
    }
  ]
}
```

**Priority APIs for Schemas:**
- Balance Check
- Package Eligibility
- Data Usage Summary
- Connection Status

#### **2. Environment-Specific Data** ⏱️ 1 hour

Create environment-specific test data:

`data/test-data/accounts.dev.json`
`data/test-data/accounts.staging.json`
`data/test-data/accounts.prod.json`

Update data provider to load based on environment.

#### **3. Auth Scenarios** ⏱️ 1 hour

Add authentication test scenarios:

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

### **PHASE 5: CI/CD Integration (Week 5)**

#### **1. Update GitHub Actions** ⏱️ 30 minutes

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
          TRACE_ID: ${{ secrets.TRACE_ID }}
        run: npm run test:smoke
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: smoke-report
          path: playwright-report

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
          TRACE_ID: ${{ secrets.TRACE_ID }}
        run: npm run test:regression
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: regression-report
          path: playwright-report
```

#### **2. Add GitHub Secrets** ⏱️ 10 minutes

In GitHub repository settings, add:
- `STAGING_BASE_URL`
- `PROD_BASE_URL`
- `TRACE_ID`

#### **3. Configure Parallel Execution** ⏱️ 10 minutes

Update `playwright.config.ts`:

```typescript
workers: process.env.CI ? 4 : 8,
```

---

## 📊 Progress Tracking

### **Week 1: Foundation**
- [ ] Run sample tests
- [ ] Review documentation
- [ ] Understand architecture
- [ ] Create first scenario (Balance Check)

### **Week 2: Critical APIs**
- [ ] Balance Check
- [ ] Connection Status
- [ ] Data Usage Summary
- [ ] Package Eligibility

### **Week 3: Service APIs**
- [ ] GSM Packages
- [ ] HBB Packages
- [ ] DTV Packages
- [ ] MBB Packages

### **Week 4: Advanced Features**
- [ ] Add schemas for critical APIs
- [ ] Environment-specific data
- [ ] Auth scenarios
- [ ] Boundary value tests

### **Week 5: Production Ready**
- [ ] Update CI/CD
- [ ] Parallel execution
- [ ] Team training
- [ ] Documentation review

---

## 🎯 Success Metrics

### **After Week 1**
- ✓ Framework understood
- ✓ First scenario created
- ✓ Tests running successfully

### **After Week 3**
- ✓ 50% of APIs migrated
- ✓ 150+ test scenarios
- ✓ Tag-based execution working

### **After Week 5**
- ✓ 100% of APIs migrated
- ✓ 250+ test scenarios
- ✓ CI/CD integrated
- ✓ Team trained

---

## 🚨 Common Issues & Solutions

### **Issue: Tests fail with network errors**

**Solution:**
```bash
npm run test:mock
```

### **Issue: Data interpolation not working**

**Solution:**
- Check placeholder syntax: `{{account.postpaid.gsm.accountNumber}}`
- Verify test data exists in `data/test-data/accounts.data.json`
- Check data provider can find matching record

### **Issue: Scenarios not running**

**Solution:**
- Verify scenario file is in `data/scenarios/`
- Check test file is in `tests/scenarios/`
- Ensure tags match filter (if using TEST_TAG)

### **Issue: Schema validation fails**

**Solution:**
- Check schema file exists in `src/validators/schemas/`
- Verify schema matches actual API response
- Use `console.log` to inspect response body

---

## 📞 Getting Help

### **Documentation**
- `QUICKSTART.md` - Quick start guide
- `ARCHITECTURE.md` - Detailed architecture
- `MIGRATION.md` - Migration guide
- `ARCHITECTURE_VISUAL.md` - Visual diagrams
- `FILE_CHANGES.md` - What changed

### **Sample Code**
- `tests/scenarios/gsm-packages.spec.ts` - Test file example
- `data/scenarios/gsm-packages.scenarios.json` - Scenario example
- `data/test-data/accounts.data.json` - Test data example

---

## 🎉 Final Checklist

Before considering migration complete:

- [ ] All critical APIs have scenarios
- [ ] Smoke tests run in < 5 minutes
- [ ] Regression tests run in < 20 minutes
- [ ] Negative scenarios exist for all APIs
- [ ] Schemas created for critical APIs
- [ ] CI/CD pipeline updated
- [ ] Team trained on new structure
- [ ] Documentation reviewed
- [ ] Old tests archived
- [ ] Success metrics met

---

## 🚀 You're Ready!

You now have:
✅ Enterprise-grade framework
✅ Clear implementation plan
✅ Sample code to follow
✅ Comprehensive documentation
✅ Phased migration approach

**Start with Phase 1 today. You'll have your first scenario running in 2 hours.**

**Good luck! 🎯**
