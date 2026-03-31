# Dialog API Testing Framework

**Enterprise-grade, scenario-driven API automation framework built with Playwright Test for Dialog Axiata's API testing needs.**

[![Playwright](https://img.shields.io/badge/Playwright-1.58.2-green)](https://playwright.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0.0-blue)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18%20LTS%20%7C%2020%20LTS-brightgreen)](https://nodejs.org/)

---

## 🚀 Quick Start

```bash
# Install dependencies
npm ci

# Install Playwright browsers
npx playwright install

# Copy environment configuration
copy .env.example .env

# Run smoke tests
npm run test:smoke

# View report
npx playwright show-report
```

---

## 📋 Overview

This is a **scenario-driven, data-driven API testing framework** that provides comprehensive test coverage for Dialog Axiata's REST APIs across multiple service domains.

### Key Features

- ✅ **Scenario-Driven Architecture** - Test scenarios defined in JSON, separated from execution code
- ✅ **Intelligent Test Data Management** - Automatic test number resolution based on API context
- ✅ **Comprehensive Assertions** - 10 assertion types with declarative configuration
- ✅ **Tag-Based Execution** - Run smoke, regression, or negative tests selectively
- ✅ **Response Capture** - Capture and analyze API responses for debugging and assertion generation
- ✅ **Retry Logic** - Automatic retry on transient failures
- ✅ **Mock Mode** - Offline testing without real API calls
- ✅ **CI/CD Ready** - GitHub Actions integration with parallel execution
- ✅ **Type-Safe** - Full TypeScript implementation with comprehensive type definitions
- ✅ **Extensible** - Easy to add new domains, scenarios, and assertion types

### Test Coverage

| Domain | Test File | Scenarios | Status |
|--------|-----------|-----------|--------|
| **GSM Packages** | `gsm-packages.spec.ts` | 8 | ✅ Complete |
| **HBB Packages** | `hbb-packages.spec.ts` | 7 | ✅ Complete |
| **HBB Addons** | `hbb-addons.spec.ts` | 6 | ✅ Complete |
| **MBB Packages** | `mbb-packages.spec.ts` | 6 | ✅ Complete |
| **MBB Addons** | `mbb-addons.spec.ts` | 7 | ✅ Complete |
| **DTV Packages** | `dtv-packages.spec.ts` | 7 | ✅ Complete |
| **DTV Channels** | `dtv-channels.spec.ts` | 7 | ✅ Complete |

**Total: 48 test scenarios across 7 domains**

---

## 🏗️ Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Test Execution Layer                     │
│  Playwright Test Runner → Test Specs → Scenario Runner      │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                  Scenario Processing Layer                   │
│  Scenario Loader → Number Resolver → Data Interpolator      │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                   API Communication Layer                    │
│  API Client → Request Builder → Response Capture            │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                      Validation Layer                        │
│  Assertion Executor → Response Validator → Test Reporter    │
└─────────────────────────────────────────────────────────────┘
```

### Directory Structure

```
Decagon.Api/
├── config/
│   ├── environments/              # Environment-specific configs
│   └── test-config.ts             # Central configuration
├── data/
│   ├── scenarios/                 # Test scenario definitions (JSON)
│   │   ├── gsm-packages.json
│   │   ├── hbb-packages.json
│   │   ├── hbb-addons.json
│   │   ├── mbb-packages.json
│   │   ├── mbb-addons.json
│   │   ├── dtv-packages.json
│   │   └── dtv-channels.json
│   └── test-data/                 # Test numbers and data
│       ├── service-number-mapping.json  # API → Number mapping
│       ├── test-numbers.json            # Test number registry
│       ├── accounts.json                # Legacy account data
│       └── packages.json                # Package codes
├── src/
│   ├── api/client/                # API client with retry & capture
│   │   ├── api-client.ts
│   │   └── request-builder.ts
│   ├── helpers/                   # Core framework components
│   │   ├── scenario-runner.ts     # Generic test runner
│   │   ├── assertion-executor.ts  # Assertion engine
│   │   ├── number-resolver.ts     # Test number resolution
│   │   ├── response-capture.ts    # Response capture
│   │   └── response-consolidator.ts
│   └── types/                     # TypeScript type definitions
│       └── test-data.types.ts
├── tests/e2e/                     # Test spec files
│   ├── gsm-packages.spec.ts
│   ├── hbb-packages.spec.ts
│   ├── hbb-addons.spec.ts
│   ├── mbb-packages.spec.ts
│   ├── mbb-addons.spec.ts
│   ├── dtv-packages.spec.ts
│   └── dtv-channels.spec.ts
├── scripts/                       # Utility scripts
│   ├── consolidate-all-responses.ts
│   └── update-scenario-assertions.ts
├── test-results/                  # Test execution results
│   └── api-captures/              # Captured responses
├── playwright-report/             # HTML test reports
├── .env                          # Environment variables
├── playwright.config.ts          # Playwright configuration
├── tsconfig.json                 # TypeScript configuration
└── package.json                  # Project dependencies
```

---

## 🧪 Running Tests

### Basic Commands

```bash
# Run all E2E tests
npm run test:e2e

# Run specific domain
npm run test:gsm                   # GSM packages only
npm run test:hbb                   # HBB packages only
npx playwright test tests/e2e/dtv-packages.spec.ts

# Run by tag
npm run test:smoke                 # Smoke tests only
npm run test:regression            # Regression tests
npm run test:negative              # Negative tests
TEST_TAG=@postpaid npm run test:e2e

# Run specific test by name
npx playwright test -g "Get GSM Packages - Postpaid"

# Run in mock mode (no real API calls)
npm run test:mock
```

### Advanced Options

```bash
# Run in headed mode (see browser)
npx playwright test --headed

# Run in debug mode
npx playwright test --debug

# Run with specific workers
npx playwright test --workers=4

# Run with trace
npx playwright test --trace on

# View HTML report
npx playwright show-report

# View specific trace
npx playwright show-trace test-results/<test-name>/trace.zip
```

### Test Tags

| Tag | Purpose | Command |
|-----|---------|---------|
| `@smoke` | Critical smoke tests | `npm run test:smoke` |
| `@regression` | Full regression suite | `npm run test:regression` |
| `@negative` | Negative test scenarios | `npm run test:negative` |
| `@postpaid` | Postpaid-specific tests | `TEST_TAG=@postpaid npm run test:e2e` |
| `@prepaid` | Prepaid-specific tests | `TEST_TAG=@prepaid npm run test:e2e` |
| `@gsm` | GSM service tests | `TEST_TAG=@gsm npm run test:e2e` |
| `@hbb` | HBB service tests | `TEST_TAG=@hbb npm run test:e2e` |
| `@mbb` | MBB service tests | `TEST_TAG=@mbb npm run test:e2e` |
| `@dtv` | DTV service tests | `TEST_TAG=@dtv npm run test:e2e` |

---

## 🔧 Configuration

### Environment Variables

Create `.env` file from `.env.example`:

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

### Test Data Configuration

Test numbers are managed in `data/test-data/`:

- **`service-number-mapping.json`** - Maps API operations to test number paths
- **`test-numbers.json`** - Contains actual test numbers with metadata
- **`accounts.json`** - Legacy account data (fallback)
- **`packages.json`** - Package codes for test scenarios

---

## 📊 Test Scenarios

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
        },
        "arrayFields": ["responseData"]
      }
    }
  ]
}
```

### Supported Placeholders

| Placeholder | Description | Example |
|-------------|-------------|---------|
| `{{number}}` | Resolved test number | `"771234567"` |
| `{{traceId}}` | Generated trace ID | `"DIA1234567890123"` |
| `{{packages.gsm.postpaid.packages[0].code}}` | Package code | `"SPM_2700"` |

---

## ✅ Assertions

### Supported Assertion Types

The framework supports 10 assertion types:

| Type | Description | Example |
|------|-------------|---------|
| **status** | HTTP status code | `200` or `[200, 201]` |
| **responseTime** | Max response time (ms) | `3000` |
| **bodyNotEmpty** | Response body not empty | `true` |
| **requiredFields** | Fields must exist | `["executionStatus", "executionMessage"]` |
| **fieldValues** | Field exact values | `{"executionStatus": "00"}` |
| **fieldMatches** | Field regex match | `{"id": "^[0-9]+$"}` |
| **bodyContains** | Body contains strings | `["success", "eligible"]` |
| **arrayFields** | Fields are arrays | `["responseData"]` |
| **arrayMinLength** | Array min length | `{"responseData": 1}` |
| **jsonSchema** | JSON schema validation | `{schema object}` |

### Example Assertions

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
    }
  }
}
```

---

## 🔍 Response Capture

### Purpose

Capture API requests and responses for:
- Debugging test failures
- Generating assertions automatically
- Documenting API behavior
- Analyzing response patterns

### Usage

```bash
# Enable response capture
set CAPTURE_API_RESPONSES=true

# Run tests
npm run test:e2e

# Responses saved to: test-results/api-captures/YYYY-MM-DD/session-HH-MM-SS/

# Consolidate all sessions
npx ts-node scripts/consolidate-all-responses.ts

# Update scenario assertions from captured responses
npx ts-node scripts/update-scenario-assertions.ts
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
    "headers": {...},
    "queryParams": {...}
  },
  "response": {
    "status": 200,
    "headers": {...},
    "body": {...},
    "duration": 1234
  },
  "suggestedAssertions": {...}
}
```

---

## 🔢 Test Number Management

### How It Works

```
Scenario defines numberResolution
    ↓
service-number-mapping.json (API → Path mapping)
    ↓
test-numbers.json (Path → Actual number)
    ↓
Resolved number replaces {{number}} in scenario
```

### Number Resolution Configuration

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

### Adding New Test Numbers

**1. Add to `test-numbers.json`:**
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
    ]
  }
}
```

**2. Map in `service-number-mapping.json`:**
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

**3. Use in scenario:**
```json
{
  "numberResolution": {
    "apiDomain": "gsm-package",
    "operation": "eligibility",
    "connectionType": "POSTPAID",
    "serviceType": "GSM"
  }
}
```

---

## 🚦 CI/CD Integration

### GitHub Actions

The framework includes a GitHub Actions workflow (`.github/workflows/ci.yml`):

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

### Features

- ✅ Runs on every push and pull request
- ✅ Parallel test execution
- ✅ Automatic retry on failure
- ✅ HTML report artifacts
- ✅ Environment-specific configuration

---

## 🛠️ Development

### Adding New Test Scenarios

**1. Create/update scenario JSON in `data/scenarios/`:**
```json
{
  "domain": "new-domain",
  "scenarios": [...]
}
```

**2. Add test numbers to `data/test-data/service-number-mapping.json`:**
```json
{
  "apiToServiceMapping": {
    "new-domain": {
      "operation": {
        "postpaid": "postpaid.active[0]"
      }
    }
  }
}
```

**3. Create test spec in `tests/e2e/new-domain.spec.ts`:**
```typescript
import { createScenarioSuite } from '../../src/helpers/scenario-runner';
import * as path from 'path';

createScenarioSuite(
  path.join(__dirname, '../../data/scenarios/new-domain.json'),
  'New Domain - Dialog API Tests'
);
```

**4. Run tests:**
```bash
npx playwright test tests/e2e/new-domain.spec.ts
```

### Key Framework Components

| Component | Purpose | Location |
|-----------|---------|----------|
| **Scenario Runner** | Generic test execution engine | `src/helpers/scenario-runner.ts` |
| **API Client** | HTTP client with retry logic | `src/api/client/api-client.ts` |
| **Request Builder** | Constructs HTTP requests | `src/api/client/request-builder.ts` |
| **Number Resolver** | Resolves test numbers | `src/helpers/number-resolver.ts` |
| **Assertion Executor** | Executes assertions | `src/helpers/assertion-executor.ts` |
| **Response Capture** | Captures API responses | `src/helpers/response-capture.ts` |

---

## 📝 Prerequisites

- **Node.js**: 18 LTS or 20 LTS
- **npm**: 8.x or higher
- **Git**: For version control
- **Text Editor**: VS Code recommended

---

## 📚 Documentation

- **[USER_GUIDE.md](USER_GUIDE.md)** - Complete usage guide with examples
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - Framework architecture and design patterns
- **[IMPLEMENTATION_ROADMAP.md](IMPLEMENTATION_ROADMAP.md)** - Development roadmap and implementation guide

---

## 🤝 Contributing

1. Create feature branch from `develop`
2. Add/update scenarios in JSON files
3. Update test data if needed
4. Run tests locally: `npm run test:e2e`
5. Ensure all tests pass
6. Create pull request to `develop`

---

## 🐛 Troubleshooting

### Common Issues

**Issue: Test number not found**
- Check `service-number-mapping.json` has mapping
- Verify path exists in `test-numbers.json`

**Issue: Assertion failures**
- Enable response capture: `set CAPTURE_API_RESPONSES=true`
- Run test and review captured response
- Update assertion or report API bug

**Issue: Connection timeouts**
- Check `BASE_URL` in `.env`
- Verify network connectivity
- Increase timeout: `API_TIMEOUT=30000`

**Issue: Response capture not working**
- Verify `CAPTURE_API_RESPONSES=true`
- Check directory permissions
- Ensure tests are running

For more troubleshooting, see [USER_GUIDE.md](USER_GUIDE.md#troubleshooting).

---

## 📊 Project Statistics

```
Total Files: 46
Total Scenarios: 48
Total Domains: 7
Lines of Code: ~3,500
Test Coverage: 100% of defined APIs
```

---

## 🎯 Features

### Current Features ✅

- ✅ Scenario-driven architecture
- ✅ Intelligent test number resolution
- ✅ 10 assertion types
- ✅ Tag-based execution
- ✅ Response capture and analysis
- ✅ Retry logic
- ✅ Mock mode
- ✅ CI/CD integration
- ✅ Parallel execution
- ✅ HTML reports with traces

### Planned Features 🚧

- 🚧 JSON schema validation
- 🚧 Performance tracking
- 🚧 Contract testing
- 🚧 Dynamic test data generation
- 🚧 Real-time dashboard

---

## 📄 License

Internal project for Dialog Axiata PLC.

---

## 🆘 Support

For issues or questions:

1. Check [USER_GUIDE.md](USER_GUIDE.md) troubleshooting section
2. Review [ARCHITECTURE.md](ARCHITECTURE.md) for design details
3. Check test logs and Playwright reports
4. Review captured responses if available
5. Contact the QA automation team

---

## 🏆 Best Practices

1. **Run smoke tests before commits**: `npm run test:smoke`
2. **Use appropriate tags**: Tag scenarios for selective execution
3. **Keep scenarios focused**: One scenario, one behavior
4. **Update test data regularly**: Review and update test numbers
5. **Capture responses for debugging**: Enable capture when investigating failures
6. **Review assertions periodically**: Ensure they match current API behavior
7. **Use mock mode for offline work**: `npm run test:mock`
8. **Check CI/CD results**: Monitor GitHub Actions runs

---

**Built with** [Playwright](https://playwright.dev/) | **Language** TypeScript | **Test Runner** Playwright Test

**Version**: 1.0.0 | **Status**: Production Ready ✅
