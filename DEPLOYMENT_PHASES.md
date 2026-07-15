# Deployment Readiness Phases (30 Granular Phases)

**Status:** NOT YET STARTED
**Priority:** CRITICAL — Must complete before production launch
**Timeline:** 29.5 days (4.5-5 weeks)
**Risk Level:** MEDIUM-HIGH

Each phase = one focused Git commit. Suggested branch prefix: `deploy/phase-{number}`.

---

## Critical Blocking Issues (Quick Reference)

| # | Issue | Severity | Est. Time |
|---|-------|----------|-----------|
| 1 | Backend: No unit/integration tests | 🔴 CRITICAL | 3-5 days |
| 2 | Backend: SSS/PhilHealth inaccurate (70%/60% vs govt tables) | 🔴 CRITICAL | 1-2 weeks |
| 3 | Backend: No error handling (@ControllerAdvice) | 🔴 CRITICAL | 1 day |
| 4 | Backend: No environment profiles (prod, staging) | 🟡 HIGH | 0.5 day |
| 5 | Mobile: Never built/tested on real device | 🔴 CRITICAL | 2-3 days |
| 6 | Mobile: API URL hardcoded to emulator | 🟡 HIGH | 0.5 day |
| 7 | Mobile: No signing/certificate for release | 🟡 HIGH | 1 day |
| 8 | Web: No E2E tests after refactoring | 🟡 HIGH | 3-5 days |
| 9 | Web: JWT token stored in localStorage (XSS) | 🔴 CRITICAL | 1 day |
| 10 | Web: No CORS/CSP/security headers | 🟡 HIGH | 1 day |
| 11 | All: No Docker/K8s deployment | 🟡 HIGH | 2-3 days |
| 12 | All: No CI/CD pipeline | 🟡 HIGH | 2-3 days |

**See DEPLOYMENT_READINESS_ASSESSMENT.md for full details.**

---

## Backend Hardening (Phases 1-11)

> **Focus:** Error handling, tests, documentation, security, environment config
> **Timeline:** 8-9 days
> **Assignee:** Backend lead

### Phase 1: Global Error Handling Setup
- **Branch:** `deploy/phase-1-error-handling`
- **Tasks:**
  - [ ] Create `ApiException.java` (base exception class)
  - [ ] Create `ResourceNotFoundException.java`
  - [ ] Create `InvalidPayrollCalculationException.java`
  - [ ] Create `ValidationException.java`
  - [ ] Create `ErrorResponse.java` (DTO for API responses)
  - [ ] Create `GlobalExceptionHandler.java` (@ControllerAdvice)
    - [ ] Handle 404 (ResourceNotFoundException)
    - [ ] Handle 400 (ValidationException)
    - [ ] Handle 422 (InvalidPayrollCalculationException)
    - [ ] Handle 500 (generic Exception, no stack trace)
  - [ ] Add `@Valid` annotations to all request DTOs
  - [ ] Test: All existing API tests still pass
- **Est. Time:** 1 day
- **Blocks:** Phases 2-7 (tests depend on error handling)

### Phase 2: PayrollComputationService Unit Tests
- **Branch:** `deploy/phase-2-payroll-unit-tests`
- **Tasks:**
  - [ ] Create `PayrollComputationServiceTest.java`
  - [ ] Test SSS, PhilHealth, Pag-IBIG, BIR calculations (80%+ coverage)
  - [ ] Test gross pay and net pay computations
  - [ ] All tests pass ✅
- **Est. Time:** 2 days
- **Depends on:** Phase 1

### Phase 3: EmployeeService Unit Tests
- **Branch:** `deploy/phase-3-employee-unit-tests`
- **Tasks:**
  - [ ] Create `EmployeeServiceTest.java`
  - [ ] Test getAllEmployees, getEmployeeById, CRUD operations (80%+ coverage)
  - [ ] All tests pass ✅
- **Est. Time:** 1 day
- **Depends on:** Phase 1

### Phase 4: AuthService Unit Tests
- **Branch:** `deploy/phase-4-auth-unit-tests`
- **Tasks:**
  - [ ] Create `AuthServiceTest.java`
  - [ ] Test login, register, token validation (80%+ coverage)
  - [ ] All tests pass ✅
- **Est. Time:** 1 day
- **Depends on:** Phase 1

### Phase 5: PayrollController Integration Tests
- **Branch:** `deploy/phase-5-payroll-integration-tests`
- **Tasks:**
  - [ ] Create `PayrollControllerIntegrationTest.java`
  - [ ] Test CRUD endpoints (POST, GET, PUT, DELETE)
  - [ ] Test auth/authz (401, 403 scenarios)
  - [ ] Use @SpringBootTest with TestRestTemplate
  - [ ] All tests pass ✅
- **Est. Time:** 1.5 days
- **Depends on:** Phase 1

### Phase 6: EmployeeController Integration Tests
- **Branch:** `deploy/phase-6-employee-integration-tests`
- **Tasks:**
  - [ ] Create `EmployeeControllerIntegrationTest.java`
  - [ ] Test CRUD endpoints with auth/authz checks
  - [ ] All tests pass ✅
- **Est. Time:** 1 day
- **Depends on:** Phase 1

### Phase 7: Test Coverage Report & Setup
- **Branch:** `deploy/phase-7-test-coverage`
- **Tasks:**
  - [ ] Add JaCoCo to `pom.xml`
  - [ ] Run `mvn clean test jacoco:report`
  - [ ] Create `TEST_COVERAGE_REPORT.md` (module coverage %)
  - [ ] Verify ≥70% coverage overall
  - [ ] Add `jacoco:check` to Maven verify phase (fail if <70%)
- **Est. Time:** 0.5 day
- **Depends on:** Phases 2-6

### Phase 8: API Documentation (Swagger)
- **Branch:** `deploy/phase-8-api-docs`
- **Tasks:**
  - [ ] Add `springdoc-openapi-starter-webmvc-ui` to `pom.xml`
  - [ ] Add `@OpenAPIDefinition`, `@Operation`, `@ApiResponses` annotations
  - [ ] Add `@Schema` to all DTOs
  - [ ] Verify Swagger UI: http://localhost:8080/swagger-ui.html
  - [ ] Export `API_SPECIFICATION.json`
  - [ ] Create `API_DOCUMENTATION.md`
- **Est. Time:** 1 day
- **Depends on:** None (can start anytime)

### Phase 9: Environment Profiles (Dev/Staging/Prod)
- **Branch:** `deploy/phase-9-env-profiles`
- **Tasks:**
  - [ ] Create `application-prod.properties` (prod config)
  - [ ] Create `application-staging.properties` (staging config)
  - [ ] Create `.env.example` template
  - [ ] Update `application.properties`: set default profile to dev
  - [ ] Create `README_DEPLOYMENT.md` (how to use profiles)
  - [ ] Test: Run with prod profile locally
- **Est. Time:** 0.5 day
- **Depends on:** None

### Phase 10: CORS & Security Headers
- **Branch:** `deploy/phase-10-cors-security`
- **Tasks:**
  - [ ] Create `CorsConfig.java`
  - [ ] Create `SecurityConfig.java` with @EnableWebSecurity
  - [ ] Add security headers (X-Content-Type-Options, X-Frame-Options, CSP, etc.)
  - [ ] Test: `curl -i http://localhost:8080/api/employees` (verify headers)
- **Est. Time:** 1 day
- **Depends on:** None

### Phase 11: Rate Limiting on Auth Endpoints
- **Branch:** `deploy/phase-11-rate-limiting`
- **Tasks:**
  - [ ] Add `bucket4j` to `pom.xml`
  - [ ] Create `RateLimitingFilter.java`
  - [ ] Limit login: 5/min per IP
  - [ ] Limit register: 3/hour per IP
  - [ ] Return 429 Too Many Requests when exceeded
  - [ ] Test rate limiting locally
- **Est. Time:** 1 day
- **Depends on:** None

---

## Web Application Hardening (Phases 12-16)

> **Focus:** Cleanup, environment config, security fixes, E2E testing
> **Timeline:** 4-5 days
> **Assignee:** Web lead
> **Parallel with:** Phases 1-11 (different team)

### Phase 12: Cleanup src/pages/ Folder
- **Branch:** `deploy/phase-12-web-cleanup-pages`
- **Tasks:**
  - [ ] Verify all `src/pages/` content migrated to `src/features/`
  - [ ] Delete `src/pages/` folder entirely
  - [ ] Search for and fix any remaining imports from `src/pages/`
  - [ ] Run `npm run build` (zero errors)
- **Est. Time:** 0.5 day
- **Depends on:** Refactoring phases 1-8 completed

### Phase 13: Environment Configuration (.env Files)
- **Branch:** `deploy/phase-13-web-env-config`
- **Tasks:**
  - [ ] Create `.env.example`, `.env.development`, `.env.staging`, `.env.production`
  - [ ] Update `vite.config.js` to use `import.meta.env`
  - [ ] Update `src/shared/api/client.js` to use `VITE_API_BASE_URL`
  - [ ] Test: `npm run dev` uses localhost, `npm run build` uses prod URL
- **Est. Time:** 0.5 day
- **Depends on:** None

### Phase 14: JWT Token Storage Security Fix
- **Branch:** `deploy/phase-14-web-token-security`
- **Tasks:**
  - [ ] Backend: Modify auth controller to set JWT as httpOnly cookie
  - [ ] Web: Remove localStorage token storage from `AuthContext.jsx`
  - [ ] Web: Configure axios with `withCredentials: true`
  - [ ] Test: Login → verify token in httpOnly cookie (DevTools), NOT localStorage
  - [ ] Test: Refresh page → still authenticated (cookie persists)
- **Est. Time:** 1 day
- **Depends on:** None

### Phase 15: Security Headers (CSP, CORS, X-Frame-Options)
- **Branch:** `deploy/phase-15-web-security-headers`
- **Tasks:**
  - [ ] Backend: Already configured in Phase 10 ✅
  - [ ] Web: Configure web server (Nginx) security headers if serving separately
  - [ ] Test: `curl -i http://localhost:3000` (verify headers)
- **Est. Time:** 0.5 day
- **Depends on:** Phase 10

### Phase 16: E2E Testing Setup (Cypress)
- **Branch:** `deploy/phase-16-web-e2e-tests`
- **Tasks:**
  - [ ] Install Cypress: `npm install --save-dev cypress`
  - [ ] Create `cypress/e2e/critical-path.cy.js` with tests:
    - [ ] Auth flow (register, login, logout)
    - [ ] HR dashboard (view employees, view payroll, generate payslip)
    - [ ] Employee dashboard (view payslips, download)
  - [ ] Run `npm run cypress:run` → all pass ✅
  - [ ] Update `package.json` scripts
- **Est. Time:** 1 day
- **Depends on:** Phase 12

---

## Mobile Application Hardening (Phases 17-20)

> **Focus:** API configuration, APK builds, device testing
> **Timeline:** 4-5 days
> **Assignee:** Mobile lead
> **Parallel with:** Phases 1-16 (different team)

### Phase 17: API URL Configuration
- **Branch:** `deploy/phase-17-mobile-api-config`
- **Tasks:**
  - [ ] Update `build.gradle.kts` with buildConfigField for debug/release
  - [ ] Debug: `API_BASE_URL = "http://10.0.2.2:8080"` (emulator special IP)
  - [ ] Release: `API_BASE_URL = "https://api.paylink.com"`
  - [ ] Update API client to use BuildConfig.API_BASE_URL
  - [ ] Test: Debug build uses emulator URL
- **Est. Time:** 0.5 day
- **Depends on:** None

### Phase 18: Debug APK Build & Emulator Testing
- **Branch:** `deploy/phase-18-mobile-debug-build`
- **Tasks:**
  - [ ] Build debug APK: `./gradlew clean assembleDebug`
  - [ ] Install on emulator (API 24, 30, 34)
  - [ ] Test: Launch, login, dashboard, navigation, logout (no crashes)
  - [ ] Verify API calls succeed (check Logcat)
- **Est. Time:** 1.5 days
- **Depends on:** Phase 17

### Phase 19: Release Build with Keystore Signing
- **Branch:** `deploy/phase-19-mobile-release-build`
- **Tasks:**
  - [ ] Generate release keystore (if not exists)
  - [ ] Update `build.gradle.kts` with signing config
  - [ ] Build release APK: `./gradlew clean assembleRelease`
  - [ ] Verify signed APK with jarsigner
- **Est. Time:** 1 day
- **Depends on:** Phase 18

### Phase 20: Physical Device Testing
- **Branch:** `deploy/phase-20-mobile-device-testing`
- **Tasks:**
  - [ ] Install release APK on devices (API 24, 30, 34)
  - [ ] Test on each device: Launch, login, dashboard, data display, navigation
  - [ ] Verify no crashes or Force Close errors
  - [ ] Create `TESTING_REPORT.md` (device compatibility matrix)
- **Est. Time:** 1.5 days
- **Depends on:** Phase 19

---

## Infrastructure & CI/CD (Phases 21-25)

> **Focus:** Docker containerization, CI/CD pipeline, orchestration
> **Timeline:** 5-6 days
> **Assignee:** DevOps/Infrastructure lead
> **Parallel with:** Phases 1-20

### Phase 21: Docker Backend Image
- **Branch:** `deploy/phase-21-docker-backend`
- **Tasks:**
  - [ ] Create `backend/Dockerfile` (multi-stage, FROM openjdk:19-slim)
  - [ ] Create `backend/.dockerignore`
  - [ ] Build image: `docker build -t paylink-backend:latest backend/`
  - [ ] Test locally: Run container, verify app starts & health check works
- **Est. Time:** 1 day
- **Depends on:** Phase 9 (env profiles)

### Phase 22: Docker Web Image
- **Branch:** `deploy/phase-22-docker-web`
- **Tasks:**
  - [ ] Create `web/Dockerfile` (multi-stage: Node builder + Nginx)
  - [ ] Create `web/nginx.conf` (React routing + API proxy)
  - [ ] Create `web/.dockerignore`
  - [ ] Build image: `docker build -t paylink-web:latest web/`
  - [ ] Test locally: Run container on port 3000, verify app loads
- **Est. Time:** 1 day
- **Depends on:** Phase 13 (env config)

### Phase 23: Docker Compose (Full Stack)
- **Branch:** `deploy/phase-23-docker-compose`
- **Tasks:**
  - [ ] Create `docker-compose.yml` (db, backend, web services)
  - [ ] Create `docker-compose.override.yml` (local dev overrides)
  - [ ] Create `.env.docker.example`
  - [ ] Test: `docker-compose up --build` → all services start, app accessible
- **Est. Time:** 1 day
- **Depends on:** Phases 21-22

### Phase 24: GitHub Actions CI/CD Pipeline
- **Branch:** `deploy/phase-24-github-actions`
- **Tasks:**
  - [ ] Create `.github/workflows/ci.yml`
  - [ ] Backend job: checkout, setup Java, build, test, Docker build
  - [ ] Web job: checkout, setup Node, build, lint, Docker build
  - [ ] Mobile job: checkout, setup Android SDK, build debug/release
  - [ ] Test workflow: Push commit → verify all jobs run ✅
- **Est. Time:** 1.5 days
- **Depends on:** Phases 7, 16, 20 (all tests in place)

### Phase 25: Branch Protection & Auto-Deploy to Staging
- **Branch:** `deploy/phase-25-branch-protection`
- **Tasks:**
  - [ ] Configure GitHub branch protection:
    - [ ] Require CI checks to pass
    - [ ] Require 1+ approver on PRs
    - [ ] Dismiss stale approvals on new commits
  - [ ] Create `.github/workflows/staging-deploy.yml` (auto-deploy after merge to main)
  - [ ] Create `docs/DEPLOYMENT.md` (deployment instructions)
- **Est. Time:** 0.5 day
- **Depends on:** Phase 24

---

## Pre-Launch Validation (Phases 26-30)

> **Focus:** Security audit, performance testing, documentation, go-live readiness
> **Timeline:** 4-5 days
> **Assignee:** QA lead + Security specialist
> **Parallel with:** Infrastructure (phases 21-25)

### Phase 26: Security Audit (OWASP Top 10)
- **Branch:** `deploy/phase-26-security-audit`
- **Tasks:**
  - [ ] Review all 10 OWASP Top 10 items:
    - [ ] Access control, cryptography, injection, design, config, components, auth, data, logging, SSRF
  - [ ] Run `npm audit` (web), `mvn dependency-check:check` (backend)
  - [ ] Verify no critical/high vulnerabilities
  - [ ] Create `docs/SECURITY_AUDIT_REPORT.md` (findings & remediation)
- **Est. Time:** 1 day
- **Depends on:** Phases 10, 14

### Phase 27: Load Testing (100+ Concurrent Users)
- **Branch:** `deploy/phase-27-load-testing`
- **Tasks:**
  - [ ] Setup JMeter or Locust
  - [ ] Create test scenarios: 100 concurrent login, 100 concurrent payroll fetch, etc.
  - [ ] Run against staging: Verify p99 response time < 2 sec, error rate < 1%
  - [ ] Monitor CPU/memory, database connections
  - [ ] Create `docs/LOAD_TEST_REPORT.md` (throughput, response times, bottlenecks)
- **Est. Time:** 1 day
- **Depends on:** Phase 24 (staging env via CI/CD)

### Phase 28: Database Backup & Restore Testing
- **Branch:** `deploy/phase-28-db-backup-restore`
- **Tasks:**
  - [ ] Configure automated PostgreSQL backups
  - [ ] Test backup: `pg_dump paylink > backup.sql`
  - [ ] Test restore: `psql paylink < backup.sql`
  - [ ] Verify data integrity (row counts match)
  - [ ] Create `docs/BACKUP_AND_RESTORE.md` (procedures)
- **Est. Time:** 0.5 day
- **Depends on:** Phase 23 (Docker with database)

### Phase 29: Documentation (Deployment, Operations, Runbooks)
- **Branch:** `deploy/phase-29-documentation`
- **Tasks:**
  - [ ] Create `docs/ARCHITECTURE_OVERVIEW.md`
  - [ ] Create `docs/DEVELOPER_SETUP.md` (local dev guide)
  - [ ] Create `docs/OPERATIONS.md` (monitoring, scaling, troubleshooting)
  - [ ] Create `docs/RUNBOOK_API_DOWN.md` (incident response)
  - [ ] Create `docs/RUNBOOK_DB_SLOW.md` (performance incident)
  - [ ] Create `docs/RUNBOOK_PAYROLL_ERROR.md` (payroll error recovery)
  - [ ] Create `docs/API_CHANGELOG.md`
- **Est. Time:** 1 day
- **Depends on:** All previous phases

### Phase 30: Final Pre-Launch Checklist & Sign-Offs
- **Branch:** `deploy/phase-30-go-live-signoff`
- **Tasks:**
  - [ ] **QA Sign-Off:** All critical user journeys tested ✅  
    Signature: __________________ Date: __________
  - [ ] **Security Sign-Off:** Audit passed, no critical vulnerabilities ✅  
    Signature: __________________ Date: __________
  - [ ] **DevOps Sign-Off:** Load tests passed, infrastructure stable ✅  
    Signature: __________________ Date: __________
  - [ ] **Compliance Sign-Off:** Payroll calculations verified ✅  
    Signature: __________________ Date: __________
  - [ ] **Product/Business Sign-Off:** Stakeholders ready, support trained ✅  
    Signature: __________________ Date: __________
  - [ ] **CTO/Tech Lead Final Sign-Off:** Ready for production ✅ YES / ❌ NO  
    Signature: __________________ Date: __________
  - [ ] Create `docs/DEPLOYMENT_SIGN_OFF.md` (archival)
  - [ ] **GO/NO-GO Decision:** ✅ GO / ❌ NO-GO (if NO-GO, list blockers)
- **Est. Time:** 1 day
- **Depends on:** Phases 26-29

---

## Timeline Summary

| Phase Group | Phases | Est. Days | Status |
|---|---|---|---|
| Backend Hardening | 1-11 | 8-9 | ⏳ Pending |
| Web Hardening | 12-16 | 4-5 | ⏳ Pending |
| Mobile Hardening | 17-20 | 4-5 | ⏳ Pending |
| Infrastructure | 21-25 | 5-6 | ⏳ Pending |
| Pre-Launch Validation | 26-30 | 4-5 | ⏳ Pending |
| **TOTAL** | **1-30** | **29.5 days** | ⏳ Pending |

**Parallel Execution:** Phases 1-11 (backend), 12-16 (web), 17-20 (mobile), and 21-25 (infrastructure) can run in parallel with different team members.

**Total Duration with Parallelization:** ~12-14 days (2 weeks) if sufficient team capacity.

---

## Go/No-Go Criteria for Production Launch

✅ **GO if:**
- [ ] All backend tests passing, no security vulnerabilities
- [ ] Web app fully functional, E2E tests passing, no XSS vulnerabilities
- [ ] Mobile app tested on ≥2 device types, no crashes
- [ ] Docker images building, CI/CD pipeline functional
- [ ] Security audit passed with no critical findings
- [ ] Load testing passed (p99 < 2 sec, error rate < 1%)
- [ ] Backup/restore tested and working
- [ ] All documentation complete
- [ ] All required sign-offs obtained

❌ **NO-GO if:**
- [ ] Any critical security vulnerability found
- [ ] Load testing fails
- [ ] Any critical bug in user journeys
- [ ] Database backup/restore not working
- [ ] Any required sign-off not obtained
