# Shift and Time-Based Payroll Implementation Plan

## Executive Summary

Currently, PayLink's payroll system only supports **basic monthly rate × proration ratio**. To comply with Philippine labor law and properly calculate overtime, night differential, and holiday pay, we need to implement a comprehensive **shift management and time-tracking system**.

This document outlines all required changes from database entities to API endpoints.

---

## Part 1: Philippine Holiday Management System

### 1.1 Holiday Master Table

**What it does:** Stores all Philippine holidays with their classification and pay multipliers

**Why it matters:** Different holidays have different pay rates:
- Regular Holiday: 100% + 50% = 150% of daily rate
- Special Non-Working Day: 100% + 30% = 130% of daily rate
- Special Holiday: 100% + 50% = 150% of daily rate

### 1.1.1 Database Schema

```sql
CREATE TABLE holidays (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    holiday_date DATE NOT NULL UNIQUE,
    holiday_name VARCHAR(255) NOT NULL,
    holiday_type ENUM('REGULAR_HOLIDAY', 'SPECIAL_HOLIDAY', 'SPECIAL_NON_WORKING_DAY') NOT NULL,
    pay_multiplier DECIMAL(3, 2) NOT NULL,  -- 1.50 for Regular, 1.30 for Special Non-Working
    description VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE INDEX idx_holiday_date ON holidays(holiday_date);
CREATE INDEX idx_holiday_type ON holidays(holiday_type);
```

### 1.1.2 Java Entities

**File:** `backend/src/main/java/edu/cit/sevilla/paylink/features/holidays/domain/Holiday.java`

```java
@Entity
@Table(name = "holidays")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Holiday {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "holiday_date", nullable = false, unique = true)
    private LocalDate holidayDate;

    @Column(name = "holiday_name", nullable = false, length = 255)
    private String holidayName;

    @Enumerated(EnumType.STRING)
    @Column(name = "holiday_type", nullable = false, length = 30)
    private HolidayType holidayType;

    @Column(name = "pay_multiplier", nullable = false, precision = 3, scale = 2)
    private BigDecimal payMultiplier;  // 1.50, 1.30, etc.

    @Column(name = "description", length = 500)
    private String description;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
```

**File:** `backend/src/main/java/edu/cit/sevilla/paylink/enums/HolidayType.java`

```java
public enum HolidayType {
    REGULAR_HOLIDAY,              // 150% pay
    SPECIAL_HOLIDAY,               // 150% pay
    SPECIAL_NON_WORKING_DAY        // 130% pay
}
```

### 1.1.3 Sample 2024-2025 Philippine Holidays

```
Date            | Holiday Name                           | Type                  | Multiplier
─────────────────────────────────────────────────────────────────────────────────────────
2024-01-01      | New Year's Day                         | REGULAR_HOLIDAY       | 1.50
2024-02-10      | EDSA Revolution Anniversary            | REGULAR_HOLIDAY       | 1.50
2024-02-12      | Chinese New Year                       | SPECIAL_NON_WORKING    | 1.30
2024-02-14      | Valentine's Day (Special Non-Working)  | SPECIAL_NON_WORKING    | 1.30
2024-03-28      | Maundy Thursday                        | SPECIAL_NON_WORKING    | 1.30
2024-03-29      | Good Friday                            | REGULAR_HOLIDAY       | 1.50
2024-03-30      | Black Saturday                         | SPECIAL_NON_WORKING    | 1.30
2024-04-01      | Easter Monday                          | REGULAR_HOLIDAY       | 1.50
2024-04-09      | Araw ng Kagitingan                     | REGULAR_HOLIDAY       | 1.50
2024-05-01      | Labor Day                              | REGULAR_HOLIDAY       | 1.50
2024-06-12      | Independence Day                       | REGULAR_HOLIDAY       | 1.50
2024-06-17      | Eid'l Fitr (Tentative)                 | SPECIAL_NON_WORKING    | 1.30
2024-08-21      | Ninoy Aquino Day                       | REGULAR_HOLIDAY       | 1.50
2024-08-26      | National Heroes Day                    | REGULAR_HOLIDAY       | 1.50
2024-11-01      | All Saints' Day                        | REGULAR_HOLIDAY       | 1.50
2024-11-30      | Bonifacio Day                          | REGULAR_HOLIDAY       | 1.50
2024-12-08      | Feast of the Immaculate Conception    | REGULAR_HOLIDAY       | 1.50
2024-12-25      | Christmas Day                          | REGULAR_HOLIDAY       | 1.50
2024-12-26      | Additional Special Day (if declared)   | SPECIAL_HOLIDAY       | 1.50
2024-12-30      | Rizal Day                              | REGULAR_HOLIDAY       | 1.50
2024-12-31      | New Year's Eve (Special Non-Working)   | SPECIAL_NON_WORKING    | 1.30
2025-01-01      | New Year's Day                         | REGULAR_HOLIDAY       | 1.50
... (continues for 2025)
```

### 1.1.4 Infrastructure Layer

**File:** `backend/src/main/java/edu/cit/sevilla/paylink/features/holidays/infrastructure/HolidayRepository.java`

```java
public interface HolidayRepository extends JpaRepository<Holiday, Long> {
    Optional<Holiday> findByHolidayDate(LocalDate date);
    List<Holiday> findByHolidayDateBetween(LocalDate start, LocalDate end);
    List<Holiday> findByHolidayType(HolidayType type);
    boolean existsByHolidayDate(LocalDate date);
}
```

### 1.1.5 Service Layer

**File:** `backend/src/main/java/edu/cit/sevilla/paylink/features/holidays/application/HolidayService.java`

```java
@Service
@RequiredArgsConstructor
public class HolidayService {
    
    private final HolidayRepository holidayRepository;
    
    @Transactional(readOnly = true)
    public Optional<Holiday> getHolidayByDate(LocalDate date) {
        return holidayRepository.findByHolidayDate(date);
    }
    
    @Transactional(readOnly = true)
    public List<Holiday> getHolidaysBetween(LocalDate start, LocalDate end) {
        return holidayRepository.findByHolidayDateBetween(start, end);
    }
    
    @Transactional(readOnly = true)
    public boolean isHoliday(LocalDate date) {
        return holidayRepository.existsByHolidayDate(date);
    }
    
    @Transactional(readOnly = true)
    public BigDecimal getPayMultiplier(LocalDate date) {
        return holidayRepository.findByHolidayDate(date)
            .map(Holiday::getPayMultiplier)
            .orElse(BigDecimal.ONE);  // Default 1.0 (no multiplier)
    }
}
```

---

## Part 2: Shift Management System

### 2.1 Shift Master Table

**What it does:** Stores predefined work shifts that employees can be assigned to

**Why it matters:** Determines baseline working hours and enables automatic night differential calculation

### 2.1.1 Database Schema

```sql
CREATE TABLE shifts (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    shift_name VARCHAR(100) NOT NULL UNIQUE,
    shift_type ENUM('DAY_SHIFT', 'NIGHT_SHIFT', 'ROTATING_SHIFT', 'FLEXIBLE') NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    working_hours_per_day DECIMAL(3, 1) NOT NULL,  -- 8.0, 10.0, etc.
    night_differential_start_time TIME,             -- Default 22:00 (10 PM)
    night_differential_end_time TIME,               -- Default 06:00 (6 AM)
    description VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE INDEX idx_shift_type ON shifts(shift_type);
CREATE INDEX idx_shift_active ON shifts(is_active);
```

### 2.1.2 Java Entities

**File:** `backend/src/main/java/edu/cit/sevilla/paylink/enums/ShiftType.java`

```java
public enum ShiftType {
    DAY_SHIFT,        // 8 AM - 5 PM (standard)
    NIGHT_SHIFT,      // 10 PM - 6 AM or similar
    ROTATING_SHIFT,   // Mix of day and night
    FLEXIBLE          // Custom hours per employee
}
```

**File:** `backend/src/main/java/edu/cit/sevilla/paylink/features/shifts/domain/Shift.java`

```java
@Entity
@Table(name = "shifts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Shift {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "shift_name", nullable = false, unique = true, length = 100)
    private String shiftName;

    @Enumerated(EnumType.STRING)
    @Column(name = "shift_type", nullable = false, length = 30)
    private ShiftType shiftType;

    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalTime endTime;

    @Column(name = "working_hours_per_day", nullable = false, precision = 3, scale = 1)
    private BigDecimal workingHoursPerDay;  // 8.0, 10.0, etc.

    @Column(name = "night_differential_start_time")
    private LocalTime nightDifferentialStartTime;  // Default 22:00

    @Column(name = "night_differential_end_time")
    private LocalTime nightDifferentialEndTime;    // Default 06:00

    @Column(name = "description", length = 500)
    private String description;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;
        if (this.isActive == null) {
            this.isActive = true;
        }
        // Default night differential window if not specified
        if (this.nightDifferentialStartTime == null) {
            this.nightDifferentialStartTime = LocalTime.of(22, 0);  // 10 PM
        }
        if (this.nightDifferentialEndTime == null) {
            this.nightDifferentialEndTime = LocalTime.of(6, 0);     // 6 AM
        }
    }

    @PreUpdate
    void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
```

### 2.1.3 Sample Shifts

```
Shift Name           | Type          | Start  | End    | Hours | Night Diff Start | Night Diff End
─────────────────────────────────────────────────────────────────────────────────────────────
Morning Shift        | DAY_SHIFT     | 08:00  | 17:00  | 8.0   | 22:00           | 06:00
Afternoon Shift      | DAY_SHIFT     | 14:00  | 23:00  | 8.0   | 22:00           | 06:00
Evening Shift        | NIGHT_SHIFT   | 18:00  | 03:00  | 8.0   | 22:00           | 06:00
Night Shift          | NIGHT_SHIFT   | 22:00  | 06:00  | 8.0   | 22:00           | 06:00
Extended Day         | DAY_SHIFT     | 08:00  | 18:00  | 10.0  | 22:00           | 06:00
Extended Night       | NIGHT_SHIFT   | 20:00  | 06:00  | 10.0  | 22:00           | 06:00
Flexible             | FLEXIBLE      | NULL   | NULL   | NULL  | 22:00           | 06:00
```

### 2.1.4 Infrastructure & Service

**File:** `backend/src/main/java/edu/cit/sevilla/paylink/features/shifts/infrastructure/ShiftRepository.java`

```java
public interface ShiftRepository extends JpaRepository<Shift, Long> {
    Optional<Shift> findByShiftName(String name);
    List<Shift> findByShiftType(ShiftType type);
    List<Shift> findByIsActive(Boolean isActive);
}
```

**File:** `backend/src/main/java/edu/cit/sevilla/paylink/features/shifts/application/ShiftService.java`

```java
@Service
@RequiredArgsConstructor
public class ShiftService {
    
    private final ShiftRepository shiftRepository;
    
    @Transactional(readOnly = true)
    public Optional<Shift> getShiftById(Long id) {
        return shiftRepository.findById(id);
    }
    
    @Transactional(readOnly = true)
    public Optional<Shift> getShiftByName(String name) {
        return shiftRepository.findByShiftName(name);
    }
    
    @Transactional(readOnly = true)
    public List<Shift> getAllActiveShifts() {
        return shiftRepository.findByIsActive(true);
    }
}
```

---

## Part 3: Employee Shift Assignment

### 3.1 Update Employee Entity

**Current:** `Employee` has no shift information

**Change:** Add shift reference to `Employee` entity

### 3.1.1 Database Schema Change

```sql
ALTER TABLE employees ADD COLUMN shift_id BIGINT;
ALTER TABLE employees ADD FOREIGN KEY (shift_id) REFERENCES shifts(id);
ALTER TABLE employees ADD COLUMN hazard_pay_rate DECIMAL(3, 2);  -- e.g., 0.10 for 10%
ALTER TABLE employees ADD COLUMN has_night_differential BOOLEAN DEFAULT TRUE;

CREATE INDEX idx_employee_shift ON employees(shift_id);
```

### 3.1.2 Updated Employee Entity

**File:** `backend/src/main/java/edu/cit/sevilla/paylink/features/employees/domain/Employee.java`

Add to existing Employee class:

```java
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shift_id")
    private Shift shift;

    @Column(name = "hazard_pay_rate", precision = 3, scale = 2)
    private BigDecimal hazardPayRate;  // e.g., 0.10 for 10% hazard pay

    @Column(name = "has_night_differential", nullable = false)
    @Builder.Default
    private Boolean hasNightDifferential = true;
```

### 3.1.3 Update DTOs

**File:** `backend/src/main/java/edu/cit/sevilla/paylink/features/employees/api/request/CreateEmployeeRequest.java`

Add:
```java
public record CreateEmployeeRequest(
    // ...existing fields...
    Long shiftId,                           // NEW
    BigDecimal hazardPayRate,               // NEW (optional)
    Boolean hasNightDifferential            // NEW (optional)
) { }
```

**File:** `backend/src/main/java/edu/cit/sevilla/paylink/features/employees/api/request/UpdateEmployeeRequest.java`

Add:
```java
public record UpdateEmployeeRequest(
    // ...existing fields...
    Long shiftId,                           // NEW
    BigDecimal hazardPayRate,               // NEW (optional)
    Boolean hasNightDifferential            // NEW (optional)
) { }
```

**File:** `backend/src/main/java/edu/cit/sevilla/paylink/features/employees/api/response/EmployeeDto.java`

Add:
```java
public record EmployeeDto(
    // ...existing fields...
    Long shiftId,                           // NEW
    String shiftName,                       // NEW
    BigDecimal hazardPayRate,               // NEW
    Boolean hasNightDifferential            // NEW
) { }
```

### 3.1.4 Updated EmployeeService

**File:** `backend/src/main/java/edu/cit/sevilla/paylink/features/employees/application/EmployeeService.java`

Update `create()` method:

```java
    private final ShiftRepository shiftRepository;  // ADD INJECTION

    @Transactional
    public EmployeeDto create(CreateEmployeeRequest req) {
        if (userRepository.existsByUsername(req.username())) {
            throw new IllegalArgumentException("Username is already taken");
        }
        if (userRepository.existsByEmail(req.email())) {
            throw new IllegalArgumentException("Email is already registered");
        }

        User user = userRepository.save(User.builder()
                .username(req.username())
                .email(req.email())
                .passwordHash(passwordEncoder.encode(req.password()))
                .role(Role.EMPLOYEE)
                .enabled(true)
                .build());

        // NEW: Get shift if provided
        Shift shift = null;
        if (req.shiftId() != null) {
            shift = shiftRepository.findById(req.shiftId())
                .orElseThrow(() -> new EntityNotFoundException("Shift not found: " + req.shiftId()));
        }

        Employee employee = employeeRepository.save(Employee.builder()
                .user(user)
                .employeeNumber("TMP-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .firstName(req.firstName())
                .lastName(req.lastName())
                .position(req.position())
                .department(req.department())
                .dateHired(req.dateHired())
                .basicRate(req.basicRate().max(MIN_BASIC_RATE))
                .shift(shift)                                    // NEW
                .hazardPayRate(req.hazardPayRate())              // NEW
                .hasNightDifferential(req.hasNightDifferential()) // NEW
                .status(EmployeeStatus.ACTIVE)
                .build());

        employee.setEmployeeNumber("EMP" + String.format("%05d", employee.getId()));
        return EmployeeDto.from(employeeRepository.save(employee));
    }
```

---

## Part 4: Attendance/Time Tracking

### 4.1 Attendance Record Table

**What it does:** Captures actual work hours per employee per day

**Why it matters:** Calculates actual overtime (hours beyond 8/day) and tracks actual daily presence

### 4.1.1 Database Schema

```sql
CREATE TABLE attendance_records (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    employee_id BIGINT NOT NULL,
    attendance_date DATE NOT NULL,
    time_in TIMESTAMP NOT NULL,
    time_out TIMESTAMP,
    hours_worked DECIMAL(4, 2),
    overtime_hours DECIMAL(4, 2),  -- Calculated: hours_worked - 8
    is_on_holiday BOOLEAN DEFAULT FALSE,
    is_on_rest_day BOOLEAN DEFAULT FALSE,
    day_type ENUM('REGULAR_DAY', 'REST_DAY', 'HOLIDAY', 'SPECIAL_HOLIDAY') NOT NULL,
    notes VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id),
    UNIQUE KEY unique_employee_date (employee_id, attendance_date)
);

CREATE INDEX idx_attendance_employee ON attendance_records(employee_id);
CREATE INDEX idx_attendance_date ON attendance_records(attendance_date);
CREATE INDEX idx_attendance_day_type ON attendance_records(day_type);
```

### 4.1.2 Java Entities

**File:** `backend/src/main/java/edu/cit/sevilla/paylink/enums/DayType.java`

```java
public enum DayType {
    REGULAR_DAY,        // Normal working day
    REST_DAY,           // Usually Sunday or employee's rest day
    HOLIDAY,            // Regular Holiday (150% pay)
    SPECIAL_HOLIDAY     // Special Holiday (150% or 130% depending on classification)
}
```

**File:** `backend/src/main/java/edu/cit/sevilla/paylink/features/attendance/domain/AttendanceRecord.java`

```java
@Entity
@Table(name = "attendance_records")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttendanceRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @Column(name = "attendance_date", nullable = false)
    private LocalDate attendanceDate;

    @Column(name = "time_in", nullable = false)
    private LocalDateTime timeIn;

    @Column(name = "time_out")
    private LocalDateTime timeOut;

    @Column(name = "hours_worked", precision = 4, scale = 2)
    private BigDecimal hoursWorked;  // Calculated from timeIn and timeOut

    @Column(name = "overtime_hours", precision = 4, scale = 2)
    private BigDecimal overtimeHours;  // hoursWorked - 8

    @Column(name = "is_on_holiday", nullable = false)
    private Boolean isOnHoliday;

    @Column(name = "is_on_rest_day", nullable = false)
    private Boolean isOnRestDay;

    @Enumerated(EnumType.STRING)
    @Column(name = "day_type", nullable = false, length = 30)
    private DayType dayType;

    @Column(name = "notes", length = 500)
    private String notes;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;
        if (this.isOnHoliday == null) {
            this.isOnHoliday = false;
        }
        if (this.isOnRestDay == null) {
            this.isOnRestDay = false;
        }
        // Calculate hours worked
        if (this.timeOut != null) {
            Duration duration = Duration.between(this.timeIn, this.timeOut);
            this.hoursWorked = BigDecimal.valueOf(duration.toMinutes() / 60.0)
                .setScale(2, RoundingMode.HALF_UP);
            // Calculate overtime (anything beyond 8 hours)
            this.overtimeHours = this.hoursWorked.subtract(BigDecimal.valueOf(8.0))
                .max(BigDecimal.ZERO)
                .setScale(2, RoundingMode.HALF_UP);
        }
    }

    @PreUpdate
    void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
```

### 4.1.3 Infrastructure & Service

**File:** `backend/src/main/java/edu/cit/sevilla/paylink/features/attendance/infrastructure/AttendanceRecordRepository.java`

```java
public interface AttendanceRecordRepository extends JpaRepository<AttendanceRecord, Long> {
    Optional<AttendanceRecord> findByEmployeeIdAndAttendanceDate(Long employeeId, LocalDate date);
    List<AttendanceRecord> findByEmployeeIdAndAttendanceDateBetween(Long employeeId, LocalDate start, LocalDate end);
    List<AttendanceRecord> findByAttendanceDateBetween(LocalDate start, LocalDate end);
    List<AttendanceRecord> findByEmployeeIdAndDayType(Long employeeId, DayType dayType);
}
```

**File:** `backend/src/main/java/edu/cit/sevilla/paylink/features/attendance/application/AttendanceService.java`

```java
@Service
@RequiredArgsConstructor
public class AttendanceService {
    
    private final AttendanceRecordRepository attendanceRepository;
    private final HolidayService holidayService;
    
    @Transactional
    public AttendanceRecord recordTimeIn(Long employeeId, LocalDateTime timeIn) {
        LocalDate today = LocalDate.now();
        AttendanceRecord record = attendanceRepository
            .findByEmployeeIdAndAttendanceDate(employeeId, today)
            .orElseGet(() -> AttendanceRecord.builder()
                .employee(new Employee())  // Will be set by caller
                .attendanceDate(today)
                .isOnHoliday(holidayService.isHoliday(today))
                .isOnRestDay(isSundayOrRestDay(today))
                .dayType(determineDayType(today))
                .build());
        
        record.setTimeIn(timeIn);
        return attendanceRepository.save(record);
    }
    
    @Transactional
    public AttendanceRecord recordTimeOut(Long employeeId, LocalDateTime timeOut) {
        LocalDate today = LocalDate.now();
        AttendanceRecord record = attendanceRepository
            .findByEmployeeIdAndAttendanceDate(employeeId, today)
            .orElseThrow(() -> new EntityNotFoundException("No time-in record for employee on " + today));
        
        record.setTimeOut(timeOut);
        return attendanceRepository.save(record);
    }
    
    @Transactional(readOnly = true)
    public List<AttendanceRecord> getEmployeeAttendance(Long employeeId, LocalDate start, LocalDate end) {
        return attendanceRepository.findByEmployeeIdAndAttendanceDateBetween(employeeId, start, end);
    }
    
    private DayType determineDayType(LocalDate date) {
        if (holidayService.isHoliday(date)) {
            Holiday holiday = holidayService.getHolidayByDate(date).orElse(null);
            return holiday != null && holiday.getHolidayType() == HolidayType.SPECIAL_NON_WORKING_DAY
                ? DayType.SPECIAL_HOLIDAY : DayType.HOLIDAY;
        }
        return isSundayOrRestDay(date) ? DayType.REST_DAY : DayType.REGULAR_DAY;
    }
    
    private boolean isSundayOrRestDay(LocalDate date) {
        return date.getDayOfWeek() == DayOfWeek.SUNDAY;
    }
}
```

---

## Part 5: Enhanced Payroll Computation

### 5.1 New Computation Services

**What they do:** Calculate shift-based pay components

**Why it matters:** Applies proper multipliers for overtime, night differential, and holiday pay

### 5.1.1 Overtime Computation Service

**File:** `backend/src/main/java/edu/cit/sevilla/paylink/features/payroll/application/OvertimeComputationService.java`

```java
@Service
@RequiredArgsConstructor
public class OvertimeComputationService {
    
    private final AttendanceRecordRepository attendanceRepository;
    private final HolidayService holidayService;
    
    /**
     * Calculate overtime pay for a pay period.
     * 
     * Rate: 
     * - 125% for regular day overtime
     * - 130% for rest day overtime  
     * - 169% for holiday overtime
     */
    public BigDecimal calculateOvertimePay(Long employeeId, LocalDate start, LocalDate end, BigDecimal dailyRate) {
        List<AttendanceRecord> records = attendanceRepository
            .findByEmployeeIdAndAttendanceDateBetween(employeeId, start, end);
        
        BigDecimal totalOvertimePay = BigDecimal.ZERO;
        BigDecimal hourlyRate = dailyRate.divide(BigDecimal.valueOf(8.0), 2, RoundingMode.HALF_UP);
        
        for (AttendanceRecord record : records) {
            if (record.getOvertimeHours() != null && record.getOvertimeHours().compareTo(BigDecimal.ZERO) > 0) {
                BigDecimal multiplier = getOvertimeMultiplier(record.getDayType());
                BigDecimal dailyOvertimePay = hourlyRate
                    .multiply(record.getOvertimeHours())
                    .multiply(multiplier)
                    .setScale(2, RoundingMode.HALF_UP);
                totalOvertimePay = totalOvertimePay.add(dailyOvertimePay);
            }
        }
        
        return totalOvertimePay;
    }
    
    private BigDecimal getOvertimeMultiplier(DayType dayType) {
        return switch (dayType) {
            case REGULAR_DAY -> BigDecimal.valueOf(1.25);      // 125%
            case REST_DAY -> BigDecimal.valueOf(1.30);         // 130%
            case HOLIDAY, SPECIAL_HOLIDAY -> BigDecimal.valueOf(1.69);  // 169%
        };
    }
}
```

### 5.1.2 Night Differential Service

**File:** `backend/src/main/java/edu/cit/sevilla/paylink/features/payroll/application/NightDifferentialService.java`

```java
@Service
@RequiredArgsConstructor
public class NightDifferentialService {
    
    /**
     * Calculate night differential for hours worked between 10 PM and 6 AM.
     * Rate: 10% additional pay for night hours
     */
    public BigDecimal calculateNightDifferential(LocalDateTime timeIn, LocalDateTime timeOut, 
                                                  BigDecimal hourlyRate) {
        if (timeOut == null) {
            return BigDecimal.ZERO;
        }
        
        LocalTime nightStart = LocalTime.of(22, 0);  // 10 PM
        LocalTime nightEnd = LocalTime.of(6, 0);    // 6 AM
        
        BigDecimal nightHours = calculateNightHours(timeIn.toLocalTime(), timeOut.toLocalTime(), 
                                                     nightStart, nightEnd);
        
        // Night differential: 10% of hourly rate × night hours
        return hourlyRate
            .multiply(nightHours)
            .multiply(BigDecimal.valueOf(0.10))
            .setScale(2, RoundingMode.HALF_UP);
    }
    
    private BigDecimal calculateNightHours(LocalTime timeIn, LocalTime timeOut, 
                                           LocalTime nightStart, LocalTime nightEnd) {
        // Logic to calculate hours worked during night period
        // Handle cases crossing midnight
        BigDecimal nightHours = BigDecimal.ZERO;
        
        // If entire shift is during night hours
        if (timeIn.isAfter(nightStart) || timeIn.isBefore(nightEnd)) {
            if (timeOut.isAfter(nightStart) || timeOut.isBefore(nightEnd)) {
                Duration duration = Duration.between(timeIn, timeOut);
                if (timeOut.isBefore(timeIn)) {  // Crosses midnight
                    duration = duration.plusHours(24);
                }
                nightHours = BigDecimal.valueOf(duration.toMinutes() / 60.0);
            }
        }
        // If shift crosses into night hours...
        else if (timeOut.isAfter(nightStart)) {
            Duration duration = Duration.between(nightStart, timeOut);
            nightHours = BigDecimal.valueOf(duration.toMinutes() / 60.0);
        }
        
        return nightHours.setScale(2, RoundingMode.HALF_UP);
    }
}
```

### 5.1.3 Holiday Pay Service

**File:** `backend/src/main/java/edu/cit/sevilla/paylink/features/payroll/application/HolidayPayService.java`

```java
@Service
@RequiredArgsConstructor
public class HolidayPayService {
    
    private final HolidayService holidayService;
    
    /**
     * Calculate holiday pay.
     * 
     * If employee worked: Full day rate × holiday multiplier (1.50 or 1.30)
     * If employee didn't work: 100% of daily rate (as substitute)
     */
    public BigDecimal calculateHolidayPay(Long employeeId, LocalDate date, 
                                          BigDecimal dailyRate, Boolean workedOnHoliday) {
        Optional<Holiday> holiday = holidayService.getHolidayByDate(date);
        
        if (holiday.isEmpty()) {
            return BigDecimal.ZERO;
        }
        
        if (workedOnHoliday) {
            // If worked: daily rate × holiday multiplier
            return dailyRate.multiply(holiday.get().getPayMultiplier())
                .setScale(2, RoundingMode.HALF_UP);
        } else {
            // If didn't work: 100% of daily rate as holiday benefit
            return dailyRate;
        }
    }
}
```

### 5.1.4 Updated PayrollComputationService

**File:** `backend/src/main/java/edu/cit/sevilla/paylink/features/payroll/application/PayrollComputationService.java`

Add injections and new methods:

```java
    private final OvertimeComputationService overtimeService;
    private final NightDifferentialService nightDifferentialService;
    private final HolidayPayService holidayPayService;
    private final AttendanceRecordRepository attendanceRepository;

    /**
     * Compute gross pay WITH shift-based components.
     * Includes: basic pay + overtime + night differential + holiday pay
     */
    public BigDecimal computeGrossPayWithShift(Long employeeId, BigDecimal monthlyBasicRate, 
                                               LocalDate start, LocalDate end) {
        BigDecimal basicPay = computeBasicPay(monthlyBasicRate, start, end);
        BigDecimal dailyRate = monthlyBasicRate.divide(BigDecimal.valueOf(26.0), 2, RoundingMode.HALF_UP);
        
        BigDecimal overtimePay = overtimeService.calculateOvertimePay(employeeId, start, end, dailyRate);
        
        // Get attendance records to calculate night differential and holiday pay
        List<AttendanceRecord> records = attendanceRepository
            .findByEmployeeIdAndAttendanceDateBetween(employeeId, start, end);
        
        BigDecimal nightDifferential = BigDecimal.ZERO;
        BigDecimal holidayPay = BigDecimal.ZERO;
        
        for (AttendanceRecord record : records) {
            BigDecimal hourlyRate = dailyRate.divide(BigDecimal.valueOf(8.0), 2, RoundingMode.HALF_UP);
            nightDifferential = nightDifferential.add(
                nightDifferentialService.calculateNightDifferential(record.getTimeIn(), 
                                                                     record.getTimeOut(), hourlyRate)
            );
            holidayPay = holidayPay.add(
                holidayPayService.calculateHolidayPay(employeeId, record.getAttendanceDate(), 
                                                       dailyRate, record.getIsOnHoliday())
            );
        }
        
        return basicPay.add(overtimePay).add(nightDifferential).add(holidayPay)
            .setScale(2, RoundingMode.HALF_UP);
    }
    
    private BigDecimal computeBasicPay(BigDecimal monthlyBasicRate, LocalDate start, LocalDate end) {
        long days = ChronoUnit.DAYS.between(start, end) + 1;
        return monthlyBasicRate
            .multiply(BigDecimal.valueOf(days))
            .divide(BigDecimal.valueOf(30), 2, RoundingMode.HALF_UP);
    }
```

---

## Part 6: Updated API Endpoints

### 6.1 Payroll Processing Request

**File:** `backend/src/main/java/edu/cit/sevilla/paylink/features/payroll/api/request/ProcessPayrollRequest.java`

Updated to handle shift-based calculations:

```java
public record ProcessPayrollRequest(
    @NotNull Long employeeId,
    @NotNull Long payPeriodId,
    @NotNull Boolean includeOvertimeCalculation,    // NEW
    @NotNull Boolean includeNightDifferential,      // NEW
    @NotNull Boolean includeHolidayPay,             // NEW
    List<LineItem> additionalItems
) {
    public record LineItem(
        @NotNull PayrollItemType itemType,
        @NotNull String label,
        @NotNull BigDecimal amount
    ) { }
}
```

### 6.2 Payroll DTO Response

**File:** `backend/src/main/java/edu/cit/sevilla/paylink/features/payroll/api/response/PayrollDto.java`

Add fields to show breakdown:

```java
public record PayrollDto(
    Long id,
    Long employeeId,
    Long payPeriodId,
    BigDecimal basicPay,                    // NEW
    BigDecimal overtimePay,                 // NEW
    BigDecimal nightDifferential,           // NEW
    BigDecimal holidayPay,                  // NEW
    BigDecimal grossPay,
    BigDecimal totalAllowances,
    BigDecimal totalDeductions,
    BigDecimal netPay,
    String status,
    LocalDateTime processedAt,
    List<PayrollItemDto> items
) { }
```

---

## Implementation Summary

### Database Changes Required

1. **Create `holidays` table** — Store Philippine holidays with multipliers
2. **Create `shifts` table** — Store work shift definitions
3. **Create `attendance_records` table** — Track daily time-in/time-out
4. **Alter `employees` table** — Add shift_id, hazard_pay_rate, has_night_differential

### Java Entities Required

| Entity | Purpose |
|--------|---------|
| `Holiday` | Stores holiday data with pay multipliers |
| `Shift` | Stores shift definitions (8 AM-5 PM, 10 PM-6 AM, etc.) |
| `AttendanceRecord` | Tracks employee time-in/time-out and calculates hours worked |
| Updated `Employee` | References shift and hazard pay settings |

### Services Required

| Service | Purpose |
|---------|---------|
| `HolidayService` | CRUD operations for holidays, lookup by date |
| `ShiftService` | CRUD operations for shifts |
| `AttendanceService` | Time-in, time-out, daily attendance tracking |
| `OvertimeComputationService` | Calculate overtime pay (125%-169%) based on day type |
| `NightDifferentialService` | Calculate 10% night differential for 10 PM-6 AM hours |
| `HolidayPayService` | Calculate holiday pay (150% or 130% based on holiday type) |
| Updated `PayrollComputationService` | Enhanced to use all shift-based components |

### API Changes Required

1. **Employee endpoints** — Accept shift assignment during create/update
2. **Payroll processing** — Accept flags for overtime, night differential, holiday pay inclusion
3. **New attendance endpoints** — Time-in, time-out, attendance history
4. **New holiday endpoints** — CRUD for holiday master
5. **New shift endpoints** — CRUD for shift master

---

## Calculation Flow (Updated)

```
INPUT:
- Employee with assigned shift (e.g., 6 PM - 3 AM)
- Pay period (2024-06-01 to 2024-06-15)
- Attendance records (daily time-in/time-out)
- Holiday calendar

PROCESSING:
1. Load employee shift & attendance records
2. For each day in pay period:
   a. Calculate hours worked
   b. Determine if holiday/rest day/regular day
   c. Calculate overtime (hours > 8)
   d. Calculate night differential (10 PM - 6 AM hours × 10%)
3. Apply multipliers:
   - Overtime: ×1.25 (regular), ×1.30 (rest day), ×1.69 (holiday)
   - Night differential: ×1.10 (10% additional)
   - Holiday: ×1.50 (regular holiday) or ×1.30 (special non-working)
4. Sum all components into gross pay
5. Apply statutory deductions (SSS, PhilHealth, Pag-IBIG, Tax)
6. Calculate net pay

OUTPUT:
Payroll record with:
- Basic pay: ₱15,000
- Overtime pay: ₱500
- Night differential: ₱750
- Holiday pay: ₱250
- Total gross: ₱16,500
- Statutory deductions: ₱2,100
- Additional deductions: ₱500
- Net pay: ₱13,900
```

---

## Timeline & Effort Estimate

| Phase | Component | Effort | Timeline |
|-------|-----------|--------|----------|
| 1 | Holiday Master + Service | 1 day | 8 hours |
| 2 | Shift Master + Service | 1 day | 8 hours |
| 3 | Attendance System + Service | 2 days | 16 hours |
| 4 | Overtime & Night Differential Services | 2 days | 16 hours |
| 5 | Updated Employee Entity & APIs | 1.5 days | 12 hours |
| 6 | Enhanced PayrollComputationService | 1.5 days | 12 hours |
| 7 | Database Migrations & Seed Data | 1 day | 8 hours |
| 8 | Integration Testing | 2 days | 16 hours |
| **Total** | | **11.5 days** | **96 hours** |

---

## Priority

### Phase 1 (Critical - Do First)
- Holiday Master table & service
- Shift Master table & service
- Employee shift assignment (update Employee entity)

### Phase 2 (Important - Do Next)
- Attendance system & service
- Overtime computation service
- Night differential service

### Phase 3 (Polish - Do Last)
- Holiday pay service
- Enhanced payroll computation
- API updates
- Integration testing

