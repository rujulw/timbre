# Player Playback Polling (Commit 17)

## Scope
Commit 17 adds frontend global playback polling and session history state updates:
- Poll endpoint: `/api/auth/currently-playing`
- Poll cadence: every 5 seconds
- App-level state updates: `activeTrack`, `currentlyPlaying`, `liveHistory`

## Reference Source
Behavior is ported from old frontend polling flow in:
- `old-frontend/src/App.jsx`

Porting intent:
- Keep polling + dedupe semantics identical in spirit.
- Keep implementation commit-scoped (no full player UI work in commit 17).

## Implemented Behavior
1. Read auth tokens from app state with localStorage fallback.
2. Call backend currently-playing endpoint with optional refresh token.
3. If response contains `newAccessToken`, persist via app-state token update flow.
4. Normalize playback payload (`currentlyPlaying` wrapper vs direct object).
5. Update active playback state:
- `activeTrack` includes `track` and `isPlaying`.
- if no current item exists, preserve track but set `isPlaying` false.
6. Update history:
- prepend only when track id differs from current first entry
- cap history size to 20
- stamp each inserted entry with `played_at` timestamp

## Callback Hydration Alignment
Callback flow now hydrates app context with:
- dashboard datasets (`songs`, `artists`, `albums`, `playlists`)
- playback bootstrap fields (`currentlyPlaying`, `activeTrack`, `liveHistory`)

This ensures polling starts from a coherent state after OAuth redirect.

## Verification
- `cd frontend && npm run lint`
- `cd frontend && npm run build`
