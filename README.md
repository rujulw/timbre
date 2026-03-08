# timbre

Timbre is a split-stack Spotify analytics app:
- Backend API: Spring Boot, OAuth orchestration, Spotify proxying, persistence
- Frontend app: React/Vite dashboard and player experience

## Stack

### Backend
- Java 21
- Spring Boot 4
- Spring Web MVC
- Spring Data JPA
- Spring Security
- PostgreSQL
- Maven

### Frontend
- React 19
- Vite 7
- React Router DOM 7
- Tailwind CSS 4
- Vitest + Testing Library

## Repository Layout

```text
timbre/
  backend/        # Spring Boot API
  frontend/       # React/Vite app
  docs/           # Architecture and product/design notes
  README.md
```

## Local Development

### 1) Backend

```bash
cd backend
./mvnw spring-boot:run
```

Default local API URL: `http://localhost:8080`

### 2) Frontend

```bash
cd frontend
npm install
npm run dev
```

Default local app URL: `http://127.0.0.1:5173`

## Environment Variables

### Backend

See `backend/.env.example`.

Required for OAuth:
- `SPOTIFY_CLIENT_ID`
- `SPOTIFY_CLIENT_SECRET`
- `SPOTIFY_REDIRECT_URI`

Recommended for OAuth hardening:
- `SPOTIFY_OAUTH_STATE_SECRET`

CORS:
- `FRONTEND_URL` (single origin)
- `FRONTEND_URLS` (comma-separated multi-origin support)

Database:
- `SPRING_DATASOURCE_URL`
- `SPRING_DATASOURCE_USERNAME`
- `SPRING_DATASOURCE_PASSWORD`

### Frontend

See `frontend/.env.example`.

- `VITE_API_BASE_URL` (recommended in non-local environments)

## Quality Gates

Frontend:
```bash
npm --prefix frontend run lint
npm --prefix frontend run test
npm --prefix frontend run build
```

Backend:
```bash
./mvnw -f backend/pom.xml test
./mvnw -f backend/pom.xml package -DskipTests
```

## v1.0.0 Release Checklist

- Frontend lint/tests/build all pass
- Backend tests/package pass
- OAuth login/callback verified end-to-end
- Dashboard and player smoke-tested
- Local-file fallback behavior verified
- Docs in `README.md` and `docs/` reviewed and consistent
