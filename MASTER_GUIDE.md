# 🚀 Complete Master Guide: Dialog API Testing Framework

**For anyone starting from zero knowledge**

---

## 📋 Table of Contents

1. [What Is This Framework?](#what-is-this-framework)
2. [Quick Start (5 Minutes)](#quick-start-5-minutes)
3. [Understanding the Architecture](#understanding-the-architecture)
4. [Project Structure Explained](#project-structure-explained)
5. [How Test Numbers Work](#how-test-numbers-work)
6. [How to Add New APIs](#how-to-add-new-apis)
7. [How to Run Tests](#how-to-run-tests)
8. [Environment Configuration](#environment-configuration)
9. [Troubleshooting](#troubleshooting)
10. [Complete Workflow Example](#complete-workflow-example)

---

## What Is This Framework?

This is an **enterprise-grade API testing framework** built with **Playwright** and **TypeScript** for testing Dialog Axiata's APIs (GSM, DTV, HBB, MBB services).

### Key Features:
- ✅ **Scenario-driven testing** (not one API = one test)
- ✅ **Smart test number management** (automatic selection based on service type)
- ✅ **Tag-based execution** (@smoke, @regression, @prepaid, @postpaid)
- ✅ **Schema validation** (validates API responses against JSON schemas)
- ✅ **Environment switching** (dev, staging, production)
- ✅ **Retry logic** (handles flaky APIs)
- ✅ **Mock mode** (run tests without real APIs)

### What Makes It "Enterprise-Grade"?
- Separation of concerns (config, data, scenarios, tests, API client)
- Reusable components (no code duplication)
- Maintainable (add new APIs without changing test code)
- Scalable (supports 58+ APIs across 4 service types)

---

## Quick Start (5 Minutes)

### Prerequisites
- **Node.js 18 LTS** (download from [nodejs.org](https://nodejs.org))
- **Git** (for version control)
- **VS Code** (recommended editor)

### Installation Steps

```bash
# 1. Clone the repository
git clone https://github.com/sgrvperera/Decagon_API.git
cd Decagon_API

# 2. Install dependencies
npm ci

# 3. Install Playwright browsers
npx playwright install

# 4. Set up environment
copy .env.example .env
# Edit .env and set BASE_URL, TRACE_ID

# 5. Generate API definitions from Excel
npm run generate:data

# 6. Run smoke tests
npm run test:smoke

# 7. View report
npx playwright show-report
```

**That's it!** You've just run your first API tests.

---

## Understanding the Architecture

The framework follows a **layered architecture**:

```
┌─────────────────────────────────────────────────────────┐
│  TEST EXECUTION LAYER (tests/e2e/*.spec.ts)            │
│  - Reads scenarios                                       │
│  - Resolves test numbers                                 │
│  - Executes API calls                                    │
│  - Validates responses                                   │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│  SCENARIO DEFINITION LAYER (data/scenarios/*.json)      │
│  - Defines test scenarios                                │
│  - Groups related API calls                              │
│  - Specifies expected outcomes                           │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│  DATA MANAGEMENT LAYER (data/test-data/*.json)          │
│  - Test numbers registry                                 │
│  - Service-number mappings                               │
│  - API definitions                                       │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│  API CLIENT LAYER (src/api/client/api-client.ts)        │
│  - HTTP request handling                                 │
│  - Retry logic                                           │
│  - Mock mode support                                     │
│  - Logging                                               │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│  CONFIGURATION LAYER (config/*)                          │
│  - Environment settings                                  │
│  - Base URLs                                             │
│  - Timeouts                                              │
│  - Authentication                                        │
└─────────────────────────────────────────────────────────┘
```

### Why This Architecture?

**Problem:** In basic frameworks, each API is a separate test with hardcoded data.
- Hard to maintain (change one number = edit 50 files)
- Not scalable (adding APIs = writing more test code)
- No reusability (same logic repeated everywhere)

**Solution:** This framework separates concerns:
- **Data** is in JSON files (easy to update)
- **Logic** is in reusable helpers (write once, use everywhere)
- **Tests** are scenario-driven (test business flows, not individual APIs)

---

## Project Structure Explained

```
Decagon_API/
│
├── config/                          # Configuration files
│   ├── environments/                # Environment-specific settings
│   │   ├── dev.json                 # Development environment
│   │   ├── staging.json             # Staging environment
│   │   └── production.json          # Production environment
│   └── test-config.ts               # Config loader
│
├── data/                            # All test data
│   ├── raw/                         # Raw Excel files
│   │   └── Book 4.xlsx              # Original API definitions
│   ├── generated/                   # Generated files
│   │   └── api-definitions.json     # Parsed API definitions (58 APIs)
│   ├── test-data/                   # Test data files
│   │   ├── test-numbers.json        # Test numbers registry
│   │   └── service-number-mapping.json  # Service-to-number mappings
│   └── scenarios/                   # Test scenarios
│       ├── gsm-packages.json        # GSM package scenarios
│       ├── dtv-packages.json        # DTV package scenarios
│       ├── hbb-packages.json        # HBB package scenarios
│       └── mbb-packages.json        # MBB package scenarios
│
├── src/                             # Source code
│   ├── api/                         # API layer
│   │   ├── client/                  # API client
│   │   │   └── api-client.ts        # HTTP client with retry logic
│   │   └── auth/                    # Authentication
│   │       └── auth-handler.ts      # Auth handler (Bearer, Basic, API Key)
│   ├── helpers/                     # Helper utilities
│   │   ├── number-resolver.ts       # Smart test number resolver
│   │   └── data-provider.ts         # Data provider (wraps number resolver)
│   ├── types/                       # TypeScript types
│   │   └── test-data.types.ts       # Type definitions
│   ├── validators/                  # Validation layer
│   │   ├── schema-validator.ts      # JSON schema validator
│   │   └── response-validator.ts    # Response validator
│   └── utils/                       # Utilities
│       ├── excelParser.ts           # Excel to JSON parser
│       └── curlParser.ts            # cURL command parser
│
├── tests/                           # Test files
│   └── e2e/                         # End-to-end tests
│       ├── gsm-packages.spec.ts     # GSM package tests
│       ├── dtv-packages.spec.ts     # DTV package tests
│       ├── hbb-packages.spec.ts     # HBB package tests
│       └── mbb-packages.spec.ts     # MBB package tests
│
├── .env                             # Environment variables (not committed)
├── .env.example                     # Example environment file
├── playwright.config.ts             # Playwright configuration
├── package.json                     # Dependencies and scripts
└── tsconfig.json                    # TypeScript configuration
```

### Key Files Explained

| File | Purpose | When to Edit |
|------|---------|--------------|
| `test-numbers.json` | Registry of all test numbers | When you get new test numbers |
| `service-number-mapping.json` | Maps services to numbers | When adding new service types |
| `gsm-packages.json` | GSM test scenarios | When adding GSM tests |
| `api-definitions.json` | All API definitions | Auto-generated from Excel |
| `number-resolver.ts` | Smart number selection logic | Rarely (only for new logic) |
| `api-client.ts` | HTTP client | Rarely (only for new features) |
| `gsm-packages.spec.ts` | GSM test runner | When adding new GSM scenarios |

---

## How Test Numbers Work

### The Problem
Different APIs need different test numbers:
- GSM APIs need GSM numbers
- DTV APIs need DTV account numbers
- Postpaid APIs need postpaid numbers
- Prepaid APIs need prepaid numbers
- Negative tests need inactive/invalid numbers

### The Solution: Smart Number Resolver

The framework automatically selects the correct test number based on:
1. **Service Type** (GSM, DTV, HBB, MBB)
2. **Connection Type** (Postpaid, Prepaid)
3. **Scenario Type** (Positive, Negative)
4. **Operation Type** (Eligibility, Activation, GetPackages)

### Example

```json
// In scenario file (gsm-packages.json)
{
  "name": "Get GSM packages - Postpaid",
  "numberResolution": {
    "serviceType": "GSM",
    "connectionType": "POSTPAID",
    "scenarioType": "POSITIVE"
  }
}
```

**What happens:**
1. Test reads scenario
2. Number resolver sees: "Need GSM Postpaid number for positive test"
3. Resolver looks in `test-numbers.json` → finds `762546554` (active GSM postpaid)
4. Test uses `762546554` in API request

### Test Numbers Registry Structure

```json
{
  "postpaid": {
    "active": [
      { "number": "762546554", "status": "active", "serviceType": "GSM" }
    ],
    "inactive": [
      { "number": "762532515", "status": "inactive", "serviceType": "GSM" }
    ]
  },
  "prepaid": {
    "active": [
      { "number": "763290491", "status": "reserved", "serviceType": "GSM" }
    ]
  },
  "dtv": { ... },
  "hbb": { ... },
  "mbb": { ... }
}
```

### Color Coding (from Excel)
- 🟢 **Green** = Active, safe to use
- 🟡 **Yellow** = Active, primary test numbers
- 🔴 **Red** = Reserved/special, use with caution

---

## How to Add New APIs

### Step 1: Add API to Excel
1. Open `data/raw/Book 4.xlsx`
2. Add new row with:
   - API Common Name
   - MIFE Name
   - cURL command

### Step 2: Regenerate API Definitions
```bash
npm run generate:data
```
This parses Excel and updates `api-definitions.json`.

### Step 3: Create Scenario
Create/edit scenario file (e.g., `data/scenarios/gsm-packages.json`):

```json
{
  "name": "New API Test",
  "description": "Test new API",
  "tags": ["@smoke", "@gsm", "@postpaid"],
  "numberResolution": {
    "serviceType": "GSM",
    "connectionType": "POSTPAID",
    "scenarioType": "POSITIVE"
  },
  "steps": [
    {
      "name": "Call new API",
      "apiName": "Your API Common Name from Excel",
      "expectedStatus": 200
    }
  ]
}
```

### Step 4: Run Test
```bash
npm run test:smoke
```

**That's it!** No test code changes needed.

---

## How to Run Tests

### Run All Tests
```bash
npm test
```

### Run by Tag
```bash
# Smoke tests only
npm run test:smoke

# Regression tests
npm run test:regression

# Postpaid tests only
npm run test:postpaid

# Prepaid tests only
npm run test:prepaid

# GSM tests only
npm run test:gsm

# DTV tests only
npm run test:dtv
```

### Run Specific Service
```bash
# GSM packages
npx playwright test tests/e2e/gsm-packages.spec.ts

# DTV packages
npx playwright test tests/e2e/dtv-packages.spec.ts

# HBB packages
npx playwright test tests/e2e/hbb-packages.spec.ts

# MBB packages
npx playwright test tests/e2e/mbb-packages.spec.ts
```

### Run in Mock Mode (No Real APIs)
```bash
set MOCK_API=true && npm test
```

### Run with Specific Environment
```bash
set TEST_ENV=staging && npm test
```

### View Report
```bash
npx playwright show-report
```

---

## Environment Configuration

### .env File
```ini
# Base URL of API
BASE_URL=https://chatbot.dialog.lk

# Trace ID for request tracking
TRACE_ID=MYTRACEID123

# Environment (dev, staging, production)
TEST_ENV=dev

# Mock mode (true = no real API calls)
MOCK_API=false

# Retry settings
MAX_RETRIES=2
RETRY_DELAY=1000
```

### Environment-Specific Settings

**config/environments/dev.json:**
```json
{
  "baseURL": "https://dev-api.dialog.lk",
  "timeout": 30000,
  "retries": 2
}
```

**config/environments/staging.json:**
```json
{
  "baseURL": "https://staging-api.dialog.lk",
  "timeout": 60000,
  "retries": 3
}
```

**config/environments/production.json:**
```json
{
  "baseURL": "https://api.dialog.lk",
  "timeout": 90000,
  "retries": 1
}
```

### Switching Environments
```bash
# Use staging
set TEST_ENV=staging && npm test

# Use production
set TEST_ENV=production && npm test
```

---

## Troubleshooting

### Issue: "Cannot find test numbers"
**Cause:** Test numbers registry is empty or incorrect.
**Solution:**
1. Check `data/test-data/test-numbers.json`
2. Ensure numbers exist for your service type
3. Update registry if needed

### Issue: "API request failed with 404"
**Cause:** Wrong BASE_URL or API endpoint changed.
**Solution:**
1. Check `.env` file → verify `BASE_URL`
2. Check `api-definitions.json` → verify endpoint path
3. Regenerate definitions: `npm run generate:data`

### Issue: "Duplicate test title"
**Cause:** Two scenarios have the same name.
**Solution:**
1. Open scenario file
2. Make test names unique (add index or description)

### Issue: "PowerShell script execution disabled"
**Cause:** Windows security policy.
**Solution:**
```powershell
# Run PowerShell as Administrator
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Issue: "Node version incompatible"
**Cause:** Using wrong Node version.
**Solution:**
```bash
# Install Node 18 LTS
nvm install 18
nvm use 18
node -v  # Should show v18.x
```

### Issue: "Tests are flaky"
**Cause:** Network issues or API instability.
**Solution:**
1. Increase retries in `.env`: `MAX_RETRIES=3`
2. Increase timeout: `TIMEOUT=60000`
3. Use mock mode for development: `MOCK_API=true`

---

## Complete Workflow Example

### Scenario: Add a New GSM API Test

**Step 1: Add API to Excel**
- Open `data/raw/Book 4.xlsx`
- Add row:
  - API Name: "Get GSM Balance"
  - MIFE Name: "SS-DIA-GSM-Balance-v1.0.0"
  - cURL: `curl -X GET https://chatbot.dialog.lk/api/gsm/balance ...`

**Step 2: Generate Definitions**
```bash
npm run generate:data
```

**Step 3: Create Scenario**
Edit `data/scenarios/gsm-packages.json`:
```json
{
  "name": "Get GSM Balance - Postpaid",
  "description": "Retrieve balance for postpaid GSM customer",
  "tags": ["@smoke", "@gsm", "@postpaid"],
  "numberResolution": {
    "serviceType": "GSM",
    "connectionType": "POSTPAID",
    "scenarioType": "POSITIVE"
  },
  "steps": [
    {
      "name": "Get balance",
      "apiName": "Get GSM Balance",
      "expectedStatus": 200,
      "assertions": [
        {
          "type": "jsonPath",
          "path": "$.balance",
          "expected": "exists"
        }
      ]
    }
  ]
}
```

**Step 4: Run Test**
```bash
npm run test:smoke
```

**Step 5: View Results**
```bash
npx playwright show-report
```

**Step 6: Commit Changes**
```bash
git add .
git commit -m "Add GSM balance API test"
git push
```

**Done!** Your new test is now part of the framework.

---

## Summary: What You've Learned

✅ **What the framework is** (enterprise-grade API testing)
✅ **How to install and run** (5-minute quick start)
✅ **How the architecture works** (layered design)
✅ **How test numbers work** (smart resolver)
✅ **How to add new APIs** (4-step process)
✅ **How to run tests** (tags, environments, mock mode)
✅ **How to troubleshoot** (common issues and solutions)
✅ **Complete workflow** (end-to-end example)

---

## Next Steps

1. **Read ARCHITECTURE.md** for deeper technical details
2. **Read NUMBER_REGISTRY_GUIDE.md** for advanced number management
3. **Read QUICKSTART.md** for command reference
4. **Explore scenario files** in `data/scenarios/`
5. **Run tests** and view reports
6. **Add your first API** following the workflow above

---

## Need Help?

- **Documentation:** Check other MD files in project root
- **Issues:** Create GitHub issue
- **Questions:** Contact framework maintainer

---

**You're now ready to use the Dialog API Testing Framework!** 🎉
