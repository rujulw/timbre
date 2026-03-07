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

## Dashboard Range UX (Commit 14)
- Added range switcher with three options:
- `4 weeks` (`short_term`)
- `6 months` (`medium_term`)
- `all time` (`long_term`)
- Uses callback payload as initial `short_term` data.
- Fetches updated top tracks/artists on range change and derives top albums client-side.
- Shows skeleton blocks while range fetch is in flight.

## Navigation And Guard Stabilization (Commit 15)
- Added protected layout shell with top navigation component.
- Added route guards for `/dashboard`, `/player`, `/stats`, and `/settings`.
- Added placeholder pages for protected routes not fully implemented yet to preserve navigation continuity.
