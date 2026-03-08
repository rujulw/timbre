# Player Playback Polling

## Scope
App-level polling that keeps playback state current across routes.

## Poll Loop

- Runs in `GlobalPlaybackPoller`.
- Interval: 5 seconds.
- Reads access/refresh tokens from app state with local fallback.

## State Updates

- Sets/updates:
  - `activeTrack`
  - `currentlyPlaying`
  - `liveHistory` (deduped, capped)

## Contract Guarantees

- Safe handling when endpoint returns no item/current playback.
- History updates avoid duplicate consecutive entries.
- Access token refresh from backend response is persisted.
