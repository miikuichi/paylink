# PayLink Monorepo

PayLink is a monorepo containing:

- `backend/` - Spring Boot API
- `web/` - React + Vite web app
- `mobile/` - Android app (Kotlin + Jetpack Compose)

## Prerequisites

Install the following before running the project:

- Java JDK 19 (for backend)
- Node.js 18+ and npm (for web)
- Android Studio Iguana 2023.2.1 Patch 2 (for mobile)
- Android SDK Platform 34 + Build Tools (for mobile)

## Project Structure

- `backend/` - REST API, auth, payroll domain logic
- `web/` - browser client
- `mobile/` - Android mobile client
- `docs/` - project documentation

## 1) Start the Backend (Required for Web and Mobile)

The web and mobile clients both call the Spring Boot backend.

### Configure backend local properties

The backend uses local profile values from:

- `backend/src/main/resources/application-local.properties`

Ensure your DB/JWT values are valid before starting the API.

### Run backend

```powershell
cd backend
./mvnw.cmd spring-boot:run
```

Backend API base URL (local):

- `http://localhost:8080/api`

## 2) Run the Web App

```powershell
cd web
npm install
npm run dev
```

Vite will print the local URL (usually `http://localhost:5173`).

## 3) Run the Mobile App (Android)

## Mobile scope currently implemented

- Kotlin + Jetpack Compose Android app initialization
- Login and Register flows wired to Spring Boot backend
- Role-based routing after auth:
  - `EMPLOYEE` -> Employee Dashboard
  - `ADMIN` -> HR Dashboard
- Session persistence using DataStore
- API integration using Retrofit and OkHttp

### Iguana-compatible mobile toolchain

Pinned for Android Studio Iguana 2023.2.1 compatibility:

- AGP: `8.4.2`
- Gradle Wrapper: `8.6`

### Backend connection for Android

Default mobile API base URL is in:

- `mobile/app/build.gradle.kts`

Current value:

- `http://10.0.2.2:8080/api/`

Notes:

- `10.0.2.2` is correct when using Android Emulator and backend runs on your PC.
- For a physical device, replace it with your machine's LAN IP.

### Build mobile app

```powershell
cd mobile
./gradlew.bat :app:assembleDebug
```

### Run mobile app

1. Start backend first.
2. Open `mobile/` in Android Studio Iguana.
3. Start an emulator (or connect a USB-debug device).
4. Run the `app` configuration.

Optional CLI install (if adb is available):

```powershell
cd mobile
./gradlew.bat :app:installDebug
```

## Quick Start (All Services)

Use this order:

1. Start backend
2. Start web (`npm run dev`) and/or run mobile app from Android Studio

## Common Notes

- If mobile build fails with SDK location errors, set `mobile/local.properties` with `sdk.dir=...`.
- Backend must be running before logging in from web/mobile.
- If login fails from mobile emulator, verify backend is reachable at `http://10.0.2.2:8080`.
