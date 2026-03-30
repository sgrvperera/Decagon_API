# Quick Start Guide - Enterprise API Framework

## 🚀 Get Started in 5 Minutes

### **1. Install & Setup**

```bash
# Install dependencies
npm ci

# Install Playwright browsers
npx playwright install

# Copy environment config
copy config\environments\dev.env .env
```

### **2. Run Your First Test**

```bash
# Run smoke tests
npm run test:smoke

# View report
npm run report
```

### **3. Run Specific Tests**

```bash
# GSM package tests
npm run test:gsm

# HBB package tests
npm run test:hbb

# Negative tests only
npm run test:negative

# Regression suite
npm run test:regression
```

---

## 📝 Create Your First Scenario

### **Step 1: Create Scenario File**

Create `data/scenarios/balance-check.scenarios.json`:

```json
[
  {
    "id": "balance-check-valid",
    "name": "Check Balance - Valid Account",
    "description": "Verify balance check for valid account",
    "tags": ["@smoke", "@regression"],
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
    "id": "balance-check-invalid",
    "name": "Check Balance - Invalid Account (Negative)",
    "description": "Verify error for invalid account",
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
  }
]
```

### **Step 2: Create Test File**

Create `tests/scenarios/balance-check.spec.ts`:

```typescript
import { test } from '@playwright/test';
import { ApiClient } from '../../src/api/client/api-client';
import { scenarioLoader, ApiScenario } from '../../src/helpers/scenario-loader';
import { dataProvider } from '../../src/helpers/data-provider';
import { responseValidator } from '../../src/validators/response-validator';
import { matchesFilter } from '../../src/helpers/test-tags';

test.describe('Balance Check API', () => {
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

### **Step 3: Run Your Test**

```bash
npx playwright test tests/scenarios/balance-check.spec.ts
```

---

## 🏷️ Using Tags

### **Add Tags to Scenarios**

```json
{
  "tags": ["@smoke", "@regression", "@postpaid", "@gsm"]
}
```

### **Run by Tag**

```bash
# Smoke tests
npm run test:smoke

# Regression tests
npm run test:regression

# Negative tests
npm run test:negative

# Custom tag
TEST_TAG=@gsm npm test
```

---

## 📊 Test Data

### **Use Placeholders**

In scenario body/params:

```json
{
  "accountNumber": "{{account.postpaid.gsm.accountNumber}}",
  "packageCode": "{{package.gsm.postpaid.code}}",
  "invalidValue": "{{common.invalidAccount}}"
}
```

### **Add Test Data**

Edit `data/test-data/accounts.data.json`:

```json
{
  "accountNumber": "123456789",
  "msisdn": "123456789",
  "type": "PREPAID",
  "sbu": "GSM",
  "status": "ACTIVE"
}
```

---

## ✅ Assertions

### **Status Check**

```json
{
  "type": "status",
  "expected": 200
}
```

### **Field Validation**

```json
{
  "type": "field",
  "field": "status",
  "expected": "success"
}
```

### **Schema Validation**

```json
{
  "type": "schema",
  "schemaFile": "my-response"
}
```

### **Contains Check**

```json
{
  "type": "contains",
  "field": "packages",
  "expected": "SPM_2700"
}
```

---

## 🌍 Environments

### **Switch Environment**

```bash
# Dev
npm run test:dev

# Staging
npm run test:staging

# Custom
TEST_ENV=prod npm test
```

### **Create Environment Config**

Create `config/environments/staging.env`:

```
BASE_URL=https://staging.dialog.lk
TRACE_ID=STAGING_TRACE
API_TIMEOUT=20000
```

---

## 🧪 Mock Mode

Run tests without backend:

```bash
npm run test:mock
```

All requests return mock responses (200 OK).

---

## 📈 Reports

### **View HTML Report**

```bash
npm run report
```

### **JSON Report**

Results saved to `test-results/results.json`

---

## 🔍 Debugging

### **Run Single Test**

```bash
npx playwright test tests/scenarios/gsm-packages.spec.ts
```

### **Run with UI**

```bash
npx playwright test --ui
```

### **Debug Mode**

```bash
npx playwright test --debug
```

### **Verbose Logging**

```bash
DEBUG=pw:api npm test
```

---

## 📚 Common Commands

```bash
# Run all tests
npm test

# Smoke tests
npm run test:smoke

# Regression tests
npm run test:regression

# Negative tests
npm run test:negative

# GSM tests
npm run test:gsm

# Mock mode
npm run test:mock

# View report
npm run report

# Format code
npm run format

# Lint code
npm run lint
```

---

## 🆘 Troubleshooting

### **Tests Not Running**

Check:
- Scenario file exists in `data/scenarios/`
- Test file exists in `tests/scenarios/`
- Tags match filter

### **Data Interpolation Fails**

Check:
- Placeholder syntax: `{{account.type.sbu.field}}`
- Test data exists in `data/test-data/`

### **Connection Errors**

- Check `BASE_URL` in `.env`
- Try mock mode: `npm run test:mock`
- Verify network connectivity

---

## 📖 Next Steps

1. ✅ Run smoke tests
2. ✅ Create your first scenario
3. ✅ Add test data
4. ✅ Run regression tests
5. ✅ Add schema validation
6. ✅ Update CI workflow

---

## 📞 Resources

- **Architecture Guide**: `ARCHITECTURE.md`
- **Migration Guide**: `MIGRATION.md`
- **Playwright Docs**: https://playwright.dev
- **JSON Schema**: https://json-schema.org

---

**Happy Testing! 🎉**
