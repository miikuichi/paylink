# PayLink Implementation Explanation Report

## Overview

This document summarizes the implemented PayLink system after the backend vertical-slice refactor.

Scope:

- React web client
- Android mobile client
- Spring Boot backend
- PostgreSQL database via JPA and Flyway

## Architecture Summary

### Backend style

The backend now follows feature-first vertical slices:

- backend/src/main/java/edu/cit/sevilla/paylink/features/auth
- backend/src/main/java/edu/cit/sevilla/paylink/features/employees
- backend/src/main/java/edu/cit/sevilla/paylink/features/payperiods
- backend/src/main/java/edu/cit/sevilla/paylink/features/payroll
- backend/src/main/java/edu/cit/sevilla/paylink/features/payslips

Each feature groups API, application service, domain model, and infrastructure repository in one module.

### Shared packages kept at root

These remain outside feature slices because they are cross-cutting or shared by multiple features:

- backend/src/main/java/edu/cit/sevilla/paylink/security
- backend/src/main/java/edu/cit/sevilla/paylink/repository (shared user repository)
- backend/src/main/java/edu/cit/sevilla/paylink/entity (shared user entity)
- backend/src/main/java/edu/cit/sevilla/paylink/enums
- backend/src/main/java/edu/cit/sevilla/paylink/exception

## Implemented Features

## 1) Authentication

Purpose:

- register and login users
- issue JWT tokens

Backend components:

- backend/src/main/java/edu/cit/sevilla/paylink/features/auth/api/AuthController.java
- backend/src/main/java/edu/cit/sevilla/paylink/features/auth/application/AuthService.java
- backend/src/main/java/edu/cit/sevilla/paylink/features/auth/api/request/LoginRequest.java
- backend/src/main/java/edu/cit/sevilla/paylink/features/auth/api/request/RegisterRequest.java
- backend/src/main/java/edu/cit/sevilla/paylink/features/auth/api/response/AuthResponse.java

Endpoints:

- POST /api/auth/register
- POST /api/auth/login

Tables involved:

- users
- employees

## 2) Employee Management

Purpose:

- list, view, create, and update employee profiles

Backend components:

- backend/src/main/java/edu/cit/sevilla/paylink/features/employees/api/EmployeeController.java
- backend/src/main/java/edu/cit/sevilla/paylink/features/employees/application/EmployeeService.java
- backend/src/main/java/edu/cit/sevilla/paylink/features/employees/infrastructure/EmployeeRepository.java
- backend/src/main/java/edu/cit/sevilla/paylink/features/employees/domain/Employee.java
- backend/src/main/java/edu/cit/sevilla/paylink/features/employees/api/request/CreateEmployeeRequest.java
- backend/src/main/java/edu/cit/sevilla/paylink/features/employees/api/request/UpdateEmployeeRequest.java
- backend/src/main/java/edu/cit/sevilla/paylink/features/employees/api/response/EmployeeDto.java

Endpoints:

- GET /api/employees
- GET /api/employees/me
- GET /api/employees/{id}
- POST /api/employees
- PUT /api/employees/{id}

Table involved:

- employees

## 3) Pay Period Management

Purpose:

- define payroll periods and update period status

Backend components:

- backend/src/main/java/edu/cit/sevilla/paylink/features/payperiods/api/PayPeriodController.java
- backend/src/main/java/edu/cit/sevilla/paylink/features/payperiods/application/PayPeriodService.java
- backend/src/main/java/edu/cit/sevilla/paylink/features/payperiods/infrastructure/PayPeriodRepository.java
- backend/src/main/java/edu/cit/sevilla/paylink/features/payperiods/domain/PayPeriod.java
- backend/src/main/java/edu/cit/sevilla/paylink/features/payperiods/api/request/CreatePayPeriodRequest.java
- backend/src/main/java/edu/cit/sevilla/paylink/features/payperiods/api/response/PayPeriodDto.java

Endpoints:

- GET /api/pay-periods
- GET /api/pay-periods/{id}
- POST /api/pay-periods
- PATCH /api/pay-periods/{id}/status

Table involved:

- pay_periods

## 4) Payroll Processing

Purpose:

- process payroll for an employee in a selected pay period
- compute gross pay, statutory deductions, and net pay

Backend components:

- backend/src/main/java/edu/cit/sevilla/paylink/features/payroll/api/PayrollController.java
- backend/src/main/java/edu/cit/sevilla/paylink/features/payroll/application/PayrollService.java
- backend/src/main/java/edu/cit/sevilla/paylink/features/payroll/application/PayrollComputationService.java
- backend/src/main/java/edu/cit/sevilla/paylink/features/payroll/infrastructure/PayrollRepository.java
- backend/src/main/java/edu/cit/sevilla/paylink/features/payroll/infrastructure/PayrollItemRepository.java
- backend/src/main/java/edu/cit/sevilla/paylink/features/payroll/domain/Payroll.java
- backend/src/main/java/edu/cit/sevilla/paylink/features/payroll/domain/PayrollItem.java
- backend/src/main/java/edu/cit/sevilla/paylink/features/payroll/api/request/ProcessPayrollRequest.java
- backend/src/main/java/edu/cit/sevilla/paylink/features/payroll/api/response/PayrollDto.java
- backend/src/main/java/edu/cit/sevilla/paylink/features/payroll/api/response/PayrollItemDto.java

Endpoints:

- GET /api/payrolls?payPeriodId={id}
- GET /api/payrolls/me
- GET /api/payrolls/{id}
- POST /api/payrolls/process

Tables involved:

- payrolls
- payroll_items

## 5) Payslip Generation and Viewing

Purpose:

- generate payslips from processed payroll
- support HR and employee payslip retrieval flows

Backend components:

- backend/src/main/java/edu/cit/sevilla/paylink/features/payslips/api/PayslipController.java
- backend/src/main/java/edu/cit/sevilla/paylink/features/payslips/application/PayslipService.java
- backend/src/main/java/edu/cit/sevilla/paylink/features/payslips/infrastructure/PayslipRepository.java
- backend/src/main/java/edu/cit/sevilla/paylink/features/payslips/domain/Payslip.java
- backend/src/main/java/edu/cit/sevilla/paylink/features/payslips/api/response/PayslipDto.java

Endpoints:

- GET /api/payslips?payPeriodId={id}
- GET /api/payslips/me
- GET /api/payslips/{id}
- POST /api/payslips/generate/{payrollId}

Table involved:

- payslips

## 6) Security and Role Routing

Purpose:

- enforce route access by role
- validate JWT on secured endpoints

Core files:

- backend/src/main/java/edu/cit/sevilla/paylink/security/SecurityConfig.java
- backend/src/main/java/edu/cit/sevilla/paylink/security/JwtAuthenticationFilter.java
- backend/src/main/java/edu/cit/sevilla/paylink/entity/User.java
- backend/src/main/java/edu/cit/sevilla/paylink/enums/Role.java

## Client Responsibilities

Web:

- web/src/api/client.js
- web/src/api/auth.js
- web/src/api/employees.js
- web/src/api/payroll.js
- web/src/api/payslips.js

Mobile:

- mobile/app/src/main/java/edu/cit/sevilla/paylink/mobile/data/network
- mobile/app/src/main/java/edu/cit/sevilla/paylink/mobile/data/repo
- mobile/app/src/main/java/edu/cit/sevilla/paylink/mobile/ui/screens

## Validation Results

Phase-by-phase validations completed:

- backend tests executed successfully after each feature migration
- endpoint smoke tests executed successfully for each feature

Final end-to-end flow validated:

1. auth register/login
2. employee create and employee self fetch
3. pay period create
4. payroll process and employee payroll self fetch
5. payslip generate and employee payslip self fetch

Result:

- all core flows returned successful responses and persisted data correctly

## Notes for Submission

- Architecture is now feature-sliced in backend features package.
- Shared packages remain intentionally for cross-cutting concerns.
- The repository includes incremental commits per feature migration stage.
