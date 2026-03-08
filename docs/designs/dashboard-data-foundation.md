# Dashboard Data Foundation Design

## Scope
Dashboard data is hydrated at callback and refreshable by time range.

## Backend Contracts

- `GET /api/auth/top-tracks?range=<short_term|medium_term|long_term>`
- `GET /api/auth/top-artists?range=<short_term|medium_term|long_term>`
- `GET /api/auth/playlists`
- `POST /api/auth/create-snapshot`

All authenticated requests use `Authorization: Bearer <token>`.

## Frontend Behavior

- Uses callback payload as initial data source.
- Supports range switching and refreshes top tracks/artists/playlists.
- Derives top albums client-side from track data.
- Supports snapshot playlist creation with normalized Spotify URIs.

## Local Track Handling

- Local/non-Spotify tracks are filtered out of snapshot URI payloads.
- Dashboard rendering stays null-safe for missing artwork/ids.
