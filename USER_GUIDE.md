# Dialog API Testing Framework - User Guide

**Complete guide for using the Dialog API Testing Framework**

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Running Tests](#running-tests)
3. [Understanding Test Scenarios](#understanding-test-scenarios)
4. [Working with Assertions](#working-with-assertions)
5. [Test Data Management](#test-data-management)
6. [Response Capture & Debugging](#response-capture--debugging)
7. [Automated Assertion Generation](#automated-assertion-generation)
8. [Adding New Tests](#adding-new-tests)
9. [CI/CD Integration](#cicd-integration)
10. [Troubleshooting](#troubleshooting)

---

## Getting Started

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd Decagon.Api

# Install dependencies
npm ci

# Install Playwright browsers
npx playwright install

# Setup environment configuration
copy config\environments\dev.env.example config\environments\dev.env
```

### Environment Configuration

Edit `config/environments/dev.env`:

```ini
BASE_URL=https://chatbot.dialog.lk
TRACE_ID=DEV_TRACE_0001
API_TIMEOUT=15000
RETRIES=1
CAPTURE_API_RESPONSES=false
```

### Verify Installation

```bash
# Run smoke tests
npm run test:smoke

# View HTML report
npx playwright show-report
```

---

## Running Tests

### Basic Test Execution

```bash
# Run all tests
npm run test:e2e

# Run smoke tests only
npm run test:smoke

# Run regression tests
npm run test:regression

# Run specific test file
npx playwright test tests/e2e/nps.spec.ts

# Run specific test by name
npx playwright test -g "Check NPS Eligibility"
```

### Tag-Based Execution

```bash
# Run tests by tag
TEST_TAG=@smoke npm run test:e2e
TEST_TAG=@postpaid npm run test:e2e
TEST_TAG=@gsm npm run test:e2e

# Run tests with multiple workers
npx playwright test --workers=4

# Run in headed mode (see browser)
npx playwright test --headed

# Run in debug mode
npx playwright test --debug
```

### Available Tags

| Tag | Description |
|-----|-------------|
| `@smoke` | Critical smoke tests |
| `@regression` | Full regression suite |
| `@postpaid` | Postpaid-specific tests |
| `@prepaid` | Prepaid-specific tests |
| `@gsm` | GSM service tests |
| `@hbb` | HBB service tests |
| `@mbb` | MBB service tests |
| `@dtv` | DTV service tests |

---

## Understanding Test Scenarios

### Scenario File Structure

Test scenarios are defined in JSON files under `data/Decagon_API/`:

```json
{
  "metadata": {
    "mainWorkflow": "NPS",
    "subWorkflow": "NPS",
    "apiCommonName": "NPS Survey",
    "mifeApi": "SS-DIA-NPS-Eligibility-Query - v1.0.0",
    "generatedAt": "2026-04-02T08:00:00.000Z",
    "source": "book5-migration"
  },
  "mifeApi": "SS-DIA-NPS-Eligibility-Query - v1.0.0",
  "scenarios": [
    {
      "id": "nps-eligibility-smoke",
      "name": "Check NPS Eligibility (Smoke)",
      "mifeApi": "SS-DIA-NPS-Eligibility-Query - v1.0.0",
      "tags": ["@smoke", "@regression"],
      "method": "POST",
      "endpoint": "/dia-api-engine/api/nps/v1/eligibility",
      "headers": {
        "traceId": "{{traceId}}",
        "Content-Type": "application/json"
      },
      "body": {
        "userId": "1181a0341b07e2aedcbbdc89",
        "servedBy": "bot",
        "triggerNpsDb": true
      },
      "expectedStatus": 200,
      "assertions": {
        "status": 200,
        "responseTime": 3000,
        "bodyNotEmpty": true,
        "requiredFields": ["executionStatus", "executionMessage"],
        "fieldValues": {
          "executionStatus": "00",
          "executionMessage": "SUCCESS"
        },
        "jsonSchema": {
          "type": "object",
          "properties": {
            "executionStatus": { "type": "string" },
            "executionMessage": { "type": "string" },
            "responseData": {
              "type": "object",
              "properties": {
                "eligible": { "type": "boolean" },
                "npsType": { "type": "string" }
              },
              "required": ["eligible", "npsType"]
            }
          },
          "required": ["executionStatus", "executionMessage", "responseData"]
        }
      }
    }
  ]
}
```

### Scenario Components

| Component | Description |
|-----------|-------------|
| **id** | Unique scenario identifier |
| **name** | Human-readable test name |
| **mifeApi** | MIFE API identifier |
| **tags** | Test tags for filtering |
| **method** | HTTP method (GET, POST, PUT, DELETE) |
| **endpoint** | API endpoint path |
| **headers** | Request headers |
| **body** | Request body (for POST/PUT) |
| **queryParams** | URL query parameters |
| **numberResolution** | Test number resolution config |
| **expectedStatus** | Expected HTTP status code |
| **assertions** | Validation rules |

### Placeholders

| Placeholder | Description | Example |
|-------------|-------------|---------|
| `{{number}}` | Resolved test number | `"771234567"` |
| `{{traceId}}` | Generated trace ID | `"DIA1234567890123"` |

---

## Working with Assertions

### Assertion Types

#### 1. Status Code Assertion

```json
{
  "assertions": {
    "status": 200
  }
}
```

Or multiple acceptable statuses:

```json
{
  "assertions": {
    "status": [200, 201]
  }
}
```

#### 2. Response Time Assertion

```json
{
  "assertions": {
    "responseTime": 3000
  }
}
```

#### 3. Body Not Empty

```json
{
  "assertions": {
    "bodyNotEmpty": true
  }
}
```

#### 4. Required Fields

```json
{
  "assertions": {
    "requiredFields": ["executionStatus", "executionMessage", "responseData"]
  }
}
```

#### 5. Field Values (Exact Match)

```json
{
  "assertions": {
    "fieldValues": {
      "executionStatus": "00",
      "executionMessage": "SUCCESS"
    }
  }
}
```

#### 6. Field Matches (Regex)

```json
{
  "assertions": {
    "fieldMatches": {
      "referenceNo": "^2-[0-9]+$",
      "email": "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$"
    }
  }
}
```

#### 7. Body Contains

```json
{
  "assertions": {
    "bodyContains": ["success", "eligible"]
  }
}
```

#### 8. Array Fields

```json
{
  "assertions": {
    "arrayFields": ["responseData", "srttDetails"]
  }
}
```

#### 9. Array Min Length

```json
{
  "assertions": {
    "arrayMinLength": {
      "responseData": 1,
      "srttDetails": 5
    }
  }
}
```

#### 10. JSON Schema Validation

```json
{
  "assertions": {
    "jsonSchema": {
      "type": "object",
      "properties": {
        "executionStatus": { "type": "string" },
        "executionMessage": { "type": "string" },
        "responseData": {
          "type": "object",
          "properties": {
            "eligible": { "type": "boolean" },
            "npsType": { "type": "string" }
          },
          "required": ["eligible", "npsType"]
        }
      },
      "required": ["executionStatus", "executionMessage", "responseData"]
    }
  }
}
```

### Combining Multiple Assertions

```json
{
  "assertions": {
    "status": 200,
    "responseTime": 3000,
    "bodyNotEmpty": true,
    "requiredFields": ["executionStatus", "executionMessage", "responseData"],
    "fieldValues": {
      "executionStatus": "00",
      "executionMessage": "SUCCESS"
    },
    "arrayFields": ["responseData"],
    "arrayMinLength": {
      "responseData": 1
    },
    "jsonSchema": { ... }
  }
}
```

---

## Test Data Management

### Test Numbers

Test numbers are managed in `data/test-data/test-numbers.json`:

```json
{
  "postpaid": {
    "active": [
      {
        "number": "762546554",
        "serviceType": "GSM",
        "connectionType": "POSTPAID",
        "status": "ACTIVE",
        "notes": "Primary postpaid test account"
      }
    ]
  },
  "prepaid": {
    "active": [
      {
        "number": "771234567",
        "serviceType": "GSM",
        "connectionType": "PREPAID",
        "status": "ACTIVE"
      }
    ]
  }
}
```

### Number Resolution

Map API operations to test numbers in `data/test-data/service-number-mapping.json`:

```json
{
  "apiToServiceMapping": {
    "complaint": {
      "lodge": {
        "postpaid": "postpaid.active[0]",
        "prepaid": "prepaid.active[0]"
      }
    }
  }
}
```

### Using Number Resolution in Scenarios

```json
{
  "body": {
    "accountNumber": "{{number}}"
  },
  "numberResolution": {
    "apiDomain": "complaint",
    "operation": "lodge",
    "connectionType": "POSTPAID",
    "serviceType": "GSM",
    "scenarioType": "positive"
  }
}
```

---

## Response Capture & Debugging

### Enable Response Capture

Edit `config/environments/dev.env`:

```ini
CAPTURE_API_RESPONSES=true
```

### Run Tests with Capture

```bash
npm run test:smoke
```

### View Captured Responses

Responses are saved to:
```
test-results/api-captures/consolidated-reference.json
```

### Captured Response Format

```json
{
  "generatedAt": "2026-04-02T08:10:41.422Z",
  "totalCaptures": 1,
  "captures": [
    {
      "domain": "NPS",
      "scenarioId": "nps-eligibility-smoke",
      "scenarioName": "Check NPS Eligibility (Smoke)",
      "mifeApi": "SS-DIA-NPS-Eligibility-Query - v1.0.0",
      "request": {
        "method": "POST",
        "endpoint": "/dia-api-engine/api/nps/v1/eligibility",
        "headers": { ... },
        "body": { ... }
      },
      "response": {
        "status": 200,
        "statusText": "",
        "headers": { ... },
        "body": { ... }
      },
      "timestamp": "2026-04-02T08:10:41.422Z",
      "duration": 346
    }
  ]
}
```

### Disable Capture for Normal Runs

```ini
CAPTURE_API_RESPONSES=false
```

---

## Automated Assertion Generation

### Step 1: Capture Responses

```bash
# Enable capture
# Edit config/environments/dev.env: CAPTURE_API_RESPONSES=true

# Run tests
npm run test:smoke
```

### Step 2: Generate Assertions

```bash
# Run assertion derivation script
npx ts-node scripts/derive-assertions.ts
```

This will:
- Read captured responses from `consolidated-reference.json`
- Analyze response structure
- Generate appropriate assertions including JSON Schema
- Update scenario JSON files automatically

### Step 3: Verify Generated Assertions

```bash
# Disable capture
# Edit config/environments/dev.env: CAPTURE_API_RESPONSES=false

# Run tests to verify
npm run test:smoke
```

### What Gets Generated

The script automatically generates:

1. **Status assertion** - From response status code
2. **Response time assertion** - From actual duration + buffer
3. **Body not empty** - Always true for valid responses
4. **Required fields** - Common fields like executionStatus, executionMessage
5. **Field values** - Exact values for validation fields
6. **JSON Schema** - Complete schema based on response structure

### Example: Before and After

**Before (No assertions):**
```json
{
  "id": "nps-eligibility-smoke",
  "name": "Check NPS Eligibility (Smoke)",
  "method": "POST",
  "endpoint": "/dia-api-engine/api/nps/v1/eligibility",
  "expectedStatus": 200
}
```

**After (With generated assertions):**
```json
{
  "id": "nps-eligibility-smoke",
  "name": "Check NPS Eligibility (Smoke)",
  "method": "POST",
  "endpoint": "/dia-api-engine/api/nps/v1/eligibility",
  "expectedStatus": 200,
  "assertions": {
    "status": 200,
    "responseTime": 3000,
    "bodyNotEmpty": true,
    "requiredFields": ["executionStatus", "executionMessage", "responseData"],
    "fieldValues": {
      "executionStatus": "00",
      "executionMessage": "SUCCESS"
    },
    "jsonSchema": {
      "type": "object",
      "properties": {
        "executionStatus": { "type": "string" },
        "executionMessage": { "type": "string" },
        "responseData": {
          "type": "object",
          "properties": {
            "eligible": { "type": "boolean" },
            "npsType": { "type": "string" }
          },
          "required": ["eligible", "npsType"]
        }
      },
      "required": ["executionStatus", "executionMessage", "responseData"]
    }
  }
}
```

---

## Adding New Tests

### Step 1: Create Scenario JSON

Create a new JSON file in `data/Decagon_API/YourDomain/`:

```json
{
  "metadata": {
    "mainWorkflow": "YourDomain",
    "subWorkflow": "YourSubWorkflow",
    "apiCommonName": "Your API Name",
    "mifeApi": "SS-DIA-Your-API - v1.0.0"
  },
  "mifeApi": "SS-DIA-Your-API - v1.0.0",
  "scenarios": [
    {
      "id": "your-test-id",
      "name": "Your Test Name",
      "mifeApi": "SS-DIA-Your-API - v1.0.0",
      "tags": ["@smoke", "@regression"],
      "method": "POST",
      "endpoint": "/dia-api-engine/api/your-endpoint/v1/action",
      "headers": {
        "traceId": "{{traceId}}"
      },
      "body": {
        "param1": "value1"
      },
      "expectedStatus": 200
    }
  ]
}
```

### Step 2: Create Test Spec

Create `tests/e2e/your-domain.spec.ts`:

```typescript
import { createScenarioSuite } from '../../src/helpers/scenario-runner';
import * as path from 'path';

createScenarioSuite(
  path.join(__dirname, '../../data/Decagon_API/YourDomain/SS-DIA-Your-API - v1.0.0.json'),
  'Your Domain - Dialog API Tests'
);
```

### Step 3: Add Test Numbers (if needed)

Update `data/test-data/service-number-mapping.json`:

```json
{
  "apiToServiceMapping": {
    "your-domain": {
      "your-operation": {
        "postpaid": "postpaid.active[0]"
      }
    }
  }
}
```

### Step 4: Run Tests

```bash
npx playwright test tests/e2e/your-domain.spec.ts
```

### Step 5: Generate Assertions

```bash
# Enable capture
# Edit config/environments/dev.env: CAPTURE_API_RESPONSES=true

# Run test
npx playwright test tests/e2e/your-domain.spec.ts

# Generate assertions
npx ts-node scripts/derive-assertions.ts

# Disable capture
# Edit config/environments/dev.env: CAPTURE_API_RESPONSES=false

# Verify
npx playwright test tests/e2e/your-domain.spec.ts
```

---

## CI/CD Integration

### GitHub Actions

The framework includes `.github/workflows/ci.yml`:

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
      - name: Run Smoke Tests
        env:
          BASE_URL: ${{ secrets.BASE_URL }}
          TRACE_ID: ${{ secrets.TRACE_ID }}
        run: npm run test:smoke
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: playwright-report
```

### Running in CI

Tests automatically run on:
- Push to `main` or `develop` branches
- Pull requests to `main`

### Viewing CI Results

1. Go to GitHub Actions tab
2. Click on the workflow run
3. Download `playwright-report` artifact
4. Extract and open `index.html`

---

## Troubleshooting

### Common Issues

#### Issue: Test number not found

**Symptoms:**
```
[NumberResolver] No mapping found for API domain: your-domain, using fallback
```

**Solution:**
1. Check `data/test-data/service-number-mapping.json` has mapping for your API
2. Verify the path exists in `data/test-data/test-numbers.json`
3. Ensure `numberResolution` in scenario matches the mapping

#### Issue: Assertion failures

**Symptoms:**
```
Error: Field 'executionStatus' expected '00', but got '02'
```

**Solution:**
1. Enable response capture: `CAPTURE_API_RESPONSES=true`
2. Run the failing test
3. Review captured response in `test-results/api-captures/consolidated-reference.json`
4. Either update the assertion or report an API bug

#### Issue: JSON Schema validation fails

**Symptoms:**
```
Error: JSON Schema validation failed: /responseData/eligible should be boolean
```

**Solution:**
1. Check the captured response structure
2. Verify the schema matches the actual API response
3. Regenerate schema using `npx ts-node scripts/derive-assertions.ts`

#### Issue: Connection timeouts

**Symptoms:**
```
Error: Timeout 15000ms exceeded
```

**Solution:**
1. Check `BASE_URL` in `config/environments/dev.env`
2. Verify network connectivity
3. Increase timeout: `API_TIMEOUT=30000`

#### Issue: Response capture not working

**Symptoms:**
- No `consolidated-reference.json` file created
- No capture messages in console

**Solution:**
1. Verify `CAPTURE_API_RESPONSES=true` in `config/environments/dev.env`
2. Check directory permissions for `test-results/`
3. Ensure tests are actually running

### Debug Mode

Run tests in debug mode:

```bash
npx playwright test --debug
```

This will:
- Open Playwright Inspector
- Pause before each action
- Allow step-by-step execution
- Show network requests

### Viewing Traces

```bash
# Run with trace
npx playwright test --trace on

# View trace
npx playwright show-trace test-results/<test-name>/trace.zip
```

### Verbose Logging

Enable verbose logging in `playwright.config.ts`:

```typescript
use: {
  trace: 'on',
  screenshot: 'on',
  video: 'on'
}
```

---

## Best Practices

### 1. Use Appropriate Tags

Tag scenarios correctly for selective execution:

```json
{
  "tags": ["@smoke", "@regression", "@postpaid", "@gsm"]
}
```

### 2. Keep Scenarios Focused

One scenario should test one specific behavior:

```json
{
  "id": "nps-eligibility-check",
  "name": "Check NPS Eligibility"
}
```

### 3. Use Meaningful Names

```json
{
  "id": "complaint-lodge-mobile-smoke",
  "name": "Lodge Complaint - Mobile (Smoke)"
}
```

### 4. Update Test Data Regularly

Review and update test numbers periodically:
- Check if numbers are still active
- Add new numbers for different scenarios
- Remove obsolete numbers

### 5. Capture Responses for Debugging

When investigating failures:
1. Enable capture
2. Run the failing test
3. Review the captured response
4. Disable capture after debugging

### 6. Use JSON Schema for Complex Responses

For responses with nested objects or arrays, use JSON Schema:

```json
{
  "assertions": {
    "jsonSchema": {
      "type": "object",
      "properties": {
        "responseData": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "id": { "type": "number" },
              "name": { "type": "string" }
            },
            "required": ["id", "name"]
          }
        }
      }
    }
  }
}
```

### 7. Run Smoke Tests Before Commits

```bash
npm run test:smoke
```

### 8. Review CI/CD Results

Monitor GitHub Actions runs and address failures promptly.

---

## Quick Reference

### Essential Commands

```bash
# Install
npm ci && npx playwright install

# Run tests
npm run test:smoke
npm run test:regression
npm run test:e2e

# Run specific test
npx playwright test tests/e2e/nps.spec.ts

# View report
npx playwright show-report

# Generate assertions
npx ts-node scripts/derive-assertions.ts

# Debug
npx playwright test --debug
```

### File Locations

| Item | Location |
|------|----------|
| Scenarios | `data/Decagon_API/` |
| Test specs | `tests/e2e/` |
| Test numbers | `data/test-data/test-numbers.json` |
| Number mapping | `data/test-data/service-number-mapping.json` |
| Environment config | `config/environments/dev.env` |
| Captured responses | `test-results/api-captures/` |
| Test reports | `playwright-report/` |

---

## Support

For additional help:

1. Check this user guide
2. Review [ARCHITECTURE.md](ARCHITECTURE.md)
3. Check test logs and reports
4. Review captured responses
5. Contact QA automation team

---

**Version**: 2.0.0 | **Last Updated**: 2026-04-02
