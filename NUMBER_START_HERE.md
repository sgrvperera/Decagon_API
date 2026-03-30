# 🚀 START HERE - Test Number Registry

## ⚡ Quick Start (2 Minutes)

### **What Changed?**

**Before:** All tests used the same hardcoded number (`763290602`)

**Now:** Each service uses its own correct test number:
- GSM Postpaid → `762546554`
- HBB Postpaid → `114395719`
- DTV Postpaid → `81378961`
- MBB Postpaid → `761463243`

### **Run Tests Now**

```bash
npx playwright test tests/e2e/gsm-packages.spec.ts
```

**Watch the console output:**
```
[NumberResolver] Resolving number for: gsm-packages/eligibility/POSTPAID
[Test] Resolved number: 762546554 (postpaid.active[0])
✓ Check GSM Package Eligibility - Valid Postpaid (Smoke)
```

---

## 📚 Documentation

1. **NUMBER_QUICK_REF.md** - Quick reference (2 min read)
   - List of all active numbers
   - Common usage examples

2. **NUMBER_REGISTRY_GUIDE.md** - Complete guide (15 min read)
   - Full architecture explanation
   - How to add new numbers
   - Troubleshooting

3. **NUMBER_IMPLEMENTATION_SUMMARY.md** - What was delivered (5 min read)
   - Summary of changes
   - Validation checklist
   - Next steps

---

## 🎯 Key Files

### **Data Files**
- `data/test-data/test-numbers.json` - All test numbers
- `data/test-data/service-number-mapping.json` - Mapping rules

### **Code Files**
- `src/helpers/number-resolver.ts` - Resolution logic
- `src/helpers/data-provider.ts` - Helper methods
- `src/types/test-data.types.ts` - TypeScript types

### **Scenario Files**
- `data/scenarios/gsm-packages.json` - Updated with numberResolution

---

## ✅ What You Get

1. **Service-Specific Numbers**: GSM uses GSM numbers, HBB uses HBB numbers
2. **Automatic Resolution**: Tests resolve numbers dynamically
3. **No Hardcoding**: Zero phone numbers in test code
4. **Easy Maintenance**: Add numbers in registry, no code changes
5. **Negative Testing**: Proper inactive numbers for negative tests

---

## 📋 Active Numbers (From Latest Excel Image)

| Service | Postpaid | Prepaid |
|---------|----------|---------|
| GSM | 762546554 🟡, 762528212 🟡, 763290602 🟢, 760642970 🟢 | 763290491 🔴, 763290574 🔴* |
| DTV | 81378961 | None** |
| HBB | 114395719 🟢 | 114396495 🟢 |
| MBB | 761463243 🟢 | None** |

**Legend:**
- 🟡 Yellow highlighted = Primary test numbers
- 🟢 Green highlighted = Active test numbers  
- 🔴 Red highlighted = Reserved/special numbers

*Both red numbers are reserved - use with caution
**No active numbers - using inactive/fallback

---

## 🔧 Common Tasks

### **Add a New Number**

Edit `data/test-data/test-numbers.json`:
```json
{
  "postpaid": {
    "active": [
      {
        "number": "NEW_NUMBER",
        "status": "active",
        "serviceType": "GSM",
        "connectionType": "POSTPAID"
      }
    ]
  }
}
```

### **Use a Different Number**

Edit `data/test-data/service-number-mapping.json`:
```json
{
  "gsm-package": {
    "eligibility": {
      "postpaid": "postpaid.active[1]"  ← Change index
    }
  }
}
```

### **Check Which Number is Used**

Run tests and look for:
```
[Test] Resolved number: 762546554 (postpaid.active[0])
```

---

## ⚠️ Important Notes

1. **DTV Prepaid**: No active numbers - tests may fail
2. **MBB Prepaid**: No numbers - falls back to GSM postpaid
3. **Red Numbers**: `763290491`, `763290574` - both reserved, use with caution
4. **Yellow Numbers**: `762546554`, `762528212` - primary test numbers for GSM postpaid
5. **Green Numbers**: Active and safe to use for all tests

---

## 🎓 Next Steps

1. **Read** `NUMBER_QUICK_REF.md` (2 minutes)
2. **Run** GSM tests (see numbers in action)
3. **Create** HBB/DTV/MBB scenarios (follow GSM pattern)

---

## 🆘 Need Help?

- **Quick answers**: `NUMBER_QUICK_REF.md`
- **Detailed guide**: `NUMBER_REGISTRY_GUIDE.md`
- **What changed**: `NUMBER_IMPLEMENTATION_SUMMARY.md`

---

**Everything is ready. Run the tests now! 🚀**
