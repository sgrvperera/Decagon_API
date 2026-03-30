# REAL IMPLEMENTATION GUIDE - Dialog API Framework

## 🎯 What Was Actually Built

Based on your **58 Dialog APIs**, I've created a **production-ready, scenario-driven framework** that:

1. ✅ Keeps your Excel-driven API inventory (`api-definitions.json`)
2. ✅ Adds a scenario layer for multiple test cases per API
3. ✅ Uses your actual account numbers and package codes
4. ✅ Supports all your API patterns (GSM, HBB, DTV, MBB, etc.)
5. ✅ Ready to run immediately

---

## 📊 YOUR ACTUAL API PATTERNS

I analyzed your 58 APIs and found these patterns:

### **Pattern 1: Package Management (GSM, HBB, DTV, MBB)**
```
GET  /api/{service}-package/v1/packages?connectionType=POSTPAID
POST /api/{service}-package/v1/check-the-eligibility-for-package
POST /api/{service}-package/v1/activate
```

### **Pattern 2: Data Usage**
```
POST /api/data-usage/v1/data-usage-summary  (body: {msisdn, sbu})
POST /api/data-usage/v1/data-usage-query    (body: {msisdn, sbu})
```

### **Pattern 3: Account Operations**
```
POST /api/balance-check/v1/check-balance         (body: {accountNo})
POST /api/connection-status/v1/check-status      (body: {accountNo})
POST /api/credit-limit/v1/check                  (body: {accountNo})
```

### **Pattern 4: Reconnection**
```
POST /api/reconnection-eligibility/v1/check      (body: {accountNo})
POST /api/temporary-reconnection/v1/process      (body: {accountNo})
POST /api/permanent-reconnection/v1/process      (body: {accountNo})
```

### **Pattern 5: DTV Channels**
```
GET  /api/dtv-channel-act/v1/get-packages
POST /api/dtv-channel-act/v1/check-eligibility   (body: {accountNo, channelNo})
POST /api/dtv-channel-act/v1/activate            (body: {accountNo, channelNo, pin})
POST /api/dtv-channel-deact/v1/deactivate        (body: {accountNo, channelNo, pin})
```

### **Pattern 6: Add-ons**
```
POST /api/mbb-data-addons/v1/get                 (body: {prepostCode})
POST /api/mbb-data-addons/v1/check-eligibility   (body: {accountNumber, packageCode})
POST /api/mbb-data-addons/v1/activate            (body: {accountNumber, packageCode})
```

### **Common Headers**
- `traceId`: Always required (e.g., "DIA123456789012")
- `Content-Type: application/json`: For POST requests
- `Authorization: Bearer <token>`: For some APIs (payment-reversal, send-sms)

---

## 🚀 STEP-BY-STEP IMPLEMENTATION

### **STEP 1: Run the GSM Package Tests (5 minutes)**

```bash
# Run all GSM tests
npx playwright test tests/e2e/gsm-packages.spec.ts

# Run only smoke tests
TEST_TAG=@smoke npx playwright test tests/e2e/gsm-packages.spec.ts

# Run only negative tests
TEST_TAG=@negative npx playwright test tests/e2e/gsm-packages.spec.ts

# Run in mock mode (if backend unavailable)
MOCK_API=true npx playwright test tests/e2e/gsm-packages.spec.ts
```

**Expected Output:**
```
✓ Get GSM Packages - Postpaid (Smoke) [SS-DIA-Get-Gsm-Packages-Query - v1.0.0] @smoke @regression @postpaid @gsm
✓ Get GSM Packages - Prepaid [SS-DIA-Get-Gsm-Packages-Query - v1.0.0] @regression @prepaid @gsm
✓ Check GSM Package Eligibility - Valid Postpaid (Smoke) [SS-DIA-Gsm-Package-Change-Eligibility-Query - v1.0.0] @smoke @regression @postpaid @gsm
...
```

### **STEP 2: Create HBB Package Scenarios (15 minutes)**

Create `data/scenarios/hbb-packages.json`:

```json
{
  "domain": "hbb-packages",
  "mifeApis": [
    "SS-DIA-HBB-Pack-Change-Get-Packages-Query - v1.0.0",
    "SS-DIA-HBB-Pack-Act-Eligibility-Query - v1.0.0",
    "SS-DIA-HBB-Pack-Act-Activation-Insert - v1.0.0"
  ],
  "scenarios": [
    {
      "id": "hbb-get-packages-postpaid-smoke",
      "name": "Get HBB Packages - Postpaid (Smoke)",
      "mifeApi": "SS-DIA-HBB-Pack-Change-Get-Packages-Query - v1.0.0",
      "tags": ["@smoke", "@regression", "@postpaid", "@hbb"],
      "method": "GET",
      "endpoint": "/dia-api-engine/api/hbb-package-change/v1/upgrade-downgrade-list/POSTPAID",
      "headers": {
        "Content-Type": "application/json",
        "traceId": "AUTO_TEST_{{timestamp}}"
      },
      "expectedStatus": 200,
      "assertions": {
        "status": 200,
        "bodyNotEmpty": true
      }
    },
    {
      "id": "hbb-check-eligibility-valid",
      "name": "Check HBB Package Eligibility - Valid Account (Smoke)",
      "mifeApi": "SS-DIA-HBB-Pack-Act-Eligibility-Query - v1.0.0",
      "tags": ["@smoke", "@regression", "@hbb"],
      "method": "POST",
      "endpoint": "/dia-api-engine/api/hbb-package-change/v1/check-the-eligibility-for-package",
      "headers": {
        "Content-Type": "application/json",
        "traceId": "AUTO_TEST_{{timestamp}}"
      },
      "body": {
        "msisdn": "{{accounts.postpaid.hbb.msisdn}}",
        "packageCode": "STAFF325GB"
      },
      "expectedStatus": 200,
      "assertions": {
        "status": 200,
        "bodyNotEmpty": true
      }
    },
    {
      "id": "hbb-activate-package",
      "name": "Activate HBB Package",
      "mifeApi": "SS-DIA-HBB-Pack-Act-Activation-Insert - v1.0.0",
      "tags": ["@regression", "@hbb"],
      "method": "POST",
      "endpoint": "/dia-api-engine/api/hbb-package-change/v1/activate-package",
      "headers": {
        "Content-Type": "application/json",
        "traceId": "AUTO_TEST_{{timestamp}}"
      },
      "body": {
        "accountNumber": "{{accounts.postpaid.hbb.accountNumber}}",
        "packageCode": "STAFF325GB"
      },
      "expectedStatus": [200, 201],
      "assertions": {
        "status": [200, 201],
        "bodyNotEmpty": true
      }
    }
  ]
}
```

### **STEP 3: Create Test File for HBB (5 minutes)**

Copy `tests/e2e/gsm-packages.spec.ts` to `tests/e2e/hbb-packages.spec.ts` and update:

```typescript
// Change line 9:
const scenarioFile = JSON.parse(fs.readFileSync(path.join(__dirname, '../../data/scenarios/hbb-packages.json'), 'utf8'));

// Change line 27:
test.describe('HBB Packages - Dialog API Tests', () => {
```

Run it:
```bash
npx playwright test tests/e2e/hbb-packages.spec.ts
```

### **STEP 4: Create Data Usage Scenarios (15 minutes)**

Create `data/scenarios/data-usage.json`:

```json
{
  "domain": "data-usage",
  "mifeApis": [
    "SS-DIA-Data-Usage-Summary-Query - v1.0.0",
    "SS-DIA-Data-Usage-Query - v1.0.0"
  ],
  "scenarios": [
    {
      "id": "data-usage-summary-hbb-smoke",
      "name": "Get Data Usage Summary - HBB (Smoke)",
      "mifeApi": "SS-DIA-Data-Usage-Summary-Query - v1.0.0",
      "tags": ["@smoke", "@regression", "@hbb"],
      "method": "POST",
      "endpoint": "/dia-api-engine/api/data-usage/v1/data-usage-summary",
      "headers": {
        "Content-Type": "application/json",
        "traceId": "AUTO_TEST_{{timestamp}}"
      },
      "body": {
        "msisdn": "{{accounts.postpaid.hbb.msisdn}}",
        "sbu": "HBB"
      },
      "expectedStatus": 200,
      "assertions": {
        "status": 200,
        "bodyNotEmpty": true
      }
    },
    {
      "id": "data-usage-summary-gsm",
      "name": "Get Data Usage Summary - GSM",
      "mifeApi": "SS-DIA-Data-Usage-Summary-Query - v1.0.0",
      "tags": ["@regression", "@gsm"],
      "method": "POST",
      "endpoint": "/dia-api-engine/api/data-usage/v1/data-usage-summary",
      "headers": {
        "Content-Type": "application/json",
        "traceId": "AUTO_TEST_{{timestamp}}"
      },
      "body": {
        "msisdn": "{{accounts.postpaid.gsm.msisdn}}",
        "sbu": "GSM"
      },
      "expectedStatus": 200,
      "assertions": {
        "status": 200,
        "bodyNotEmpty": true
      }
    },
    {
      "id": "data-usage-detailed-hbb",
      "name": "Get Detailed Data Usage - HBB",
      "mifeApi": "SS-DIA-Data-Usage-Query - v1.0.0",
      "tags": ["@regression", "@hbb"],
      "method": "POST",
      "endpoint": "/dia-api-engine/api/data-usage/v1/data-usage-query",
      "headers": {
        "Content-Type": "application/json",
        "traceId": "AUTO_TEST_{{timestamp}}"
      },
      "body": {
        "msisdn": "{{accounts.postpaid.hbb.msisdn}}",
        "sbu": "HBB"
      },
      "expectedStatus": 200,
      "assertions": {
        "status": 200,
        "bodyNotEmpty": true
      }
    }
  ]
}
```

---

## 📋 COMPLETE API COVERAGE PLAN

Here's how to cover all 58 APIs:

### **Week 1: Core Package APIs (20 APIs)**
- ✅ GSM Packages (3 APIs) - DONE
- HBB Packages (3 APIs)
- DTV Packages (3 APIs)
- MBB Packages (3 APIs)
- MBB Add-ons (3 APIs)
- HBB Add-ons (3 APIs)
- DTV Channels (4 APIs)

### **Week 2: Account & Usage APIs (15 APIs)**
- Data Usage (4 APIs)
- Balance Check (1 API)
- Connection Status (1 API)
- Credit Limit (1 API)
- Reconnection (3 APIs)
- Payment History (1 API)
- Payment Reversal (2 APIs)
- Roaming (4 APIs)

### **Week 3: Support & Misc APIs (15 APIs)**
- Complaints (2 APIs)
- DTV Rescan/Reset (2 APIs)
- E-bill (2 APIs)
- NPS/Survey (2 APIs)
- SMS (1 API)
- Verification (1 API)
- Connection Number (2 APIs)
- Diagnosis (1 API)

### **Week 4: Negative & Edge Cases**
- Add negative scenarios for all APIs
- Add boundary value tests
- Add auth failure tests
- Add missing header tests

---

## 🎯 SCENARIO TEMPLATE

For each API domain, create scenarios following this pattern:

```json
{
  "domain": "api-domain-name",
  "mifeApis": ["MIFE-API-NAME-1", "MIFE-API-NAME-2"],
  "scenarios": [
    {
      "id": "unique-scenario-id",
      "name": "Human Readable Name",
      "mifeApi": "MIFE-API-NAME",
      "tags": ["@smoke/@regression/@negative", "@service-type"],
      "method": "GET/POST/PUT/DELETE",
      "endpoint": "/dia-api-engine/api/...",
      "headers": {
        "traceId": "AUTO_TEST_{{timestamp}}",
        "Content-Type": "application/json"
      },
      "queryParams": {},
      "body": {},
      "expectedStatus": 200,
      "assertions": {
        "status": 200,
        "bodyNotEmpty": true,
        "schema": "schema-name"
      }
    }
  ]
}
```

---

## 🔧 COMMANDS REFERENCE

```bash
# Run all tests
npx playwright test tests/e2e/

# Run specific domain
npx playwright test tests/e2e/gsm-packages.spec.ts

# Run by tag
TEST_TAG=@smoke npx playwright test tests/e2e/
TEST_TAG=@negative npx playwright test tests/e2e/
TEST_TAG=@gsm npx playwright test tests/e2e/

# Run in mock mode
MOCK_API=true npx playwright test tests/e2e/

# View report
npx playwright show-report

# Run with UI
npx playwright test --ui

# Debug mode
npx playwright test --debug
```

---

## 📊 PROGRESS TRACKING

Track your implementation:

```
Package APIs:
[ ] GSM Packages (3 scenarios) - DONE
[ ] HBB Packages (3 scenarios)
[ ] DTV Packages (3 scenarios)
[ ] MBB Packages (3 scenarios)
[ ] MBB Add-ons (3 scenarios)
[ ] HBB Add-ons (3 scenarios)
[ ] DTV Channels (4 scenarios)

Account APIs:
[ ] Data Usage (4 scenarios)
[ ] Balance Check (2 scenarios)
[ ] Connection Status (2 scenarios)
[ ] Credit Limit (2 scenarios)
[ ] Reconnection (3 scenarios)

Support APIs:
[ ] Complaints (2 scenarios)
[ ] Payment History (2 scenarios)
[ ] E-bill (2 scenarios)
[ ] NPS (2 scenarios)
```

---

## 🎉 WHAT YOU HAVE NOW

✅ **Working GSM Package Tests** - 7 scenarios ready to run
✅ **Real Test Data** - Your actual account numbers and package codes
✅ **Scenario Framework** - Easy to add more APIs
✅ **Tag-Based Execution** - Run smoke, regression, or negative tests
✅ **Mock Mode** - Test without backend
✅ **Production-Ready** - Based on your actual 58 Dialog APIs

---

## 🚀 NEXT STEPS

1. **Run GSM tests now**: `npx playwright test tests/e2e/gsm-packages.spec.ts`
2. **Create HBB scenarios**: Follow Step 2 above
3. **Create Data Usage scenarios**: Follow Step 4 above
4. **Repeat for remaining APIs**: Use the template

**You can have all 58 APIs covered in 3-4 weeks following this pattern.**
