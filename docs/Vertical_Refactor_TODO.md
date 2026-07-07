# Vertical Refactor TODO (Commit-by-Task)

## Rules

- Do exactly one task, verify, then commit.
- Do not mix tasks from different features in one commit.
- Keep API contract unchanged unless explicitly planned.

## Phase 0: Preparation

- [x] P0.1 Confirm branch is vertical-refactor
- [x] P0.2 Verify clean git status before task
- [x] P0.3 Run baseline backend tests

## Phase A: Authentication

- [x] A1 Move AuthController to features/auth/api
- [x] A2 Move AuthService to features/auth/application
- [x] A3 Move auth DTOs to features/auth/api/request and response
- [x] A4 Decide ownership of UserRepository and migrate if feature-owned (kept shared due security/JWT filter usage)
- [x] A5 Auth smoke tests (/api/auth/register, /api/auth/login)

## Phase B: Employees

- [x] B1 Move EmployeeController to features/employees/api
- [x] B2 Move EmployeeService to features/employees/application
- [x] B3 Move employee DTOs to features/employees/api/request and response
- [x] B4 Move EmployeeRepository to features/employees/infrastructure
- [x] B5 Move Employee entity to features/employees/domain (feature-owned)
- [x] B6 Employee endpoint smoke tests

## Phase C: Pay Periods

- [x] C1 Move PayPeriodController to features/payperiods/api
- [x] C2 Move PayPeriodService to features/payperiods/application
- [x] C3 Move pay-period DTOs to features/payperiods/api/request and response
- [x] C4 Move PayPeriodRepository to features/payperiods/infrastructure
- [x] C5 Move PayPeriod entity to features/payperiods/domain
- [x] C6 Pay period endpoint smoke tests

## Phase D: Payroll

- [x] D1 Move PayrollController to features/payroll/api
- [x] D2 Move PayrollService and PayrollComputationService to features/payroll/application
- [x] D3 Move payroll DTOs to features/payroll/api/request and response
- [x] D4 Move PayrollRepository and PayrollItemRepository to features/payroll/infrastructure
- [x] D5 Move Payroll and PayrollItem entities to features/payroll/domain
- [x] D6 Payroll endpoint smoke tests

## Phase E: Payslips

- [x] E1 Move PayslipController to features/payslips/api
- [x] E2 Move PayslipService to features/payslips/application
- [x] E3 Move payslip DTOs/repository/domain to feature package as needed
- [x] E4 Payslip endpoint smoke tests

## Phase F: Cleanup and Validation

- [ ] F1 Remove old empty layer-based backend folders
- [ ] F2 Full backend tests
- [ ] F3 End-to-end smoke flow (auth -> employees -> pay period -> payroll -> payslip)
- [ ] F4 Update architecture docs
