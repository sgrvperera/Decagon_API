# ✅ What Should I Do Now? - Action Checklist

## Immediate Actions (Do These First)

### ✅ 1. Verify Test Numbers Are Updated
```bash
# Check if test numbers match the latest Excel image
type data\test-data\test-numbers.json
```

**Expected:** Should see updated numbers with correct status (active/reserved/inactive)

---

### ✅ 2. Verify Framework Installation
```bash
# Check Node version (should be 18.x)
node -v

# Check if dependencies are installed
npm list --depth=0

# If not installed, run:
npm ci
npx playwright install
```

---

### ✅ 3. Set Up Environment
```bash
# Copy example env file
copy .env.example .env

# Edit .env and set:
# BASE_URL=https://chatbot.dialog.lk
# TRACE_ID=YOUR_TRACE_ID
# TEST_ENV=dev
```

---

### ✅ 4. Generate API Definitions
```bash
# Parse Excel and generate api-definitions.json
npm run generate:data
```

**Expected:** Should see `data/generated/api-definitions.json` with 58 APIs

---

### ✅ 5. Run Smoke Tests
```bash
# Run quick smoke tests to verify everything works
npm run test:smoke
```

**Expected:** Tests should run and pass (or show clear errors)

---

### ✅ 6. View Test Report
```bash
# Open Playwright HTML report
npx playwright show-report
```

**Expected:** Browser opens with detailed test results

---

## Next Actions (After Verification)

### 📝 7. Review Documentation
Read these files in order:
1. **MASTER_GUIDE.md** ← Start here (complete guide)
2. **QUICKSTART.md** ← Quick commands reference
3. **ARCHITECTURE.md** ← Technical architecture
4. **NUMBER_REGISTRY_GUIDE.md** ← Test number management

---

### 🧪 8. Run Full Test Suite
```bash
# Run all tests
npm test

# Or run by service type
npm run test:gsm
npm run test:dtv
npm run test:hbb
npm run test:mbb
```

---

### 🔍 9. Verify All APIs Are Working
```bash
# Check which APIs are parsed successfully
node -e "const apis = require('./data/generated/api-definitions.json'); console.log('Total APIs:', apis.length); console.log('Parsed:', apis.filter(a => a.parsed).length); console.log('Unparsed:', apis.filter(a => !a.parsed).length);"
```

---

### 📊 10. Check Test Coverage
Review scenario files to see what's tested:
- `data/scenarios/gsm-packages.json` (8 scenarios)
- `data/scenarios/dtv-packages.json`
- `data/scenarios/hbb-packages.json`
- `data/scenarios/mbb-packages.json`

---

## Common Issues & Quick Fixes

### ❌ Issue: "Cannot find module"
```bash
# Fix: Reinstall dependencies
npm ci
```

### ❌ Issue: "PowerShell script execution disabled"
```powershell
# Fix: Run PowerShell as Administrator
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### ❌ Issue: "API request failed"
```bash
# Fix: Check environment settings
type .env

# Or run in mock mode
set MOCK_API=true && npm test
```

### ❌ Issue: "No test numbers found"
```bash
# Fix: Verify test numbers file
type data\test-data\test-numbers.json

# Check if numbers exist for your service type
```

---

## Quick Commands Reference

| Command | Purpose |
|---------|---------|
| `npm run generate:data` | Parse Excel → JSON |
| `npm run test:smoke` | Run smoke tests |
| `npm run test:regression` | Run regression tests |
| `npm run test:gsm` | Run GSM tests only |
| `npm run test:postpaid` | Run postpaid tests only |
| `npm run test:prepaid` | Run prepaid tests only |
| `npm test` | Run all tests |
| `npx playwright show-report` | View test report |
| `set MOCK_API=true && npm test` | Run without real APIs |
| `set TEST_ENV=staging && npm test` | Run on staging |

---

## Decision Tree: What Should I Do?

```
START
  │
  ├─ Need to understand the framework?
  │   └─ Read MASTER_GUIDE.md
  │
  ├─ Need to run tests quickly?
  │   └─ Run: npm run test:smoke
  │
  ├─ Need to add new API?
  │   ├─ 1. Add to Excel
  │   ├─ 2. npm run generate:data
  │   ├─ 3. Add scenario to data/scenarios/
  │   └─ 4. npm run test:smoke
  │
  ├─ Need to update test numbers?
  │   ├─ 1. Edit data/test-data/test-numbers.json
  │   └─ 2. npm test (to verify)
  │
  ├─ Tests are failing?
  │   ├─ Check .env file (BASE_URL correct?)
  │   ├─ Check test numbers (active numbers available?)
  │   ├─ Try mock mode: set MOCK_API=true && npm test
  │   └─ Read TROUBLESHOOTING section in MASTER_GUIDE.md
  │
  └─ Need to deploy/CI?
      └─ Read CI/CD section in README.md
```

---

## Status Check Commands

### Check Framework Health
```bash
# 1. Check Node version
node -v

# 2. Check dependencies
npm list --depth=0

# 3. Check environment
type .env

# 4. Check API definitions
dir data\generated\api-definitions.json

# 5. Check test numbers
type data\test-data\test-numbers.json

# 6. Run health check test
npm run test:smoke
```

---

## Your Next 5 Minutes

1. ✅ Run `npm run test:smoke`
2. ✅ Run `npx playwright show-report`
3. ✅ Open `MASTER_GUIDE.md` and read "Quick Start" section
4. ✅ Check `data/scenarios/gsm-packages.json` to see example scenarios
5. ✅ Try adding a new scenario following the guide

---

## Summary

**Right Now:**
- ✅ Test numbers are updated
- ✅ Master guide is created
- ✅ Framework is ready to use

**Next Step:**
- Run `npm run test:smoke` to verify everything works
- Read `MASTER_GUIDE.md` for complete understanding
- Start adding your own tests

---

**You're all set!** 🚀
