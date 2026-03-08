# Deployment Runbook

## Objective
Deploy Timbre `v1.0.0` with consistent frontend/backend configuration.

## Prerequisites
- Java 21
- Node 20+
- PostgreSQL instance
- Spotify app credentials

## Environment

### Backend
Set:
- `SPOTIFY_CLIENT_ID`
- `SPOTIFY_CLIENT_SECRET`
- `SPOTIFY_OAUTH_STATE_SECRET`
- `SPOTIFY_REDIRECT_URI`
- `SPRING_DATASOURCE_URL`
- `SPRING_DATASOURCE_USERNAME`
- `SPRING_DATASOURCE_PASSWORD`
- `FRONTEND_URL` or `FRONTEND_URLS`

### Frontend
Set:
- `VITE_API_BASE_URL`

## Build Verification

```bash
npm --prefix frontend run lint
npm --prefix frontend run test
npm --prefix frontend run build
./mvnw -f backend/pom.xml test
./mvnw -f backend/pom.xml package -DskipTests
```

## Deployment Steps

1. Deploy backend service.
2. Confirm backend health and `/api/auth/login` redirect behavior.
3. Deploy frontend static bundle.
4. Verify OAuth round trip (`/` -> Spotify -> `/callback` -> `/dashboard`).
5. Verify dashboard range switching and snapshot creation.
6. Verify player polling and local-track fallback behavior.

## Post-Deploy Smoke Checklist
- Login works
- Callback hydration works
- Dashboard data loads
- Player updates every 5s
- Footer links work
- No token params in frontend network request URLs
