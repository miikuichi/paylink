# PayLink Payroll Calculation Explanation

## Overview

The PayLink system calculates payroll using Philippine statutory deduction rules based on 2024 regulations and the TRAIN Law (2023) for withholding tax. This document explains the complete calculation flow and values used.

---

## Key Input Values

### 1. **Employee's Monthly Basic Rate** (`employee.basicRate`)
- **What it is:** The employee's fixed monthly salary
- **Example:** ₱30,000.00
- **Where it comes from:** Set when creating/updating an employee profile
- **Used in:** All calculations as the base for deductions and gross pay

### 2. **Pay Period Dates** (`payPeriod.startDate` and `payPeriod.endDate`)
- **What they are:** The date range for which payroll is being processed
- **Example:** 2024-06-01 to 2024-06-15 (15 days)
- **Where they come from:** Created as pay periods by HR admin
- **Used in:** Prorating calculations (adjusting amounts based on actual working days)

### 3. **Additional Items** (allowances and deductions)
- **Allowances:** Extra payments (bonuses, incentives, etc.)
- **Deductions:** Extra deductions beyond statutory (loans, uniforms, etc.)
- **Optional:** Only added when HR specifically adds them during payroll processing

---

## Payroll Calculation Flow

### Step 1: Prorating Factor
First, calculate how many days the pay period covers:

```
Days in Pay Period = (End Date - Start Date) + 1
Prorating Ratio = Days / 30

Example:
  Start: June 1, 2024
  End: June 15, 2024
  Days = 15 days (including both start and end)
  Ratio = 15 / 30 = 0.5
```

### Step 2: Calculate Gross Pay

```
Gross Pay = (Monthly Basic Rate × Days ÷ 30) + Additional Allowances

Example (with Monthly Basic Rate = ₱30,000):
  Basic Pay (prorated) = ₱30,000 × 15 ÷ 30 = ₱15,000.00
  Additional Allowances = ₱2,000.00 (if any)
  ─────────────────────────────────────────────
  Gross Pay = ₱17,000.00
```

### Step 3: Calculate Statutory Deductions

The system calculates four statutory deductions **per month**, then **prorates** them:

#### 3a. **SSS Contribution** (Social Security System)
- **Rate:** 4.5% of Monthly Salary Credit (MSC)
- **MSC Range:** ₱4,250 – ₱30,000
- **Rules:**
  - MSC is rounded to nearest ₱500 bracket
  - Employee contributes 4.5% of the bracket
  
**Formula:**
```
Monthly SSS = MSC × 4.5%
Prorated SSS = Monthly SSS × (Days / 30)

Example (Salary = ₱30,000, Days = 15):
  MSC = ₱30,000 (already at max)
  Monthly SSS = ₱30,000 × 0.045 = ₱1,350.00
  Prorated SSS = ₱1,350.00 × 0.5 = ₱675.00
```

#### 3b. **PhilHealth Contribution**
- **Rate:** 2.5% of basic salary
- **Salary Band:** ₱10,000 – ₱100,000 (capped)
- **Rules:**
  - Minimum: ₱10,000
  - Maximum: ₱100,000
  - Then apply 2.5%

**Formula:**
```
Clipped Salary = Clamp(Salary, 10,000, 100,000)
Monthly PhilHealth = Clipped Salary × 2.5%
Prorated PhilHealth = Monthly PhilHealth × (Days / 30)

Example (Salary = ₱30,000, Days = 15):
  Clipped Salary = ₱30,000 (within range)
  Monthly PhilHealth = ₱30,000 × 0.025 = ₱750.00
  Prorated PhilHealth = ₱750.00 × 0.5 = ₱375.00
```

#### 3c. **Pag-IBIG Contribution** (Home Development Mutual Fund)
- **Rate:** Depends on salary
- **Rules:**
  - If salary ≤ ₱1,500: 1% contribution
  - If salary > ₱1,500: 2% contribution (capped at ₱100/month)

**Formula:**
```
If Salary ≤ ₱1,500:
  Monthly Pag-IBIG = Salary × 1%
Else:
  Monthly Pag-IBIG = Min(Salary × 2%, ₱100)

Prorated Pag-IBIG = Monthly Pag-IBIG × (Days / 30)

Example (Salary = ₱30,000, Days = 15):
  Monthly Pag-IBIG = Min(₱30,000 × 0.02, ₱100) = ₱100.00
  Prorated Pag-IBIG = ₱100.00 × 0.5 = ₱50.00
```

#### 3d. **Withholding Tax** (BIR - Bureau of Internal Revenue)
- **Basis:** TRAIN Law 2023 monthly tax table
- **Taxable Income:** Gross Monthly Salary - SSS - PhilHealth - Pag-IBIG

**Tax Brackets (Monthly):**
```
Taxable Income              Tax Rate
≤ ₱20,833                  ₱0.00 (exempt)
₱20,834 – ₱33,333          20% of excess over ₱20,833
₱33,334 – ₱66,667          ₱2,500 + 25% of excess over ₱33,333
₱66,668 – ₱166,667         ₱10,833.33 + 30% of excess over ₱66,667
₱166,668 – ₱666,667        ₱40,833.33 + 32% of excess over ₱166,667
> ₱666,667                 ₱200,833.33 + 35% of excess over ₱666,667
```

**Formula:**
```
Taxable Income = Monthly Gross - SSS - PhilHealth - Pag-IBIG
Monthly Tax = Apply bracket calculation above
Prorated Tax = Monthly Tax × (Days / 30)

Example (Salary = ₱30,000, Days = 15):
  Monthly SSS = ₱1,350.00
  Monthly PhilHealth = ₱750.00
  Monthly Pag-IBIG = ₱100.00
  Taxable = ₱30,000 - ₱1,350 - ₱750 - ₱100 = ₱27,800.00
  
  Tax Calculation (Bracket 3):
    Excess = ₱27,800 - ₱33,333 = negative (use Bracket 2)
  
  Tax Calculation (Bracket 2):
    Excess = ₱27,800 - ₱20,833 = ₱6,967.00
    Tax = ₱6,967.00 × 0.20 = ₱1,393.40
  
  Prorated Tax = ₱1,393.40 × 0.5 = ₱696.70
```

### Step 4: Total Statutory Deductions

```
Total Statutory = SSS + PhilHealth + Pag-IBIG + Withholding Tax

Example:
  SSS Contribution: ₱675.00
  PhilHealth Contribution: ₱375.00
  Pag-IBIG Contribution: ₱50.00
  Withholding Tax: ₱696.70
  ─────────────────────────────────
  Total Statutory: ₱1,796.70
```

### Step 5: Total Deductions

```
Total Deductions = Total Statutory + Additional Deductions

Example:
  Total Statutory: ₱1,796.70
  Additional Deductions: ₱500.00 (if any)
  ───────────────────────────────
  Total Deductions: ₱2,296.70
```

### Step 6: Calculate Net Pay

```
Net Pay = Gross Pay - Total Deductions

Example:
  Gross Pay: ₱17,000.00
  Total Deductions: ₱2,296.70
  ─────────────────────────────
  Net Pay: ₱14,703.30
```

---

## Complete Example Calculation

### Scenario
- **Employee:** John Doe
- **Monthly Basic Rate:** ₱30,000.00
- **Pay Period:** June 1-15, 2024 (15 days)
- **Additional Allowance:** ₱2,000.00 (performance bonus)
- **Additional Deduction:** ₱500.00 (uniform fee)

### Calculation Steps

#### Step 1: Prorating
```
Days = 15
Ratio = 15 / 30 = 0.5
```

#### Step 2: Gross Pay
```
Basic (prorated) = ₱30,000 × 0.5 = ₱15,000.00
Allowances = ₱2,000.00
Gross Pay = ₱17,000.00
```

#### Step 3: Statutory Deductions (Monthly, then Prorated)

**SSS:**
```
Monthly SSS = ₱30,000 × 0.045 = ₱1,350.00
Prorated = ₱1,350.00 × 0.5 = ₱675.00
```

**PhilHealth:**
```
Monthly = ₱30,000 × 0.025 = ₱750.00
Prorated = ₱750.00 × 0.5 = ₱375.00
```

**Pag-IBIG:**
```
Monthly = Min(₱30,000 × 0.02, ₱100) = ₱100.00
Prorated = ₱100.00 × 0.5 = ₱50.00
```

**Withholding Tax:**
```
Taxable = ₱30,000 - ₱1,350 - ₱750 - ₱100 = ₱27,800
Tax = (₱27,800 - ₱20,833) × 0.20 = ₱1,393.40
Prorated = ₱1,393.40 × 0.5 = ₱696.70
```

**Total Statutory:**
```
₱675.00 + ₱375.00 + ₱50.00 + ₱696.70 = ₱1,796.70
```

#### Step 4: Total Deductions
```
Statutory: ₱1,796.70
Additional: ₱500.00
Total: ₱2,296.70
```

#### Step 5: Net Pay
```
Gross: ₱17,000.00
Deductions: ₱2,296.70
Net: ₱14,703.30
```

### Payroll Summary

| Component | Amount |
|-----------|--------|
| **EARNINGS** | |
| Basic Salary (prorated) | ₱15,000.00 |
| Performance Bonus | ₱2,000.00 |
| **Gross Pay** | **₱17,000.00** |
| | |
| **STATUTORY DEDUCTIONS** | |
| SSS Contribution | ₱675.00 |
| PhilHealth Contribution | ₱375.00 |
| Pag-IBIG Contribution | ₱50.00 |
| Withholding Tax (BIR) | ₱696.70 |
| **Subtotal Statutory** | **₱1,796.70** |
| | |
| **ADDITIONAL DEDUCTIONS** | |
| Uniform Fee | ₱500.00 |
| **Subtotal Additional** | **₱500.00** |
| | |
| **Total Deductions** | **₱2,296.70** |
| | |
| **NET PAY** | **₱14,703.30** |

---

## Key Features of the Calculation

### 1. **Prorating**
- Salaries are adjusted based on actual working days
- Formula: `(Days / 30) × Monthly Amount`
- Allows accurate payment for partial pay periods
- Example: 15-day pay period = 50% of monthly deductions

### 2. **Statutory Compliance**
- Uses 2024 contribution rates
- Follows Philippine SSS, PhilHealth, Pag-IBIG regulations
- Implements TRAIN Law 2023 tax brackets
- All amounts use 2 decimal places for accuracy

### 3. **Line Items**
Each payroll record stores detailed line items:
- One line item for each statutory deduction (SSS, PhilHealth, Pag-IBIG, Tax)
- One line item for each additional allowance/deduction
- Allows HR to see breakdown and audit trail

### 4. **Additional Flexibility**
HR can add:
- **Allowances:** Bonuses, incentives, overtime premiums
- **Deductions:** Loan repayments, uniform costs, disciplinary fines

---

## Database Storage

### Payroll Record
```sql
INSERT INTO payrolls (
  employee_id, pay_period_id,
  gross_pay, total_allowances, total_deductions, net_pay,
  status, processed_by, processed_at
) VALUES (
  123, 456,
  17000.00, 2000.00, 2296.70, 14703.30,
  'PROCESSED', 1, NOW()
);
```

### Payroll Items (Line Details)
```sql
INSERT INTO payroll_items (payroll_id, item_type, label, amount) VALUES
(1, 'DEDUCTION', 'SSS Contribution', 675.00),
(1, 'DEDUCTION', 'PhilHealth Contribution', 375.00),
(1, 'DEDUCTION', 'Pag-IBIG Contribution', 50.00),
(1, 'DEDUCTION', 'Withholding Tax', 696.70),
(1, 'ALLOWANCE', 'Performance Bonus', 2000.00),
(1, 'DEDUCTION', 'Uniform Fee', 500.00);
```

---

## Mobile/Web Display

### Mobile Display
The mobile app shows:
- **Payroll History Tab:** List of past payroll records with gross, deductions, net
- **Latest Payslip Card:** Summary of most recent payroll
- **Detailed View:** Breakdown of all deductions

### Web Display
The web dashboard shows:
- **HR Payroll Section:** Table of all processed payroll records
- **Employee View:** Personal payroll history
- **Generate Payslip:** Creates downloadable payslip PDF

---

## API Endpoints

### Process Payroll (Backend → HrDashboard)
```
POST /api/payroll/process
Content-Type: application/json

Request:
{
  "employeeId": 123,
  "payPeriodId": 456,
  "additionalItems": [
    {
      "itemType": "ALLOWANCE",
      "label": "Performance Bonus",
      "amount": 2000.00
    },
    {
      "itemType": "DEDUCTION",
      "label": "Uniform Fee",
      "amount": 500.00
    }
  ]
}

Response:
{
  "id": 1,
  "employeeId": 123,
  "payPeriodLabel": "Jun 1-15, 2024",
  "grossPay": 17000.00,
  "totalDeductions": 2296.70,
  "netPay": 14703.30,
  "status": "PROCESSED",
  "items": [
    { "itemType": "DEDUCTION", "label": "SSS Contribution", "amount": 675.00 },
    { "itemType": "DEDUCTION", "label": "PhilHealth Contribution", "amount": 375.00 },
    { "itemType": "DEDUCTION", "label": "Pag-IBIG Contribution", "amount": 50.00 },
    { "itemType": "DEDUCTION", "label": "Withholding Tax", "amount": 696.70 },
    { "itemType": "ALLOWANCE", "label": "Performance Bonus", "amount": 2000.00 },
    { "itemType": "DEDUCTION", "label": "Uniform Fee", "amount": 500.00 }
  ]
}
```

---

## Summary Table of Rates (2024, Philippines)

| Deduction | Type | Rate / Rule |
|-----------|------|-----------|
| **SSS** | % of MSC | 4.5% (MSC: ₱4,250–₱30,000, rounded to ₱500 bracket) |
| **PhilHealth** | % of Salary | 2.5% (salary clipped to ₱10,000–₱100,000) |
| **Pag-IBIG** | % or Fixed | 1% if salary ≤₱1,500; 2% if >₱1,500 (capped ₱100/month) |
| **Withholding Tax** | Bracket-based | TRAIN Law 2023 brackets (0%, 20%, 25%, 30%, 32%, 35%) |

---

## Conclusion

The PayLink payroll system provides:
- ✅ **Accurate calculations** using current Philippine tax rates
- ✅ **Prorating** for partial pay periods
- ✅ **Detailed line items** for transparency and auditability
- ✅ **Flexibility** to add allowances and deductions
- ✅ **Compliance** with statutory requirements

All calculations are performed in the backend (`PayrollComputationService`) and stored for both employee viewing (via payslips) and HR auditing.
