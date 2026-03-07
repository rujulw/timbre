# Frontend Callback Hydration Flow

## Scope
Commit 13 implements frontend hydration wiring for dashboard bootstrap.

## Route Flow
1. User starts OAuth from landing page via backend `/api/auth/login`.
2. Spotify redirects user to `/callback?code=...`.
3. Callback page sends `code` to backend `/api/auth/callback`.
4. Backend returns aggregated hydration payload.
5. Frontend stores payload in global app-state context and localStorage.
6. Frontend redirects user to `/dashboard`.

## State Contract
Hydrated state mirrors backend callback payload, including:
- auth/user metadata (`accessToken`, `refreshToken`, `user`, `spotifyId`)
- dashboard data (`songs`, `artists`, `albums`, `recentlyPlayed`)

## Global State
- `AppStateProvider` owns session state.
- `useAppState` hook exposes `appState`, `setHydratedState`, and `clearAppState`.
- Dashboard is guarded to require hydrated `accessToken`.
