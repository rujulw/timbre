# Auth Foundation Design

## Scope
This note documents the current OAuth foundation used by Timbre.

## Flow

1. Frontend redirects user to backend `GET /api/auth/login`.
2. Backend builds Spotify authorization URL and includes OAuth `state`.
3. Spotify redirects user to frontend callback route with `code` + `state`.
4. Frontend forwards both values to backend `GET /api/auth/callback`.
5. Backend validates `state`, exchanges token, fetches profile/data, persists user metadata, and returns hydration payload.

## Security Decisions

- OAuth `state` is signed server-side and time-limited.
- Callback rejects invalid/missing state.
- Tokens are not passed via URL query params in app API calls.

## Persistence Mapping

- Spotify identity and token metadata are persisted on `User`.
- Frontend receives hydration payload for immediate dashboard/session initialization.
