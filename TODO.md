# PayLink Refactoring To-Do List

Goal: Migrate both `web` and `mobile` to a **vertical-slice / feature-first** architecture,
matching the pattern already established in the backend.

Each checklist block = one focused Git commit.
Suggested branch prefix: `refactor/`.

---

## Legend

- [ ] Pending
- [x] Done

---

## Web — Current vs Target

### Current (horizontal layers)
```
src/
  api/          ← all API calls in one flat folder
  auth/         ← context, guard, mock data mixed together
  components/ui/← shared UI
  data/         ← stale mock data
  layouts/      ← shared layouts
  pages/
    auth/       ← login + register pages
    employee/   ← monolithic EmployeeDashboard.jsx (414 lines)
    hr/         ← monolithic HrDashboard.jsx (1013 lines)
  styles/
```

### Target (vertical slices)
```
src/
  features/
    auth/               ← everything auth needs
    employees/          ← employee CRUD slice (used by HR)
    payroll/            ← pay-period + payroll slice
    payslips/           ← payslip slice
    hr-dashboard/       ← HR shell + overview section
    employee-dashboard/ ← Employee shell + sections
  shared/
    api/                ← axios client only
    components/ui/      ← design system components
    icons/              ← consolidated SVG icon set
    layouts/            ← AuthLayout, DashboardLayout
    styles/             ← global.css, tokens.css
  App.jsx
  main.jsx
```

---

## Web Refactoring Checklist

### `refactor/web-shared-core`
> Extract the cross-cutting shared infrastructure before touching any feature.

- [x] Create `src/shared/api/client.js` — move content from `src/api/client.js`
- [x] Create `src/shared/components/ui/` — move all files from `src/components/ui/`
- [x] Create `src/shared/layouts/` — move `src/layouts/AuthLayout.*` and `DashboardLayout.*`
- [x] Create `src/shared/icons/index.jsx` — consolidate all inline SVG icon components
  - Deduplicate `GridIcon`, `WalletIcon`, `DocIcon` (currently defined in both dashboards)
  - Include `PeopleIcon`, `PlusIcon`, `CalendarIcon`, `DownloadIcon`, `CheckIcon`, etc.
- [x] Move `src/styles/` → `src/shared/styles/`
- [x] Update every existing import that references the old paths
- [x] Delete the now-empty `src/components/`, `src/layouts/`, `src/styles/`

---

### `refactor/web-feature-auth`
> Collapse the `src/auth/` + `src/api/auth.js` + `src/pages/auth/` silos into one slice.

- [x] Create `src/features/auth/` folder
- [x] Move `src/api/auth.js` → `src/features/auth/api.js`
- [x] Move `src/auth/AuthContext.jsx` → `src/features/auth/AuthContext.jsx`
- [x] Move `src/auth/ProtectedRoute.jsx` → `src/features/auth/ProtectedRoute.jsx`
- [x] Move `src/pages/auth/LoginPage.jsx` → `src/features/auth/LoginPage.jsx`
- [x] Move `src/pages/auth/RegisterPage.jsx` → `src/features/auth/RegisterPage.jsx`
- [x] Move `src/pages/auth/AuthForm.css` → `src/features/auth/AuthForm.css`
- [x] Delete `src/auth/mockAccounts.js` (unused legacy file)
- [x] Fix all internal imports within the new `auth/` slice
- [x] Update `App.jsx` to import from `features/auth/`
- [x] Delete the now-empty `src/auth/` and `src/pages/auth/`

---

### `refactor/web-feature-employees`
> Carve the employee-management concern out of `HrDashboard.jsx` into its own slice.

- [x] Create `src/features/employees/` folder
- [x] Move `src/api/employees.js` → `src/features/employees/api.js`
- [x] Create `src/features/employees/hooks/useEmployees.js`
  - Extract employee state + `handleAddEmployee` / `handleEditEmployee` logic from `HrDashboard.jsx`
- [x] Create `src/features/employees/components/EmployeeTable.jsx`
  - Extract the employee `<DataTable>` block from `HrDashboard.jsx`
- [x] Create `src/features/employees/components/AddEmployeeModal.jsx`
  - Extract the add-employee form/modal from `HrDashboard.jsx`
- [x] Create `src/features/employees/components/EditEmployeeModal.jsx`
  - Extract the edit-rate form/modal from `HrDashboard.jsx`
- [x] Export a clean public API from `src/features/employees/index.js`

---

### `refactor/web-feature-payroll`
> Carve pay-period + payroll processing out of `HrDashboard.jsx`.

- [x] Create `src/features/payroll/` folder
- [x] Move `src/api/payroll.js` → `src/features/payroll/api.js`
- [x] Create `src/features/payroll/hooks/usePayroll.js`
  - Extract payroll/pay-period state + handlers from `HrDashboard.jsx`
- [x] Create `src/features/payroll/components/PayPeriodSelector.jsx`
  - Extract the pay-period `<select>` / period-switching UI
- [x] Create `src/features/payroll/components/PayrollTable.jsx`
  - Extract the payroll `<DataTable>` block
- [x] Create `src/features/payroll/components/AddPayPeriodModal.jsx`
  - Extract the add-period form/modal
- [x] Export a clean public API from `src/features/payroll/index.js`

---

### `refactor/web-feature-payslips`
> Carve payslip generation + viewing out of both dashboards.

- [x] Create `src/features/payslips/` folder
- [x] Move `src/api/payslips.js` → `src/features/payslips/api.js`
- [x] Create `src/features/payslips/hooks/usePayslips.js`
  - Extract payslip state + handlers from `HrDashboard.jsx` and `EmployeeDashboard.jsx`
- [x] Create `src/features/payslips/components/PayslipTable.jsx`
  - Extract the payslips `<DataTable>` block (used by both roles)
- [x] Create `src/features/payslips/components/PayslipDetailCard.jsx`
  - Extract the payslip breakdown card from `EmployeeDashboard.jsx`
- [x] Create `src/features/payslips/components/GeneratePayslipAction.jsx`
  - Extract the HR "Generate" button + logic from `HrDashboard.jsx`
- [x] Export a clean public API from `src/features/payslips/index.js`

---

### `refactor/web-feature-hr-dashboard`
> Reduce `HrDashboard.jsx` from a 1013-line monolith to a thin orchestrator.

- [x] Create `src/features/hr-dashboard/` folder
- [x] Create `src/features/hr-dashboard/sections/HrOverviewSection.jsx`
  - Extract the overview stats + summary panels
- [x] Create `src/features/hr-dashboard/sections/HrEmployeesSection.jsx`
  - Compose from `features/employees` components
- [x] Create `src/features/hr-dashboard/sections/HrPayrollSection.jsx`
  - Compose from `features/payroll` components
- [x] Create `src/features/hr-dashboard/sections/HrPayslipsSection.jsx`
  - Compose from `features/payslips` components
- [x] Rewrite `HrDashboard.jsx` as a thin shell (nav + section routing only) → move to `src/features/hr-dashboard/HrDashboard.jsx`
- [x] Move `src/pages/hr/Dashboard.css` → `src/features/hr-dashboard/HrDashboard.css`
- [x] Update `App.jsx` import
- [ ] Delete `src/pages/hr/`

---

### `refactor/web-feature-employee-dashboard`
> Same treatment for `EmployeeDashboard.jsx`.

- [x] Create `src/features/employee-dashboard/` folder
- [x] Create `src/features/employee-dashboard/sections/EmployeeOverviewSection.jsx`
  - Extract stat cards + latest payslip card + quick-info panel
- [x] Create `src/features/employee-dashboard/sections/EmployeePayslipsSection.jsx`
  - Compose from `features/payslips` components
- [x] Create `src/features/employee-dashboard/sections/EmployeePayrollHistorySection.jsx`
  - Compose from `features/payroll` components
- [x] Rewrite `EmployeeDashboard.jsx` as a thin shell → move to `src/features/employee-dashboard/EmployeeDashboard.jsx`
- [x] Move `src/pages/employee/Dashboard.css` → `src/features/employee-dashboard/EmployeeDashboard.css`
- [x] Update `App.jsx` import
- [ ] Delete `src/pages/employee/`

---

### `refactor/web-cleanup`
> Remove every now-empty old folder and verify the build.

- [x] Delete `src/api/` (all files moved to feature slices)
- [x] Delete `src/data/mockPayroll.js` (stale mock, unused in production paths)
- [x] Delete `src/pages/` (should be empty by now)
- [x] Confirm `App.jsx` has no remaining imports from old paths
- [x] Run `npm run build` — zero errors, zero dead imports

---
---

## Mobile — Current vs Target

### Current (horizontal layers)
```
mobile/data/
  model/
    AuthModels.kt     ← all auth DTOs + Session
    DomainModels.kt   ← ALL other DTOs in one file
  network/
    AuthApi.kt, EmployeeApi.kt, PayPeriodApi.kt,
    PayrollApi.kt, PayslipApi.kt, NetworkModule.kt, ApiError.kt
  repo/
    AuthRepository.kt
    DashboardRepository.kt  ← God-repository (employees + payroll + payslips + pay-periods)
    SessionStore.kt

mobile/ui/
  navigation/NavRoutes.kt
  screens/
    auth/   AuthViewModel, LoginScreen, RegisterScreen
    dashboard/ HrDashboardScreen+VM, EmployeeDashboardScreen+VM
  theme/  Color, Theme, Type

PayLinkMobileApp.kt   ← manual DI + NavHost wiring (164 lines)
```

### Target (vertical slices)
```
features/
  auth/
    data/model/, data/network/, data/repository/
    ui/  AuthViewModel, LoginScreen, RegisterScreen
  employees/
    data/model/, data/network/, data/repository/
  payroll/
    data/model/, data/network/, data/repository/
  payperiods/
    data/model/, data/network/, data/repository/
  payslips/
    data/model/, data/network/, data/repository/
  hr-dashboard/
    ui/  HrDashboardViewModel, HrDashboardScreen
         sections/  OverviewSection, EmployeesSection,
                    PayrollSection, PayslipsSection
  employee-dashboard/
    ui/  EmployeeDashboardViewModel, EmployeeDashboardScreen
         sections/  OverviewSection, PayslipsSection,
                    PayrollHistorySection

core/
  network/   NetworkModule.kt, ApiError.kt
  session/   SessionStore.kt
  navigation/ NavRoutes.kt
  ui/theme/  Color.kt, Theme.kt, Type.kt
```

---

## Mobile Refactoring Checklist

### `refactor/mobile-core`
> Extract the cross-cutting infrastructure before touching any feature.

- [x] Create `core/network/` package — move `NetworkModule.kt` and `ApiError.kt`
- [x] Create `core/session/` package — move `SessionStore.kt`
- [x] Create `core/navigation/` package — move `NavRoutes.kt`
- [x] Create `core/ui/theme/` package — move `Color.kt`, `Theme.kt`, `Type.kt`
- [x] Update all `package` declarations in the moved files
- [x] Fix all import references in `PayLinkMobileApp.kt`, `AuthRepository.kt`, `DashboardRepository.kt`, screen files

---

### `refactor/mobile-feature-auth`
> Collapse `data/model/AuthModels.kt` + `data/network/AuthApi.kt` + `data/repo/AuthRepository.kt` + `ui/screens/auth/` into one slice.

- [x] Create `features/auth/data/model/` package
  - Move `LoginRequest`, `RegisterRequest`, `AuthResponse`, `Session` out of `AuthModels.kt`
- [x] Create `features/auth/data/network/` package — move `AuthApi.kt`
- [x] Create `features/auth/data/repository/` package — move `AuthRepository.kt`
- [x] Create `features/auth/ui/` package — move `AuthViewModel.kt`, `LoginScreen.kt`, `RegisterScreen.kt`
- [x] Update `package` declarations in all moved files
- [x] Update imports in `PayLinkMobileApp.kt` and `NetworkModule.kt`
- [x] Delete the now-empty `data/model/AuthModels.kt`, `ui/screens/auth/`

---

### `refactor/mobile-feature-employees`
> Extract the employee domain out of the God-repository into its own slice.

- [x] Create `features/employees/data/model/` package
  - Extract `EmployeeProfile`, `CreateEmployeeRequest`, `UpdateEmployeeRequest` from `DomainModels.kt`
- [x] Create `features/employees/data/network/` package — move `EmployeeApi.kt`
- [x] Create `features/employees/data/repository/EmployeeRepository.kt`
- [x] Update `package` declarations in all moved/new files
- [x] Update imports in `DashboardRepository.kt` and `AuthRepository.kt`
- [x] Update `NetworkModule.kt` to use feature `EmployeeApi`
- [x] Remove employee models from `DomainModels.kt`

---

### `refactor/mobile-feature-payperiods`
> Extract the pay-period domain into its own slice.

- [x] Create `features/payperiods/data/model/` package
  - Extract `PayPeriodDto`, `CreatePayPeriodRequest` from `DomainModels.kt`
- [x] Create `features/payperiods/data/network/` package — move `PayPeriodApi.kt`
- [x] Create `features/payperiods/data/repository/PayPeriodRepository.kt`
- [x] Update `package` declarations in all moved/new files
- [x] Update imports in `DashboardRepository.kt`
- [x] Update `NetworkModule.kt` to use feature `PayPeriodApi`
- [x] Remove payperiod models from `DomainModels.kt`

---

### `refactor/mobile-feature-payroll`
> Extract the payroll domain into its own slice.

- [x] Create `features/payroll/data/model/` package
  - Extract `PayrollDto`, `PayrollItemDto`, `ProcessPayrollRequest` from `DomainModels.kt`
- [x] Create `features/payroll/data/network/` package — move `PayrollApi.kt`
- [x] Create `features/payroll/data/repository/PayrollRepository.kt`
- [x] Update `package` declarations in all moved/new files
- [x] Update imports in `DashboardRepository.kt`
- [x] Update `NetworkModule.kt` to use feature `PayrollApi`
- [x] Remove payroll models from `DomainModels.kt`

---

### `refactor/mobile-feature-payslips`
> Extract the payslip domain into its own slice.

- [x] Create `features/payslips/data/model/` package
  - Extract `PayslipDto` from `DomainModels.kt`
- [x] Create `features/payslips/data/network/` package — move `PayslipApi.kt`
- [x] Create `features/payslips/data/repository/PayslipRepository.kt`
- [x] Update `package` declarations in all moved/new files
- [x] Update imports in `DashboardRepository.kt`
- [x] Update `NetworkModule.kt` to use feature `PayslipApi`
- [x] Remove payslip models from `DomainModels.kt`
- [x] Delete old `data/model/` and `data/network/` folders

---

### `refactor/mobile-feature-hr-dashboard`
> Slim down `HrDashboardViewModel` and decompose `HrDashboardScreen` into sections.

- [x] Create `features/hr-dashboard/ui/` package
- [x] Rewrite `HrDashboardViewModel.kt` to inject feature repositories instead of `DashboardRepository`
- [x] Move `HrDashboardScreen.kt` → `features/hr-dashboard/ui/HrDashboardScreen.kt`
- [x] Update all imports to use feature models and core theme
- [x] Update `PayLinkMobileApp.kt` imports and ViewModel factory wiring
- [x] Delete old `ui/screens/dashboard/HrDashboardScreen.kt` and `HrDashboardViewModel.kt`

---

### `refactor/mobile-feature-employee-dashboard`
> Same treatment for the employee-facing dashboard.

- [ ] Create `features/employee-dashboard/ui/` package
- [ ] Rewrite `EmployeeDashboardViewModel.kt` to inject `EmployeeRepository`, `PayrollRepository`, `PayslipRepository` directly
- [ ] Move `EmployeeDashboardScreen.kt` → `features/employee-dashboard/ui/EmployeeDashboardScreen.kt`
- [ ] Create `features/employee-dashboard/ui/sections/EmployeeOverviewSection.kt` — extract stat cards + payslip summary
- [ ] Create `features/employee-dashboard/ui/sections/EmployeePayslipsSection.kt` — extract payslips tab composable
- [ ] Create `features/employee-dashboard/ui/sections/EmployeePayrollHistorySection.kt` — extract payroll-history tab composable
- [ ] Update `EmployeeDashboardScreen.kt` to delegate to section composables
- [ ] Update `PayLinkMobileApp.kt` imports and ViewModel factory wiring

---

### `refactor/mobile-cleanup`
> Remove all old horizontal-layer folders and verify the build.

- [ ] Delete `data/model/DomainModels.kt` (all types now live in feature model packages)
- [ ] Delete `data/model/AuthModels.kt` (moved to `features/auth`)
- [ ] Delete `data/model/` folder (should be empty)
- [ ] Delete `data/network/` folder (all API interfaces moved to feature packages)
- [ ] Delete `data/repo/DashboardRepository.kt` (replaced by per-feature repositories)
- [ ] Delete `data/repo/` folder (AuthRepository + SessionStore already moved)
- [ ] Delete `data/` folder (should be empty)
- [ ] Delete `ui/screens/auth/` and `ui/screens/dashboard/` (moved to feature packages)
- [ ] Delete `ui/screens/` and `ui/navigation/` and `ui/theme/` (moved to core/feature packages)
- [ ] Slim down `PayLinkMobileApp.kt` — update DI wiring to use only `core/` and `features/` packages
- [ ] Run `./gradlew.bat :app:assembleDebug` — zero compilation errors

---

## Commit Order Summary

| # | Commit branch | Scope |
|---|---|---|
| 1 | `refactor/web-shared-core` | Web shared infrastructure |
| 2 | `refactor/web-feature-auth` | Web auth slice |
| 3 | `refactor/web-feature-employees` | Web employees slice |
| 4 | `refactor/web-feature-payroll` | Web payroll slice |
| 5 | `refactor/web-feature-payslips` | Web payslips slice |
| 6 | `refactor/web-feature-hr-dashboard` | Web HR dashboard decomposition |
| 7 | `refactor/web-feature-employee-dashboard` | Web employee dashboard decomposition |
| 8 | `refactor/web-cleanup` | Web — delete old layer folders |
| 9 | `refactor/mobile-core` | Mobile core infrastructure |
| 10 | `refactor/mobile-feature-auth` | Mobile auth slice |
| 11 | `refactor/mobile-feature-employees` | Mobile employees slice |
| 12 | `refactor/mobile-feature-payperiods` | Mobile pay-periods slice |
| 13 | `refactor/mobile-feature-payroll` | Mobile payroll slice |
| 14 | `refactor/mobile-feature-payslips` | Mobile payslips slice |
| 15 | `refactor/mobile-feature-hr-dashboard` | Mobile HR dashboard decomposition |
| 16 | `refactor/mobile-feature-employee-dashboard` | Mobile employee dashboard decomposition |
| 17 | `refactor/mobile-cleanup` | Mobile — delete old layer folders |
