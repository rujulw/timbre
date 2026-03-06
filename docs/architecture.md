# Architecture

## Overview
`timbre` is a split-stack music analytics product with a strict boundary between:
- `frontend` (React/Vite): presentation, session UI state, navigation.
- `backend` (Spring Boot): OAuth, Spotify API orchestration, persistence.

Current model:
- Monorepo with two deployable applications.
- Frontend and backend communicate only via HTTP API contracts.
- Spotify is treated as an external integration owned by backend.

## Repository Structure
- `frontend/`: React app (routes, pages, components, client-side state).
- `backend/`: Spring Boot app (controllers, services, persistence, config).
- `docs/`: Architecture, roadmap, design notes, bug log.

Boundary rules:
- No backend logic in frontend.
- No frontend rendering concerns in backend.
- Shared semantics flow through API contracts and docs, not shared runtime code.

## Runtime Architecture
### Frontend (`frontend`)
Target responsibilities:
- Route composition and protected navigation.
- Session-local state (active playback, hydrated dashboard data).
- Rendering analytics and player experiences.
- Calling backend endpoints through a single API base URL.

### Backend (`backend`)
Current responsibilities:
- Spotify OAuth login/callback flow.
- Spotify token exchange + profile retrieval.
- User identity/token metadata sync to PostgreSQL.
- Safe translation of Spotify payloads to frontend-ready DTOs.

Future responsibilities:
- Security hardening and access controls.
- Broader persistence model for historical analytics.
- More robust error normalization and observability.

## Session Lifecycle
1. User lands on frontend and starts OAuth.
2. Frontend redirects to backend `/api/auth/login`.
3. Backend completes OAuth callback and returns hydrated bootstrap payload.
- Access/refresh token handling is managed through backend-auth flow.
- Frontend initializes dashboard/player state from callback payload.
4. Frontend polls currently playing via backend and updates session state.
5. User interactions (range switches, snapshot creation) call backend APIs.

## Data Model
- `User` (persisted): spotify id, profile metadata, token metadata.
- `Track` (domain model): normalized track representation for analytics features.
- Spotify DTOs: API boundary objects only (not persistence entities).

Current implemented backend layers:
- `controller`: `AuthController` (`/api/auth/login`, `/api/auth/callback`)
- `service`: `SpotifyAuthService`, `UserService`
- `repository`: `UserRepository`
- `model`: `User` (`app_users` table)
- `dto`: `SpotifyTokenResponse`, `SpotifyUserDTO`

## Naming and Conventions
- Branch naming: `feat-<branch-name>`.
- Commit prefixes: `[impl]`, `[test]`, `[design]`, `[debug]`.
- Keep PRs small and scoped to 5-commit slices from `commits.txt`.
- Use clear layer naming:
- Frontend: `pages/`, `components/`.
- Backend: `controller/`, `service/`, `repository/`, `model/`, `dto/`, `config/`.

## Known Gaps
- Initial phase prioritizes rebuild velocity over full hardening.
- E2E coverage is not baseline yet.
- Token/session handling will be tightened in later milestones.

## Environment Variables
### Backend
- `SPOTIFY_CLIENT_ID`
- `SPOTIFY_CLIENT_SECRET`
- `SPOTIFY_REDIRECT_URI`
- `FRONTEND_URL`
- DB connection vars (or `application.properties` overrides)

### Frontend
- `VITE_API_BASE_URL`

## Development Commands
- Backend: `cd backend && ./mvnw spring-boot:run`
- Frontend: `cd frontend && npm install && npm run dev`
- Frontend lint: `cd frontend && npm run lint`
- Backend tests: `cd backend && ./mvnw test`
