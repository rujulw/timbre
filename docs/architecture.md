# Architecture

## Overview
Timbre is a split-stack application with a strict frontend/backend boundary.

- `frontend/` (React + Vite): UI, route composition, client session state
- `backend/` (Spring Boot): OAuth, Spotify API orchestration, persistence, API contracts

The frontend never calls Spotify directly. All Spotify interactions flow through backend endpoints.

## Runtime Flow

1. User starts login from frontend.
2. Frontend redirects to backend `/api/auth/login`.
3. Backend redirects user to Spotify authorization endpoint with OAuth `state`.
4. Spotify redirects user back to frontend callback route.
5. Frontend forwards `code` and `state` to backend `/api/auth/callback`.
6. Backend exchanges token, fetches bootstrap data, and returns hydration payload.
7. Frontend hydrates global app state and routes to dashboard.
8. Global playback poller calls backend `/api/auth/currently-playing` and updates player state.

## Data Boundaries

Backend entities:
- `User` (persisted identity/token metadata)

Backend DTOs:
- Spotify API payload contracts (`SpotifyTrackDTO`, `SpotifyArtistDTO`, etc.)

Frontend normalized contracts:
- Local + Spotify tracks are normalized through `trackCompat` before UI rendering.

## Security Model (Current)

- OAuth `state` is generated and validated by backend.
- Frontend sends Spotify access token to backend via Authorization header.
- Refresh token flow uses request body/header transport (not URL query params).
- CORS is origin-configurable via environment variables.

## Key Backend Endpoints

- `GET /api/auth/login`
- `GET /api/auth/callback`
- `POST /api/auth/refresh-token`
- `GET /api/auth/currently-playing`
- `GET /api/auth/top-tracks`
- `GET /api/auth/top-artists`
- `GET /api/auth/recently-played`
- `GET /api/auth/playlists`
- `POST /api/auth/create-snapshot`

## Deployment Notes

- Configure explicit backend and frontend origins.
- Set production datasource credentials via env vars.
- Set `VITE_API_BASE_URL` for split-domain deployments.
