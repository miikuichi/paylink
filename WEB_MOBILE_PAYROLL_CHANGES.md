# PayLink Web & Mobile - Payroll Changes Guide

**Date Created:** July 15, 2026  
**Status:** Ready for Implementation  
**Based on:** Backend Payroll Calculation Enhancement with Hours Worked & Leave Tracking

---

## 📋 Overview

The backend has been updated with comprehensive Philippine Government payroll calculations including:
- Hours-based pay calculation
- Overtime multipliers (125%, 130%, 169%)
- Holiday pay (regular/special holidays)
- Night differential (10% additional)
- Official government deduction tables (SSS, PhilHealth, Pag-IBIG, BIR)
- Leave deduction framework

This document outlines all required changes for web and mobile applications to support these new features.

---

## 🌐 WEB APPLICATION CHANGES

### 1. Payroll Input Form Enhancement

**Location:** `src/features/payroll/`

#### New Form Fields to Add:

```
Current Fields:
- Employee Selection
- Period Start Date
- Period End Date
- Monthly Basic Rate

NEW Fields:
- Hours Worked (numeric input, range 0-240, default 240)
- Overtime Hours (numeric input, default 0)
- Night Shift Hours (numeric input, default 0)
- Regular Holiday Worked (checkbox/toggle)
- Special Holiday Worked (checkbox/toggle)
- Leave Type (dropdown selector)
- Leave with Pay Hours (numeric)
- Leave without Pay Hours (numeric)
- Sick Leave Hours (numeric)
```

#### Form Validation Rules:

- **Hours Worked:** 
  - Min: 0, Max: 240
  - Must be numeric
  - Cannot exceed monthly hours

- **Overtime Hours:**
  - Min: 0
  - Cannot exceed total available hours
  - Validation: `hoursWorked + overtimeHours ≤ 240`

- **Night Shift Hours:**
  - Min: 0
  - Cannot exceed overtime hours
  - Only valid if overtime hours > 0

- **Leave Fields:**
  - Cannot exceed available leave balance
  - Leave with Pay: Does not deduct from salary
  - Leave without Pay: Deducts from gross salary

---

### 2. API Request Structure Update

**Location:** `src/shared/api/payroll.api.js` or similar

#### Current Request:
```javascript
POST /api/payroll/compute
{
  "employeeId": "uuid",
  "monthlyBasicRate": 30000,
  "startDate": "2024-01-01",
  "endDate": "2024-01-31"
}
```

#### NEW Request Structure:
```javascript
POST /api/payroll/compute
{
  "employeeId": "uuid",
  "monthlyBasicRate": 30000,
  "startDate": "2024-01-01",
  "endDate": "2024-01-31",
  "hoursWorked": 240,
  "overtimeHours": 8,
  "nightShiftHours": 4,
  "holidays": {
    "regularHolidaysWorked": false,
    "specialHolidaysWorked": false
  },
  "absences": {
    "leaveWithPay": 0,
    "leaveWithoutPay": 0,
    "sickLeave": 0
  }
}
```

---

### 3. Payslip Display Component

**Location:** `src/features/payslips/` (new or enhanced component)

#### Component Structure:

```
PAYSLIP DISPLAY
├── Employee Information
│   ├── Name
│   ├── Position
│   ├── Department
│   └── Period
│
├── TIME & ATTENDANCE
│   ├── Hours Worked: 240
│   ├── Overtime Hours: 8
│   ├── Night Shift Hours: 4
│   ├── Holidays Worked: Regular (if yes)
│   └── Absences: Leave Type (hours)
│
├── EARNINGS
│   ├── Basic Pay: ₱30,000.00
│   ├── Overtime Pay: ₱250.00 (8 hrs × hourly rate × 1.25)
│   ├── Night Differential: ₱125.00
│   ├── Holiday Pay: ₱0.00 (if worked)
│   └── GROSS PAY: ₱30,375.00
│
├── DEDUCTIONS
│   ├── SSS Contribution: ₱1,350.00 (from table)
│   ├── PhilHealth: ₱750.00
│   ├── Pag-IBIG: ₱100.00
│   ├── BIR Withholding Tax: ₱1,393.40
│   ├── Leave Deduction (LWP): ₱0.00
│   └── TOTAL DEDUCTIONS: ₱3,593.40
│
└── SUMMARY
    ├── Gross Pay: ₱30,375.00
    ├── Total Deductions: ₱3,593.40
    └── NET PAY: ₱26,781.60
```

#### Display Format:
- Use currency formatting (₱ sign, 2 decimal places)
- Color code: Green for earnings, Red for deductions
- Show breakdown percentages where applicable
- Include tooltips for complex calculations

---

### 4. Payroll List/Table Enhancement

**Location:** `src/features/payroll/` (list view)

#### New Columns to Add:

```
Current Columns:
- Employee Name
- Position
- Period
- Gross Pay
- Net Pay

NEW Columns:
- Hours Worked
- Overtime Hours
- Night Shift
- Holiday (Y/N)
- Leave Type
- Gross Pay
- Deductions
- Net Pay
- Status (Computed/Pending)
```

#### Column Width Recommendation:
- Use scrollable table for mobile responsiveness
- Priority columns: Employee, Period, Net Pay
- Secondary columns: Hours, Overtime, Leave
- Tertiary columns: Breakdown details

---

### 5. Real-Time Calculation Preview

**Feature:** As user enters values in form, show instant preview

```javascript
// Pseudo-code for calculation preview

function updatePayrollPreview(formValues) {
  const hourlyRate = formValues.monthlyBasicRate / 240;
  
  const regularPay = formValues.hoursWorked * hourlyRate;
  const overtimePay = formValues.overtimeHours * hourlyRate * 1.25;
  const nightDifferential = formValues.nightShiftHours * hourlyRate * 0.10;
  const holidayPay = calculateHolidayPay(...); // Logic from backend
  
  const grossPay = regularPay + overtimePay + nightDifferential + holidayPay;
  
  // Fetch deductions from backend or calculate locally
  const deductions = calculateDeductions(grossPay); // SSS, PhilHealth, Pag-IBIG, Tax
  const leaveDeduction = calculateLeaveDeduction(...);
  
  const totalDeductions = deductions + leaveDeduction;
  const netPay = grossPay - totalDeductions;
  
  return {
    grossPay,
    deductions,
    netPay,
    breakdown: { regularPay, overtimePay, nightDifferential, holidayPay }
  };
}
```

---

### 6. Form State Management

**Location:** Component state or global store (Redux/Context)

#### State Structure:

```javascript
const payrollFormState = {
  employeeId: null,
  monthlyBasicRate: 0,
  startDate: null,
  endDate: null,
  hoursWorked: 240,
  overtimeHours: 0,
  nightShiftHours: 0,
  holidays: {
    regularHolidaysWorked: false,
    specialHolidaysWorked: false
  },
  absences: {
    leaveWithPay: 0,
    leaveWithoutPay: 0,
    sickLeave: 0
  },
  computed: false,
  result: null,
  loading: false,
  error: null
};
```

---

## 📱 MOBILE APPLICATION CHANGES

### 1. Mobile Payroll Input Screen

**Location:** Android/Kotlin app (new or enhanced fragment/activity)

#### Screen Layout:

```
┌─────────────────────────────┐
│  PAYROLL CALCULATION        │
├─────────────────────────────┤
│ Employee: [John Doe ▼]      │ ← Pre-filled
│ Period: Jan 1 - Jan 31      │ ← Pre-filled
│ Basic Rate: ₱30,000         │ ← Pre-filled
├─────────────────────────────┤
│ HOURS & ATTENDANCE          │
│ Hours Worked: [240    ]     │ ← Input (spinnerbar)
│ Overtime Hours: [0    ]     │ ← Input
│ Night Shift: [0      ]      │ ← Input
├─────────────────────────────┤
│ HOLIDAYS & LEAVE            │
│ ☐ Worked Regular Holiday    │ ← Checkbox
│ ☐ Worked Special Holiday    │ ← Checkbox
│ Leave Type: [None   ▼]      │ ← Dropdown
│ Leave Hours: [0     ]       │ ← Input
├─────────────────────────────┤
│ [COMPUTE]  [CLEAR]          │ ← Action buttons
└─────────────────────────────┘
```

#### Input Components:

1. **Hours Worked Spinnerbar**
   - Range: 0-240
   - Step: 1
   - Default: 240

2. **Overtime Spinnerbar**
   - Range: 0-100
   - Step: 0.5
   - Validation: Cannot exceed available hours

3. **Night Shift Spinnerbar**
   - Range: 0-100
   - Step: 0.5
   - Validation: Only if overtime > 0

4. **Holiday Checkboxes**
   - Regular Holiday Worked (Y/N)
   - Special Holiday Worked (Y/N)

5. **Leave Type Dropdown**
   - Options: None, Leave with Pay, Leave without Pay, Sick Leave
   - Auto-populate from company policy

6. **Leave Hours Input**
   - Numeric input
   - Validation: Cannot exceed available balance

---

### 2. Mobile Payslip Display Screen

**Location:** Android/Kotlin payslip view activity

#### Screen Layout:

```
┌──────────────────────────────┐
│ PAYSLIP - January 2024       │
├──────────────────────────────┤
│ John Doe                     │
│ Senior Developer             │
│ Engineering Dept             │
├──────────────────────────────┤
│ WORK DETAILS                 │ ← Expandable
│ ▼ Hours Worked: 240          │
│   Overtime: 8                │
│   Night Shift: 4             │
│   Holiday: Yes               │
├──────────────────────────────┤
│ EARNINGS                     │ ← Expandable
│ ▼ Basic Pay: ₱30,000.00     │
│   Overtime: ₱250.00          │
│   Night Diff: ₱125.00        │
│   Holiday Pay: ₱300.00       │
│ ────────────────────────     │
│ Gross: ₱30,675.00           │
├──────────────────────────────┤
│ DEDUCTIONS                   │ ← Expandable
│ ▼ SSS: ₱1,350.00            │
│   PhilHealth: ₱750.00        │
│   Pag-IBIG: ₱100.00          │
│   Tax: ₱1,393.40             │
│ ────────────────────────     │
│ Total: ₱3,593.40            │
├──────────────────────────────┤
│ NET PAY: ₱27,081.60         │ ← Highlighted
├──────────────────────────────┤
│ [SHARE] [PRINT] [DOWNLOAD]   │
└──────────────────────────────┘
```

#### Features:

1. **Expandable Sections**
   - Click to expand/collapse each section
   - Show/hide details as needed

2. **Color Coding**
   - Green: Earnings
   - Red: Deductions
   - Blue: Net Pay (highlighted)

3. **Action Buttons**
   - Share (email, messaging)
   - Print (PDF generation)
   - Download (save as PDF to device)

---

### 3. Mobile Time Tracking Screen (Optional for Phase 2+)

**Location:** New activity for daily time entry

#### Screen Layout:

```
┌──────────────────────────────┐
│ TIME TRACKING - Jan 15       │
├──────────────────────────────┤
│ Date: [Jan 15, 2024 ▼]       │
├──────────────────────────────┤
│ TIME IN: 08:00 AM ✓          │
│ TIME OUT: 05:00 PM ✓         │
├──────────────────────────────┤
│ HOURS WORKED: 9.0 hrs        │
├──────────────────────────────┤
│ OVERTIME                     │
│ ☐ Overtime Hours: [0    ]   │
│ Start: [__:__ AM/PM]         │
│ End: [__:__ AM/PM]           │
├──────────────────────────────┤
│ NIGHT SHIFT                  │
│ ☐ Night Shift: [0    ]      │
├──────────────────────────────┤
│ ABSENCES                     │
│ Type: [None ▼]               │
│ Hours: [0    ]               │
├──────────────────────────────┤
│ [SAVE]  [CANCEL]             │
└──────────────────────────────┘
```

---

### 4. Mobile API Integration

**Location:** Retrofit/HTTP client service

#### API Call Implementation:

```kotlin
// Pseudo-code for Kotlin

interface PayrollService {
    @POST("/api/payroll/compute")
    suspend fun computePayroll(
        @Body request: PayrollComputeRequest
    ): PayrollComputeResponse
}

data class PayrollComputeRequest(
    val employeeId: String,
    val monthlyBasicRate: BigDecimal,
    val startDate: String,
    val endDate: String,
    val hoursWorked: BigDecimal,
    val overtimeHours: BigDecimal,
    val nightShiftHours: BigDecimal,
    val holidays: HolidayData,
    val absences: AbsenceData
)

data class HolidayData(
    val regularHolidaysWorked: Boolean,
    val specialHolidaysWorked: Boolean
)

data class AbsenceData(
    val leaveWithPay: BigDecimal,
    val leaveWithoutPay: BigDecimal,
    val sickLeave: BigDecimal
)

data class PayrollComputeResponse(
    val grossPay: BigDecimal,
    val deductions: Map<String, BigDecimal>,
    val netPay: BigDecimal,
    val breakdown: PayrollBreakdown
)

data class PayrollBreakdown(
    val basicPay: BigDecimal,
    val overtimePay: BigDecimal,
    val nightDifferential: BigDecimal,
    val holidayPay: BigDecimal,
    val sss: BigDecimal,
    val philhealth: BigDecimal,
    val pagibig: BigDecimal,
    val tax: BigDecimal,
    val leaveDeduction: BigDecimal
)
```

---

### 5. Mobile State Management

**Location:** ViewModel or equivalent state holder

```kotlin
// Pseudo-code for Android ViewModel

class PayrollViewModel : ViewModel() {
    private val _formState = MutableLiveData<PayrollFormState>()
    val formState: LiveData<PayrollFormState> = _formState

    private val _computeResult = MutableLiveData<PayrollComputeResponse>()
    val computeResult: LiveData<PayrollComputeResponse> = _computeResult

    private val _loading = MutableLiveData<Boolean>(false)
    val loading: LiveData<Boolean> = _loading

    private val _error = MutableLiveData<String>()
    val error: LiveData<String> = _error

    fun updateFormField(field: String, value: Any) {
        // Update specific field in form state
    }

    fun computePayroll() {
        viewModelScope.launch {
            try {
                _loading.value = true
                val request = buildRequest(_formState.value!!)
                val response = payrollService.computePayroll(request)
                _computeResult.value = response
            } catch (e: Exception) {
                _error.value = e.message
            } finally {
                _loading.value = false
            }
        }
    }

    fun resetForm() {
        _formState.value = PayrollFormState()
        _computeResult.value = null
    }
}
```

---

## 🗄️ DATABASE CONSIDERATIONS

### New Tables/Columns Needed:

#### 1. `payroll_entries` Table
```sql
CREATE TABLE payroll_entries (
    id UUID PRIMARY KEY,
    employee_id UUID NOT NULL,
    period_start_date DATE NOT NULL,
    period_end_date DATE NOT NULL,
    monthly_basic_rate DECIMAL(10,2) NOT NULL,
    hours_worked DECIMAL(5,2) DEFAULT 240,
    overtime_hours DECIMAL(5,2) DEFAULT 0,
    night_shift_hours DECIMAL(5,2) DEFAULT 0,
    regular_holiday_worked BOOLEAN DEFAULT FALSE,
    special_holiday_worked BOOLEAN DEFAULT FALSE,
    gross_pay DECIMAL(10,2),
    net_pay DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (employee_id) REFERENCES employees(id)
);
```

#### 2. `payroll_deductions` Table
```sql
CREATE TABLE payroll_deductions (
    id UUID PRIMARY KEY,
    payroll_entry_id UUID NOT NULL,
    deduction_type VARCHAR(50),
    amount DECIMAL(10,2),
    FOREIGN KEY (payroll_entry_id) REFERENCES payroll_entries(id)
);
```

#### 3. `leave_records` Table
```sql
CREATE TABLE leave_records (
    id UUID PRIMARY KEY,
    employee_id UUID NOT NULL,
    payroll_entry_id UUID,
    leave_type VARCHAR(50),
    hours DECIMAL(5,2),
    is_paid BOOLEAN,
    created_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (employee_id) REFERENCES employees(id),
    FOREIGN KEY (payroll_entry_id) REFERENCES payroll_entries(id)
);
```

---

## 🔄 BACKEND API ENDPOINTS

### Existing Endpoints (Update):

```
POST /api/payroll/compute
- Enhanced to accept hours, overtime, leave data
- Returns detailed breakdown with new calculations

GET /api/payroll/{id}
- Returns full payroll record with all details
```

### New Endpoints (Create):

```
GET /api/payroll/employee/{employeeId}
- Get all payroll records for an employee

POST /api/payroll/{id}/regenerate
- Recalculate payroll with updated values

GET /api/holidays
- Get list of holidays for year selection

GET /api/employee/{employeeId}/leave-balance
- Get available leave balance for employee
```

---

## 📊 IMPLEMENTATION PHASES

### Phase 1: Hours-Based Calculation
**Duration:** 2-3 days
- [x] Backend: Hours worked input
- [ ] Web: Add hours worked form field
- [ ] Mobile: Add hours spinnerbar
- [ ] Both: Update payslip display
- [ ] Both: Real-time preview

### Phase 2: Holiday & Overtime
**Duration:** 2-3 days
- [ ] Backend: Holiday pay calculation (already done)
- [ ] Web: Add holiday checkboxes
- [ ] Mobile: Add holiday selection
- [ ] Both: Display overtime/holiday pay in payslip
- [ ] Both: Update calculations

### Phase 3: Leave Tracking
**Duration:** 3-4 days
- [ ] Backend: Leave deduction logic
- [ ] Web: Add leave type selector
- [ ] Mobile: Add leave input
- [ ] Database: Create leave_records table
- [ ] Both: Validate leave balance
- [ ] Both: Display leave deductions

### Phase 4: Time Tracking (Optional)
**Duration:** 3-4 days
- [ ] Web: Time in/out interface
- [ ] Mobile: Time tracking screen
- [ ] Backend: Time entry API
- [ ] Database: time_entries table
- [ ] Auto-calculate hours worked

### Phase 5: Payslip Features
**Duration:** 2-3 days
- [ ] Web: PDF generation/download
- [ ] Mobile: PDF generation
- [ ] Both: Share functionality (email)
- [ ] Both: Print functionality
- [ ] Audit trail

---

## ✅ IMPLEMENTATION CHECKLIST

### Web Application
- [ ] Add hours worked input field
- [ ] Add overtime hours input
- [ ] Add night shift hours input
- [ ] Add holiday worked checkboxes
- [ ] Add leave type dropdown
- [ ] Add leave hours input
- [ ] Update API request structure
- [ ] Update payslip component
- [ ] Add real-time preview
- [ ] Add form validation
- [ ] Update payroll list table
- [ ] Add PDF export
- [ ] Add share functionality
- [ ] Test with sample data

### Mobile Application
- [ ] Add hours spinnerbar
- [ ] Add overtime input
- [ ] Add night shift input
- [ ] Add holiday checkboxes
- [ ] Add leave selection
- [ ] Update payslip view
- [ ] Add expandable sections
- [ ] Update API service
- [ ] Update ViewModel
- [ ] Add PDF download
- [ ] Add share functionality
- [ ] Test on multiple devices

### Database
- [ ] Create payroll_entries table
- [ ] Create payroll_deductions table
- [ ] Create leave_records table
- [ ] Add migration scripts
- [ ] Update models/entities

### Backend
- [ ] New API endpoints
- [ ] Leave balance queries
- [ ] Holiday endpoints
- [ ] Update documentation

---

## 🔗 RELATED BACKEND CHANGES

All backend calculations already implemented in:
- `PayrollConfiguration.java` - All official government tables
- `PayrollComputationService.java` - Computation methods:
  - `computeGrossPayWithOvertime()` - Handles hours + overtime
  - `computeHolidayPay()` - Holiday pay calculation
  - `computeNightDifferential()` - Night shift differential
  - `computeStatutoryDeductions()` - Deductions from official tables
  - `isHoliday()` - Holiday detection

---

## 📝 NOTES

1. **Data Consistency:** Always validate on both frontend and backend
2. **Backward Compatibility:** Support old payroll records without new fields
3. **Timezone:** Consider employee timezone for time-based calculations
4. **Rounding:** All monetary values rounded to 2 decimal places (PHP standard)
5. **Audit Trail:** Log all payroll calculations for compliance
6. **Performance:** Cache holiday and deduction tables on client side
7. **Offline Support (Mobile):** Allow offline entry, sync when online

---

## 🚀 NEXT STEPS

1. Review this document with team
2. Prioritize implementation phases
3. Assign tasks to developers
4. Set up git branches: `feature/web-hours-input`, `feature/mobile-payroll-calc`, etc.
5. Begin Phase 1 implementation
6. Commit and test incrementally

---

**Questions or Clarifications?** Refer to backend files:
- `PayrollConfiguration.java` - Configuration & tables
- `PayrollComputationService.java` - All calculation methods
- Test file: `PayrollComputationServiceTest.java` - Example calculations

