# Enterprise API Testing Framework - Architecture Guide

## Overview

This is a **scenario-driven, enterprise-grade API automation framework** built with Playwright Test. It supports:

- ✅ Multiple test scenarios per API (positive, negative, boundary, auth)
- ✅ Prepaid, Postpaid, DTV, HBB, GSM, MBB service types
- ✅ Tag-based selective execution (smoke, regression, negative)
- ✅ Environment-specific test data
- ✅ Schema validation with JSON schemas
- ✅ Centralized auth and header management
- ✅ Retry logic and mock mode
- ✅ Parallel execution support

---

## Architecture Principles

### **Separation of Concerns**

```
API Registry (what APIs exist)
    ↓
Scenarios (how to test each API)
    ↓
Test Data (what data to use)
    ↓
Request Builder (how to build requests)
    ↓
API Client (how to execute)
    ↓
Validators (how to verify)
```

### **Key Design Decisions**

1. **Scenario-Driven**: Each API has multiple scenarios (not 1:1 mapping)
2. **Data Interpolation**: Use `{{placeholder}}` syntax for dynamic data
3. **Tag-Based Filtering**: Run specific test types via tags
4. **Schema Validation**: Contract testing with JSON schemas
5. **Environment Abstraction**: Switch environments via TEST_ENV

---

## Folder Structure

```
├── config/
│   ├── environments/          # Environment-specific configs
│   └── test-config.ts         # Central configuration
├── data/
│   ├── registry/              # API definitions (from Excel)
│   ├── scenarios/             # Test scenarios per API domain
│   └── test-data/             # Test data (accounts, packages, common)
├── src/
│   ├── api/
│   │   ├── client/            # API client & request builder
│   │   └── auth/              # Auth handler
│   ├── validators/            # Response & schema validators
│   │   └── schemas/           # JSON schemas
│   └── helpers/               # Data provider, scenario loader, tags
├── tests/
│   ├── scenarios/             # Scenario-driven test files
│   └── smoke/                 # Health check tests
```

---

## Running Tests

### **By Test Type**

```bash
npm run test:smoke          # Smoke tests only
npm run test:regression     # Regression tests
npm run test:negative       # Negative tests only
```

### **By Service Type**

```bash
npm run test:gsm           # GSM package tests
npm run test:hbb           # HBB package tests
npm run test:dtv           # DTV package tests
```

### **By Environment**

```bash
npm run test:dev           # Run against dev
npm run test:staging       # Run against staging
TEST_ENV=prod npm test     # Run against prod
```

### **Mock Mode (No Backend)**

```bash
npm run test:mock          # All tests with mock responses
```

### **Specific Scenarios**

```bash
npx playwright test tests/scenarios/gsm-packages.spec.ts
npx playwright test --grep "@smoke"
npx playwright test --grep "@negative"
```

---

## Creating New Scenarios

### **Step 1: Define Scenarios**

Create `data/scenarios/my-api.scenarios.json`:

```json
[
  {
    "id": "my-api-positive",
    "name": "My API - Valid Request",
    "description": "Test valid request",
    "tags": ["@smoke", "@regression"],
    "apiId": "my-api",
    "method": "POST",
    "path": "/api/v1/my-endpoint",
    "body": {
      "accountNumber": "{{account.postpaid.gsm.accountNumber}}"
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
  }
]
```

### **Step 2: Create Test File**

Create `tests/scenarios/my-api.spec.ts`:

```typescript
import { test } from '@playwright/test';
import { ApiClient } from '../../src/api/client/api-client';
import { scenarioLoader } from '../../src/helpers/scenario-loader';
import { responseValidator } from '../../src/validators/response-validator';

test.describe('My API Tests', () => {
  let client: ApiClient;
  const scenarios = scenarioLoader.loadScenarios('my-api');

  test.beforeAll(async () => {
    client = await ApiClient.create();
  });

  test.afterAll(async () => {
    await client.dispose();
  });

  scenarios.forEach((scenario) => {
    test(`${scenario.name}`, async () => {
      const response = await client.post(scenario.path, {
        body: scenario.body
      });
      await responseValidator.validate(response, scenario.assertions);
    });
  });
});
```

---

## Test Data Management

### **Using Data Placeholders**

In scenario files, use:

- `{{account.postpaid.gsm.accountNumber}}` - Gets postpaid GSM account
- `{{package.gsm.postpaid.code}}` - Gets GSM postpaid package code
- `{{common.invalidAccount}}` - Gets common test data

### **Adding New Test Data**

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

## Schema Validation

### **Create Schema**

Create `src/validators/schemas/my-response.schema.json`:

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["status", "data"],
  "properties": {
    "status": { "type": "string" },
    "data": { "type": "object" }
  }
}
```

### **Use in Scenario**

```json
{
  "assertions": [
    {
      "type": "schema",
      "schemaFile": "my-response"
    }
  ]
}
```

---

## Tags Reference

| Tag | Purpose |
|-----|---------|
| `@smoke` | Critical path tests (run first) |
| `@regression` | Full regression suite |
| `@negative` | Negative test cases |
| `@prepaid` | Prepaid-specific tests |
| `@postpaid` | Postpaid-specific tests |
| `@gsm` | GSM service tests |
| `@hbb` | HBB service tests |
| `@dtv` | DTV service tests |
| `@auth` | Authentication tests |
| `@boundary` | Boundary value tests |

---

## CI/CD Integration

### **GitHub Actions Example**

```yaml
- name: Run Smoke Tests
  run: npm run test:smoke

- name: Run Regression Tests
  run: npm run test:regression
  if: github.event_name == 'pull_request'
```

---

## Troubleshooting

### **Scenario Not Running**

- Check if tag filter matches: `TEST_TAG=@smoke npm test`
- Verify scenario file is in `data/scenarios/`
- Check `skip` field is not `true`

### **Data Interpolation Fails**

- Verify placeholder syntax: `{{account.type.sbu.field}}`
- Check test data exists in `data/test-data/`
- Ensure data provider can find matching record

### **Schema Validation Fails**

- Check schema file exists in `src/validators/schemas/`
- Verify schema matches actual API response
- Use `console.log` to inspect response body

---

## Migration from Old Framework

### **What Changed**

| Old | New |
|-----|-----|
| `api-definitions.json` | `api-registry.json` + scenarios |
| One test per API | Multiple scenarios per API |
| Generic assertions | Scenario-specific assertions |
| Hardcoded data | Data provider with interpolation |
| No tags | Tag-based filtering |
| Basic client | Enhanced client with retry/auth |

### **Migration Steps**

1. Keep existing `api-definitions.json` as reference
2. Create scenario files for each API domain
3. Move test data to `data/test-data/`
4. Update test files to use scenario loader
5. Add tags to scenarios
6. Create schemas for responses

---

## Best Practices

1. **One scenario file per API domain** (e.g., gsm-packages, hbb-packages)
2. **Tag all scenarios** for selective execution
3. **Use data interpolation** instead of hardcoding
4. **Create schemas** for critical APIs
5. **Write negative tests** for each positive test
6. **Keep scenarios small** and focused
7. **Use descriptive names** for scenarios
8. **Document expected behavior** in description field

---

## Support

For questions or issues, refer to:
- Playwright docs: https://playwright.dev
- JSON Schema: https://json-schema.org
- Project README: README.md
