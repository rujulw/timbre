# Player Currently Playing Foundation

## Scope
Backend live playback endpoint and frontend consumption contract.

## Endpoint

- `GET /api/auth/currently-playing`

Headers:
- `Authorization: Bearer <access-token>`
- `X-Refresh-Token: <refresh-token>` (optional)

## Behavior

- Attempts currently-playing fetch with access token.
- On unauthorized + refresh token available, refreshes access token and retries.
- Returns normalized payload including `isPlaying` alias and optional `newAccessToken`.

## Frontend Use

- Global poller calls endpoint every 5 seconds.
- Updates `activeTrack`, `currentlyPlaying`, and deduped `liveHistory`.
