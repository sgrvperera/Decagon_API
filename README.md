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
copy config\environments\dev.env.example config\environments\dev.env

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
- ✅ **Comprehensive Assertions** - 10+ assertion types including JSON Schema validation
- ✅ **Tag-Based Execution** - Run smoke, regression, or negative tests selectively
- ✅ **Response Capture** - Capture and analyze API responses for debugging
- ✅ **Automated Assertion Generation** - Derive assertions from captured responses
- ✅ **Retry Logic** - Automatic retry on transient failures
- ✅ **CI/CD Ready** - GitHub Actions integration with parallel execution
- ✅ **Type-Safe** - Full TypeScript implementation
- ✅ **Extensible** - Easy to add new domains, scenarios, and assertion types

### Test Coverage

| Domain | Scenarios | Status |
|--------|-----------|--------|
| **Complaint Handling** | 3 | ✅ Complete |
| **Ebill Management** | 3 | ✅ Complete |
| **Roaming Services** | 4 | ✅ Complete |
| **Customer Diagnosis** | 2 | ✅ Complete |
| **NPS Survey** | 2 | ✅ Complete |
| **Customer Verification** | 4 | ✅ Complete |
| **Payment Reversal** | 2 | ✅ Complete |
| **Reconnection Services** | 3 | ✅ Complete |
| **Balance & Bill Check** | 1 | ✅ Complete |
| **Data Usage** | 2 | ✅ Complete |
| **Data Addons (HBB/MBB)** | 6 | ✅ Complete |
| **Package Change (GSM/HBB/MBB/DTV)** | 12 | ✅ Complete |
| **DTV Channels** | 5 | ✅ Complete |
| **DTV Rescan & Reset** | 2 | ✅ Complete |
| **Payment History & Credit Limit** | 2 | ✅ Complete |
| **Connection Status** | 1 | ✅ Complete |

**Total: 54+ test scenarios across 16 domains**

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
│  Assertion Executor → JSON Schema Validator → Reporter      │
└─────────────────────────────────────────────────────────────┘
```

### Directory Structure

```
Decagon.Api/
├── config/
│   ├── environments/              # Environment-specific configs
│   │   └── dev.env               # Development environment
│   └── test-config.ts            # Central configuration
├── data/
│   ├── Decagon_API/              # Test scenario definitions (JSON)
│   │   ├── Complaint/
│   │   ├── Ebill/
│   │   ├── Roaming/
│   │   ├── Diagnosis/
│   │   ├── NPS/
│   │   ├── Verification/
│   │   ├── Payment-Reversal/
│   │   ├── Reconnection/
│   │   ├── Balance and Bill Check/
│   │   ├── Data Usage/
│   │   ├── Data Addon/
│   │   ├── Package change/
│   │   ├── DTV channel activation - deactivation/
│   │   ├── DTV Rescan and Reset/
│   │   ├── Payment Status and Credit Limit Checks/
│   │   └── Reconnection status/
│   └── test-data/                # Test numbers and data
│       ├── service-number-mapping.json
│       ├── test-numbers.json
│       ├── accounts.json
│       └── packages.json
├── src/
│   ├── api/client/               # API client with retry & capture
│   │   ├── api-client.ts
│   │   └── request-builder.ts
│   ├── helpers/                  # Core framework components
│   │   ├── scenario-runner.ts    # Generic test runner
│   │   ├── assertion-executor.ts # Assertion engine with JSON Schema
│   │   ├── number-resolver.ts    # Test number resolution
│   │   └── response-capture.ts   # Response capture
│   └── types/                    # TypeScript type definitions
│       └── test-data.types.ts
├── tests/e2e/                    # Test spec files
│   ├── complaint.spec.ts
│   ├── ebill.spec.ts
│   ├── roaming.spec.ts
│   ├── diagnosis.spec.ts
│   ├── nps.spec.ts
│   ├── verification.spec.ts
│   ├── payment-reversal.spec.ts
│   ├── reconnection-eligibility.spec.ts
│   ├── temporary-reconnection.spec.ts
│   ├── permanent-reconnection.spec.ts
│   ├── balance-check.spec.ts
│   ├── data-usage.spec.ts
│   ├── credit-limit.spec.ts
│   ├── payment-history.spec.ts
│   ├── connection-status.spec.ts
│   ├── gsm-packages.spec.ts
│   ├── hbb-packages.spec.ts
│   ├── hbb-addons.spec.ts
│   ├── mbb-packages.spec.ts
│   ├── mbb-addons.spec.ts
│   ├── dtv-packages.spec.ts
│   ├── dtv-channels.spec.ts
│   ├── dtv-rescan.spec.ts
│   └── dtv-reset.spec.ts
├── scripts/                      # Utility scripts
│   └── derive-assertions.ts      # Auto-generate assertions
├── test-results/                 # Test execution results
│   └── api-captures/             # Captured responses (when enabled)
├── playwright-report/            # HTML test reports
├── .env                         # Root environment variables
├── playwright.config.ts         # Playwright configuration
├── tsconfig.json                # TypeScript configuration
└── package.json                 # Project dependencies
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
npx playwright test tests/e2e/complaint.spec.ts

# Run by tag
npm run test:smoke                 # Smoke tests only
npm run test:regression            # Regression tests
TEST_TAG=@postpaid npm run test:e2e

# Run specific test by name
npx playwright test -g "Check NPS Eligibility"

# Run with specific workers
npx playwright test --workers=4
```

### Test Tags

| Tag | Purpose | Command |
|-----|---------|---------|
| `@smoke` | Critical smoke tests | `npm run test:smoke` |
| `@regression` | Full regression suite | `npm run test:regression` |
| `@postpaid` | Postpaid-specific tests | `TEST_TAG=@postpaid npm run test:e2e` |
| `@prepaid` | Prepaid-specific tests | `TEST_TAG=@prepaid npm run test:e2e` |
| `@gsm` | GSM service tests | `TEST_TAG=@gsm npm run test:e2e` |
| `@hbb` | HBB service tests | `TEST_TAG=@hbb npm run test:e2e` |
| `@mbb` | MBB service tests | `TEST_TAG=@mbb npm run test:e2e` |
| `@dtv` | DTV service tests | `TEST_TAG=@dtv npm run test:e2e` |

---

## 🔧 Configuration

### Environment Variables

Edit `config/environments/dev.env`:

```ini
# API Base URL
BASE_URL=https://chatbot.dialog.lk

# Default Trace ID
TRACE_ID=DEV_TRACE_0001

# API Timeout (milliseconds)
API_TIMEOUT=15000

# Retry count on failure
RETRIES=1

# Enable response capture (for debugging/assertion generation)
CAPTURE_API_RESPONSES=false
```

---

## ✅ Assertions

### Supported Assertion Types

The framework supports 10+ assertion types with JSON Schema validation:

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
| **jsonSchema** | JSON schema validation | `{type: "object", properties: {...}}` |

### Example Assertions with JSON Schema

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

## 🔍 Response Capture & Assertion Generation

### Capture API Responses

```bash
# 1. Enable response capture
# Edit config/environments/dev.env: CAPTURE_API_RESPONSES=true

# 2. Run tests
npm run test:smoke

# 3. Responses saved to: test-results/api-captures/consolidated-reference.json
```

### Auto-Generate Assertions

```bash
# Generate assertions from captured responses
npx ts-node scripts/derive-assertions.ts

# This will:
# - Read captured responses
# - Derive appropriate assertions (including JSON Schema)
# - Update scenario JSON files automatically
```

### Disable Capture for Normal Runs

```bash
# Edit config/environments/dev.env: CAPTURE_API_RESPONSES=false
npm run test:e2e
```

---

## 📊 Test Scenarios

### Scenario Structure

Test scenarios are defined in JSON files under `data/Decagon_API/`:

```json
{
  "metadata": {
    "mainWorkflow": "NPS",
    "subWorkflow": "NPS",
    "apiCommonName": "NPS Survey",
    "mifeApi": "SS-DIA-NPS-Eligibility-Query - v1.0.0"
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
        "traceId": "{{traceId}}"
      },
      "body": {
        "userId": "1181a0341b07e2aedcbbdc89",
        "servedBy": "bot"
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
        "jsonSchema": { ... }
      }
    }
  ]
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
    "apiDomain": "complaint",
    "operation": "lodge",
    "connectionType": "POSTPAID",
    "serviceType": "GSM",
    "scenarioType": "positive"
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
      - run: npm ci
      - run: npx playwright install
      - run: npm run test:smoke
      - uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: playwright-report
```

---

## 🛠️ Development

### Adding New Test Scenarios

**1. Create/update scenario JSON in `data/Decagon_API/`:**
```json
{
  "metadata": { ... },
  "mifeApi": "SS-DIA-New-API - v1.0.0",
  "scenarios": [...]
}
```

**2. Create test spec in `tests/e2e/new-domain.spec.ts`:**
```typescript
import { createScenarioSuite } from '../../src/helpers/scenario-runner';
import * as path from 'path';

createScenarioSuite(
  path.join(__dirname, '../../data/Decagon_API/NewDomain/SS-DIA-New-API - v1.0.0.json'),
  'New Domain - Dialog API Tests'
);
```

**3. Run tests:**
```bash
npx playwright test tests/e2e/new-domain.spec.ts
```

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
- **[IMPLEMENTATION_ROADMAP.md](IMPLEMENTATION_ROADMAP.md)** - Development roadmap

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
- Enable response capture: `CAPTURE_API_RESPONSES=true`
- Run test and review captured response
- Update assertion or report API bug

**Issue: JSON Schema validation fails**
- Check captured response structure
- Verify schema matches actual API response
- Regenerate schema using derive-assertions script

For more troubleshooting, see [USER_GUIDE.md](USER_GUIDE.md).

---

## 📊 Project Statistics

```
Total Scenarios: 54+
Total Domains: 16
Total Test Files: 24
Lines of Code: ~4,000
Test Coverage: 100% of defined APIs
Assertion Types: 10+
```

---

## 🎯 Key Features

### Current Features ✅

- ✅ Scenario-driven architecture
- ✅ Intelligent test number resolution
- ✅ 10+ assertion types with JSON Schema validation
- ✅ Tag-based execution
- ✅ Response capture and analysis
- ✅ Automated assertion generation
- ✅ Retry logic
- ✅ CI/CD integration
- ✅ Parallel execution
- ✅ HTML reports with traces
- ✅ TypeScript type safety

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

**Built with** [Playwright](https://playwright.dev/) | **Language** TypeScript | **Test Runner** Playwright Test

**Version**: 2.0.0 | **Status**: Production Ready ✅
