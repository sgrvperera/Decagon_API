# Quick Reference - Test Number Usage

## 🎯 Active Test Numbers (From Image)

### **GSM (Mobile)**
- **Postpaid**: `762546554` 🟡, `762528212` 🟡, `763290602` 🟢, `760642970` 🟢
- **Prepaid**: `763290491` 🔴, `763290574` 🔴 (Both reserved - use with caution)

**Color Legend:**
- 🟡 Yellow = Primary test numbers
- 🟢 Green = Active test numbers
- 🔴 Red = Reserved/special numbers

### **DTV (Television)**
- **Postpaid**: `81378961`
- **Prepaid**: None active (use inactive for testing)

### **HBB (Home Broadband)**
- **Postpaid**: `114395719`
- **Prepaid**: `114396495`

### **MBB (Mobile Broadband)**
- **Postpaid**: `761463243`
- **Prepaid**: None (fallback to GSM postpaid)

---

## 🚀 Quick Usage

### **In Scenario JSON**

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

### **In Test Code (if needed)**

```typescript
import { dataProvider } from '../../src/helpers/data-provider';

// Get number for eligibility
const number = dataProvider.getNumberForEligibility('gsm-packages', 'POSTPAID', 'GSM');

// Get number for activation
const number = dataProvider.getNumberForActivation('hbb-packages', 'PREPAID', 'HBB');

// Get invalid number for negative test
const invalidNumber = dataProvider.getInvalidNumber();
```

---

## 📋 Common Scenarios

### **Check Eligibility**
- Postpaid GSM → `762546554`
- Prepaid GSM → `763290491`
- Postpaid HBB → `114395719`
- Prepaid HBB → `114396495`
- Postpaid DTV → `81378961`
- Postpaid MBB → `761463243`

### **Activate Package**
- Same numbers as eligibility

### **Get Packages**
- Same numbers as eligibility

### **Negative Tests**
- Invalid: `0000000000`
- Inactive Postpaid: `762532515`
- Inactive Prepaid: `763289770`, `760642693`
- Reserved (use carefully): `763290491`, `763290574`

---

## ⚠️ Important Notes

1. **Red-highlighted numbers** (`763290491`, `763290574`):
   - Both marked as reserved in test-numbers.json
   - Use with caution - may have special behavior
   - Consider using for edge case testing only

2. **DTV Prepaid**:
   - No active numbers available
   - Tests may fail - this is expected

3. **MBB Prepaid**:
   - No numbers available
   - Falls back to GSM postpaid

4. **Number Rotation**:
   - To use different number, edit `service-number-mapping.json`
   - Change `active[0]` to `active[1]`, `active[2]`, etc.

---

## 🔧 Quick Commands

```bash
# Run GSM tests
npx playwright test tests/e2e/gsm-packages.spec.ts

# Run smoke tests only
npm run test:smoke

# Run negative tests only
npm run test:negative

# View which numbers are being used
npx playwright test tests/e2e/gsm-packages.spec.ts | grep "Resolved number"
```

---

## 📚 Full Documentation

See `NUMBER_REGISTRY_GUIDE.md` for complete details.
