# Frontend Hydration Flow

## Scope
How frontend session/app state is initialized after OAuth callback.

## Route Sequence

1. `/` (landing) -> backend login redirect
2. `/callback` receives `code` + `state` from Spotify
3. Frontend calls backend callback endpoint
4. Frontend writes hydrated auth/data state
5. Frontend routes to `/dashboard`

## Hydrated State

Includes:
- auth/token metadata
- user profile metadata
- songs/artists/albums/playlists
- recently played history

## Guarding

Protected pages (`/dashboard`, `/player`, `/stats`, `/settings`) require hydrated auth state via `ProtectedRoute`.
