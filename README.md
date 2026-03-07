# timbre

A self-hosted, privacy-first analytics platform for Spotify listening data, built with Spring Boot and React.

Timbre focuses on a clean split-stack architecture:
- backend service for OAuth, data orchestration, and persistence
- frontend client for dashboard/player UX and live session views

See:
- `docs/architecture.md` for system structure and synchronization model.
- `docs/roadmap.md` for planned refactors and feature expansion.

## Tech Stack

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
- React Router DOM
- Tailwind CSS 4
- Axios

## Project Structure

```text
new-timbre/
  backend/        # Spring Boot API + Spotify integration
  frontend/       # React/Vite client
  docs/           # architecture and design notes
  README.md
```

## Quick Start

### 1. Start backend

```bash
cd backend
./mvnw spring-boot:run
```

Backend default: `http://localhost:8080`

### 2. Start frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend default: `http://127.0.0.1:5173`

## Environment Variables

### Backend (`backend/.env` or shell env)

```bash
SPOTIFY_CLIENT_ID=
SPOTIFY_CLIENT_SECRET=
SPOTIFY_REDIRECT_URI=http://127.0.0.1:5173/callback
SPOTIFY_AUTHORIZE_URL=https://accounts.spotify.com/authorize
SPOTIFY_TOKEN_URL=https://accounts.spotify.com/api/token
SPOTIFY_API_BASE_URL=https://api.spotify.com/v1
SPOTIFY_SCOPES=user-read-email,user-read-private,user-top-read,user-read-recently-played,user-read-currently-playing,playlist-modify-private,playlist-modify-public
FRONTEND_URL=http://127.0.0.1:5173
```

### Frontend (`frontend/.env`)

```bash
VITE_API_BASE_URL=http://localhost:8080
```

## Known Gaps
- Security hardening is intentionally staged; early commits prioritize functional rebuild milestones.
- Test coverage starts focused on critical auth/data flows and expands incrementally per roadmap.
- Local Spotify token handling will be refined in later hardening phases.

## Development Workflow
- Branch naming: `feat-<branch-name>`
- Commit convention: `[impl]`, `[test]`, `[design]`, `[debug]`
- Use short-lived feature branches and open PRs in small, reviewable slices
- Keep architecture notes and decisions under `docs/`
