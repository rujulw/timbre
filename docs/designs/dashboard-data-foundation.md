# Dashboard Data Foundation Design

## Scope
Commit 11 adds backend analytics endpoints used by dashboard data flows:
- `GET /api/auth/top-tracks?token=...&range=...`
- `GET /api/auth/top-artists?token=...&range=...`
- `GET /api/auth/recently-played?token=...`

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
- Aggregated callback hydration is intentionally deferred to commit 12.
