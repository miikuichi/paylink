# PayLink Payroll Calculation - Code Implementation

This document shows the actual Java code that performs payroll calculations.

---

## Overview of Classes

### 1. **PayrollService** (Orchestration)
- **Location:** `backend/src/main/java/edu/cit/sevilla/paylink/features/payroll/application/PayrollService.java`
- **Responsibility:** Orchestrates the payroll processing workflow
- **Key Method:** `processPayroll(ProcessPayrollRequest req, Long processorUserId)`

### 2. **PayrollComputationService** (Calculations)
- **Location:** `backend/src/main/java/edu/cit/sevilla/paylink/features/payroll/application/PayrollComputationService.java`
- **Responsibility:** Performs all mathematical calculations
- **Key Methods:** `computeGrossPay()`, `computeStatutoryDeductions()`, individual deduction calculators

### 3. **Domain Models**
- **Payroll:** Main record entity
- **PayrollItem:** Line item (SSS, PhilHealth, etc.)
- **PayPeriod:** Date range for payroll
- **Employee:** Employee data including basicRate

---

## Code: PayrollService.processPayroll()

```java
@Transactional
public PayrollDto processPayroll(ProcessPayrollRequest req, Long processorUserId) {
    // 1. VALIDATE & FETCH ENTITIES
    Employee employee = employeeRepository.findById(req.employeeId())
        .orElseThrow(() -> new EntityNotFoundException(
            "Employee not found: " + req.employeeId()));
    
    PayPeriod period = payPeriodRepository.findById(req.payPeriodId())
        .orElseThrow(() -> new EntityNotFoundException(
            "Pay period not found: " + req.payPeriodId()));
    
    User processor = userRepository.findById(processorUserId)
        .orElseThrow(() -> new EntityNotFoundException(
            "User not found: " + processorUserId));

    // Check if payroll already exists (prevent duplicates)
    payrollRepository.findByEmployeeIdAndPayPeriodId(
        req.employeeId(), req.payPeriodId())
        .ifPresent(e -> {
            throw new IllegalStateException(
                "Payroll already exists for employee " + req.employeeId()
                + " in pay period " + req.payPeriodId());
        });

    // 2. AGGREGATE ADDITIONAL ITEMS
    BigDecimal extraAllowances = BigDecimal.ZERO;
    BigDecimal extraDeductions = BigDecimal.ZERO;
    
    if (req.additionalItems() != null) {
        for (ProcessPayrollRequest.LineItem item : req.additionalItems()) {
            if (item.itemType() == PayrollItemType.ALLOWANCE) {
                extraAllowances = extraAllowances.add(item.amount());
            } else {
                extraDeductions = extraDeductions.add(item.amount());
            }
        }
    }

    // 3. CALCULATE GROSS PAY
    // Calls PayrollComputationService to compute:
    // - Prorated basic salary based on pay period days
    // - Plus additional allowances
    BigDecimal grossPay = computationService.computeGrossPay(
        employee.getBasicRate(), 
        period.getStartDate(), 
        period.getEndDate(), 
        extraAllowances);

    // 4. CALCULATE STATUTORY DEDUCTIONS
    // Calls PayrollComputationService to compute:
    // - SSS, PhilHealth, Pag-IBIG, Withholding Tax
    // - Prorated based on pay period days
    Map<String, BigDecimal> statutory = computationService
        .computeStatutoryDeductions(
            employee.getBasicRate(), 
            period.getStartDate(), 
            period.getEndDate());

    // 5. SUM DEDUCTIONS
    BigDecimal statutoryTotal = statutory.values()
        .stream()
        .reduce(BigDecimal.ZERO, BigDecimal::add);
    
    BigDecimal totalDeductions = statutoryTotal.add(extraDeductions);

    // 6. CALCULATE NET PAY
    BigDecimal netPay = grossPay.subtract(totalDeductions);

    // 7. PERSIST PAYROLL RECORD
    Payroll payroll = payrollRepository.save(Payroll.builder()
        .employee(employee)
        .payPeriod(period)
        .grossPay(grossPay)
        .totalAllowances(extraAllowances)
        .totalDeductions(totalDeductions)
        .netPay(netPay)
        .status(PayrollStatus.PROCESSED)
        .processedBy(processor)
        .processedAt(LocalDateTime.now())
        .build());

    // 8. BUILD AND ATTACH LINE ITEMS
    List<PayrollItem> items = new ArrayList<>();
    
    // Add statutory deduction line items
    for (Map.Entry<String, BigDecimal> entry : statutory.entrySet()) {
        items.add(PayrollItem.builder()
            .payroll(payroll)
            .itemType(PayrollItemType.DEDUCTION)
            .label(entry.getKey())  // "SSS Contribution", "PhilHealth", etc.
            .amount(entry.getValue())
            .build());
    }
    
    // Add additional line items (allowances and deductions)
    if (req.additionalItems() != null) {
        for (ProcessPayrollRequest.LineItem item : req.additionalItems()) {
            items.add(PayrollItem.builder()
                .payroll(payroll)
                .itemType(item.itemType())
                .label(item.label())
                .amount(item.amount())
                .build());
        }
    }
    
    payroll.getItems().addAll(items);
    payroll = payrollRepository.save(payroll);

    return PayrollDto.from(payroll);
}
```

---

## Code: PayrollComputationService Methods

### 1. computeGrossPay()

```java
/**
 * Computes gross pay for the pay period.
 * Basic pay is prorated from the monthly basic rate using calendar days / 30.
 */
public BigDecimal computeGrossPay(
        BigDecimal monthlyBasicRate, 
        LocalDate start, 
        LocalDate end,
        BigDecimal additionalAllowances) {
    
    // Calculate number of days (inclusive)
    long days = ChronoUnit.DAYS.between(start, end) + 1;
    
    // Prorate basic pay: (daily × days)
    BigDecimal basicPay = monthlyBasicRate
        .multiply(BigDecimal.valueOf(days))
        .divide(BigDecimal.valueOf(30), 2, RoundingMode.HALF_UP);
    
    // Add allowances and return with proper scale
    return basicPay
        .add(additionalAllowances)
        .setScale(2, RoundingMode.HALF_UP);
}
```

**Example Calculation:**
```
monthlyBasicRate = ₱30,000
start = 2024-06-01
end = 2024-06-15
additionalAllowances = ₱2,000

days = ChronoUnit.DAYS.between(2024-06-01, 2024-06-15) + 1
     = 14 + 1 = 15 days

basicPay = ₱30,000 × 15 ÷ 30
         = ₱450,000 ÷ 30
         = ₱15,000.00

return = ₱15,000.00 + ₱2,000.00
       = ₱17,000.00
```

---

### 2. computeStatutoryDeductions()

```java
/**
 * Returns ordered map of statutory deduction label → prorated amount 
 * for the pay period.
 */
public Map<String, BigDecimal> computeStatutoryDeductions(
        BigDecimal monthlyBasicRate,
        LocalDate start, 
        LocalDate end) {
    
    // Calculate prorating ratio
    long days = ChronoUnit.DAYS.between(start, end) + 1;
    BigDecimal ratio = BigDecimal.valueOf(days)
        .divide(BigDecimal.valueOf(30), 10, RoundingMode.HALF_UP);

    // Compute monthly deductions
    BigDecimal sss = sssMonthly(monthlyBasicRate)
        .multiply(ratio)
        .setScale(2, RoundingMode.HALF_UP);
    
    BigDecimal philhealth = philhealthMonthly(monthlyBasicRate)
        .multiply(ratio)
        .setScale(2, RoundingMode.HALF_UP);
    
    BigDecimal pagibig = pagibigMonthly(monthlyBasicRate)
        .multiply(ratio)
        .setScale(2, RoundingMode.HALF_UP);
    
    BigDecimal tax = withholdingTax(
            monthlyBasicRate,
            sssMonthly(monthlyBasicRate),
            philhealthMonthly(monthlyBasicRate),
            pagibigMonthly(monthlyBasicRate))
        .multiply(ratio)
        .setScale(2, RoundingMode.HALF_UP);

    // Return as ordered map
    Map<String, BigDecimal> result = new LinkedHashMap<>();
    result.put("SSS Contribution", sss);
    result.put("PhilHealth Contribution", philhealth);
    result.put("Pag-IBIG Contribution", pagibig);
    result.put("Withholding Tax", tax);
    
    return result;
}
```

**Example Calculation:**
```
monthlyBasicRate = ₱30,000
days = 15
ratio = 15 / 30 = 0.5

sss = sssMonthly(₱30,000) × 0.5
    = ₱1,350.00 × 0.5 = ₱675.00

philhealth = philhealthMonthly(₱30,000) × 0.5
           = ₱750.00 × 0.5 = ₱375.00

pagibig = pagibigMonthly(₱30,000) × 0.5
        = ₱100.00 × 0.5 = ₱50.00

tax = withholdingTax(...) × 0.5
    = ₱1,393.40 × 0.5 = ₱696.70

result = {
  "SSS Contribution": ₱675.00,
  "PhilHealth Contribution": ₱375.00,
  "Pag-IBIG Contribution": ₱50.00,
  "Withholding Tax": ₱696.70
}
```

---

### 3. sssMonthly() - SSS Calculation

```java
/**
 * SSS 2024: employee = 4.5% of Monthly Salary Credit, 
 * MSC range ₱4,250–₱30,000.
 */
private BigDecimal sssMonthly(BigDecimal salary) {
    // Clamp salary to MSC range
    double msc = Math.max(4250, Math.min(30000, salary.doubleValue()));
    
    // Round MSC to nearest ₱500 bracket
    long rounded = Math.round(msc / 500.0) * 500L;
    rounded = Math.max(4500L, Math.min(30000L, rounded));
    
    // Calculate 4.5% of rounded MSC
    return BigDecimal.valueOf(rounded * 0.045)
        .setScale(2, RoundingMode.HALF_UP);
}
```

**Examples:**
```
Salary = ₱30,000
  msc = Min(30000, Max(4250, 30000)) = ₱30,000
  rounded = round(30000 / 500) × 500 = 60 × 500 = ₱30,000
  sss = ₱30,000 × 0.045 = ₱1,350.00 ✓

Salary = ₱15,000
  msc = ₱15,000
  rounded = round(15000 / 500) × 500 = 30 × 500 = ₱15,000
  sss = ₱15,000 × 0.045 = ₱675.00

Salary = ₱5,000 (below range)
  msc = Max(4250, 5000) = ₱5,000
  rounded = round(5000 / 500) × 500 = 10 × 500 = ₱5,000
  sss = ₱5,000 × 0.045 = ₱225.00
```

---

### 4. philhealthMonthly() - PhilHealth Calculation

```java
/**
 * PhilHealth 2024: employee share = 2.5% of basic salary, 
 * clipped to ₱10,000–₱100,000.
 */
private BigDecimal philhealthMonthly(BigDecimal salary) {
    // Clamp salary to valid range
    double clipped = Math.max(10000, Math.min(100000, salary.doubleValue()));
    
    // Calculate 2.5% of clipped salary
    return BigDecimal.valueOf(clipped * 0.025)
        .setScale(2, RoundingMode.HALF_UP);
}
```

**Examples:**
```
Salary = ₱30,000
  clipped = Min(100000, Max(10000, 30000)) = ₱30,000
  philhealth = ₱30,000 × 0.025 = ₱750.00 ✓

Salary = ₱120,000 (above cap)
  clipped = Min(100000, ...) = ₱100,000
  philhealth = ₱100,000 × 0.025 = ₱2,500.00

Salary = ₱8,000 (below minimum)
  clipped = Max(10000, ...) = ₱10,000
  philhealth = ₱10,000 × 0.025 = ₱250.00
```

---

### 5. pagibigMonthly() - Pag-IBIG Calculation

```java
/**
 * Pag-IBIG: employee = 2% of salary if > ₱1,500, capped at ₱100; else 1%.
 */
private BigDecimal pagibigMonthly(BigDecimal salary) {
    double s = salary.doubleValue();
    
    // Tiered calculation
    double contribution = (s <= 1500) 
        ? s * 0.01  // 1% if salary ≤ ₱1,500
        : Math.min(s * 0.02, 100.0);  // 2% capped at ₱100 if > ₱1,500
    
    return BigDecimal.valueOf(contribution)
        .setScale(2, RoundingMode.HALF_UP);
}
```

**Examples:**
```
Salary = ₱30,000
  s > 1500, so: Min(30000 × 0.02, 100) = Min(600, 100) = ₱100.00 ✓

Salary = ₱20,000
  s > 1500, so: Min(20000 × 0.02, 100) = Min(400, 100) = ₱100.00

Salary = ₱1,000 (below threshold)
  s ≤ 1500, so: 1000 × 0.01 = ₱10.00

Salary = ₱1,500 (at threshold)
  s ≤ 1500, so: 1500 × 0.01 = ₱15.00
```

---

### 6. withholdingTax() - BIR Tax Calculation

```java
/**
 * BIR TRAIN Law withholding tax (monthly table, 2023).
 * Taxable income = gross monthly salary − SSS − PhilHealth − Pag-IBIG.
 */
private BigDecimal withholdingTax(
        BigDecimal salary,
        BigDecimal sss, 
        BigDecimal philhealth, 
        BigDecimal pagibig) {
    
    // Calculate taxable income
    double taxable = salary
        .subtract(sss)
        .subtract(philhealth)
        .subtract(pagibig)
        .doubleValue();
    
    if (taxable <= 0)
        return BigDecimal.ZERO;

    double tax;
    
    // TRAIN Law 2023 brackets (monthly)
    if (taxable <= 20833) {
        tax = 0;  // Exempt
    } else if (taxable <= 33333) {
        tax = (taxable - 20833) * 0.20;
    } else if (taxable <= 66667) {
        tax = 2500 + (taxable - 33333) * 0.25;
    } else if (taxable <= 166667) {
        tax = 10833.33 + (taxable - 66667) * 0.30;
    } else if (taxable <= 666667) {
        tax = 40833.33 + (taxable - 166667) * 0.32;
    } else {
        tax = 200833.33 + (taxable - 666667) * 0.35;
    }

    return BigDecimal.valueOf(tax)
        .setScale(2, RoundingMode.HALF_UP);
}
```

**Tax Bracket Examples:**

```
Scenario 1: Taxable = ₱18,000 (Bracket 1 - Exempt)
  tax = ₱0.00 ✓

Scenario 2: Taxable = ₱25,000 (Bracket 2)
  excess = ₱25,000 - ₱20,833 = ₱4,167
  tax = ₱4,167 × 0.20 = ₱833.40 ✓

Scenario 3: Taxable = ₱27,800 (Bracket 2) ← Our example
  excess = ₱27,800 - ₱20,833 = ₱6,967
  tax = ₱6,967 × 0.20 = ₱1,393.40 ✓

Scenario 4: Taxable = ₱50,000 (Bracket 3)
  excess = ₱50,000 - ₱33,333 = ₱16,667
  tax = ₱2,500 + (₱16,667 × 0.25) = ₱2,500 + ₱4,166.75 = ₱6,666.75

Scenario 5: Taxable = ₱100,000 (Bracket 4)
  excess = ₱100,000 - ₱66,667 = ₱33,333
  tax = ₱10,833.33 + (₱33,333 × 0.30) = ₱10,833.33 + ₱10,000 = ₱20,833.33
```

---

## Data Models

### Payroll Entity

```java
@Entity
@Table(name = "payrolls")
public class Payroll {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pay_period_id", nullable = false)
    private PayPeriod payPeriod;

    @Column(name = "gross_pay", nullable = false, precision = 12, scale = 2)
    private BigDecimal grossPay;

    @Column(name = "total_allowances", nullable = false, precision = 12, scale = 2)
    private BigDecimal totalAllowances;

    @Column(name = "total_deductions", nullable = false, precision = 12, scale = 2)
    private BigDecimal totalDeductions;

    @Column(name = "net_pay", nullable = false, precision = 12, scale = 2)
    private BigDecimal netPay;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PayrollStatus status;  // PROCESSED, DRAFT

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "processed_by")
    private User processedBy;

    @Column(name = "processed_at")
    private LocalDateTime processedAt;

    @OneToMany(mappedBy = "payroll", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PayrollItem> items = new ArrayList<>();

    @OneToOne(mappedBy = "payroll")
    private Payslip payslip;
}
```

### PayrollItem Entity

```java
@Entity
@Table(name = "payroll_items")
public class PayrollItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "payroll_id", nullable = false)
    private Payroll payroll;

    @Enumerated(EnumType.STRING)
    @Column(name = "item_type", nullable = false, length = 20)
    private PayrollItemType itemType;  // ALLOWANCE, DEDUCTION

    @Column(nullable = false, length = 100)
    private String label;  // "SSS Contribution", "Bonus", etc.

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
```

---

## API Request/Response

### Request: ProcessPayrollRequest

```java
public record ProcessPayrollRequest(
    Long employeeId,
    Long payPeriodId,
    List<LineItem> additionalItems
) {
    public record LineItem(
        PayrollItemType itemType,
        String label,
        BigDecimal amount
    ) {}
}
```

**Example JSON:**
```json
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
```

### Response: PayrollDto

```java
public class PayrollDto {
    private Long id;
    private Long employeeId;
    private String employeeNumber;
    private String employeeName;
    private String payPeriodLabel;  // "Jun 1-15, 2024"
    private BigDecimal grossPay;
    private BigDecimal totalDeductions;
    private BigDecimal netPay;
    private String status;
    private List<PayrollItemDto> items;
}
```

**Example JSON:**
```json
{
  "id": 1,
  "employeeId": 123,
  "employeeNumber": "EMP-001",
  "employeeName": "John Doe",
  "payPeriodLabel": "Jun 1-15, 2024",
  "grossPay": 17000.00,
  "totalDeductions": 2296.70,
  "netPay": 14703.30,
  "status": "PROCESSED",
  "items": [
    {
      "itemType": "DEDUCTION",
      "label": "SSS Contribution",
      "amount": 675.00
    },
    {
      "itemType": "DEDUCTION",
      "label": "PhilHealth Contribution",
      "amount": 375.00
    },
    {
      "itemType": "DEDUCTION",
      "label": "Pag-IBIG Contribution",
      "amount": 50.00
    },
    {
      "itemType": "DEDUCTION",
      "label": "Withholding Tax",
      "amount": 696.70
    },
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
```

---

## Key Implementation Details

### 1. BigDecimal for Money
All monetary values use `BigDecimal` (not `double`) for precision.
```java
BigDecimal result = BigDecimal.ZERO;
result = result.add(BigDecimal.valueOf(100.00));  // ✓ Accurate
```

### 2. Rounding Mode
All calculations use `RoundingMode.HALF_UP` for standard rounding (0.5 rounds up).
```java
.setScale(2, RoundingMode.HALF_UP);  // Round to 2 decimal places
```

### 3. Prorating
Days are calculated inclusively (including both start and end dates).
```java
long days = ChronoUnit.DAYS.between(start, end) + 1;  // +1 includes end date
```

### 4. Transaction Management
Payroll processing is wrapped in `@Transactional` for data consistency.
```java
@Transactional
public PayrollDto processPayroll(...) { ... }
```

### 5. Error Handling
Duplicate payroll checks prevent processing the same employee twice in one period.
```java
payrollRepository.findByEmployeeIdAndPayPeriodId(employeeId, payPeriodId)
    .ifPresent(e -> {
        throw new IllegalStateException("Payroll already exists...");
    });
```

---

## Summary

The PayLink payroll system:
- ✅ Uses **BigDecimal** for monetary precision
- ✅ Implements **Philippine statutory rates** (2024)
- ✅ Prorates all amounts based on **actual working days**
- ✅ Stores **detailed line items** for transparency
- ✅ Supports **additional allowances and deductions**
- ✅ Complies with **TRAIN Law 2023** tax brackets
- ✅ Uses proper **transaction management** for data consistency

