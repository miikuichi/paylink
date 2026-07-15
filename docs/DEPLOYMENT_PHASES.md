# Deployment Phases (Web + Mobile)

This guide prepares PayLink deployment in 2 independent phases.

## Phase 1: Web Deployment

### 1. Configure production API URL
Create `web/.env.production` from `web/.env.production.example`:

```env
VITE_API_BASE_URL=https://your-backend-domain.com/api
```

### 2. Build locally
From repository root:

```powershell
Set-Location web
npm ci
npm run build:prod
```

Build output is generated at `web/dist`.

### 3. Deploy static build
Deploy `web/dist` to your hosting provider (Vercel, Netlify, Firebase Hosting, Nginx, etc.).

### 4. CI pipeline
Use GitHub Actions workflow:
- `.github/workflows/phase1-web-deploy-ready.yml`

Required secret:
- `WEB_API_BASE_URL`

---

## Phase 2: Mobile Deployment (Android)

### 1. Set release API URL
Provide one of the following:
- Gradle property: `PAYLINK_API_BASE_URL`
- Environment variable: `PAYLINK_API_BASE_URL`

If not provided, release build falls back to placeholder URL in `mobile/app/build.gradle.kts`.

### 2. Configure signing (recommended for Play Store)
Set these Gradle properties or environment variables:
- `PAYLINK_RELEASE_STORE_FILE`
- `PAYLINK_RELEASE_STORE_PASSWORD`
- `PAYLINK_RELEASE_KEY_ALIAS`
- `PAYLINK_RELEASE_KEY_PASSWORD`

### 3. Build locally

```powershell
Set-Location mobile
.\gradlew.bat :app:compileDebugKotlin
.\gradlew.bat :app:assembleRelease :app:bundleRelease
```

Output artifacts:
- APK: `mobile/app/build/outputs/apk/release`
- AAB: `mobile/app/build/outputs/bundle/release`

### 4. CI pipeline
Use GitHub Actions workflow:
- `.github/workflows/phase2-mobile-release-ready.yml`

Recommended secrets:
- `MOBILE_API_BASE_URL`
- `MOBILE_RELEASE_KEYSTORE_BASE64`
- `MOBILE_RELEASE_STORE_PASSWORD`
- `MOBILE_RELEASE_KEY_ALIAS`
- `MOBILE_RELEASE_KEY_PASSWORD`

---

## Deployment Readiness Checklist

### Web
- [ ] `VITE_API_BASE_URL` points to production backend
- [ ] `npm run build:prod` succeeds
- [ ] SPA routing configured in host
- [ ] HTTPS enabled

### Mobile
- [ ] `PAYLINK_API_BASE_URL` points to production backend
- [ ] Release signing configured
- [ ] `:app:assembleRelease` and `:app:bundleRelease` succeed
- [ ] Test release APK on physical device
- [ ] Upload AAB to Play Console internal testing first
