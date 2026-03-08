# Dashboard Data Foundation Design

## Scope
Commit 11 adds backend analytics endpoints used by dashboard data flows:
- `GET /api/auth/top-tracks?token=...&range=...`
- `GET /api/auth/top-artists?token=...&range=...`
- `GET /api/auth/recently-played?token=...`
- `POST /api/auth/create-snapshot?token=...` (snapshot playlist creation from selected dashboard track set)

## Service Responsibilities
`SpotifyAuthService` now provides:
- `getTopTracks(accessToken, timeRange)`
- `getTopArtists(accessToken, timeRange)`
- `getRecentlyPlayed(accessToken)`

Each method calls Spotify Web API through `RestClient`, maps the result via `SpotifyPager<T>`, and returns list payloads for controller responses.

## DTO Layer
Added DTOs aligned to Spotify response shape:
- `SpotifyTrackDTO`
- `SpotifyArtistDTO`
- `SpotifyRecentlyPlayedDTO`
- `SpotifyPager<T>`

## API Contract Notes
- `range` defaults to `short_term`.
- Endpoint payloads are raw typed lists for now.
- Aggregated callback hydration (commit 12) now returns:
- auth/user metadata (`accessToken`, `refreshToken`, `expiresIn`, `userId`, `spotifyId`, `user`)
- dashboard bootstrap data (`songs`, `artists`, `albums`, `recentlyPlayed`)
- Snapshot creation contract:
- request body: `{ "name": string, "uris": string[] }`
- URI normalization: plain track ids are converted to `spotify:track:<id>` before add-tracks call.
