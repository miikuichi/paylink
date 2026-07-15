# PayLink Payroll Calculation - Quick Reference

## The Formula (Simplified)

```
┌─────────────────────────────────────────────────────────────┐
│                   PAYROLL CALCULATION FLOW                   │
└─────────────────────────────────────────────────────────────┘

INPUT DATA
├─ Monthly Basic Rate (employee.basicRate)
│  └─ Example: ₱30,000.00
├─ Pay Period (startDate to endDate)
│  └─ Example: June 1-15, 2024 (15 days)
└─ Additional Items (allowances, deductions)
   └─ Optional: Bonuses, fees, etc.

                            ↓

PRORATION CALCULATION
   Days = (End - Start) + 1 = 15 days
   Ratio = 15 / 30 = 0.5 (50% of monthly)

                            ↓

┌─ GROSS PAY ────────────────────────────┐
│ = (Basic Rate × Ratio) + Allowances    │
│ = (₱30,000 × 0.5) + ₱2,000              │
│ = ₱15,000 + ₱2,000                      │
│ = ₱17,000.00                            │
└────────────────────────────────────────┘

                            ↓

┌─ STATUTORY DEDUCTIONS (Monthly, then prorate) ─┐
│                                                 │
│  1. SSS Contribution                            │
│     = ₱30,000 × 4.5% × 0.5 = ₱675.00           │
│                                                 │
│  2. PhilHealth Contribution                     │
│     = ₱30,000 × 2.5% × 0.5 = ₱375.00           │
│                                                 │
│  3. Pag-IBIG Contribution                       │
│     = Min(₱30,000 × 2%, ₱100) × 0.5 = ₱50.00   │
│                                                 │
│  4. Withholding Tax (TRAIN Law bracket)         │
│     Taxable = ₱30,000 - ₱1,350 - ₱750 - ₱100   │
│     = (₱27,800 - ₱20,833) × 20% = ₱1,393.40    │
│     Prorated = ₱1,393.40 × 0.5 = ₱696.70       │
│                                                 │
│  Total Statutory = ₱1,796.70                    │
└─────────────────────────────────────────────────┘

                            ↓

┌─ TOTAL DEDUCTIONS ─────────────────┐
│ = Statutory + Additional Deductions│
│ = ₱1,796.70 + ₱500                 │
│ = ₱2,296.70                        │
└────────────────────────────────────┘

                            ↓

┌─ NET PAY ──────────────────────────┐
│ = Gross Pay - Total Deductions     │
│ = ₱17,000.00 - ₱2,296.70           │
│ = ₱14,703.30                       │
└────────────────────────────────────┘
```

---

## Payroll Breakdown (Visual)

```
EARNINGS SIDE
═════════════════════════════════════════════════════════════
  Gross Pay
  ├─ Basic Salary (prorated):        ₱15,000.00
  ├─ Performance Bonus:              ₱2,000.00
  └─ TOTAL GROSS:                    ₱17,000.00
═════════════════════════════════════════════════════════════

DEDUCTIONS SIDE
═════════════════════════════════════════════════════════════
  STATUTORY:
  ├─ SSS Contribution                ₱675.00
  ├─ PhilHealth Contribution         ₱375.00
  ├─ Pag-IBIG Contribution           ₱50.00
  ├─ Withholding Tax (BIR)           ₱696.70
  │                                  ─────────
  │                                  ₱1,796.70 (Subtotal)
  │
  ADDITIONAL:
  ├─ Uniform Fee                     ₱500.00
  │                                  ─────────
  │                                  ₱500.00 (Subtotal)
  │
  TOTAL DEDUCTIONS:                  ₱2,296.70
═════════════════════════════════════════════════════════════

NET PAY (Take-Home) = ₱17,000.00 - ₱2,296.70 = ₱14,703.30
```

---

## Key Input Values

| Input | Value | Source | Used For |
|-------|-------|--------|----------|
| **Basic Rate** | ₱30,000/month | Employee profile | All calculations |
| **Pay Period** | Jun 1-15, 2024 | HR creates period | Prorating ratio |
| **Days** | 15 days | Calculate from dates | 50% proration |
| **Allowances** | ₱2,000 | HR adds optional | Increase gross |
| **Deductions** | ₱500 | HR adds optional | Increase total deductions |

---

## Deduction Rates (2024, Philippines)

### 1. SSS (Social Security System)
```
Employee Rate: 4.5% of Monthly Salary Credit (MSC)
MSC Range: ₱4,250 – ₱30,000
Rounded: To nearest ₱500 bracket

Formula (Monthly):
  SSS = MSC × 0.045

Example:
  Salary = ₱30,000
  MSC = ₱30,000 (at max)
  Monthly SSS = ₱30,000 × 0.045 = ₱1,350.00
  Prorated (15 days) = ₱1,350 × 0.5 = ₱675.00
```

### 2. PhilHealth
```
Employee Rate: 2.5% of basic salary
Salary Band: ₱10,000 – ₱100,000 (capped)

Formula (Monthly):
  ClippedSalary = Clamp(Salary, ₱10,000, ₱100,000)
  PhilHealth = ClippedSalary × 0.025

Example:
  Salary = ₱30,000
  Clipped = ₱30,000 (within range)
  Monthly = ₱30,000 × 0.025 = ₱750.00
  Prorated (15 days) = ₱750 × 0.5 = ₱375.00
```

### 3. Pag-IBIG (Home Development Mutual Fund)
```
Employee Rate:
  - 1% if salary ≤ ₱1,500
  - 2% if salary > ₱1,500 (capped at ₱100/month)

Formula (Monthly):
  If Salary ≤ ₱1,500:
    Pag-IBIG = Salary × 0.01
  Else:
    Pag-IBIG = Min(Salary × 0.02, ₱100)

Example:
  Salary = ₱30,000
  Rate = 2% (salary > ₱1,500)
  Monthly = Min(₱30,000 × 0.02, ₱100) = ₱100.00
  Prorated (15 days) = ₱100 × 0.5 = ₱50.00
```

### 4. Withholding Tax (BIR - TRAIN Law 2023)
```
Basis: TRAIN Law monthly tax brackets

Taxable Income = Gross Monthly - SSS - PhilHealth - Pag-IBIG

Tax Brackets (Monthly):
  ≤ ₱20,833           →  ₱0 (exempt)
  ₱20,834 - ₱33,333   →  20% of excess over ₱20,833
  ₱33,334 - ₱66,667   →  ₱2,500 + 25% of excess over ₱33,333
  ₱66,668 - ₱166,667  →  ₱10,833.33 + 30% of excess over ₱66,667
  ... (higher brackets exist)

Example (Salary = ₱30,000):
  Monthly SSS = ₱1,350
  Monthly PhilHealth = ₱750
  Monthly Pag-IBIG = ₱100
  
  Taxable = ₱30,000 - ₱1,350 - ₱750 - ₱100 = ₱27,800
  
  Bracket: ₱20,834 - ₱33,333 (20%)
  Tax = (₱27,800 - ₱20,833) × 0.20 = ₱1,393.40
  
  Prorated (15 days) = ₱1,393.40 × 0.5 = ₱696.70
```

---

## Database Storage

### 1. Payroll Record
```
id: 1
employee_id: 123
pay_period_id: 456
gross_pay: 17,000.00
total_allowances: 2,000.00
total_deductions: 2,296.70
net_pay: 14,703.30
status: PROCESSED
processed_by: (admin user)
processed_at: 2024-06-15 10:30:00
```

### 2. Payroll Items (Line Details)
```
Payroll ID 1 has items:
  - SSS Contribution (DEDUCTION): ₱675.00
  - PhilHealth Contribution (DEDUCTION): ₱375.00
  - Pag-IBIG Contribution (DEDUCTION): ₱50.00
  - Withholding Tax (DEDUCTION): ₱696.70
  - Performance Bonus (ALLOWANCE): ₱2,000.00
  - Uniform Fee (DEDUCTION): ₱500.00
```

---

## Step-by-Step Example

### Input
- Employee: John Doe
- Basic Rate: ₱30,000.00
- Pay Period: June 1-15, 2024 (15 days)
- Allowances: ₱2,000 (bonus)
- Deductions: ₱500 (uniform)

### Calculation

**Step 1: Proration**
```
Days = 15
Ratio = 0.5 (50%)
```

**Step 2: Gross Pay**
```
Gross = (₱30,000 × 0.5) + ₱2,000
      = ₱15,000 + ₱2,000
      = ₱17,000.00 ✓
```

**Step 3: Deductions**
```
SSS (₱1,350 × 0.5)           = ₱675.00
PhilHealth (₱750 × 0.5)      = ₱375.00
Pag-IBIG (₱100 × 0.5)        = ₱50.00
Tax (₱1,393.40 × 0.5)        = ₱696.70
Statutory Subtotal           = ₱1,796.70
Additional (Uniform)         = ₱500.00
─────────────────────────────────────
TOTAL DEDUCTIONS             = ₱2,296.70 ✓
```

**Step 4: Net Pay**
```
Net = ₱17,000.00 - ₱2,296.70
    = ₱14,703.30 ✓
```

### Output
```
Payroll for John Doe:
  Gross Pay:        ₱17,000.00
  Deductions:       ₱2,296.70
  Net Pay:          ₱14,703.30
  
  Breakdown:
    - SSS:          ₱675.00
    - PhilHealth:   ₱375.00
    - Pag-IBIG:     ₱50.00
    - Tax:          ₱696.70
    - Uniform:      ₱500.00
```

---

## Flow Diagram

```
┌─────────────────────────────────────────────────┐
│         HR Admin Creates Payroll                 │
│  (Select Employee, Pay Period, Add Items)        │
└──────────────────┬──────────────────────────────┘
                   │
                   ↓
┌─────────────────────────────────────────────────┐
│    Backend: PayrollComputationService            │
│  1. Read employee.basicRate                      │
│  2. Read payPeriod.startDate & endDate           │
│  3. Calculate prorating ratio (days/30)          │
│  4. Compute Gross Pay (prorate + allowances)     │
│  5. Compute Statutory Deductions                 │
│     - SSS, PhilHealth, Pag-IBIG, Tax             │
│  6. Add Additional Deductions                    │
│  7. Calculate Net Pay                            │
│  8. Save Payroll + Line Items to DB              │
└──────────────────┬──────────────────────────────┘
                   │
                   ↓
┌─────────────────────────────────────────────────┐
│    Payroll Stored in Database                    │
│  - payrolls table                                │
│  - payroll_items table (line details)            │
└──────────────────┬──────────────────────────────┘
                   │
                   ↓
┌─────────────────────────────────────────────────┐
│    Employee Views in Mobile/Web                  │
│  - Payroll History Tab (list of payrolls)        │
│  - Latest Payslip Card (summary)                 │
│  - Payslip PDF Download                          │
└─────────────────────────────────────────────────┘
```

---

## Common Questions

### Q: Why is my net pay so much less than gross?
**A:** Statutory deductions (SSS, PhilHealth, Pag-IBIG, Tax) are mandatory in the Philippines. They average 10-15% of gross pay. Plus any additional deductions the company adds.

### Q: How is the salary calculated for a 15-day pay period?
**A:** It's prorated: (15 days / 30 days) × monthly salary. This ensures accurate payment whether it's a full month or partial period.

### Q: What if an employee earns less than ₱20,833/month?
**A:** They pay no withholding tax (first bracket exemption), but they still pay SSS, PhilHealth, and Pag-IBIG.

### Q: Can I add custom allowances and deductions?
**A:** Yes! HR can add "Additional Items" during payroll processing. These are added as line items and included in the final calculation.

### Q: Is this calculation based on Philippine regulations?
**A:** Yes! It uses 2024 SSS, PhilHealth, Pag-IBIG rates and the TRAIN Law 2023 tax brackets, all based on actual Philippine law.

---

## References

- **SSS:** 2024 contribution table
- **PhilHealth:** Circular 2023-006
- **Pag-IBIG:** Circular 2019-006
- **BIR:** TRAIN Law 2023 (Republic Act 10963, amended)
