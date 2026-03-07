# Architecture

## Overview
`timbre` is a split-stack music analytics product with a strict boundary between:
- `frontend` (React/Vite): presentation, session UI state, navigation.
- `backend` (Spring Boot): OAuth, Spotify API orchestration, persistence.

Current model:
- Monorepo with two deployable applications.
- Frontend and backend communicate only via HTTP API contracts.
- Spotify is treated as an external integration owned by backend.

## Current Delivery Stage (As Of 2026-03-07)
- Active branch track: `feat-player-experience`.
- Commit position: **Commit 16** (`[impl] add live currently playing endpoint with token refresh fallback`).
- Execution pattern from this point:
- Use `old-backend/` and `old-frontend/` as behavior references.
- Re-implement in `backend/` and `frontend/` with clean boundaries.
- Keep commit ordering strict to `commits.txt` (16 -> 25) without skipping ahead.

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

Current frontend state model:
- Callback route exchanges `code` via backend callback endpoint.
- Hydration payload is stored in app-level context + localStorage persistence.
- Dashboard route reads hydrated state from global context.
- Dashboard supports time-range switching (`short_term`, `medium_term`, `long_term`) for top tracks/artists.
- Dashboard uses loading skeleton states while range data is being fetched.
- Protected layout wraps authenticated routes and applies consistent top navigation shell.
- Route guards enforce authenticated access to dashboard/player/stats/settings paths.
- Player route remains a guarded placeholder until commits 17-18 wire polling and player UI.

### Backend (`backend`)
Current responsibilities:
- Spotify OAuth login/callback flow.
- Spotify token exchange + profile retrieval.
- User identity/token metadata sync to PostgreSQL.
- Spotify analytics endpoints for top tracks, top artists, and recently played.
- Safe translation of Spotify payloads to frontend-ready DTOs.

Commit-16 in-progress responsibility:
- Add `/api/auth/currently-playing` endpoint behavior aligned to old backend:
- Primary fetch against Spotify currently-playing API.
- Token refresh fallback on unauthorized/expired token paths.
- Normalized response payload for frontend polling consumers.

Future responsibilities:
- Security hardening and access controls.
- Broader persistence model for historical analytics.
- More robust error normalization and observability.

## Session Lifecycle
1. User lands on frontend and starts OAuth.
2. Frontend redirects to backend `/api/auth/login`.
3. Backend completes OAuth callback and returns hydrated bootstrap payload.
- Access/refresh token handling is managed through backend-auth flow.
- Frontend initializes dashboard state from aggregated callback data (`songs`, `artists`, `albums`, `recentlyPlayed`) and auth metadata.
4. Commit 16 establishes backend currently-playing endpoint with refresh fallback.
5. Commit 17 introduces frontend polling/session-history loop consuming that endpoint.
6. User interactions (range switches, snapshot creation) call backend APIs.

## Data Model
- `User` (persisted): spotify id, profile metadata, token metadata.
- `Track` (domain model): normalized track representation for analytics features.
- Spotify DTOs: API boundary objects only (not persistence entities).

Current implemented backend layers:
- `controller`: `AuthController` (`/api/auth/login`, `/api/auth/callback`, `/api/auth/refresh-token`, `/api/auth/currently-playing`)
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
- Reference-first workflow for commits 16+:
- Read old implementation in `old-backend/` and `old-frontend/`.
- Port behavior with minimal divergence.
- Validate each commit with tests/build before advancing.

## Known Gaps
- Initial phase prioritizes rebuild velocity over full hardening.
- E2E coverage is not baseline yet.
- Auth happy-path coverage now includes:
- Service tests for token exchange and profile fetch behavior.
- Controller tests for login redirect and callback payload contract.
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
