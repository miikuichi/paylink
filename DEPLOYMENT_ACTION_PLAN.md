# PayLink Deployment Readiness – Action Plan (Next Steps)

**Created:** July 15, 2026  
**Target Audience:** Development Team Leads & Project Managers  
**Purpose:** Clear prioritized action items to begin deployment readiness work

---

## 🎯 Immediate Priority (This Week)

### 1. **Kick-Off Meeting & Team Assignment** (ASAP)
**Time:** 2-3 hours

**Attendees:**
- [ ] Backend Lead
- [ ] Web Lead  
- [ ] Mobile Lead
- [ ] DevOps/Infrastructure Lead
- [ ] QA Lead
- [ ] Project Manager
- [ ] CTO/Technical Lead

**Agenda:**
- [ ] Review DEPLOYMENT_READINESS_ASSESSMENT.md (executive summary)
- [ ] Review DEPLOYMENT_PHASES.md timeline
- [ ] Assign team members to phases 1-11 (backend), 12-16 (web), 17-20 (mobile)
- [ ] Establish sprint schedule (daily standups, weekly reviews)
- [ ] Agree on parallelization strategy
- [ ] Set success metrics and go/no-go criteria

**Output:** 
- [ ] Written team assignments with phase ownership
- [ ] Agreed sprint dates
- [ ] Communication plan for blockers

---

### 2. **Backend Phase 1: Global Error Handling Setup** (Day 1-2)
**Branch:** `deploy/phase-1-error-handling`  
**Assignee:** Backend Lead

**Critical First Step:** This phase blocks all other backend phases (2-7)

**Checklist:**
- [ ] Create `backend/src/main/java/edu/cit/sevilla/paylink/exception/ApiException.java`
  ```java
  public class ApiException extends RuntimeException {
    private String errorCode;
    private int httpStatus;
    
    public ApiException(String message, String errorCode, int httpStatus) {
      super(message);
      this.errorCode = errorCode;
      this.httpStatus = httpStatus;
    }
    // ... getters
  }
  ```

- [ ] Create `backend/src/main/java/edu/cit/sevilla/paylink/exception/ResourceNotFoundException.java`
- [ ] Create `backend/src/main/java/edu/cit/sevilla/paylink/exception/InvalidPayrollCalculationException.java`
- [ ] Create `backend/src/main/java/edu/cit/sevilla/paylink/exception/ValidationException.java`

- [ ] Create `backend/src/main/java/edu/cit/sevilla/paylink/api/response/ErrorResponse.java`
  ```java
  public class ErrorResponse {
    private String timestamp;
    private int status;
    private String error;
    private String message;
    private String path;
    private Map<String, String> fieldErrors; // for validation errors
  }
  ```

- [ ] Create `backend/src/main/java/edu/cit/sevilla/paylink/api/advice/GlobalExceptionHandler.java`
  ```java
  @RestControllerAdvice
  public class GlobalExceptionHandler {
    
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(...) {
      // Return 404 with ErrorResponse
    }
    
    @ExceptionHandler(ValidationException.class)
    public ResponseEntity<ErrorResponse> handleValidation(...) {
      // Return 400 with field errors
    }
    
    @ExceptionHandler(InvalidPayrollCalculationException.class)
    public ResponseEntity<ErrorResponse> handlePayrollError(...) {
      // Return 422 with calculation details
    }
    
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneric(...) {
      // Return 500 WITHOUT stack trace
    }
  }
  ```

- [ ] Add `@Valid` annotations to all request DTOs in controllers
- [ ] Test: Run existing tests, verify none break
- [ ] Create PR and get code review

**Success Criteria:**
- [ ] All exception classes compile
- [ ] GlobalExceptionHandler intercepts errors properly
- [ ] Stack traces no longer exposed in responses
- [ ] All existing tests still pass
- [ ] Code review approved

**Estimated Time:** 1 day  
**Blocks:** Phases 2-7

---

### 3. **Backend Phase 2: PayrollComputationService Unit Tests** (Day 3-5)
**Branch:** `deploy/phase-2-payroll-unit-tests`  
**Assignee:** Backend Lead or Senior Developer

**Checklist:**
- [ ] Create `backend/src/test/java/edu/cit/sevilla/paylink/features/payroll/application/PayrollComputationServiceTest.java`
- [ ] Write test cases (minimum 20 tests):
  - [ ] SSS contribution calculation (multiple salary brackets: 100k, 250k, 500k+)
  - [ ] PhilHealth premium calculation
  - [ ] Pag-IBIG contribution calculation
  - [ ] BIR tax calculation
  - [ ] Gross pay with allowances
  - [ ] Net pay with deductions
  - [ ] Edge cases (zero salary, minimum wage, maximum salary)

**Sample Test:**
```java
@Test
public void testComputeSSS_WithSalary100000() {
  // Given
  Employee emp = new Employee();
  emp.setBasicRate(100000);
  
  // When
  double sss = payrollService.computeSSS(emp);
  
  // Then
  assertEquals(4500.0, sss, 0.01); // 4.5% of 100k
}
```

- [ ] Run tests: `mvn clean test -Dtest=PayrollComputationServiceTest`
- [ ] Verify ≥80% code coverage for PayrollComputationService
- [ ] Create PR and get code review

**Success Criteria:**
- [ ] 20+ test cases passing
- [ ] ≥80% code coverage on PayrollComputationService
- [ ] All tests passing (mvn test)
- [ ] Code review approved

**Estimated Time:** 2 days  
**Depends On:** Phase 1

---

### 4. **Web Phase 12: Cleanup src/pages/ Folder** (Day 1-2, runs in parallel)
**Branch:** `deploy/phase-12-web-cleanup-pages`  
**Assignee:** Web Lead

**Quick Win - Unblocks Phase 13**

**Checklist:**
- [ ] Verify all `src/pages/**` content is already in `src/features/`
  - [ ] `src/pages/auth/*` → `src/features/auth/`
  - [ ] `src/pages/hr/*` → `src/features/hr-dashboard/`
  - [ ] `src/pages/employee/*` → `src/features/employee-dashboard/`

- [ ] Search codebase for any remaining imports from `src/pages/`:
  ```bash
  grep -r "from.*pages" src/ --include="*.jsx" --include="*.js"
  ```

- [ ] Update `src/App.jsx` imports (if needed)

- [ ] Delete `src/pages/` folder entirely:
  ```bash
  rm -r src/pages/
  ```

- [ ] Run build test: `npm run build`
  - [ ] Zero errors ✅
  - [ ] Zero warnings about dead code ✅

- [ ] Create PR and get code review

**Success Criteria:**
- [ ] `src/pages/` folder deleted
- [ ] `npm run build` runs with zero errors
- [ ] No broken imports in codebase
- [ ] Code review approved

**Estimated Time:** 0.5 day  
**Blocks:** Phase 13

---

### 5. **Mobile Phase 17: API URL Configuration** (Day 1, runs in parallel)
**Branch:** `deploy/phase-17-mobile-api-config`  
**Assignee:** Mobile Lead

**Quick Win - Unblocks Phase 18**

**Checklist:**
- [ ] Update `mobile/app/build.gradle.kts`:
  ```kotlin
  buildTypes {
    debug {
      buildConfigField("String", "API_BASE_URL", "\"http://10.0.2.2:8080\"")
    }
    release {
      buildConfigField("String", "API_BASE_URL", "\"https://api.paylink.com\"")
    }
  }
  ```

- [ ] Find the API client class (likely in `features/auth/data/network/` or `core/network/`)
  - [ ] Replace hardcoded URL with `BuildConfig.API_BASE_URL`
  - [ ] Example: `BASE_URL = BuildConfig.API_BASE_URL`

- [ ] Build debug APK to verify: `./gradlew assembleDebug`
  - [ ] Zero compilation errors ✅

- [ ] Create PR and get code review

**Success Criteria:**
- [ ] buildConfigField added to build.gradle.kts
- [ ] API client uses BuildConfig.API_BASE_URL
- [ ] Debug APK compiles successfully
- [ ] Code review approved

**Estimated Time:** 0.5 day  
**Blocks:** Phase 18

---

## 📅 Week 1 Timeline Summary

| Day | Backend | Web | Mobile | DevOps |
|-----|---------|-----|--------|--------|
| Mon | Phase 1: Error Handling | Phase 12: Cleanup | Phase 17: API Config | Planning |
| Tue | Phase 1: Testing | Phase 13: Env Config | Phase 18: Debug APK Build | Planning |
| Wed | Phase 2: Unit Tests | Phase 14: Token Security | Phase 18: Debug Testing | Planning |
| Thu | Phase 2: Testing | Phase 15: Security Headers | Phase 19: Release APK | Planning |
| Fri | Phase 3: Employee Tests | Phase 16: E2E Tests Setup | Phase 20: Device Testing | Planning |

---

## 📋 Parallel Work Groups (Weeks 2-4)

### Backend Team (Phases 1-11)
- Lead: Backend Lead
- Duration: 8-9 days (weeks 1-2)
- Phases:
  - [x] Phase 1: Error Handling (complete by end of week 1)
  - [x] Phase 2: Payroll Tests (complete by mid-week 2)
  - [ ] Phase 3: Employee Tests
  - [ ] Phase 4: Auth Tests
  - [ ] Phase 5: Payroll Integration Tests
  - [ ] Phase 6: Employee Integration Tests
  - [ ] Phase 7: Test Coverage Report
  - [ ] Phase 8: API Documentation
  - [ ] Phase 9: Environment Profiles
  - [ ] Phase 10: CORS & Security Headers
  - [ ] Phase 11: Rate Limiting

### Web Team (Phases 12-16)
- Lead: Web Lead
- Duration: 4-5 days (weeks 1-2)
- Phases:
  - [x] Phase 12: Cleanup (complete by end of week 1)
  - [x] Phase 13: Env Config (complete by mid-week 2)
  - [ ] Phase 14: Token Security
  - [ ] Phase 15: Security Headers
  - [ ] Phase 16: E2E Testing

### Mobile Team (Phases 17-20)
- Lead: Mobile Lead
- Duration: 4-5 days (weeks 1-2)
- Phases:
  - [x] Phase 17: API Config (complete by end of week 1)
  - [x] Phase 18: Debug APK (complete by mid-week 2)
  - [ ] Phase 19: Release APK
  - [ ] Phase 20: Device Testing

### DevOps Team (Phases 21-25)
- Lead: DevOps/Infrastructure Lead
- Duration: 5-6 days (weeks 2-3)
- Phases:
  - [ ] Phase 21: Docker Backend
  - [ ] Phase 22: Docker Web
  - [ ] Phase 23: Docker Compose
  - [ ] Phase 24: GitHub Actions CI/CD
  - [ ] Phase 25: Branch Protection

### QA/Security Team (Phases 26-30)
- Lead: QA Lead + Security Specialist
- Duration: 4-5 days (weeks 4-5)
- Phases:
  - [ ] Phase 26: Security Audit
  - [ ] Phase 27: Load Testing
  - [ ] Phase 28: Backup/Restore Testing
  - [ ] Phase 29: Documentation
  - [ ] Phase 30: Final Sign-Offs

---

## 🚀 Getting Started Today

### For Backend Lead:
1. ✅ Read DEPLOYMENT_READINESS_ASSESSMENT.md Part 1 (Backend section)
2. ✅ Read DEPLOYMENT_PHASES.md Phases 1-11
3. ⏭️ **Today:** Create branch `deploy/phase-1-error-handling`
4. ⏭️ **Today:** Create 5 exception classes listed above
5. ⏭️ **Today:** Create GlobalExceptionHandler.java
6. ⏭️ **End of today:** Push WIP PR for code review

### For Web Lead:
1. ✅ Read DEPLOYMENT_READINESS_ASSESSMENT.md Part 3 (Web section)
2. ✅ Read DEPLOYMENT_PHASES.md Phases 12-16
3. ⏭️ **Today:** Create branch `deploy/phase-12-web-cleanup-pages`
4. ⏭️ **Today:** Search for any lingering imports from src/pages/
5. ⏭️ **Today:** Delete src/pages/ folder
6. ⏭️ **End of today:** Run `npm run build` and verify success

### For Mobile Lead:
1. ✅ Read DEPLOYMENT_READINESS_ASSESSMENT.md Part 2 (Mobile section)
2. ✅ Read DEPLOYMENT_PHASES.md Phases 17-20
3. ⏭️ **Today:** Create branch `deploy/phase-17-mobile-api-config`
4. ⏭️ **Today:** Update build.gradle.kts with buildConfigField
5. ⏭️ **Today:** Update API client to use BuildConfig.API_BASE_URL
6. ⏭️ **End of today:** Build debug APK: `./gradlew assembleDebug`

### For DevOps Lead:
1. ✅ Read DEPLOYMENT_READINESS_ASSESSMENT.md Part 4 (Infrastructure)
2. ✅ Read DEPLOYMENT_PHASES.md Phases 21-25
3. ⏭️ **This week:** Set up Git repository branch protection rules template
4. ⏭️ **This week:** Prepare Docker and GitHub Actions environment
5. ⏭️ **Week 2:** Start Phase 21 (Docker backend)

### For QA Lead:
1. ✅ Read DEPLOYMENT_READINESS_ASSESSMENT.md Parts 2-5
2. ✅ Read DEPLOYMENT_PHASES.md Phases 26-30
3. ⏭️ **This week:** Prepare security audit checklist (OWASP Top 10)
4. ⏭️ **This week:** Set up load testing tools (JMeter/Locust)
5. ⏭️ **Week 4:** Execute phases 26-30

### For Project Manager:
1. ✅ Read DEPLOYMENT_READINESS_INDEX.md (this entire file)
2. ✅ Read DEPLOYMENT_READINESS_ASSESSMENT.md Executive Summary
3. ⏭️ **Today:** Schedule kick-off meeting with team leads
4. ⏭️ **This week:** Create sprint/Gantt chart in project management tool
5. ⏭️ **This week:** Assign phases to team members
6. ⏭️ **Weekly:** Track progress against 30-phase checklist

---

## 📊 Success Metrics (Weekly Tracking)

**Week 1 Targets:**
- [ ] Phases 1, 12, 17 complete (3 quick wins)
- [ ] PRs created for phases 2, 13, 18
- [ ] Zero blockers preventing backend/web/mobile work

**Week 2 Targets:**
- [ ] Phases 2-11 (backend) complete
- [ ] Phases 12-16 (web) complete
- [ ] Phases 17-20 (mobile) complete
- [ ] 100% of phases 1-20 merged to main branch

**Week 3 Targets:**
- [ ] Phases 21-25 (infrastructure) complete
- [ ] Docker images building and pushing
- [ ] CI/CD pipeline functional

**Week 4 Targets:**
- [ ] Phases 26-28 (security & performance) complete
- [ ] No critical security vulnerabilities found
- [ ] Load test passes with p99 < 2 sec

**Week 5 Targets:**
- [ ] Phase 29 (documentation) complete
- [ ] Phase 30 (sign-offs) complete
- [ ] All stakeholders have signed off
- [ ] ✅ **GO TO PRODUCTION DECISION MADE**

---

## 🚨 Risk Mitigation

### If Phase 1 (Error Handling) Fails:
- **Impact:** Blocks all backend phases (2-11)
- **Mitigation:** Have backup developer pair-program with backend lead
- **Workaround:** None; this must complete to unblock testing

### If Phase 2 (Unit Tests) Takes Longer:
- **Impact:** Delays backend go/no-go decision
- **Mitigation:** Start with minimum 10 critical tests, add remaining tests in parallel
- **Workaround:** Extend week 2 by 2-3 days if needed

### If Web Phase 14 (Token Security) Creates Issues:
- **Impact:** Web app may break temporarily during refactoring
- **Mitigation:** Test on staging environment first, not production
- **Workaround:** Have rollback plan to localStorage if httpOnly causes auth issues

### If Mobile Phase 18/19 Build Fails:
- **Impact:** Cannot proceed to device testing
- **Mitigation:** Consult Android SDK setup, gradle wrapper versions
- **Workaround:** Can be fixed by end of day with proper troubleshooting

---

## 📞 Decision Points & Escalation

### If any phase takes >2x estimated time:
- [ ] Report to CTO immediately
- [ ] Assess if dependencies changed
- [ ] Reassign resources if needed
- [ ] Update timeline

### If Phase 26 (Security Audit) finds >5 critical vulnerabilities:
- [ ] Pause deployment to production
- [ ] Form incident response team
- [ ] Prioritize fixes by severity
- [ ] Extend timeline by 1 week minimum

### If Phase 27 (Load Testing) fails performance targets:
- [ ] Investigate bottlenecks (database, API, frontend)
- [ ] Profile code with APM tools
- [ ] Optimize before retesting
- [ ] May require architecture changes (caching, indexing, etc.)

---

## 📱 Communication Plan

**Daily:** Standups (15 min, 9:30 AM)
- Each team lead: What completed yesterday, what blocked today, what's blocking others

**Weekly:** Sprint Review (1 hour, Fridays)
- Demo completed phases
- Review blockers
- Plan next week

**Bi-Weekly:** Steering Committee (1.5 hours)
- CTO, Product Manager, Project Manager
- Review overall progress
- Make go/no-go decisions for each phase group

---

## 🎓 Knowledge Base

**For developers working on specific phases:**
- Backend phases 1-11 → Read DEPLOYMENT_PHASES.md lines 60-550
- Web phases 12-16 → Read DEPLOYMENT_PHASES.md lines 550-750
- Mobile phases 17-20 → Read DEPLOYMENT_PHASES.md lines 750-950
- Infrastructure phases 21-25 → Read DEPLOYMENT_PHASES.md lines 950-1200
- QA phases 26-30 → Read DEPLOYMENT_PHASES.md lines 1200-1500

**Git branch naming:**
- Backend: `deploy/phase-{number}-{short-name}` (e.g., `deploy/phase-1-error-handling`)
- Web: `deploy/phase-{number}-{short-name}` (e.g., `deploy/phase-12-web-cleanup`)
- Mobile: `deploy/phase-{number}-{short-name}` (e.g., `deploy/phase-17-mobile-api-config`)

**PR requirements:**
- All phases: Must have ≥1 code review approval before merge
- Phases 1-11: Backend lead approval required
- Phases 12-16: Web lead approval required
- Phases 17-20: Mobile lead approval required
- Phases 21-30: All team leads approval required

---

## ✅ Checklist to Begin Today

- [ ] All team leads have read DEPLOYMENT_READINESS_INDEX.md
- [ ] Kick-off meeting scheduled for this week
- [ ] Phases 1, 12, 17 assigned to respective leads
- [ ] Git branches created: deploy/phase-1-*, deploy/phase-12-*, deploy/phase-17-*
- [ ] Backend lead: Exception classes skeleton created
- [ ] Web lead: src/pages/ cleanup started
- [ ] Mobile lead: build.gradle.kts updated with buildConfigField
- [ ] Project manager: Weekly tracking spreadsheet created
- [ ] CTO: Go/no-go criteria reviewed and signed off

---

## 📞 Questions?

Refer to these documents in order:
1. DEPLOYMENT_READINESS_INDEX.md (this file) – Overview
2. DEPLOYMENT_READINESS_ASSESSMENT.md – Detailed findings
3. DEPLOYMENT_PHASES.md – Implementation details
4. Specific phase documentation in DEPLOYMENT_PHASES.md

**For urgent questions:** Contact CTO or Project Manager

