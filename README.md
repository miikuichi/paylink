# PayLink Monorepo

PayLink is a full-stack payroll management monorepo with:

- backend: Spring Boot REST API
- web: React + Vite client
- mobile: Android Kotlin + Jetpack Compose client
- docs: project documentation and architecture reports

## Current Backend Architecture

The backend has been refactored to a vertical-slice, feature-first structure.

Feature modules:

- backend/src/main/java/edu/cit/sevilla/paylink/features/auth
- backend/src/main/java/edu/cit/sevilla/paylink/features/employees
- backend/src/main/java/edu/cit/sevilla/paylink/features/payperiods
- backend/src/main/java/edu/cit/sevilla/paylink/features/payroll
- backend/src/main/java/edu/cit/sevilla/paylink/features/payslips

Shared cross-cutting packages (intentionally outside feature slices):

- backend/src/main/java/edu/cit/sevilla/paylink/security
- backend/src/main/java/edu/cit/sevilla/paylink/repository (shared UserRepository)
- backend/src/main/java/edu/cit/sevilla/paylink/entity (shared User)
- backend/src/main/java/edu/cit/sevilla/paylink/enums
- backend/src/main/java/edu/cit/sevilla/paylink/exception

## Prerequisites

Install the following before running the project:

- Java JDK 21
- Node.js 18+ and npm
- Android Studio Iguana 2023.2.1 Patch 2
- Android SDK Platform 34 + Build Tools

## Run the Backend

The web and mobile clients both depend on the backend API.

1. Configure local backend properties:

- backend/src/main/resources/application-local.properties

2. Run backend:

```powershell
cd backend
./mvnw.cmd spring-boot:run
```

Local API base URL:

- http://localhost:8080/api

## Run the Web App

```powershell
cd web
npm install
npm run dev
```

Default local URL is usually:

- http://localhost:5173

## Run the Mobile App

Current mobile implementation includes:

- login/register flow
- role-based routing (EMPLOYEE and ADMIN)
- session persistence with DataStore
- API integration using Retrofit/OkHttp

### Android toolchain

- AGP: 8.4.2
- Gradle Wrapper: 8.6

### Backend URL for emulator

Configured in:

- mobile/app/build.gradle.kts

Default value:

- http://10.0.2.2:8080/api/

Notes:

- 10.0.2.2 is correct for Android Emulator to host machine.
- For physical devices, change to your machine LAN IP.

### Build and run mobile

```powershell
cd mobile
./gradlew.bat :app:assembleDebug
```

Then run from Android Studio.

## Quick Start Order

1. Start backend
2. Start web and/or mobile

## Verification Commands

Backend tests:

```powershell
cd backend
./mvnw.cmd test
```

Web production build:

```powershell
cd web
npm run build
```

Mobile debug build:

```powershell
cd mobile
./gradlew.bat :app:assembleDebug
```

## Notes

- The backend uses the local Spring profile by default.
- Flyway handles database migration validation at startup.
- If mobile fails due to SDK path issues, set mobile/local.properties with sdk.dir.
