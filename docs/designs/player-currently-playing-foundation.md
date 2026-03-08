# Player Currently Playing Foundation (Commit 16)

## Scope
Commit 16 implements backend live playback retrieval with token refresh fallback:
- Endpoint target: `/api/auth/currently-playing`
- Primary source: Spotify currently-playing API
- Fallback path: refresh token flow, then retry currently-playing request

This commit is backend-first and sets the data contract for commit 17 frontend polling.

Status:
- Implemented in `backend` with controller + service coverage.
- Consumed by commit 17 frontend polling workflow.

## Reference-First Implementation Pattern
For this phase, behavior is mirrored from:
- `old-backend/src/main/java/com/rujulw/timbre/controller/AuthController.java`
- `old-backend/src/main/java/com/rujulw/timbre/service/SpotifyAuthService.java`
- `old-frontend/src/App.jsx` (polling consumption shape reference for next commit)

Porting rule:
- Reproduce behavior and response semantics first.
- Keep changes commit-scoped to commit 16 only.
- Avoid introducing commit 17+ UI/polling work in this step.

## Expected Endpoint Behavior
Input query params:
- `token` (required access token)
- `refresh` (optional refresh token)

Behavior:
1. Call Spotify currently-playing with provided access token.
2. If call fails due token expiry/unauthorized and refresh token exists:
3. Exchange refresh token for new access token.
4. Retry currently-playing call once with refreshed token.
5. Return normalized payload for frontend consumption.

## Contract Notes For Commit 17
- Frontend polling loop should treat empty/no-content responses as non-fatal.
- Response keys should be stable enough for:
- active track card rendering
- session history dedupe by track id
- is-playing state checks

## Verification Gate (Commit 16)
- Backend test pass: `cd backend && ./mvnw test`
- Keep documentation and bug log updated before moving to commit 17.
