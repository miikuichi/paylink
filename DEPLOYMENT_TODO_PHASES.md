# PayLink Deployment Readiness - Detailed Phases

**Goal:** Break down the 2.5-4 week deployment readiness work into 17 granular phases, each representing one focused Git commit/PR.

**Status:** PENDING - Ready to start

---

## Deployment Readiness Phase 1: Backend Error Handling & Validation (1 day)

**Branch:** `deploy/backend-error-handling`

Goal: Add global exception handling, input validation, and proper HTTP error responses.

### Tasks

- [ ] Create `backend/src/main/java/edu/cit/sevilla/paylink/exception/ApiException.java` (base exception)
- [ ] Create `backend/src/main/java/edu/cit/sevilla/paylink/exception/ResourceNotFoundException.java`
- [ ] Create `backend/src/main/java/edu/cit/sevilla/paylink/exception/InvalidPayrollCalculationException.java`
- [ ] Create `backend/src/main/java/edu/cit/sevilla/paylink/exception/ValidationException.java`
- [ ] Create `backend/src/main/java/edu/cit/sevilla/paylink/api/response/ErrorResponse.java` (consistent error format)
- [ ] Create `backend/src/main/java/edu/cit/sevilla/paylink/api/advice/GlobalExceptionHandler.java` (@ControllerAdvice)
  - [ ] Handle EntityNotFoundException → 404
  - [ ] Handle ValidationException → 400
  - [ ] Handle IllegalArgumentException → 400
  - [ ] Handle Generic Exception → 500
- [ ] Add @Valid annotations to all @RestController request DTOs
- [ ] Test: Verify 404, 400, 500 responses work correctly
- [ ] Verify: No stack traces exposed in error responses
- [ ] PR: Create pull request, get code review, merge to main

---

## Deployment Readiness Phase 2: Backend Unit Tests - Payroll Service (2 days)

**Branch:** `deploy/backend-payroll-tests`

Goal: Achieve 80%+ test coverage for PayrollComputationService.

### Tasks

- [ ] Create `backend/src/test/java/edu/cit/sevilla/paylink/features/payroll/application/PayrollComputationServiceTest.java`
  - [ ] Test `computeGrossPay()` with various day counts (5, 15, 30 days)
  - [ ] Test `computeStatutoryDeductions()` for all 4 deductions (SSS, PhilHealth, Pag-IBIG, Tax)
  - [ ] Test SSS calculation with min/max MSC ranges (₱4,250 - ₱30,000)
  - [ ] Test PhilHealth with salary clipping (min ₱10,000, max ₱100,000)
  - [ ] Test Pag-IBIG with 1% rate (salary ≤ ₱1,500) vs 2% rate (salary > ₱1,500)
  - [ ] Test Withholding Tax with all 6 TRAIN Law brackets
  - [ ] Test edge cases: salary ₱0, salary NULL, negative numbers, very high salaries
- [ ] Run tests: `mvn test` — verify all pass
- [ ] Coverage check: `mvn jacoco:report` — verify ≥ 80% coverage on PayrollComputationService
- [ ] Document test results
- [ ] PR: Create pull request, get code review, merge to main

---

## Deployment Readiness Phase 3: Backend Unit Tests - Employee Service (1 day)

**Branch:** `deploy/backend-employee-service-tests`

Goal: Test EmployeeService CRUD operations and validation.

### Tasks

- [ ] Create `backend/src/test/java/edu/cit/sevilla/paylink/features/employees/application/EmployeeServiceTest.java`
  - [ ] Test `create()` with valid employee data
  - [ ] Test `create()` with duplicate username → throw exception
  - [ ] Test `create()` with duplicate email → throw exception
  - [ ] Test `create()` with salary below MIN_BASIC_RATE → verify enforcement
  - [ ] Test `findById()` with valid ID → return employee
  - [ ] Test `findById()` with invalid ID → throw EntityNotFoundException
  - [ ] Test `findByUserId()` with valid user ID
  - [ ] Test `findByUserId()` with invalid user ID → throw exception
  - [ ] Test `update()` with valid updates
  - [ ] Test employee number generation format (EMP##### pattern)
- [ ] Run tests: `mvn test` — verify all pass
- [ ] Verify: No regression in existing functionality
- [ ] PR: Create pull request, get code review, merge to main

---

## Deployment Readiness Phase 4: Backend Unit Tests - Auth Service (1 day)

**Branch:** `deploy/backend-auth-service-tests`

Goal: Test AuthService login, registration, and JWT token generation.

### Tasks

- [ ] Create `backend/src/test/java/edu/cit/sevilla/paylink/features/auth/application/AuthServiceTest.java`
  - [ ] Test `register()` with valid credentials
  - [ ] Test `register()` with existing username → throw exception
  - [ ] Test `register()` with existing email → throw exception
  - [ ] Test `login()` with valid credentials → return JWT token
  - [ ] Test `login()` with invalid password → throw exception
  - [ ] Test `login()` with non-existent user → throw exception
  - [ ] Test JWT token generation and format
  - [ ] Test token expiration (24 hours as per config)
  - [ ] Test password encoding (verify not stored in plain text)
- [ ] Run tests: `mvn test` — verify all pass
- [ ] PR: Create pull request, get code review, merge to main

---

## Deployment Readiness Phase 5: Backend Integration Tests - Payroll API (1.5 days)

**Branch:** `deploy/backend-payroll-api-tests`

Goal: Test PayrollController endpoints end-to-end.

### Tasks

- [ ] Create `backend/src/test/java/edu/cit/sevilla/paylink/features/payroll/api/PayrollControllerTest.java`
  - [ ] Test POST `/api/payroll/process` with valid request → 201 Created
  - [ ] Test POST `/api/payroll/process` with missing employee → 404
  - [ ] Test POST `/api/payroll/process` with missing pay period → 404
  - [ ] Test GET `/api/payroll/list?payPeriodId=X` with valid period → return list
  - [ ] Test GET `/api/payroll/get/{id}` with valid ID → return payroll
  - [ ] Test GET `/api/payroll/get/{id}` with invalid ID → 404
  - [ ] Verify response includes: gross_pay, net_pay, deductions breakdown, items
  - [ ] Verify 401 Unauthorized without token
  - [ ] Verify 403 Forbidden for EMPLOYEE role trying to process payroll
- [ ] Run tests: `mvn test` — verify all pass
- [ ] PR: Create pull request, get code review, merge to main

---

## Deployment Readiness Phase 6: Backend Integration Tests - Employee API (1 day)

**Branch:** `deploy/backend-employee-api-tests`

Goal: Test EmployeeController endpoints end-to-end.

### Tasks

- [ ] Create `backend/src/test/java/edu/cit/sevilla/paylink/features/employees/api/EmployeeControllerTest.java`
  - [ ] Test POST `/api/employees` (create) with valid data → 201
  - [ ] Test POST `/api/employees` with invalid salary (below MIN_BASIC_RATE) → 400
  - [ ] Test GET `/api/employees` (list all) → return list
  - [ ] Test GET `/api/employees/{id}` with valid ID → return employee
  - [ ] Test GET `/api/employees/{id}` with invalid ID → 404
  - [ ] Test PUT `/api/employees/{id}` (update) with valid data → 200
  - [ ] Test unauthorized access without token → 401
- [ ] Run tests: `mvn test` — verify all pass
- [ ] PR: Create pull request, get code review, merge to main

---

## Deployment Readiness Phase 7: Backend Test Coverage Report (0.5 day)

**Branch:** `deploy/backend-coverage-report`

Goal: Generate final test coverage report and document results.

### Tasks

- [ ] Run full test suite: `mvn clean test`
- [ ] Generate coverage report: `mvn jacoco:report`
- [ ] Create `backend/TEST_COVERAGE_REPORT.md` documenting:
  - [ ] Total test count and pass/fail status
  - [ ] Code coverage percentage (target ≥ 80%)
  - [ ] Services/classes with coverage breakdown
  - [ ] Any areas needing additional testing
- [ ] Verify overall coverage ≥ 80%
- [ ] PR: Create pull request, get code review, merge to main

---

## Deployment Readiness Phase 8: Backend API Documentation (1 day)

**Branch:** `deploy/backend-swagger-setup`

Goal: Add Swagger/OpenAPI documentation for all endpoints.

### Tasks

- [ ] Add dependency to `pom.xml`: `springdoc-openapi-starter-webmvc-ui` v2.1.0
- [ ] Add to `backend/src/main/resources/application.properties`:
  ```properties
  springdoc.api-docs.path=/v3/api-docs
  springdoc.swagger-ui.path=/swagger-ui.html
  springdoc.swagger-ui.enabled=true
  ```
- [ ] Add `@OpenAPIDefinition` and `@Info` to main application class
- [ ] Add `@Operation` and `@ApiResponses` to all controller methods:
  - [ ] AuthController (register, login, logout)
  - [ ] EmployeeController (CRUD operations)
  - [ ] PayrollController (process, list, get)
  - [ ] PayPeriodController (CRUD)
  - [ ] PayslipController (list, get, generate)
- [ ] Test: Access Swagger UI at `http://localhost:8080/swagger-ui.html`
- [ ] Verify: All endpoints documented with request/response schemas
- [ ] PR: Create pull request, get code review, merge to main

---

## Deployment Readiness Phase 9: Backend Environment Profiles (0.5 day)

**Branch:** `deploy/backend-prod-config`

Goal: Create production and staging environment configurations.

### Tasks

- [ ] Create `backend/src/main/resources/application-prod.properties`:
  ```properties
  spring.jpa.hibernate.ddl-auto=validate
  spring.jpa.show-sql=false
  spring.jpa.properties.hibernate.format_sql=false
  logging.level.root=WARN
  logging.level.edu.cit.sevilla.paylink=INFO
  server.port=8080
  server.servlet.context-path=/api
  ```
- [ ] Create `backend/src/main/resources/application-staging.properties`:
  ```properties
  spring.jpa.hibernate.ddl-auto=validate
  spring.jpa.show-sql=true
  logging.level.root=INFO
  logging.level.edu.cit.sevilla.paylink=DEBUG
  server.port=8080
  ```
- [ ] Create `backend/.env.example`:
  ```
  SPRING_DATASOURCE_URL=jdbc:postgresql://host:5432/paylink
  SPRING_DATASOURCE_USERNAME=paylink_user
  SPRING_DATASOURCE_PASSWORD=<secure_password>
  PAYLINK_SECURITY_JWT_SECRET=<secure_jwt_secret>
  SPRING_PROFILES_ACTIVE=prod
  ```
- [ ] Update `backend/README.md` or create `docs/ENVIRONMENT_SETUP.md` with instructions
- [ ] PR: Create pull request, get code review, merge to main

---

## Deployment Readiness Phase 10: Backend Security - CORS & Headers (1 day)

**Branch:** `deploy/backend-security-cors`

Goal: Add CORS configuration and security headers.

### Tasks

- [ ] Create `backend/src/main/java/edu/cit/sevilla/paylink/config/CorsConfig.java`:
  - [ ] Allow origins: `http://localhost:3000` (dev), staging URL, production URL
  - [ ] Allow methods: GET, POST, PUT, DELETE, OPTIONS
  - [ ] Allow headers: Content-Type, Authorization
  - [ ] Allow credentials: true
  - [ ] Max age: 3600 seconds
- [ ] Create `backend/src/main/java/edu/cit/sevilla/paylink/config/SecurityConfig.java`:
  - [ ] Configure SecurityFilterChain bean
  - [ ] Add security headers: X-Content-Type-Options, X-Frame-Options, X-XSS-Protection
  - [ ] Configure HTTPS redirect (if on prod profile)
- [ ] Test: Make request from web app, verify CORS headers present
- [ ] PR: Create pull request, get code review, merge to main

---

## Deployment Readiness Phase 11: Backend Security - Rate Limiting (1 day)

**Branch:** `deploy/backend-rate-limiting`

Goal: Add rate limiting on auth endpoints.

### Tasks

- [ ] Add dependency to `pom.xml`: `resilience4j-spring-boot3` v2.1.0
- [ ] Create rate limiting configuration for `/api/auth/login` and `/api/auth/register`:
  - [ ] Max 5 attempts per minute per IP
  - [ ] Response: 429 Too Many Requests after limit exceeded
- [ ] Implement using Resilience4j (or Spring Cloud RateLimiter)
- [ ] Test: Simulate 10 rapid login attempts, verify rate limiting kicks in
- [ ] PR: Create pull request, get code review, merge to main

---

## Deployment Readiness Phase 12: Web - Cleanup Old Folder Structure (0.5 day)

**Branch:** `deploy/web-cleanup-pages`

Goal: Remove old `src/pages/` folder that was replaced by feature slices.

### Tasks

- [ ] Delete `web/src/pages/` folder completely (all content already migrated to features/)
- [ ] Search codebase for any remaining imports from `src/pages/` → remove or redirect
- [ ] Verify `App.jsx` has no imports from old paths
- [ ] Run `npm run build` — verify no errors, no warnings about missing files
- [ ] Test: App loads and navigates correctly in dev mode (`npm run dev`)
- [ ] PR: Create pull request, get code review, merge to main

---

## Deployment Readiness Phase 13: Web - Environment Configuration (0.5 day)

**Branch:** `deploy/web-environment-config`

Goal: Add .env files for environment-based API URLs.

### Tasks

- [ ] Create `web/.env.example`:
  ```
  VITE_API_BASE_URL=http://localhost:8080/api/
  ```
- [ ] Create `web/.env.development`:
  ```
  VITE_API_BASE_URL=http://localhost:8080/api/
  ```
- [ ] Create `web/.env.staging`:
  ```
  VITE_API_BASE_URL=https://staging-api.paylink.com/api/
  ```
- [ ] Create `web/.env.production`:
  ```
  VITE_API_BASE_URL=https://api.paylink.com/api/
  ```
- [ ] Update `web/vite.config.js` if needed to support env loading
- [ ] Update `web/src/shared/api/client.js` to use `import.meta.env.VITE_API_BASE_URL`
- [ ] Test: `npm run build` produces correct API URL in bundle
- [ ] Add `*.env` to `.gitignore` if not already present
- [ ] PR: Create pull request, get code review, merge to main

---

## Deployment Readiness Phase 14: Web - Token Storage Security Fix (1 day)

**Branch:** `deploy/web-secure-token-storage`

Goal: Fix XSS vulnerability by moving JWT from localStorage to httpOnly cookies.

### Tasks

- [ ] Update `web/src/features/auth/AuthContext.jsx`:
  - [ ] Remove: `localStorage.setItem('token', token)` and `localStorage.getItem('token')`
  - [ ] Add: Instead rely on backend setting httpOnly cookie
- [ ] Update backend `AuthService.java` to set httpOnly cookie in login response:
  ```java
  response.addHeader("Set-Cookie", 
    "authToken=" + jwt + "; HttpOnly; Secure; SameSite=Strict; Path=/");
  ```
- [ ] Update API client to handle cookie-based auth (should be automatic with credentials: 'include')
- [ ] Test: Login → check browser DevTools Cookies tab (verify token in cookie, not localStorage)
- [ ] Test: API calls automatically include cookie
- [ ] PR: Create pull request, get code review, merge to main

---

## Deployment Readiness Phase 15: Web - Security Headers (1 day)

**Branch:** `deploy/web-security-headers`

Goal: Add CSP, CORS validation, and security headers.

### Tasks

- [ ] Update `web/vite.config.js` or create middleware to add security headers:
  ```javascript
  headers: {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline';"
  }
  ```
- [ ] Configure CORS headers to match backend settings
- [ ] Test: Open browser DevTools Network tab, verify headers present in responses
- [ ] Test: Verify CSP doesn't block legitimate resources
- [ ] PR: Create pull request, get code review, merge to main

---

## Deployment Readiness Phase 16: Web - E2E Testing Setup (1 day)

**Branch:** `deploy/web-e2e-testing`

Goal: Add Cypress E2E tests for critical user flows.

### Tasks

- [ ] Install Cypress: `cd web && npm install --save-dev cypress`
- [ ] Create `web/cypress.config.js` with basic config
- [ ] Create `web/cypress/support/commands.js` with custom commands (login, navigate, etc.)
- [ ] Create `web/cypress/support/e2e.js`

**Auth E2E Tests:**
- [ ] Create `web/cypress/e2e/auth.cy.js`:
  - [ ] Test: User can register new account
  - [ ] Test: User can login with valid credentials
  - [ ] Test: User cannot login with invalid password → error message
  - [ ] Test: User is redirected to login if not authenticated
  - [ ] Test: User can logout and session clears

**HR Dashboard E2E Tests:**
- [ ] Create `web/cypress/e2e/hr-dashboard.cy.js`:
  - [ ] Test: HR can view employee list
  - [ ] Test: HR can add new employee (form submission, validation)
  - [ ] Test: HR can edit employee details
  - [ ] Test: HR can view payroll list for selected pay period
  - [ ] Test: HR can process payroll

**Employee Dashboard E2E Tests:**
- [ ] Create `web/cypress/e2e/employee-dashboard.cy.js`:
  - [ ] Test: Employee can view latest payslip
  - [ ] Test: Employee can view payroll history
  - [ ] Test: Employee can download/view payslip details

**Run and Verify:**
- [ ] Run tests: `npx cypress run` — verify all pass
- [ ] Verify: No regressions from refactoring phases
- [ ] PR: Create pull request, get code review, merge to main

---

## Deployment Readiness Phase 17: Mobile - API URL Configuration (0.5 day)

**Branch:** `deploy/mobile-api-config`

Goal: Make API URL configurable for different build types.

### Tasks

- [ ] Update `mobile/app/build.gradle.kts`:
  ```kotlin
  buildTypes {
    debug {
      buildConfigField("String", "API_BASE_URL", "\"http://10.0.2.2:8080/api/\"")
    }
    release {
      buildConfigField("String", "API_BASE_URL", "\"https://api.paylink.com/api/\"")
    }
  }
  ```
- [ ] Verify: Mobile uses `BuildConfig.API_BASE_URL` in NetworkModule
- [ ] Test: Debug build loads from emulator URL, release build loads from production URL
- [ ] PR: Create pull request, get code review, merge to main

---

## Deployment Readiness Phase 18: Mobile - Debug APK Build & Testing (1.5 days)

**Branch:** `deploy/mobile-debug-build`

Goal: Build and test mobile debug APK on emulator.

### Tasks

- [ ] Build debug APK: `cd mobile && ./gradlew assembleDebug`
- [ ] Verify: APK created in `mobile/app/build/outputs/apk/debug/`
- [ ] Start Android Emulator (API 30+)
- [ ] Test on Emulator:
  - [ ] App launches without crash
  - [ ] Login screen displays correctly
  - [ ] Registration screen displays correctly
  - [ ] Login with valid credentials works
  - [ ] JWT token received and stored (check logs)
  - [ ] Employee dashboard loads
  - [ ] HR dashboard loads (if ADMIN user)
  - [ ] Payslip list loads
  - [ ] Payslip details display
  - [ ] No unhandled exceptions in logs
- [ ] Check Logcat for errors and warnings
- [ ] PR: Create pull request with screenshots, get code review, merge to main

---

## Deployment Readiness Phase 19: Mobile - Release Build Setup (1 day)

**Branch:** `deploy/mobile-release-build`

Goal: Prepare for release build with signing.

### Tasks

- [ ] Create Android signing keystore:
  ```bash
  keytool -genkey -v -keystore paylink-release.keystore \
    -keyalg RSA -keysize 2048 -validity 10000 -alias paylink
  ```
- [ ] Create `mobile/app/keystore.properties`:
  ```properties
  storeFile=../paylink-release.keystore
  storePassword=<password>
  keyAlias=paylink
  keyPassword=<password>
  ```
- [ ] Update `mobile/app/build.gradle.kts` to use signing config for release builds
- [ ] Build release APK: `./gradlew assembleRelease`
- [ ] Verify: Signed APK created in `mobile/app/build/outputs/apk/release/`
- [ ] Check APK size (should be reasonable, ~5-15 MB)
- [ ] PR: Create pull request (don't commit keystore), get code review, merge to main

---

## Deployment Readiness Phase 20: Mobile - Device Testing (1.5 days)

**Branch:** `deploy/mobile-device-testing`

Goal: Test mobile app on physical Android devices.

### Tasks

- [ ] Identify test devices:
  - [ ] API 24 device (e.g., Samsung J3)
  - [ ] API 30 device (e.g., Pixel 3a)
  - [ ] API 34 device (e.g., Pixel 8)

**For each device:**
- [ ] Install APK: `adb install -r path/to/app-release.apk`
- [ ] Functional testing:
  - [ ] Launch app → no crash
  - [ ] Navigate all screens (auth, dashboards, payslips)
  - [ ] Test network requests (with WiFi and mobile network)
  - [ ] Test logout/login flow
  - [ ] Check Logcat for errors
- [ ] Performance testing (for flagship device):
  - [ ] Monitor memory usage: target < 150 MB
  - [ ] Monitor battery drain: 1% per 30 minutes is acceptable
  - [ ] Check frame rate (should be smooth, no jank)
- [ ] Document results: device name, OS version, status (pass/fail), notes

- [ ] PR: Create pull request with testing report, get code review, merge to main

---

## Deployment Readiness Phase 21: Infrastructure - Docker Backend (1 day)

**Branch:** `deploy/infra-docker-backend`

Goal: Create backend Docker image for production deployment.

### Tasks

- [ ] Create `backend/Dockerfile`:
  ```dockerfile
  FROM eclipse-temurin:19-jdk-alpine
  WORKDIR /app
  COPY mvnw mvnw
  COPY .mvn .mvn
  COPY pom.xml pom.xml
  RUN chmod +x mvnw && ./mvnw clean package -DskipTests -q
  COPY target/paylink-*.jar app.jar
  EXPOSE 8080
  ENTRYPOINT ["java", "-Dspring.profiles.active=prod", "-jar", "app.jar"]
  ```
- [ ] Build Docker image: `docker build -t paylink-backend:1.0 -f backend/Dockerfile .`
- [ ] Test run: `docker run -p 8080:8080 -e SPRING_DATASOURCE_URL=... paylink-backend:1.0`
- [ ] Verify: API responds at `http://localhost:8080/api/`
- [ ] Check image size (should be < 500 MB)
- [ ] PR: Create pull request, get code review, merge to main

---

## Deployment Readiness Phase 22: Infrastructure - Docker Web (1 day)

**Branch:** `deploy/infra-docker-web`

Goal: Create web Docker image with Nginx for SPA serving.

### Tasks

- [ ] Create `web/Dockerfile`:
  ```dockerfile
  FROM node:20-alpine as builder
  WORKDIR /app
  COPY package*.json ./
  RUN npm ci
  COPY . .
  RUN npm run build
  
  FROM nginx:alpine
  COPY --from=builder /app/dist /usr/share/nginx/html
  COPY nginx.conf /etc/nginx/nginx.conf
  EXPOSE 80
  CMD ["nginx", "-g", "daemon off;"]
  ```
- [ ] Create `web/nginx.conf` for SPA routing (rewrite to index.html)
- [ ] Build Docker image: `docker build -t paylink-web:1.0 -f web/Dockerfile .`
- [ ] Test run: `docker run -p 3000:80 paylink-web:1.0`
- [ ] Verify: Web UI accessible at `http://localhost:3000`
- [ ] Check image size (should be < 100 MB)
- [ ] PR: Create pull request, get code review, merge to main

---

## Deployment Readiness Phase 23: Infrastructure - Docker Compose (1 day)

**Branch:** `deploy/infra-docker-compose`

Goal: Create docker-compose for local full-stack testing.

### Tasks

- [ ] Create `docker-compose.yml`:
  ```yaml
  version: '3.8'
  services:
    postgres:
      image: postgres:15-alpine
      environment:
        POSTGRES_DB: paylink
        POSTGRES_USER: paylink_user
        POSTGRES_PASSWORD: paylink_pass
      ports:
        - "5432:5432"
      volumes:
        - postgres_data:/var/lib/postgresql/data
    
    backend:
      build:
        context: .
        dockerfile: backend/Dockerfile
      environment:
        SPRING_DATASOURCE_URL: jdbc:postgresql://postgres:5432/paylink
        SPRING_DATASOURCE_USERNAME: paylink_user
        SPRING_DATASOURCE_PASSWORD: paylink_pass
        PAYLINK_SECURITY_JWT_SECRET: dev-secret-key-change-in-prod
      ports:
        - "8080:8080"
      depends_on:
        - postgres
      healthcheck:
        test: ["CMD", "curl", "-f", "http://localhost:8080/api/health"]
        interval: 30s
        timeout: 10s
        retries: 3
    
    web:
      build:
        context: .
        dockerfile: web/Dockerfile
      ports:
        - "3000:80"
      environment:
        VITE_API_BASE_URL: http://localhost:8080/api/
      depends_on:
        - backend
  
  volumes:
    postgres_data:
  ```
- [ ] Test: `docker-compose up`
- [ ] Verify: All services start without errors
- [ ] Test: Full user flow:
  - [ ] Open `http://localhost:3000`
  - [ ] Register new account
  - [ ] Login
  - [ ] View employee dashboard
  - [ ] Check network requests reach backend
- [ ] Test: `docker-compose down` — cleanup
- [ ] Document: Add instructions to README
- [ ] PR: Create pull request, get code review, merge to main

---

## Deployment Readiness Phase 24: CI/CD - GitHub Actions Pipeline (1.5 days)

**Branch:** `deploy/cicd-github-actions`

Goal: Create automated testing and deployment pipeline.

### Tasks

- [ ] Create `.github/workflows/ci.yml`:
  ```yaml
  name: CI/CD Pipeline
  on:
    push:
      branches: [main, staging, develop]
    pull_request:
      branches: [main, staging]
  
  jobs:
    backend-test:
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v3
        - uses: actions/setup-java@v3
          with:
            java-version: '19'
        - run: cd backend && mvn clean test
    
    backend-build:
      runs-on: ubuntu-latest
      needs: backend-test
      steps:
        - uses: actions/checkout@v3
        - uses: actions/setup-java@v3
          with:
            java-version: '19'
        - run: cd backend && mvn clean package -DskipTests
    
    web-build:
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v3
        - uses: actions/setup-node@v3
          with:
            node-version: '20'
        - run: cd web && npm ci && npm run build
    
    e2e-test:
      runs-on: ubuntu-latest
      needs: [backend-build, web-build]
      steps:
        - uses: actions/checkout@v3
        - uses: actions/setup-node@v3
          with:
            node-version: '20'
        - run: cd web && npm ci && npx cypress run
  ```
- [ ] Push to GitHub and verify workflow runs
- [ ] Verify: All jobs execute and pass
- [ ] Check: Workflow badge appears on README
- [ ] PR: Create pull request, get code review, merge to main

---

## Deployment Readiness Phase 25: CI/CD - Branch Protection (0.5 day)

**Branch:** (No branch, just configuration)

Goal: Configure branch protection to enforce quality standards.

### Tasks

- [ ] Go to GitHub repo → Settings → Branches
- [ ] Add rule for `main` branch:
  - [ ] Require at least 2 code review approvals
  - [ ] Require status checks to pass:
    - [ ] backend-test
    - [ ] backend-build
    - [ ] web-build
    - [ ] e2e-test
  - [ ] Require branches to be up to date before merging
  - [ ] Include administrators in restrictions
- [ ] Verify: Changes to main now require PR with passing checks

---

## Deployment Readiness Phase 26: Pre-Launch - Security Audit (1 day)

**Branch:** `deploy/security-audit`

Goal: Conduct security review against OWASP Top 10.

### Tasks

- [ ] OWASP Top 10 Checklist:
  - [ ] **A01** – Broken Access Control: Verify role-based access works, only ADMIN can process payroll
  - [ ] **A02** – Cryptographic Failures: Verify passwords hashed, JWT secret in env var, HTTPS enforced in prod
  - [ ] **A03** – Injection: Verify parameterized queries, no SQL injection
  - [ ] **A04** – Insecure Design: Verify auth flows secure (JWT), session management correct
  - [ ] **A05** – Security Misconfiguration: Verify no debug endpoints exposed, error handling doesn't leak info
  - [ ] **A07** – Cross-Site Scripting (XSS): Verify input sanitization, CSP headers present, JWT in httpOnly cookie
  - [ ] **A08** – Software and Data Integrity: Verify dependencies updated, no known vulnerabilities
  - [ ] **A09** – Logging & Monitoring: Verify logs capture security events (logins, access denied, etc.)
- [ ] Fix any identified issues with separate commits
- [ ] Document findings in `docs/SECURITY_AUDIT.md`

---

## Deployment Readiness Phase 27: Pre-Launch - Load Testing (1 day)

**Branch:** `deploy/load-testing`

Goal: Verify system can handle production load.

### Tasks

- [ ] Install load testing tool: `npm install -g artillery`
- [ ] Create `load-test.yml`:
  ```yaml
  config:
    target: "http://localhost:8080/api"
    phases:
      - duration: 60
        arrivalRate: 10  # 10 users per second
  scenarios:
    - name: "Payroll Flow"
      steps:
        - post:
            url: "/auth/login"
            json: { username: "testuser", password: "password" }
        - get:
            url: "/employees"
        - get:
            url: "/payroll/list?payPeriodId=1"
  ```
- [ ] Run load test: `artillery run load-test.yml`
- [ ] Target: Handle 100+ concurrent users without errors
- [ ] Verify: Response times < 2 seconds, CPU/Memory stable
- [ ] Document results in `docs/LOAD_TEST_RESULTS.md`

---

## Deployment Readiness Phase 28: Pre-Launch - Database Backup Testing (0.5 day)

**Branch:** `deploy/database-backup-testing`

Goal: Ensure data can be backed up and restored.

### Tasks

- [ ] Create backup script `backend/scripts/backup-db.sh`:
  ```bash
  #!/bin/bash
  pg_dump -h $DB_HOST -U $DB_USER paylink > backup-$(date +%Y%m%d-%H%M%S).sql
  ```
- [ ] Test backup: Run script, verify .sql file created
- [ ] Create restore script `backend/scripts/restore-db.sh`:
  ```bash
  #!/bin/bash
  psql -h $DB_HOST -U $DB_USER paylink < $1
  ```
- [ ] Test restore process:
  - [ ] Create test database
  - [ ] Restore backup to test database
  - [ ] Verify data integrity (row counts, values match)
  - [ ] Delete test database
- [ ] Document: Backup retention policy (keep 30 days, hourly backups)
- [ ] PR: Create pull request, get code review, merge to main

---

## Deployment Readiness Phase 29: Pre-Launch - Documentation (1 day)

**Branch:** `deploy/docs-deployment`

Goal: Create deployment, operations, and incident response documentation.

### Tasks

- [ ] Create `docs/DEPLOYMENT.md`:
  - [ ] Prerequisites (Docker, Docker Compose, PostgreSQL)
  - [ ] Environment variables required
  - [ ] Step-by-step deployment instructions
  - [ ] Health check endpoints
  - [ ] Verification steps
  - [ ] Rollback procedures

- [ ] Create `docs/OPERATIONS.md`:
  - [ ] Monitoring dashboards (Prometheus, Grafana setup if applicable)
  - [ ] Common issues and troubleshooting
  - [ ] Scaling strategy (horizontal scaling guidelines)
  - [ ] Database maintenance tasks
  - [ ] Log analysis

- [ ] Create incident response runbooks:
  - [ ] `docs/RUNBOOK_API_DOWN.md`: API service down, symptoms, investigation, resolution
  - [ ] `docs/RUNBOOK_DB_SLOW.md`: Database performance degradation
  - [ ] `docs/RUNBOOK_PAYROLL_ERROR.md`: Payroll processing errors

- [ ] PR: Create pull request, get code review, merge to main

---

## Deployment Readiness Phase 30: Final Pre-Launch Checklist & Sign-Off (1 day)

**Branch:** `deploy/final-checklist`

Goal: Complete pre-launch verification and get sign-offs.

### Tasks

**Backend Verification:**
- [ ] All 50+ unit tests passing
- [ ] Test coverage ≥ 80%
- [ ] Swagger docs accessible
- [ ] Error handling works (404, 400, 500)
- [ ] CORS configured correctly
- [ ] Rate limiting active on auth endpoints
- [ ] Security headers present
- [ ] Environment profiles set (prod, staging, dev)

**Mobile Verification:**
- [ ] Debug APK built and tested on emulator
- [ ] Release APK built with valid signing
- [ ] Tested on API 24, 30, 34 devices
- [ ] API URL correctly configured for production
- [ ] No crashes in critical flows (auth, dashboards, payslips)
- [ ] Memory usage < 150 MB
- [ ] Battery drain acceptable (< 1% per 30 min)

**Web Verification:**
- [ ] `npm run build` completes without errors
- [ ] E2E tests passing (auth, HR flow, employee flow)
- [ ] Environment variables correctly set for production
- [ ] Security headers present
- [ ] JWT stored in httpOnly cookie
- [ ] CORS validation working
- [ ] No localStorage token exposure

**Infrastructure Verification:**
- [ ] Docker images build successfully
- [ ] `docker-compose up` runs full stack
- [ ] GitHub Actions CI/CD pipeline active
- [ ] All branch protection rules enforced
- [ ] Load test passes (100+ users, < 2s response)
- [ ] Backup/restore tested and working

**Documentation Verification:**
- [ ] DEPLOYMENT.md complete and tested
- [ ] OPERATIONS.md complete
- [ ] Runbooks created and tested
- [ ] Team trained on deployment procedures

**Sign-Off:**
- [ ] [ ] CTO/Tech Lead approval: "Approved for production"
- [ ] [ ] Business stakeholder approval: "Ready to launch"
- [ ] [ ] Legal/Compliance sign-off (payroll compliance verified)
- [ ] [ ] Security audit complete, findings addressed

**Go-Live:**
- [ ] [ ] Deploy to production
- [ ] [ ] Monitor first 24 hours (logs, error rates, performance)
- [ ] [ ] Confirm system stable
- [ ] [ ] Update deployment timestamp in README

---

## Timeline Summary

| Phase # | Name | Duration | Cumulative |
|---------|------|----------|-----------|
| 1 | Backend Error Handling | 1 day | 1 day |
| 2 | Payroll Tests | 2 days | 3 days |
| 3 | Employee Service Tests | 1 day | 4 days |
| 4 | Auth Service Tests | 1 day | 5 days |
| 5 | Payroll API Tests | 1.5 days | 6.5 days |
| 6 | Employee API Tests | 1 day | 7.5 days |
| 7 | Coverage Report | 0.5 day | 8 days |
| 8 | API Documentation | 1 day | 9 days |
| 9 | Environment Profiles | 0.5 day | 9.5 days |
| 10 | CORS & Headers | 1 day | 10.5 days |
| 11 | Rate Limiting | 1 day | 11.5 days |
| 12 | Web Cleanup | 0.5 day | 12 days |
| 13 | Web Env Config | 0.5 day | 12.5 days |
| 14 | Token Storage Fix | 1 day | 13.5 days |
| 15 | Security Headers | 1 day | 14.5 days |
| 16 | E2E Testing | 1 day | 15.5 days |
| 17 | Mobile API Config | 0.5 day | 16 days |
| 18 | Debug APK Build | 1.5 days | 17.5 days |
| 19 | Release Build Setup | 1 day | 18.5 days |
| 20 | Device Testing | 1.5 days | 20 days |
| 21 | Docker Backend | 1 day | 21 days |
| 22 | Docker Web | 1 day | 22 days |
| 23 | Docker Compose | 1 day | 23 days |
| 24 | GitHub Actions | 1.5 days | 24.5 days |
| 25 | Branch Protection | 0.5 day | 25 days |
| 26 | Security Audit | 1 day | 26 days |
| 27 | Load Testing | 1 day | 27 days |
| 28 | Backup Testing | 0.5 day | 27.5 days |
| 29 | Documentation | 1 day | 28.5 days |
| 30 | Final Checklist | 1 day | 29.5 days |
| **TOTAL** | | | **4.5-5 weeks** |

---

## Key Notes

- **Each phase = one focused Git commit or small PR**
- **Branch naming convention:** `deploy/phase-name`
- **After completing phase:** Create PR for code review
- **Merge only after:** Tests pass AND code review approved
- **Use this checklist** to track progress through deployment readiness
- **Target completion:** Mid-August 2026 (from July 15, 2026 start date)
- **Parallel work possible:** Backend phases (1-11) can run in parallel with Web phases (12-16) if multiple developers
- **Mobile (17-20) depends on backend completion** for testing
- **Infrastructure (21-25) can start while testing phases ongoing**

