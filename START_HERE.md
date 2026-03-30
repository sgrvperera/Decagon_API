# 🚀 START HERE - Dialog API Framework

## ⚡ Quick Start (5 Minutes)

### **Step 1: Run Your First Test**

```bash
npx playwright test tests/e2e/gsm-packages.spec.ts
```

This will run **7 real tests** against your Dialog GSM Package APIs:
- Get packages (Postpaid)
- Get packages (Prepaid)  
- Get packages (Invalid - Negative)
- Check eligibility (Valid)
- Check eligibility (Invalid account - Negative)
- Check eligibility (Invalid package - Negative)
- Activate package

### **Step 2: View the Report**

```bash
npx playwright show-report
```

### **Step 3: Run Smoke Tests Only**

```bash
npm run test:smoke
```

---

## 📚 What to Read Next

1. **`DELIVERY_SUMMARY.md`** - What was actually built (5 min read)
2. **`REAL_IMPLEMENTATION.md`** - How to add more APIs (15 min read)

---

## 🎯 What You Have

### **Real Test Data** (`data/test-data/`)
- `accounts.json` - Your actual account numbers (763290602, 769654581)
- `packages.json` - Your actual package codes (SPM_2700, STAFF325GB, etc.)

### **Real Scenarios** (`data/scenarios/`)
- `gsm-packages.json` - 7 scenarios for GSM APIs with your actual MIFE names

### **Working Tests** (`tests/e2e/`)
- `gsm-packages.spec.ts` - Production-ready test file

---

## 🔧 Common Commands

```bash
# Run all tests
npm test

# Run GSM tests
npm run test:gsm

# Run smoke tests only
npm run test:smoke

# Run negative tests only
npm run test:negative

# Run in mock mode (no backend needed)
npm run test:mock

# View report
npm run report
```

---

## 📋 Your 58 APIs - Coverage Plan

### **✅ DONE (7 scenarios)**
- GSM Packages (get, eligibility, activate)

### **📝 TODO (Follow REAL_IMPLEMENTATION.md)**
- HBB Packages (3 APIs)
- DTV Packages (3 APIs)
- MBB Packages (3 APIs)
- Data Usage (4 APIs)
- Balance Check (1 API)
- Connection Status (1 API)
- Credit Limit (1 API)
- Reconnection (3 APIs)
- DTV Channels (4 APIs)
- Add-ons (6 APIs)
- Support APIs (15 APIs)

**Total: 51 more APIs to cover**

---

## 🎓 How to Add More APIs

### **Example: Add HBB Package Tests**

1. **Create scenario file** (`data/scenarios/hbb-packages.json`):
   - Copy `gsm-packages.json`
   - Change endpoints to HBB endpoints
   - Update MIFE API names

2. **Create test file** (`tests/e2e/hbb-packages.spec.ts`):
   - Copy `gsm-packages.spec.ts`
   - Change scenario file path to `hbb-packages.json`
   - Update test describe name

3. **Run it**:
   ```bash
   npx playwright test tests/e2e/hbb-packages.spec.ts
   ```

**Time: 15-20 minutes per API domain**

---

## 🆘 Troubleshooting

### **Tests fail with network errors**

Run in mock mode:
```bash
npm run test:mock
```

### **Need to see what's being sent**

Check console output - each test logs:
- Request details
- Response status
- Response body (first 500 chars)

### **Want to debug a specific test**

```bash
npx playwright test --debug tests/e2e/gsm-packages.spec.ts
```

---

## ✅ Success Criteria

After running `npm run test:gsm`, you should see:

```
✓ Get GSM Packages - Postpaid (Smoke) [SS-DIA-Get-Gsm-Packages-Query - v1.0.0] @smoke @regression @postpaid @gsm
✓ Get GSM Packages - Prepaid [SS-DIA-Get-Gsm-Packages-Query - v1.0.0] @regression @prepaid @gsm
✓ Get GSM Packages - Invalid Connection Type (Negative) [SS-DIA-Get-Gsm-Packages-Query - v1.0.0] @negative @gsm
✓ Check GSM Package Eligibility - Valid Postpaid (Smoke) [SS-DIA-Gsm-Package-Change-Eligibility-Query - v1.0.0] @smoke @regression @postpaid @gsm
✓ Check GSM Package Eligibility - Invalid Account (Negative) [SS-DIA-Gsm-Package-Change-Eligibility-Query - v1.0.0] @negative @gsm
✓ Check GSM Package Eligibility - Invalid Package Code (Negative) [SS-DIA-Gsm-Package-Change-Eligibility-Query - v1.0.0] @negative @gsm
✓ Activate GSM Package - Postpaid [SS-DIA-Gsm-Package-Change-Activate-Insert - v1.0.0] @regression @postpaid @gsm

7 passed (Xs)
```

---

## 🎉 You're Ready!

**Run your first test now:**

```bash
npx playwright test tests/e2e/gsm-packages.spec.ts
```

**Then read `REAL_IMPLEMENTATION.md` to add more APIs.**

---

**Questions? Check:**
- `DELIVERY_SUMMARY.md` - What was built
- `REAL_IMPLEMENTATION.md` - How to extend it
- Your existing `README.md` - Original framework docs
