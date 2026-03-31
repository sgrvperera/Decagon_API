# Implementation Roadmap - Dialog API Testing Framework

## Table of Contents

1. [Current State](#current-state)
2. [Framework Overview](#framework-overview)
3. [Getting Started](#getting-started)
4. [Adding New Test Scenarios](#adding-new-test-scenarios)
5. [Working with Test Data](#working-with-test-data)
6. [Response Capture Workflow](#response-capture-workflow)
7. [Maintenance Tasks](#maintenance-tasks)
8. [Advanced Features](#advanced-features)
9. [CI/CD Integration](#cicd-integration)
10. [Future Enhancements](#future-enhancements)

---

## Current State

### What's Implemented ✅

The framework is **fully functional** and production-ready with the following features:

#### Core Framework
- ✅ **Scenario-driven architecture** - JSON-based test scenarios
- ✅ **Generic test runner** - One runner for all domains
- ✅ **API client with retry logic** - Automatic retry on failures
- ✅ **Request builder** - Constructs URLs, headers, query strings
- ✅ **Assertion executor** - 10 assertion types supported
- ✅ **Number resolver** - Intelligent test number resolution
- ✅ **Response capture** - Optional request/response logging
- ✅ **Mock mode** - Offline testing support

#### Test Coverage
- ✅ **7 domains implemented**: GSM Packages, HBB Packages, HBB Addons, MBB Packages, MBB Addons, DTV Packages, DTV Channels
- ✅ **48 test scenarios** across all domains
- ✅ **Tag-based execution** - @smoke, @regression, @negative, @postpaid, @prepaid
- ✅ **All scenarios have assertions** - Comprehensive validation

#### Infrastructure
- ✅ **Environment configuration** - .env based config
- ✅ **TypeScript compilation** - No errors
- ✅ **Test data management** - Centralized test numbers
- ✅ **Utility scripts** - Response consolidation and assertion updates
- ✅ **Documentation** - Complete architecture and user guides

### Project Statistics

```
Total Files: 46
├── Source Code: 15 files
├── Test Specs: 7 files
├── Scenario Files: 7 files
├── Test Data: 4 files
├── Configuration: 4 files
├── Scripts: 2 files
├── Documentation: 4 files
└── Other: 3 files

Test Scenarios: 48
├── GSM Packages: 8 scenarios
├── HBB Packages: 7 scenarios
├── HBB Addons: 6 scenarios
├── MBB Packages: 6 scenarios
├── MBB Addons: 7 scenarios
├── DTV Packages: 7 scenarios
└── DTV Channels: 7 scenarios

Lines of Code: ~3,500
├── TypeScript: ~2,800 lines
├── JSON: ~700 lines
└── Configuration: ~100 lines
```

---

## Framework Overview

### How It Works

```
1. Test Spec loads Scenario JSON
   ↓
2. Scenario Runner processes each scenario
   ↓
3. Number Resolver gets test number (if needed)
   ↓
4. Data Interpolator replaces {{placeholders}}
   ↓
5. API Client executes HTTP request
   ↓
6. Response Capture saves data (optional)
   ↓
7. Assertion Executor validates response
   ↓
8. Test passes or fails
```

### Key Concepts

**Scenario-Driven**: Tests are defined in JSON files, not code
```json
{
  "id": "gsm-get-packages-postpaid-smoke",
  "name": "Get GSM Packages - Postpaid (Smoke)",
  "method": "GET",
  "endpoint": "/dia-api-engine/api/gsm-package/v1/packages",
  "assertions": {...}
}
```

**Data-Driven**: Test numbers resolved automatically
```json
{
  "numberResolution": {
    "apiDomain": "gsm-packages",
    "operation": "eligibility",
    "connectionType": "POSTPAID",
    "serviceType": "GSM"
  }
}
```

**Assertion-Driven**: Validations declared in scenarios
```json
{
  "assertions": {
    "status": 200,
    "responseTime": 3000,
    "requiredFields": ["executionStatus"],
    "fieldValues": {"executionStatus": "00"}
  }
}
```

---

## Getting Started

### Prerequisites

- Node.js 18 LTS or 20 LTS
- npm 8.x or higher
- Git
- Text editor (VS Code recommended)

### Initial Setup

```bash
# 1. Clone repository (if not already done)
git clone <repository-url>
cd Decagon.Api

# 2. Install dependencies
npm ci

# 3. Install Playwright browsers
npx playwright install

# 4. Copy environment file
copy .env.example .env

# 5. Configure environment (edit .env)
# Set BASE_URL, TRACE_ID, etc.

# 6. Verify setup
npm run test:smoke
```

### First Test Run

```bash
# Run all tests
npm run test:e2e

# Run specific domain
npx playwright test tests/e2e/gsm-packages.spec.ts

# Run with tag
TEST_TAG=@smoke npm run test:e2e

# View report
npx playwright show-report
```

### Understanding the Output

```
Running 8 tests using 4 workers

  ✓ Get GSM Packages - Postpaid (Smoke) [SS-DIA-Get-Gsm-Packages-Query - v1.0.0] @smoke @regression @postpaid @gsm (1.2s)
  ✓ Get GSM Packages - Prepaid [SS-DIA-Get-Gsm-Packages-Query - v1.0.0] @regression @prepaid @gsm (1.1s)
  ✓ Check GSM Package Eligibility - Valid Postpaid (Smoke) [SS-DIA-Gsm-Package-Change-Eligibility-Query - v1.0.0] @smoke @regression @postpaid @gsm (1.5s)
  ...

8 passed (12.3s)
```

---

## Adding New Test Scenarios

### Step-by-Step Guide

#### Step 1: Identify the API

Gather API information:
- API endpoint (e.g., `/dia-api-engine/api/balance-check/v1/check-balance`)
- HTTP method (GET, POST, PUT, DELETE)
- Request headers
- Request body/query parameters
- Expected response structure

#### Step 2: Determine the Domain

Choose or create a domain:
- Use existing domain if API fits (e.g., `gsm-packages`)
- Create new domain if needed (e.g., `balance-check`)

#### Step 3: Add Test Numbers (if needed)

If the API requires account numbers:

**Edit `data/test-data/service-number-mapping.json`:**
```json
{
  "apiToServiceMapping": {
    "balance-check": {
      "checkBalance": {
        "postpaid": "postpaid.active[0]",
        "prepaid": "prepaid.active[0]"
      }
    }
  }
}
```

**Verify numbers exist in `data/test-data/test-numbers.json`:**
```json
{
  "postpaid": {
    "active": [
      {
        "number": "771234567",
        "serviceType": "GSM",
        "connectionType": "POSTPAID",
        "status": "ACTIVE"
      }
    ]
  }
}
```

#### Step 4: Create Scenario JSON

**Create or edit `data/scenarios/balance-check.json`:**
```json
{
  "domain": "balance-check",
  "mifeApis": [
    "SS-DIA-Balance-Check-Query - v1.0.0"
  ],
  "scenarios": [
    {
      "id": "balance-check-postpaid-valid",
      "name": "Check Balance - Valid Postpaid Account (Smoke)",
      "mifeApi": "SS-DIA-Balance-Check-Query - v1.0.0",
      "tags": ["@smoke", "@regression", "@postpaid"],
      "method": "POST",
      "endpoint": "/dia-api-engine/api/balance-check/v1/check-balance",
      "headers": {
        "traceId": "{{traceId}}",
        "Content-Type": "application/json"
      },
      "body": {
        "accountNo": "{{number}}"
      },
      "numberResolution": {
        "apiDomain": "balance-check",
        "operation": "checkBalance",
        "connectionType": "POSTPAID",
        "serviceType": "GSM",
        "scenarioType": "positive"
      },
      "expectedStatus": 200,
      "assertions": {
        "status": 200,
        "responseTime": 3000,
        "bodyNotEmpty": true,
        "requiredFields": ["executionStatus", "executionMessage", "responseData"],
        "fieldValues": {
          "executionStatus": "00",
          "executionMessage": "SUCCESS"
        }
      }
    },
    {
      "id": "balance-check-invalid-account",
      "name": "Check Balance - Invalid Account (Negative)",
      "mifeApi": "SS-DIA-Balance-Check-Query - v1.0.0",
      "tags": ["@negative"],
      "method": "POST",
      "endpoint": "/dia-api-engine/api/balance-check/v1/check-balance",
      "headers": {
        "traceId": "{{traceId}}",
        "Content-Type": "application/json"
      },
      "body": {
        "accountNo": "{{number}}"
      },
      "numberResolution": {
        "apiDomain": "balance-check",
        "operation": "checkBalance",
        "connectionType": "POSTPAID",
        "serviceType": "GSM",
        "scenarioType": "negative"
      },
      "expectedStatus": [400, 404],
      "assertions": {
        "status": [400, 404],
        "responseTime": 3000,
        "bodyNotEmpty": true
      }
    }
  ]
}
```

#### Step 5: Create Test Spec

**Create `tests/e2e/balance-check.spec.ts`:**
```typescript
import { createScenarioSuite } from '../../src/helpers/scenario-runner';
import * as path from 'path';

createScenarioSuite(
  path.join(__dirname, '../../data/scenarios/balance-check.json'),
  'Balance Check - Dialog API Tests'
);
```

#### Step 6: Run and Verify

```bash
# Run the new test
npx playwright test tests/e2e/balance-check.spec.ts

# Run with debug
npx playwright test tests/e2e/balance-check.spec.ts --debug

# View report
npx playwright show-report
```

#### Step 7: Refine Assertions

If tests fail, capture the actual response:

```bash
# Enable response capture
set CAPTURE_API_RESPONSES=true

# Run test
npx playwright test tests/e2e/balance-check.spec.ts

# Check captured response
# File: test-results/api-captures/YYYY-MM-DD/session-HH-MM-SS/balance-check-*.json
```

Update assertions based on actual response.

---

## Working with Test Data

### Test Number Management

#### Understanding the Resolution Flow

```
Scenario numberResolution block
    ↓
service-number-mapping.json (API → Path mapping)
    ↓
test-numbers.json (Path → Actual number)
    ↓
Resolved number used in request
```

#### Adding New Test Numbers

**Step 1: Add to test-numbers.json**
```json
{
  "postpaid": {
    "active": [
      {
        "number": "771234567",
        "serviceType": "GSM",
        "connectionType": "POSTPAID",
        "status": "ACTIVE",
        "notes": "Primary postpaid test account"
      },
      {
        "number": "772345678",
        "serviceType": "GSM",
        "connectionType": "POSTPAID",
        "status": "ACTIVE",
        "notes": "Secondary postpaid test account"
      }
    ]
  }
}
```

**Step 2: Map in service-number-mapping.json**
```json
{
  "apiToServiceMapping": {
    "gsm-package": {
      "eligibility": {
        "postpaid": "postpaid.active[0]"
      },
      "activation": {
        "postpaid": "postpaid.active[1]"
      }
    }
  }
}
```

**Step 3: Use in scenarios**
```json
{
  "numberResolution": {
    "apiDomain": "gsm-package",
    "operation": "activation",
    "connectionType": "POSTPAID",
    "serviceType": "GSM"
  }
}
```
This will resolve to `772345678` (postpaid.active[1])

#### Managing Package Codes

**Edit `data/test-data/packages.json`:**
```json
{
  "gsm": {
    "postpaid": {
      "packages": [
        {
          "code": "SPM_2700",
          "name": "Super Max 2700",
          "type": "POSTPAID"
        }
      ]
    },
    "prepaid": {
      "packages": [
        {
          "code": "59",
          "name": "Prepaid Package 59",
          "type": "PREPAID"
        }
      ]
    }
  }
}
```

**Use in scenarios:**
```json
{
  "body": {
    "packageCode": "{{packages.gsm.postpaid.packages[0].code}}"
  }
}
```

---

## Response Capture Workflow

### Purpose

Response capture allows you to:
1. Analyze actual API responses
2. Generate assertions automatically
3. Document API behavior
4. Debug test failures

### Workflow

#### Step 1: Enable Capture

```bash
# Windows
set CAPTURE_API_RESPONSES=true

# Linux/Mac
export CAPTURE_API_RESPONSES=true
```

#### Step 2: Run Tests

```bash
# Run all tests
npm run test:e2e

# Or specific domain
npx playwright test tests/e2e/gsm-packages.spec.ts
```

#### Step 3: Review Captured Responses

Responses saved to:
```
test-results/api-captures/YYYY-MM-DD/session-HH-MM-SS/
├── gsm-packages-gsm-get-packages-postpaid-smoke.json
├── gsm-packages-gsm-check-eligibility-postpaid-valid.json
└── ...
```

Each file contains:
```json
{
  "domain": "gsm-packages",
  "scenarioId": "gsm-get-packages-postpaid-smoke",
  "scenarioName": "Get GSM Packages - Postpaid (Smoke)",
  "mifeApi": "SS-DIA-Get-Gsm-Packages-Query - v1.0.0",
  "timestamp": "2024-01-15T10:30:45.123Z",
  "request": {
    "method": "GET",
    "endpoint": "/dia-api-engine/api/gsm-package/v1/packages",
    "headers": {...},
    "queryParams": {"connectionType": "POSTPAID"}
  },
  "response": {
    "status": 200,
    "headers": {...},
    "body": {
      "executionStatus": "00",
      "executionMessage": "SUCCESS",
      "responseData": [...]
    },
    "duration": 1234
  },
  "suggestedAssertions": {
    "status": 200,
    "responseTime": 3000,
    "bodyNotEmpty": true,
    "requiredFields": ["executionStatus", "executionMessage", "responseData"],
    "fieldValues": {
      "executionStatus": "00",
      "executionMessage": "SUCCESS"
    },
    "arrayFields": ["responseData"]
  }
}
```

#### Step 4: Consolidate Captures

```bash
# Consolidate all sessions into master reference
npx ts-node scripts/consolidate-all-responses.ts
```

Creates:
```
test-results/api-captures/YYYY-MM-DD/master-reference-responses.json
```

#### Step 5: Update Scenario Assertions

```bash
# Automatically update scenario JSON files with captured assertions
npx ts-node scripts/update-scenario-assertions.ts
```

This updates all scenario JSON files with assertions from captured responses.

#### Step 6: Review and Commit

```bash
# Review changes
git diff data/scenarios/

# Commit if correct
git add data/scenarios/
git commit -m "Update assertions based on captured responses"
```

### Use Cases

**1. Initial Setup**
- Capture responses for new APIs
- Generate baseline assertions
- Document expected behavior

**2. API Changes**
- Re-capture after API updates
- Compare with previous captures
- Update assertions accordingly

**3. Debugging**
- Capture failing test responses
- Analyze actual vs expected
- Fix assertions or report bugs

**4. Documentation**
- Capture responses as examples
- Share with team
- Reference for API contracts

---

## Maintenance Tasks

### Regular Maintenance

#### Weekly Tasks

**1. Review Test Results**
```bash
# Run full regression
npm run test:regression

# Check for flaky tests
# Review Playwright report for patterns
```

**2. Update Test Numbers**
```bash
# Verify test numbers are still valid
# Update inactive numbers if needed
# Add new numbers if required
```

#### Monthly Tasks

**1. Update Dependencies**
```bash
# Check for updates
npm outdated

# Update Playwright
npm install @playwright/test@latest

# Run tests to verify
npm run test:e2e
```

**2. Review and Clean Test Data**
```bash
# Remove obsolete test numbers
# Update package codes
# Clean up old captured responses
```

**3. Documentation Review**
```bash
# Update README if needed
# Review USER_GUIDE for accuracy
# Update ARCHITECTURE if changes made
```

#### Quarterly Tasks

**1. Performance Review**
```bash
# Analyze test execution times
# Identify slow tests
# Optimize if needed
```

**2. Coverage Analysis**
```bash
# Review scenario coverage
# Identify gaps
# Add missing scenarios
```

**3. Framework Improvements**
```bash
# Review framework code
# Refactor if needed
# Add new features
```

### Troubleshooting Common Issues

#### Issue: Test Number Not Found

**Symptoms:**
```
Error: Could not resolve test number for gsm-packages/eligibility/POSTPAID
```

**Solution:**
1. Check `service-number-mapping.json` has mapping
2. Verify path exists in `test-numbers.json`
3. Check spelling and case sensitivity

#### Issue: Assertion Failures

**Symptoms:**
```
Expected status 200, but got 400
Expected field 'executionStatus' to be '00', but got '01'
```

**Solution:**
1. Enable response capture
2. Run test to capture actual response
3. Review captured response
4. Update assertion or report API bug

#### Issue: Connection Timeouts

**Symptoms:**
```
Error: Request timeout after 15000ms
```

**Solution:**
1. Check network connectivity
2. Verify BASE_URL in .env
3. Increase timeout in config
4. Check VPN if required

#### Issue: Response Capture Not Working

**Symptoms:**
- No files in `test-results/api-captures/`

**Solution:**
1. Verify `CAPTURE_API_RESPONSES=true`
2. Check directory permissions
3. Ensure tests are actually running
4. Check console for errors

---

## Advanced Features

### Custom Assertions

Add new assertion types:

**1. Add to assertion-executor.ts:**
```typescript
private async assertCustomValidation(
  response: APIResponse, 
  expected: any
): Promise<void> {
  const body = await response.json();
  // Custom validation logic
  expect(body.customField).toMatch(/pattern/);
}
```

**2. Update execute() method:**
```typescript
if (assertions.customValidation) {
  await this.assertCustomValidation(response, assertions.customValidation);
}
```

**3. Use in scenarios:**
```json
{
  "assertions": {
    "customValidation": "expectedValue"
  }
}
```

### Custom Number Resolution

Add new resolution strategy:

**1. Add to number-resolver.ts:**
```typescript
resolveForCustomOperation(
  apiDomain: string, 
  customParam: string
): NumberResolutionResult {
  // Custom resolution logic
  return this.resolve({
    apiDomain,
    operation: 'custom',
    connectionType: 'POSTPAID',
    customParam
  });
}
```

**2. Update service-number-mapping.json:**
```json
{
  "apiToServiceMapping": {
    "custom-api": {
      "custom": {
        "postpaid": "postpaid.active[2]"
      }
    }
  }
}
```

### Environment-Specific Configuration

**1. Create environment files:**
```
config/environments/
├── dev.env
├── staging.env
└── prod.env
```

**2. Configure each environment:**
```ini
# dev.env
BASE_URL=https://dev-api.dialog.lk
TRACE_ID=DEV_TEST_TRACE

# staging.env
BASE_URL=https://staging-api.dialog.lk
TRACE_ID=STAGING_TEST_TRACE

# prod.env
BASE_URL=https://api.dialog.lk
TRACE_ID=PROD_TEST_TRACE
```

**3. Run with specific environment:**
```bash
TEST_ENV=staging npm run test:e2e
TEST_ENV=prod npm run test:smoke
```

---

## CI/CD Integration

### GitHub Actions

**Current workflow (`.github/workflows/ci.yml`):**
```yaml
name: API Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 18
      - run: npm ci
      - run: npx playwright install
      - name: Run E2E Tests
        env:
          BASE_URL: ${{ secrets.BASE_URL }}
          TRACE_ID: ${{ secrets.TRACE_ID }}
        run: npm run test:e2e
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: playwright-report
```

### Enhanced CI/CD Workflow

**Multi-stage pipeline:**
```yaml
jobs:
  smoke-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 18
      - run: npm ci
      - run: npx playwright install
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
      - run: npx playwright install
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

  negative-tests:
    runs-on: ubuntu-latest
    needs: regression-tests
    if: github.event_name == 'pull_request'
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 18
      - run: npm ci
      - run: npx playwright install
      - name: Run Negative Tests
        env:
          TEST_ENV: staging
          BASE_URL: ${{ secrets.STAGING_BASE_URL }}
          TRACE_ID: ${{ secrets.TRACE_ID }}
        run: npm run test:negative
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: negative-report
          path: playwright-report
```

### Scheduled Runs

```yaml
on:
  schedule:
    - cron: '0 2 * * *'  # Run daily at 2 AM
```

---

## Future Enhancements

### Planned Features

#### 1. Schema Validation (Priority: High)

**Goal**: Validate API responses against JSON schemas

**Implementation**:
```typescript
// Add to assertion-executor.ts
private async assertJsonSchema(
  response: APIResponse, 
  schemaFile: string
): Promise<void> {
  const schema = require(`../schemas/${schemaFile}.json`);
  const body = await response.json();
  const ajv = new Ajv();
  const valid = ajv.validate(schema, body);
  expect(valid).toBeTruthy();
}
```

**Usage**:
```json
{
  "assertions": {
    "jsonSchema": "gsm-packages-response"
  }
}
```

#### 2. Performance Tracking (Priority: Medium)

**Goal**: Track and report API response times

**Implementation**:
- Store response times in database
- Generate performance reports
- Alert on degradation

#### 3. Contract Testing (Priority: Medium)

**Goal**: Validate API contracts

**Implementation**:
- Define contracts in JSON
- Validate requests match contract
- Validate responses match contract

#### 4. Dynamic Test Data (Priority: Low)

**Goal**: Generate test data dynamically

**Implementation**:
- Faker.js integration
- Data generation rules
- Cleanup after tests

#### 5. Parallel Domain Execution (Priority: Low)

**Goal**: Run multiple domains in parallel

**Implementation**:
- Already supported by Playwright
- Optimize worker configuration
- Manage shared resources

### Extensibility Points

The framework is designed for easy extension:

**1. New Assertion Types**
- Add method to AssertionExecutor
- Update ScenarioAssertions interface
- Use in scenario JSON

**2. New Resolution Strategies**
- Add method to NumberResolver
- Update service-number-mapping.json
- Use in numberResolution block

**3. New Interpolation Placeholders**
- Update interpolate() in scenario-runner.ts
- Add data source if needed
- Use {{newPlaceholder}} in scenarios

**4. New Capture Formats**
- Update response-capture.ts
- Add new format method
- Configure via environment variable

---

## Best Practices

### Scenario Design

1. **One scenario, one behavior**: Each scenario tests one specific thing
2. **Descriptive names**: Clear, human-readable names
3. **Appropriate tags**: Tag for selective execution
4. **Minimal assertions**: Only assert what's necessary
5. **Reusable data**: Use number resolution, not hardcoded values

### Test Data Management

1. **Centralized**: All test numbers in registry
2. **Clear mapping**: Document number usage
3. **Regular updates**: Review and update periodically
4. **Separate positive/negative**: Different numbers for different scenarios
5. **Version control**: Track changes in Git

### Code Quality

1. **Type safety**: Use TypeScript types
2. **Error handling**: Comprehensive error handling
3. **Logging**: Detailed logging for debugging
4. **Documentation**: Keep docs up to date
5. **Code reviews**: Review all changes

### Maintenance

1. **Regular runs**: Run tests regularly
2. **Monitor failures**: Investigate failures promptly
3. **Update dependencies**: Keep dependencies current
4. **Clean up**: Remove obsolete scenarios and data
5. **Refactor**: Improve code continuously

---

## Conclusion

The Dialog API Testing Framework is fully implemented and production-ready. This roadmap provides guidance for:

- Adding new test scenarios
- Managing test data
- Using response capture
- Maintaining the framework
- Extending functionality
- Integrating with CI/CD

For architecture details, see [ARCHITECTURE.md](ARCHITECTURE.md).
For usage instructions, see [USER_GUIDE.md](USER_GUIDE.md).
For quick reference, see [README.md](README.md).
