# PayLink Refactoring Report

## 1. Overview

This report summarizes the refactored PayLink backend and its feature implementation.

The backend was reorganized into a vertical-slice, feature-first structure for easier file management and enhanced readability of the project structure.

The refactoring focused on the Spring Boot backend while preserving compatibility with the existing React web client, Android mobile client, and PostgreSQL database.

Project scope covered by this report:

- React web client
- Android mobile client
- Spring Boot backend
- PostgreSQL database through JPA and Flyway

## 2. Refactored Structure

The backend now follows feature-first vertical slices under the features package:

- backend/src/main/java/edu/cit/sevilla/paylink/features/auth
- backend/src/main/java/edu/cit/sevilla/paylink/features/employees
- backend/src/main/java/edu/cit/sevilla/paylink/features/payperiods
- backend/src/main/java/edu/cit/sevilla/paylink/features/payroll
- backend/src/main/java/edu/cit/sevilla/paylink/features/payslips

Each feature groups related classes into these local layers when applicable:

- api
- api/request
- api/response
- application
- domain
- infrastructure

## 3. Shared Components

Not every class was moved into a feature slice. Some packages remain at the root because they are cross-cutting or shared by multiple features:

- backend/src/main/java/edu/cit/sevilla/paylink/security
- backend/src/main/java/edu/cit/sevilla/paylink/repository
- backend/src/main/java/edu/cit/sevilla/paylink/entity
- backend/src/main/java/edu/cit/sevilla/paylink/enums
- backend/src/main/java/edu/cit/sevilla/paylink/exception

## 4. Feature-by-Feature Details

### 4.1 Authentication Slice

Authentication was the first slice migrated and established the pattern used by the later features.

Purpose:

- register new users
- authenticate existing users
- return JWT-based auth responses for secured access

Refactored backend components:

- AuthController -> features/auth/api/AuthController.java
- AuthService -> features/auth/application/AuthService.java
- LoginRequest -> features/auth/api/request/LoginRequest.java
- RegisterRequest -> features/auth/api/request/RegisterRequest.java
- AuthResponse -> features/auth/api/response/AuthResponse.java

Primary endpoints:

- POST /api/auth/register
- POST /api/auth/login

Primary data touched:

- users
- employees

Refactoring effect:

- auth contracts and logic are now in one feature folder
- auth DTOs are co-located with auth API endpoints
- cross-cutting security integration remains intact through shared security components

### 4.2 Employee Slice

The employee capability was then grouped into one feature module.

Purpose:

- list employee records for HR workflows
- fetch employee profiles, including self-profile view
- create and update employee information

Refactored backend components:

- EmployeeController -> features/employees/api/EmployeeController.java
- EmployeeService -> features/employees/application/EmployeeService.java
- CreateEmployeeRequest -> features/employees/api/request/CreateEmployeeRequest.java
- UpdateEmployeeRequest -> features/employees/api/request/UpdateEmployeeRequest.java
- EmployeeDto -> features/employees/api/response/EmployeeDto.java
- Employee -> features/employees/domain/Employee.java
- EmployeeRepository -> features/employees/infrastructure/EmployeeRepository.java

Primary endpoints:

- GET /api/employees
- GET /api/employees/me
- GET /api/employees/{id}
- POST /api/employees
- PUT /api/employees/{id}

Primary data touched:

- employees

Refactoring effect:

- employee CRUD flow is now self-contained in one feature slice
- request and response contracts are easier to find and maintain
- endpoint-to-repository path can be traced without leaving the feature directory

### 4.3 Pay Period Slice

Pay period management was migrated next.

Purpose:

- create payroll periods
- list and retrieve payroll period records
- update payroll period status lifecycle

Refactored backend components:

- PayPeriodController -> features/payperiods/api/PayPeriodController.java
- PayPeriodService -> features/payperiods/application/PayPeriodService.java
- CreatePayPeriodRequest -> features/payperiods/api/request/CreatePayPeriodRequest.java
- PayPeriodDto -> features/payperiods/api/response/PayPeriodDto.java
- PayPeriod -> features/payperiods/domain/PayPeriod.java
- PayPeriodRepository -> features/payperiods/infrastructure/PayPeriodRepository.java

Primary endpoints:

- GET /api/pay-periods
- GET /api/pay-periods/{id}
- POST /api/pay-periods
- PATCH /api/pay-periods/{id}/status

Primary data touched:

- pay_periods

Refactoring effect:

- pay period scheduling logic is now isolated from payroll computation internals
- status update behavior is managed inside one cohesive slice
- future changes to period policies are less likely to affect unrelated modules

### 4.4 Payroll Slice

Payroll processing was migrated after the supporting features were already organized.

Purpose:

- process payroll for an employee in a selected pay period
- compute gross pay, deductions, and net pay
- expose payroll records for HR and employee views

Refactored backend components:

- PayrollController -> features/payroll/api/PayrollController.java
- PayrollService -> features/payroll/application/PayrollService.java
- PayrollComputationService -> features/payroll/application/PayrollComputationService.java
- ProcessPayrollRequest -> features/payroll/api/request/ProcessPayrollRequest.java
- PayrollDto -> features/payroll/api/response/PayrollDto.java
- PayrollItemDto -> features/payroll/api/response/PayrollItemDto.java
- Payroll -> features/payroll/domain/Payroll.java
- PayrollItem -> features/payroll/domain/PayrollItem.java
- PayrollRepository -> features/payroll/infrastructure/PayrollRepository.java
- PayrollItemRepository -> features/payroll/infrastructure/PayrollItemRepository.java

Primary endpoints:

- GET /api/payrolls?payPeriodId={id}
- GET /api/payrolls/me
- GET /api/payrolls/{id}
- POST /api/payrolls/process

Primary data touched:

- payrolls
- payroll_items

Refactoring effect:

- payroll computation and payroll persistence are now co-located
- high-change business rules are easier to maintain and test within one slice
- endpoint, DTO, domain, and repository changes can be reviewed as one feature unit

### 4.5 Payslip Slice

The final business slice migrated was payslips.

Purpose:

- generate payslips from processed payroll data
- list and retrieve payslips for HR operations
- support employee self-service payslip retrieval

Refactored backend components:

- PayslipController -> features/payslips/api/PayslipController.java
- PayslipService -> features/payslips/application/PayslipService.java
- PayslipDto -> features/payslips/api/response/PayslipDto.java
- Payslip -> features/payslips/domain/Payslip.java
- PayslipRepository -> features/payslips/infrastructure/PayslipRepository.java

Primary endpoints:

- GET /api/payslips?payPeriodId={id}
- GET /api/payslips/me
- GET /api/payslips/{id}
- POST /api/payslips/generate/{payrollId}

Primary data touched:

- payslips

Refactoring effect:

- payslip generation and retrieval are now isolated from payroll internals
- HR and employee retrieval paths remain behaviorally consistent
- this completed the end-to-end feature slicing from auth through final payroll output

## 5. Validation Summary

Validation was performed after migration to confirm all core flows still function correctly:

1. register and login
2. create employee and fetch employee self data
3. create pay period
4. process payroll and fetch employee payroll history
5. generate payslip and fetch employee payslip data
