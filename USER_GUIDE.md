# User Guide - Dialog API Testing Framework

## Table of Contents

1. [Quick Start](#quick-start)
2. [Installation](#installation)
3. [Running Tests](#running-tests)
4. [Understanding Test Scenarios](#understanding-test-scenarios)
5. [Test Number Management](#test-number-management)
6. [Working with Assertions](#working-with-assertions)
7. [Response Capture](#response-capture)
8. [Configuration](#configuration)
9. [Troubleshooting](#troubleshooting)
10. [Best Practices](#best-practices)

---

## Quick Start

### 5-Minute Setup

```bash
# 1. Install dependencies
npm ci

# 2. Install Playwright browsers
npx playwright install

# 3. Copy environment file
copy .env.example .env

# 4. Run smoke tests
npm run test:smoke

# 5. View report
npx playwright show-report
```

### Your First Test Run

```bash
# Run all E2E tests
npm run test:e2e

# Expected output:
# Running 48 tests using 8 workers
# 48 passed (2m 15s)
```

---

## Installation

### Prerequisites

- **Node.js**: 18 LTS or 20 LTS
- **npm**: 8.x or higher
- **Git**: For version control
- **Text Editor**: VS Code recommended

### Step-by-Step Installation

#### 1. Clone Repository

```bash
git clone <repository-url>
cd Decagon.Api
```

#### 2. Install Dependencies

```bash
npm ci
```

This installs:
- Playwright Test (^1.58.2)
- TypeScript (^5.0.0)
- dotenv (^16.0.0)
- Other dependencies

#### 3. Install Playwright Browsers

```bash
npx playwright install
```

This downloads Chromium, Firefox, and WebKit browsers.

#### 4. Configure Environment

```bash
# Copy example file
copy .env.example .env

# Edit .env file
notepad .env
```

Set these variables:
```ini
BASE_URL=https://chatbot.dialog.lk
TRACE_ID=AUTO_TEST_TRACE
API_TIMEOUT=15000
RETRIES=1
CAPTURE_API_RESPONSES=false
MOCK_MODE=false
```

#### 5. Verify Installation

```bash
# Run smoke tests
npm run test:smoke

# Should see:
# ✓ All smoke tests pass
```

---

## Running Tests

### Basic Commands

```bash
# Run all E2E tests
npm run test:e2e

# Run specific domain
npx playwright test tests/e2e/gsm-packages.spec.ts
npx playwright test tests/e2e/hbb-packages.spec.ts
npx playwright test tests/e2e/dtv-packages.spec.ts

# Run by tag
TEST_TAG=@smoke npm run test:e2e
TEST_TAG=@regression npm run test:e2e
TEST_TAG=@negative npm run test:e2e

# Run specific test by name
npx playwright test -g "Get GSM Packages - Postpaid"
```

### Available Test Domains

| Domain | Command | Scenarios |
|--------|---------|-----------|
| GSM Packages | `npm run test:gsm` | 8 |
| HBB Packages | `npx playwright test tests/e2e/hbb-packages.spec.ts` | 7 |
| HBB Addons | `npx playwright test tests/e2e/hbb-addons.spec.ts` | 6 |
| MBB Packages | `npx playwright test tests/e2e/mbb-packages.spec.ts` | 6 |
| MBB Addons | `npx playwright test tests/e2e/mbb-addons.spec.ts` | 7 |
| DTV Packages | `npx playwright test tests/e2e/dtv-packages.spec.ts` | 7 |
| DTV Channels | `npx playwright test tests/e2e/dtv-channels.spec.ts` | 7 |

### Test Tags

Tests are tagged for selective execution:

| Tag | Purpose | Example |
|-----|---------|---------|
| `@smoke` | Critical smoke tests | `TEST_TAG=@smoke npm run test:e2e` |
| `@regression` | Full regression suite | `TEST_TAG=@regression npm run test:e2e` |
| `@negative` | Negative test scenarios | `TEST_TAG=@negative npm run test:e2e` |
| `@postpaid` | Postpaid-specific tests | `TEST_TAG=@postpaid npm run test:e2e` |
| `@prepaid` | Prepaid-specific tests | `TEST_TAG=@prepaid npm run test:e2e` |
| `@gsm` | GSM service tests | `TEST_TAG=@gsm npm run test:e2e` |
| `@hbb` | HBB service tests | `TEST_TAG=@hbb npm run test:e2e` |
| `@mbb` | MBB service tests | `TEST_TAG=@mbb npm run test:e2e` |
| `@dtv` | DTV service tests | `TEST_TAG=@dtv npm run test:e2e` |

### Advanced Options

```bash
# Run in headed mode (see browser)
npx playwright test --headed

# Run in debug mode
npx playwright test --debug

# Run with specific workers
npx playwright test --workers=4

# Run and update snapshots
npx playwright test --update-snapshots

# Run with trace
npx playwright test --trace on
```

### Viewing Reports

```bash
# Open HTML report
npx playwright show-report

# View specific trace
npx playwright show-trace test-results/<test-name>/trace.zip
```

---

## Understanding Test Scenarios

### Scenario Structure

Test scenarios are defined in JSON files under `data/scenarios/`:

```json
{
  "domain": "gsm-packages",
  "mifeApis": ["SS-DIA-Get-Gsm-Packages-Query - v1.0.0"],
  "scenarios": [
    {
      "id": "gsm-get-packages-postpaid-smoke",
      "name": "Get GSM Packages - Postpaid (Smoke)",
      "mifeApi": "SS-DIA-Get-Gsm-Packages-Query - v1.0.0",
      "tags": ["@smoke", "@regression", "@postpaid", "@gsm"],
      "method": "GET",
      "endpoint": "/dia-api-engine/api/gsm-package/v1/packages",
      "queryParams": {
        "connectionType": "POSTPAID"
      },
      "headers": {
        "traceId": "{{traceId}}"
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
        }
      }
    }
  ]
}
```

### Scenario Fields Explained

| Field | Required | Description | Example |
|-------|----------|-------------|---------|
| `id` | Yes | Unique scenario identifier | `"gsm-get-packages-postpaid-smoke"` |
| `name` | Yes | Human-readable name | `"Get GSM Packages - Postpaid (Smoke)"` |
| `mifeApi` | Yes | MIFE API identifier | `"SS-DIA-Get-Gsm-Packages-Query - v1.0.0"` |
| `tags` | Yes | Tags for filtering | `["@smoke", "@regression"]` |
| `method` | Yes | HTTP method | `"GET"`, `"POST"`, `"PUT"`, `"DELETE"` |
| `endpoint` | Yes | API endpoint path | `"/dia-api-engine/api/gsm-package/v1/packages"` |
| `headers` | No | Request headers | `{"traceId": "{{traceId}}"}` |
| `queryParams` | No | Query parameters | `{"connectionType": "POSTPAID"}` |
| `body` | No | Request body | `{"accountNumber": "{{number}}"}` |
| `numberResolution` | No | Test number resolution config | See below |
| `expectedStatus` | Yes | Expected HTTP status | `200` or `[200, 201]` |
| `assertions` | Yes | Response assertions | See assertions section |

### Placeholders

Scenarios support dynamic placeholders:

| Placeholder | Description | Example |
|-------------|-------------|---------|
| `{{number}}` | Resolved test number | `"771234567"` |
| `{{traceId}}` | Generated trace ID | `"DIA1234567890123"` |
| `{{packages.gsm.postpaid.packages[0].code}}` | Package code from data | `"SPM_2700"` |

---

## Test Number Management

### How Number Resolution Works

```
Scenario defines numberResolution
    ↓
Number Resolver looks up in service-number-mapping.json
    ↓
Fetches actual number from test-numbers.json
    ↓
Replaces {{number}} placeholder in scenario
```

### Number Resolution Configuration

In scenario JSON:

```json
{
  "body": {
    "accountNumber": "{{number}}"
  },
  "numberResolution": {
    "apiDomain": "gsm-packages",
    "operation": "eligibility",
    "connectionType": "POSTPAID",
    "serviceType": "GSM",
    "scenarioType": "positive"
  }
}
```

### Number Resolution Fields

| Field | Required | Description | Values |
|-------|----------|-------------|--------|
| `apiDomain` | Yes | API domain | `"gsm-packages"`, `"hbb-packages"`, etc. |
| `operation` | Yes | Operation type | `"eligibility"`, `"activation"`, `"getPackages"` |
| `connectionType` | Yes | Connection type | `"POSTPAID"`, `"PREPAID"` |
| `serviceType` | Yes | Service type | `"GSM"`, `"HBB"`, `"MBB"`, `"DTV"` |
| `scenarioType` | No | Scenario type | `"positive"` (default), `"negative"` |

### Test Number Sources

#### 1. Service Number Mapping (`data/test-data/service-number-mapping.json`)

Maps API operations to test number paths:

```json
{
  "apiToServiceMapping": {
    "gsm-package": {
      "eligibility": {
        "postpaid": "postpaid.active[0]",
        "prepaid": "prepaid.active[0]"
      },
      "activation": {
        "postpaid": "postpaid.active[1]",
        "prepaid": "prepaid.active[1]"
      }
    }
  },
  "negativeTestMapping": {
    "invalidNumber": "invalid.numbers[0]",
    "inactivePostpaid": "postpaid.inactive[0]",
    "inactivePrepaid": "prepaid.inactive[0]"
  }
}
```

#### 2. Test Number Registry (`data/test-data/test-numbers.json`)

Contains actual test numbers:

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
      }
    ],
    "inactive": [
      {
        "number": "779999999",
        "serviceType": "GSM",
        "connectionType": "POSTPAID",
        "status": "INACTIVE",
        "notes": "Inactive account for negative tests"
      }
    ]
  },
  "prepaid": {
    "active": [...],
    "inactive": [...]
  },
  "dtv": {...},
  "hbb": {...},
  "mbb": {...},
  "invalid": {
    "numbers": [
      {
        "number": "999999999",
        "status": "INVALID",
        "notes": "Invalid number for negative tests"
      }
    ]
  }
}
```

### Adding New Test Numbers

**Step 1: Add to test-numbers.json**

```json
{
  "postpaid": {
    "active": [
      {
        "number": "772345678",
        "serviceType": "GSM",
        "connectionType": "POSTPAID",
        "status": "ACTIVE",
        "notes": "New test account"
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
      "newOperation": {
        "postpaid": "postpaid.active[1]"
      }
    }
  }
}
```

**Step 3: Use in scenario**

```json
{
  "numberResolution": {
    "apiDomain": "gsm-package",
    "operation": "newOperation",
    "connectionType": "POSTPAID",
    "serviceType": "GSM"
  }
}
```

---

## Working with Assertions

### Supported Assertion Types

The framework supports 10 assertion types:

#### 1. Status Code Assertion

```json
{
  "assertions": {
    "status": 200
  }
}
```

Or multiple acceptable codes:
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

Fails if response takes longer than 3000ms.

#### 3. Body Not Empty

```json
{
  "assertions": {
    "bodyNotEmpty": true
  }
}
```

Ensures response body is not empty.

#### 4. Required Fields

```json
{
  "assertions": {
    "requiredFields": ["executionStatus", "executionMessage", "responseData"]
  }
}
```

Checks that specified fields exist in response.

Supports nested fields:
```json
{
  "assertions": {
    "requiredFields": ["responseData.packages", "responseData.packages[0].code"]
  }
}
```

#### 5. Field Values

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

Checks exact field values.

Supports nested fields:
```json
{
  "assertions": {
    "fieldValues": {
      "responseData.status": "active",
      "responseData.user.name": "John"
    }
  }
}
```

#### 6. Field Matches (Regex)

```json
{
  "assertions": {
    "fieldMatches": {
      "transactionId": "^[0-9]{10}$",
      "email": "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$"
    }
  }
}
```

Validates fields against regex patterns.

#### 7. Body Contains

```json
{
  "assertions": {
    "bodyContains": ["eligible", "true"]
  }
}
```

Checks if response body contains specific strings. Useful for negative tests.

#### 8. Array Fields

```json
{
  "assertions": {
    "arrayFields": ["responseData", "packages"]
  }
}
```

Validates that specified fields are arrays.

#### 9. Array Minimum Length

```json
{
  "assertions": {
    "arrayMinLength": {
      "responseData": 1,
      "packages": 5
    }
  }
}
```

Checks that arrays have minimum length.

#### 10. JSON Schema Validation

```json
{
  "assertions": {
    "jsonSchema": {
      "type": "object",
      "required": ["executionStatus"],
      "properties": {
        "executionStatus": {"type": "string"}
      }
    }
  }
}
```

Validates response against JSON schema.

### Complete Assertion Example

```json
{
  "assertions": {
    "status": 200,
    "responseTime": 3000,
    "bodyNotEmpty": true,
    "requiredFields": [
      "executionStatus",
      "executionMessage",
      "responseData"
    ],
    "fieldValues": {
      "executionStatus": "00",
      "executionMessage": "SUCCESS"
    },
    "fieldMatches": {
      "transactionId": "^[0-9]+$"
    },
    "arrayFields": ["responseData"],
    "arrayMinLength": {
      "responseData": 1
    }
  }
}
```

### Negative Test Assertions

For negative tests, use appropriate status codes and body contains:

```json
{
  "assertions": {
    "status": [400, 404],
    "responseTime": 3000,
    "bodyNotEmpty": true,
    "bodyContains": ["error", "invalid"]
  }
}
```

---

## Response Capture

### Purpose

Response capture allows you to:
- Analyze actual API responses
- Generate assertions automatically
- Debug test failures
- Document API behavior

### Enabling Response Capture

```bash
# Windows
set CAPTURE_API_RESPONSES=true

# Linux/Mac
export CAPTURE_API_RESPONSES=true

# Run tests
npm run test:e2e
```

### Captured Response Location

Responses saved to:
```
test-results/api-captures/YYYY-MM-DD/session-HH-MM-SS/
├── gsm-packages-gsm-get-packages-postpaid-smoke.json
├── gsm-packages-gsm-check-eligibility-postpaid-valid.json
└── ...
```

### Captured Response Format

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
    "headers": {
      "traceId": "DIA1234567890123",
      "Content-Type": "application/json"
    },
    "queryParams": {
      "connectionType": "POSTPAID"
    },
    "body": null
  },
  "response": {
    "status": 200,
    "headers": {
      "content-type": "application/json",
      "content-length": "1234"
    },
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

### Consolidating Captures

```bash
# Consolidate all sessions into master reference
npx ts-node scripts/consolidate-all-responses.ts
```

Creates:
```
test-results/api-captures/YYYY-MM-DD/master-reference-responses.json
```

### Updating Scenario Assertions

```bash
# Automatically update scenario JSON files
npx ts-node scripts/update-scenario-assertions.ts
```

This updates all scenario files with assertions from captured responses.

### Workflow Example

```bash
# 1. Enable capture
set CAPTURE_API_RESPONSES=true

# 2. Run tests
npm run test:e2e

# 3. Review captured responses
# Check: test-results/api-captures/YYYY-MM-DD/session-HH-MM-SS/

# 4. Consolidate
npx ts-node scripts/consolidate-all-responses.ts

# 5. Update assertions
npx ts-node scripts/update-scenario-assertions.ts

# 6. Review changes
git diff data/scenarios/

# 7. Commit if correct
git add data/scenarios/
git commit -m "Update assertions from captured responses"

# 8. Disable capture
set CAPTURE_API_RESPONSES=false
```

---

## Configuration

### Environment Variables

Edit `.env` file:

```ini
# API Base URL
BASE_URL=https://chatbot.dialog.lk

# Default Trace ID
TRACE_ID=AUTO_TEST_TRACE

# API Timeout (milliseconds)
API_TIMEOUT=15000

# Retry count on failure
RETRIES=1

# Enable response capture
CAPTURE_API_RESPONSES=false

# Enable mock mode (no real API calls)
MOCK_MODE=false

# Test environment
TEST_ENV=dev
```

### Playwright Configuration

Edit `playwright.config.ts`:

```typescript
export default defineConfig({
  testDir: './tests',
  timeout: 30000,
  expect: {
    timeout: 5000
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 4 : 8,
  reporter: [
    ['html'],
    ['list']
  ],
  use: {
    trace: 'on-first-retry',
  },
});
```

### Test Configuration

Edit `config/test-config.ts`:

```typescript
export const config = {
  baseURL: process.env.BASE_URL || 'https://chatbot.dialog.lk',
  traceId: process.env.TRACE_ID || 'AUTO_TEST_TRACE',
  timeout: parseInt(process.env.API_TIMEOUT || '15000'),
  retries: parseInt(process.env.RETRIES || '1'),
  mockMode: process.env.MOCK_API === 'true',
  env: process.env.TEST_ENV || 'dev'
};
```

---

## Troubleshooting

### Common Issues and Solutions

#### Issue 1: Test Number Not Found

**Error:**
```
Error: Could not resolve test number for gsm-packages/eligibility/POSTPAID
```

**Cause:** Missing mapping in service-number-mapping.json

**Solution:**
1. Check `data/test-data/service-number-mapping.json`
2. Verify mapping exists for the API domain and operation
3. Add mapping if missing:
```json
{
  "apiToServiceMapping": {
    "gsm-package": {
      "eligibility": {
        "postpaid": "postpaid.active[0]"
      }
    }
  }
}
```

#### Issue 2: Assertion Failures

**Error:**
```
Expected status 200, but got 400
Expected field 'executionStatus' to be '00', but got '01'
```

**Cause:** API response changed or assertion is incorrect

**Solution:**
1. Enable response capture: `set CAPTURE_API_RESPONSES=true`
2. Run test: `npx playwright test tests/e2e/gsm-packages.spec.ts`
3. Review captured response in `test-results/api-captures/`
4. Either:
   - Update assertion if expectation changed
   - Report API bug if behavior is wrong

#### Issue 3: Connection Timeouts

**Error:**
```
Error: Request timeout after 15000ms
```

**Cause:** Network issues, slow API, or incorrect URL

**Solution:**
1. Check network connectivity
2. Verify `BASE_URL` in `.env` is correct
3. Increase timeout in `.env`: `API_TIMEOUT=30000`
4. Check if VPN is required
5. Test API manually with curl or Postman

#### Issue 4: Response Capture Not Working

**Symptom:** No files in `test-results/api-captures/`

**Cause:** Environment variable not set or directory permissions

**Solution:**
1. Verify: `echo %CAPTURE_API_RESPONSES%` (should show `true`)
2. Check directory exists and is writable
3. Run test and check console for errors
4. Manually create directory if needed:
```bash
mkdir test-results\api-captures
```

#### Issue 5: Mock Mode Not Working

**Error:**
```
Error: Cannot read property 'get' of undefined
```

**Cause:** Mock mode enabled but API client not handling it

**Solution:**
1. Check `.env`: `MOCK_MODE=false`
2. If mock mode needed, ensure it's properly configured
3. Mock mode returns fake responses for offline testing

#### Issue 6: TypeScript Compilation Errors

**Error:**
```
error TS2304: Cannot find name 'APIResponse'
```

**Cause:** Missing type definitions or imports

**Solution:**
1. Run: `npm ci` to reinstall dependencies
2. Check imports in file
3. Run: `npx tsc --noEmit` to check all errors
4. Fix import statements

#### Issue 7: Playwright Browser Not Found

**Error:**
```
Error: Executable doesn't exist at ...
```

**Cause:** Playwright browsers not installed

**Solution:**
```bash
npx playwright install
```

### Debug Mode

Run tests in debug mode to step through execution:

```bash
# Debug specific test
npx playwright test tests/e2e/gsm-packages.spec.ts --debug

# Debug with specific scenario
npx playwright test -g "Get GSM Packages - Postpaid" --debug
```

### Verbose Logging

Enable detailed logging:

```bash
# Windows
set DEBUG=pw:api
npm run test:e2e

# Linux/Mac
DEBUG=pw:api npm run test:e2e
```

### Viewing Test Traces

```bash
# Open trace for failed test
npx playwright show-trace test-results/<test-name>/trace.zip
```

---

## Best Practices

### Test Organization

1. **Group related scenarios**: Keep related tests in same domain file
2. **Use descriptive names**: Clear, human-readable scenario names
3. **Tag appropriately**: Use tags for selective execution
4. **One scenario, one behavior**: Each scenario tests one thing

### Test Data Management

1. **Centralize test numbers**: All numbers in registry
2. **Use number resolution**: Don't hardcode numbers in scenarios
3. **Document test data**: Add notes to test numbers
4. **Regular updates**: Review and update test data periodically
5. **Separate positive/negative**: Different numbers for different scenarios

### Assertion Design

1. **Minimal assertions**: Only assert what's necessary
2. **Use appropriate types**: Choose right assertion type for validation
3. **Avoid brittle assertions**: Don't assert on dynamic values
4. **Test negative cases**: Include negative test scenarios
5. **Update regularly**: Keep assertions current with API changes

### Maintenance

1. **Run tests regularly**: Daily or on every commit
2. **Monitor failures**: Investigate failures promptly
3. **Update dependencies**: Keep Playwright and dependencies current
4. **Clean up**: Remove obsolete scenarios and test data
5. **Document changes**: Update documentation when making changes

### CI/CD Integration

1. **Run smoke tests first**: Fast feedback on critical paths
2. **Run regression on PR**: Full coverage before merge
3. **Parallel execution**: Use multiple workers
4. **Artifact reports**: Save test reports as artifacts
5. **Fail fast**: Stop on first failure in CI

---

## Additional Resources

- **Architecture Guide**: See [ARCHITECTURE.md](ARCHITECTURE.md) for framework design
- **Implementation Roadmap**: See [IMPLEMENTATION_ROADMAP.md](IMPLEMENTATION_ROADMAP.md) for development guide
- **Quick Reference**: See [README.md](README.md) for quick start
- **Playwright Documentation**: https://playwright.dev/
- **TypeScript Documentation**: https://www.typescriptlang.org/

---

## Support

For issues or questions:

1. Check this user guide
2. Review [ARCHITECTURE.md](ARCHITECTURE.md) for design details
3. Check test logs and Playwright reports
4. Review captured responses if available
5. Contact the QA automation team

---

**Framework Version**: 1.0.0  
**Last Updated**: 2024  
**Maintained By**: Dialog Axiata QA Automation Team
