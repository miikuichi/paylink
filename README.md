# PayLink

PayLink is split into 3 deliverables in this repository:

- `backend/`: Spring Boot API backed by PostgreSQL and Flyway
- `web/`: React + Vite web client
- `mobile/`: Android client built with Kotlin and Jetpack Compose

## Repository Layout

```text
paylink/
├── backend/
├── web/
├── mobile/
└── docs/
```

## Prerequisites

Install these before working on the project:

- Git
- Java 19 for the backend
- Node.js 18 or newer and npm for the web app
- Android Studio with Android SDK 34 for the mobile app
- An Android emulator or physical Android device for mobile testing
- Access to the PostgreSQL database used by the backend

## 1. Clone And Open The Repo

```powershell
git clone <your-repository-url>
cd paylink
```

Open the repository root in VS Code or Android Studio.

## 2. Backend Setup

The backend is a Spring Boot application inside `backend/`.

### Install Backend Dependencies

The project uses the Maven wrapper, so a separate Maven install is optional.

```powershell
Set-Location backend
.\mvnw.cmd dependency:go-offline
```

### Configure Backend Environment

The backend runs with the `local` Spring profile by default and expects a local properties file.

1. Create `backend/src/main/resources/application-local.properties`.
2. Use `backend/paylink/src/main/resources/application-local.properties.example` as the template.
3. Fill in these values:

- `spring.datasource.url`
- `spring.datasource.username`
- `spring.datasource.password`
- `paylink.security.jwt.secret`

The backend already enables Flyway migrations on startup.

### Run The Backend

```powershell
Set-Location backend
.\mvnw.cmd spring-boot:run
```

Default local API base URL:

- `http://localhost:9091`

The web app proxies requests from `/api` to that backend port, and the Android debug build defaults to `http://10.0.2.2:9091/api/` for the emulator.

### Run Backend Tests

```powershell
Set-Location backend
.\mvnw.cmd test
```

### Debug The Backend

In VS Code:

1. Open the `backend/` project in the workspace.
2. Open `backend/src/main/java/edu/cit/sevilla/paylink/PaylinkApplication.java`.
3. Set breakpoints in controllers, services, or repositories.
4. Use the `Run Java` or `Debug Java` code lens above the `main` method.

In IntelliJ IDEA or Spring Tools:

1. Import the `backend/pom.xml` Maven project.
2. Run the `PaylinkApplication` class in Debug mode.

## 3. Web Setup

The web client lives in `web/` and uses React with Vite.

### Install Web Dependencies

```powershell
Set-Location web
npm install
```

### Run The Web App

```powershell
Set-Location web
npm run dev
```

Vite usually starts on:

- `http://localhost:5173`

Local API calls to `/api` are proxied to `http://localhost:9091`.

### Build The Web App

```powershell
Set-Location web
npm run build
```

For production API configuration, create `web/.env.production` from `web/.env.production.example` and set:

```env
VITE_API_BASE_URL=https://your-backend-domain.com/api
```

### Render Deployment Notes

When deploying the frontend and backend on Render, use these live values:

- Backend `CORS_ALLOWED_ORIGINS`: `https://paylink-web-*.onrender.com,https://paylink-web.onrender.com`
- Frontend `VITE_API_BASE_URL`: `https://paylink-pms.onrender.com/api`

Redeploy order:

1. Deploy the backend first.
2. Then deploy the frontend.
3. Clear build cache if Render still serves stale values.

### Debug The Web App

Recommended workflow:

1. Start the backend first.
2. Run `npm run dev` in `web/`.
3. Open the app in a browser.
4. Use browser DevTools for network, state, and console inspection.
5. Set breakpoints directly in the source from the browser DevTools or use the VS Code JavaScript debugger to launch Chrome against the Vite dev server.

## 4. Mobile Setup

The Android app lives in `mobile/`.

### Install Mobile Dependencies

Open `mobile/` in Android Studio and let Gradle sync automatically, or use the Gradle wrapper from the terminal.

```powershell
Set-Location mobile
.\gradlew.bat tasks
```

### Configure Mobile API Endpoints

The mobile app uses these defaults:

- Debug: `http://10.0.2.2:9091/api/`
- Release: `https://your-backend-domain.com/api/`

To override them:

- Set `PAYLINK_DEBUG_API_BASE_URL` for debug builds
- Set `PAYLINK_API_BASE_URL` for release builds

Notes:

- `10.0.2.2` works for the Android emulator and points back to your host machine.
- For a physical device, replace it with your computer's LAN IP and make sure the backend is reachable from that device.

### Run The Mobile App

Using Android Studio:

1. Open the `mobile/` folder as a project.
2. Wait for Gradle sync to finish.
3. Start an emulator or connect a device.
4. Run the `app` configuration.

Using the command line:

```powershell
Set-Location mobile
.\gradlew.bat :app:installDebug
```

### Build Mobile Artifacts

Debug compile:

```powershell
Set-Location mobile
.\gradlew.bat :app:compileDebugKotlin
```

Release APK and bundle:

```powershell
Set-Location mobile
.\gradlew.bat :app:assembleRelease :app:bundleRelease
```

### Configure Release Signing

Use `mobile/release-signing.properties.example` as a reference for these values:

- `PAYLINK_RELEASE_STORE_FILE`
- `PAYLINK_RELEASE_STORE_PASSWORD`
- `PAYLINK_RELEASE_KEY_ALIAS`
- `PAYLINK_RELEASE_KEY_PASSWORD`
- `PAYLINK_API_BASE_URL`

### Debug The Mobile App

Recommended workflow in Android Studio:

1. Start the backend locally.
2. Confirm the debug API base URL points to the correct host.
3. Open the `mobile/` project.
4. Set breakpoints in Compose screens, view models, repositories, or networking code.
5. Click Debug on the `app` run configuration.
6. Use Logcat to inspect API failures, crashes, and device logs.

## 5. Suggested Local Startup Order

When developing across the full system, use this order:

1. Start the backend.
2. Start the web app or launch the mobile app.
3. Log in and verify API calls against the local backend.

## 6. Common Commands

### Backend

```powershell
Set-Location backend
.\mvnw.cmd spring-boot:run
.\mvnw.cmd test
```

### Web

```powershell
Set-Location web
npm install
npm run dev
npm run build
```

### Mobile

```powershell
Set-Location mobile
.\gradlew.bat :app:installDebug
.\gradlew.bat :app:compileDebugKotlin
.\gradlew.bat :app:assembleRelease :app:bundleRelease
```

## 7. Additional Documentation

- `docs/DEPLOYMENT_PHASES.md`: deployment notes for web and mobile
- `docs/SRS.md`: software requirements documentation
