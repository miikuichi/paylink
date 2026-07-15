# PayLink Payroll System - Complete Documentation Index

## Documents Created

This collection of documents explains how the PayLink payroll system calculates employee salaries and deductions.

### 1. **PAYROLL_CALCULATION_GUIDE.md** (Main Reference)
**Best for:** Understanding the complete payroll calculation process
- **Overview:** High-level explanation of the payroll system
- **Input Values:** Employee basic rate, pay period dates, additional items
- **Calculation Flow:** Step-by-step breakdown of each calculation
- **Statutory Deductions:** SSS, PhilHealth, Pag-IBIG, Withholding Tax
- **Complete Example:** Full worked example with scenario data
- **Database Storage:** How data is persisted
- **API Documentation:** Request/response examples
- **2024 Philippine Rates:** Current tax brackets and contribution rates
- **Length:** ~300 lines, comprehensive

### 2. **PAYROLL_CALCULATION_QUICK_REFERENCE.md** (Quick Start)
**Best for:** Quick lookups and visual understanding
- **ASCII Flowchart:** Visual representation of calculation flow
- **Payroll Breakdown:** Visual earnings vs. deductions breakdown
- **Key Values Table:** Input parameters at a glance
- **Deduction Rates Summary:** All rates in one place
- **Database Storage:** Quick schema reference
- **Step-by-Step Example:** Simplified worked example
- **Flow Diagram:** Complete system flow
- **FAQs:** Common questions answered
- **Length:** ~200 lines, quick reference

### 3. **PAYROLL_CALCULATION_CODE_IMPLEMENTATION.md** (For Developers)
**Best for:** Understanding the Java implementation
- **Class Overview:** PayrollService, PayrollComputationService
- **PayrollService.processPayroll():** Full code walkthrough
- **PayrollComputationService Methods:** Each calculation method with code:
  - `computeGrossPay()`
  - `computeStatutoryDeductions()`
  - `sssMonthly()`
  - `philhealthMonthly()`
  - `pagibigMonthly()`
  - `withholdingTax()`
- **Data Models:** Entity code and schema
- **API Contracts:** Request/response objects with JSON examples
- **Implementation Details:** BigDecimal usage, rounding, transaction management
- **Length:** ~400 lines, code-focused

---

## Quick Navigation

### I want to understand...

**...how gross pay is calculated:**
→ See PAYROLL_CALCULATION_GUIDE.md → "Step 2: Calculate Gross Pay"
→ Or PAYROLL_CALCULATION_CODE_IMPLEMENTATION.md → "computeGrossPay()"

**...what deductions are applied:**
→ See PAYROLL_CALCULATION_GUIDE.md → "Step 3: Calculate Statutory Deductions"
→ Or PAYROLL_CALCULATION_QUICK_REFERENCE.md → "Deduction Rates (2024, Philippines)"

**...how withholding tax is calculated:**
→ See PAYROLL_CALCULATION_GUIDE.md → "3d. Withholding Tax"
→ Or PAYROLL_CALCULATION_CODE_IMPLEMENTATION.md → "withholdingTax() - BIR Tax Calculation"

**...what values are stored in the database:**
→ See PAYROLL_CALCULATION_GUIDE.md → "Database Storage"
→ Or PAYROLL_CALCULATION_CODE_IMPLEMENTATION.md → "Data Models"

**...the complete flow with a real example:**
→ See PAYROLL_CALCULATION_GUIDE.md → "Complete Example Calculation"

**...the API endpoints and request format:**
→ See PAYROLL_CALCULATION_GUIDE.md → "API Endpoints"
→ Or PAYROLL_CALCULATION_CODE_IMPLEMENTATION.md → "API Request/Response"

**...all the rates and tax brackets at once:**
→ See PAYROLL_CALCULATION_QUICK_REFERENCE.md → "Deduction Rates (2024, Philippines)"

**...how to implement this in code:**
→ See PAYROLL_CALCULATION_CODE_IMPLEMENTATION.md

---

## Key Formulas at a Glance

### Gross Pay
```
Gross Pay = (Monthly Basic × Days ÷ 30) + Additional Allowances
```

### Statutory Deductions (all prorated by days/30)
```
SSS = Monthly Salary Credit × 4.5%
PhilHealth = Clipped Salary × 2.5%
Pag-IBIG = 1-2% (depends on salary)
Tax = Bracket-based calculation (TRAIN Law)
```

### Net Pay
```
Net Pay = Gross Pay - (Statutory Deductions + Additional Deductions)
```

---

## Complete Worked Example

**Scenario:**
- Employee: John Doe
- Monthly Basic: ₱30,000.00
- Pay Period: June 1-15, 2024 (15 days)
- Bonus: ₱2,000.00
- Uniform Deduction: ₱500.00

**Calculation:**

| Component | Calculation | Amount |
|-----------|-------------|--------|
| **GROSS PAY** | | |
| Basic (prorated) | ₱30,000 × 15/30 | ₱15,000.00 |
| Bonus | Added allowance | ₱2,000.00 |
| **Gross** | | **₱17,000.00** |
| | | |
| **DEDUCTIONS** | | |
| SSS | ₱1,350 × 0.5 | ₱675.00 |
| PhilHealth | ₱750 × 0.5 | ₱375.00 |
| Pag-IBIG | ₱100 × 0.5 | ₱50.00 |
| Tax | ₱1,393.40 × 0.5 | ₱696.70 |
| Uniform | Additional deduction | ₱500.00 |
| **Total Deductions** | | **₱2,296.70** |
| | | |
| **NET PAY** | ₱17,000 - ₱2,296.70 | **₱14,703.30** |

---

## System Architecture

### Backend Processing
```
Employee Profile (basicRate)
            ↓
PayrollService.processPayroll()
            ↓
PayrollComputationService
    ├─ computeGrossPay()
    ├─ computeStatutoryDeductions()
    │   ├─ sssMonthly()
    │   ├─ philhealthMonthly()
    │   ├─ pagibigMonthly()
    │   └─ withholdingTax()
    ├─ Aggregate additional items
    └─ Calculate net pay
            ↓
Payroll + PayrollItems (saved to DB)
            ↓
API Response (PayrollDto)
            ↓
Mobile/Web Display
```

### Data Flow
```
HR Admin creates payroll
    ↓
Sends: ProcessPayrollRequest
    {
      employeeId: 123,
      payPeriodId: 456,
      additionalItems: [...]
    }
    ↓
Backend processes & calculates
    ↓
Stores: Payroll + PayrollItems in database
    ↓
Returns: PayrollDto with full breakdown
    ↓
Mobile/Web displays:
    - Payroll history
    - Latest payslip
    - Detailed breakdown
```

---

## Philippine Statutory Requirements (2024)

### SSS (Social Security System)
- **Rate:** 4.5% of Monthly Salary Credit
- **MSC Range:** ₱4,250 – ₱30,000
- **Rounding:** To nearest ₱500 bracket

### PhilHealth
- **Rate:** 2.5% of basic salary
- **Salary Band:** ₱10,000 – ₱100,000 (capped)

### Pag-IBIG (Home Development Mutual Fund)
- **Rate:** 1% if salary ≤ ₱1,500; 2% if > ₱1,500
- **Cap:** ₱100/month maximum

### Withholding Tax (BIR - TRAIN Law 2023)
- **Brackets:** Progressive tax from 0% to 35%
- **Basis:** Taxable income after statutory deductions
- **Monthly calculation**, then prorated

---

## File Locations in Codebase

### Backend
```
backend/src/main/java/edu/cit/sevilla/paylink/features/payroll/
├── application/
│   ├── PayrollService.java           (Orchestration)
│   └── PayrollComputationService.java (Calculations)
├── api/
│   ├── PayrollController.java        (REST endpoints)
│   ├── request/
│   │   └── ProcessPayrollRequest.java
│   └── response/
│       └── PayrollDto.java
└── domain/
    ├── Payroll.java                  (Entity)
    └── PayrollItem.java              (Line items)
```

### Mobile (Kotlin)
```
mobile/features/payroll/
├── data/
│   ├── model/
│   │   └── PayrollModels.kt
│   ├── network/
│   │   └── PayrollApi.kt
│   └── repository/
│       └── PayrollRepository.kt
```

### Web (React)
```
web/src/features/payroll/
├── api.js                            (API client)
├── hooks/
│   └── usePayroll.js                 (State management)
└── components/
    ├── PayrollTable.jsx
    └── PayslipDetailCard.jsx
```

---

## Testing Scenarios

### Test Case 1: Standard Employee (Full Month)
```
Basic Rate: ₱30,000
Days: 30 (full month)
Expected: Full monthly deductions
```

### Test Case 2: Half Month
```
Basic Rate: ₱30,000
Days: 15
Expected: 50% of all deductions
```

### Test Case 3: Low Salary Employee
```
Basic Rate: ₱5,000
Days: 30
Expected: Lower SSS bracket, lower tax
```

### Test Case 4: High Salary Employee
```
Basic Rate: ₱150,000
Days: 30
Expected: SSS at max MSC, higher tax bracket
```

### Test Case 5: With Additional Items
```
Basic Rate: ₱30,000
Days: 30
Allowances: ₱5,000
Deductions: ₱2,000
Expected: Adjusted gross and net
```

---

## Common Issues & Troubleshooting

### Issue: Net pay seems too low
**Solution:** This is normal due to statutory deductions. Deductions average 10-15% of gross in the Philippines.

### Issue: Why does prorating use /30?
**Solution:** PayLink standardizes months to 30 days for consistent calculations across different months.

### Issue: How do I add custom deductions?
**Solution:** Use the `additionalItems` array in `ProcessPayrollRequest` to add DEDUCTION type items.

### Issue: Can I modify rates?
**Solution:** Contact backend team. Rates are hardcoded per Philippine law. Changes require code update and compliance review.

### Issue: What if someone hasn't been paid yet?
**Solution:** No payroll record exists. They'll show ₱0.00 for that period until HR processes payroll.

---

## References & Regulations

- **SSS:** 2024 contribution table from SSS official website
- **PhilHealth:** Circular 2023-006
- **Pag-IBIG:** Circular 2019-006
- **BIR:** TRAIN Law (Republic Act 10963, amended)
- **Withholding Tax:** 2023 monthly table

---

## Document Selection Guide

Choose the document that matches your need:

| Your Goal | Document | Length | Time |
|-----------|----------|--------|------|
| Understand the complete system | PAYROLL_CALCULATION_GUIDE.md | Long | 20-30 min |
| Quick lookup of rates/formulas | PAYROLL_CALCULATION_QUICK_REFERENCE.md | Medium | 5-10 min |
| Review the Java code | PAYROLL_CALCULATION_CODE_IMPLEMENTATION.md | Long | 20-30 min |
| Implement a similar system | PAYROLL_CALCULATION_CODE_IMPLEMENTATION.md | Long | 30-45 min |
| Answer a specific question | Use index above | Varies | 2-5 min |

---

## Summary

The PayLink payroll system provides:

✅ **Accurate Calculations**
- Uses BigDecimal for precision
- Implements 2024 Philippine statutory rates
- Prorates based on actual working days

✅ **Transparency**
- Stores detailed line items
- Shows all deductions individually
- Provides breakdown on mobile/web

✅ **Compliance**
- Follows Philippine law (SSS, PhilHealth, Pag-IBIG, BIR)
- Implements TRAIN Law 2023 tax brackets
- Maintains audit trail

✅ **Flexibility**
- Supports additional allowances
- Supports additional deductions
- Handles partial pay periods

✅ **Maintainability**
- Clean separation of concerns
- Well-documented code
- Comprehensive test coverage

---

## Next Steps

1. **New to PayLink?** Start with PAYROLL_CALCULATION_QUICK_REFERENCE.md
2. **Want details?** Read PAYROLL_CALCULATION_GUIDE.md
3. **Need to implement?** Study PAYROLL_CALCULATION_CODE_IMPLEMENTATION.md
4. **Questions?** Check the FAQ sections in each document

---

**Last Updated:** July 15, 2026  
**Version:** 1.0  
**Status:** Complete ✅
