# Bug Log

## 2026-03-06 - Commit 8 DTO annotation import mismatch
- Area: Backend auth DTOs (`SpotifyTokenResponse`, `SpotifyUserDTO`)
- Symptom: Maven compile failure (`package tools.jackson.annotation does not exist`)
- Root cause: Used `tools.jackson.annotation.JsonProperty` instead of `com.fasterxml.jackson.annotation.JsonProperty`.
- Fix: Replaced incorrect imports in both DTO files.
- Verification: `cd backend && ./mvnw test` passed.

## 2026-03-06 - Commit 10 Mockito inline agent and final-record mocking issues
- Area: Backend auth test harness
- Symptom 1: Mockito inline mock-maker failed to attach agent in local JDK environment.
- Fix 1: Added `backend/src/test/resources/mockito-extensions/org.mockito.plugins.MockMaker` with `mock-maker-subclass`.
- Symptom 2: `SpotifyProperties` (record/final) could not be mocked under subclass mock-maker.
- Fix 2: Updated `AuthControllerTest` to use a real `SpotifyProperties` instance instead of mocking.
- Verification: `cd backend && ./mvnw test` passed with all auth tests green.

## 2026-03-06 - Commit 11 Spotify pager null handling
- Area: Dashboard data service methods (`top tracks/artists/recently played`)
- Risk: Spotify API response body or `items` list may be absent on upstream failure/partial response.
- Fix: Guarded pager/item nulls and return empty lists instead of bubbling a `NullPointerException`.
- Verification: `cd backend && ./mvnw test` passed.

## 2026-03-06 - Commit 12 callback album aggregation null-safety
- Area: Aggregated callback hydration contract
- Risk: top-track entries may contain missing album references, which can break album grouping logic.
- Fix: Added null-safe filtering for album/grouping before deriving top albums for hydration payload.
- Verification: `cd backend && ./mvnw test` passed.

## 2026-03-06 - Commit 13 frontend state module fast-refresh lint issue
- Area: Frontend app-state module organization
- Symptom: ESLint `react-refresh/only-export-components` error when component and hooks were exported from the same file.
- Fix: Split state code into `AppStateProvider.jsx` (component export) and `appState.js` (context/hook export).
- Verification: `cd frontend && npm run lint && npm run build` passed.

## 2026-03-06 - Commit 14 range hydration fallback behavior
- Area: Dashboard time-range data updates
- Risk: switching from callback-hydrated `short_term` to other ranges can show stale stats while awaiting network.
- Fix: introduced explicit loading state + skeleton placeholders during range fetch operations.
- Verification: `cd frontend && npm run lint && npm run build` passed.

## 2026-03-06 - Commit 15 protected-route fallback hardening
- Area: Frontend route protection and session continuity
- Risk: direct navigation to protected routes without hydrated auth state can lead to unstable user flow.
- Fix: added centralized protected layout + route guard redirects to landing when auth state is missing.
- Verification: `cd frontend && npm run lint && npm run build` passed.

## 2026-03-07 - Dashboard top-tracks viewport over-expansion regression
- Area: Frontend dashboard track list sizing logic
- Symptom: rows expanded to oversized cards on larger layouts after switching from fixed viewport sizing to percentage-based row height.
- Root cause: row height was tied to an unconstrained/stretched container (`100%`-based formula) instead of a bounded viewport.
- Fix: restored bounded responsive viewport sizing (`TRACK_VIEWPORT_HEIGHT`) and derived row height from that fixed responsive bound.
- Verification: `cd frontend && npm run lint && npm run build` passed.

## 2026-03-07 - Dashboard parity drift in hover/pager interaction behavior
- Area: Frontend dashboard card transitions and pager behavior
- Symptom: album/artist/playlist page transitions did not match old-frontend interaction patterns after incremental refactors.
- Root cause: class-level parity drift (`hover`/`cursor`/entry animation classes and page-key behavior) and non-identical paging helper semantics.
- Fix: restored old-frontend interaction classes and paging semantics:
- `getPage(list, page) => list?.slice(...) || []`
- edge disabling via `(page + 1) * itemsPerPage >= (list?.length || 0)`
- per-page keys `\`${id}-${page}\`` for card remount parity.
- Verification: `cd frontend && npm run lint && npm run build` passed.

## 2026-03-07 - Commit 16 currently-playing refresh fallback hardening
- Area: Backend live playback endpoint (`/api/auth/currently-playing`)
- Risk: expired access tokens during live playback polling can cause repeated unauthorized responses and break player continuity.
- Fix: added service-level unauthorized handling with refresh-token retry, plus controller-level response normalization (`is_playing` -> `isPlaying`) and null-safe fallback payload.
- Verification: `cd backend && ./mvnw test` passed.

## 2026-03-07 - Commit 17 polling/state hydration continuity
- Area: Frontend app shell playback sync (`App.jsx`, callback hydration, app-state provider)
- Risk: without centralized polling state, player session history drifts and currently-playing status is lost between route transitions.
- Fix: added app-level polling loop (5s), deduped `liveHistory` append logic, `activeTrack`/`currentlyPlaying` sync, and callback-time state hydration into app context.
- Verification: `cd frontend && npm run lint && npm run build` passed.

## 2026-03-07 - Commit 18 vinyl layout hardcoded sizing risk
- Area: Frontend player page and vinyl deck composition
- Risk: old-frontend player used hardcoded dimensions and full-viewport assumptions that degrade on different monitor sizes.
- Fix: ported old player/vinyl structure with responsive sizing via `clamp()` and viewport-aware bounds while preserving original 60/40 layout ratio and interaction styling.
- Additional stabilization: replaced render-time randomness with deterministic seeded bar config to satisfy React purity lint rules without changing visual intent.
- Verification: `cd frontend && npm run lint && npm run build` passed.

## 2026-03-07 - Commit 18 currently-playing 404 resilience and api-base normalization
- Area: Frontend playback polling and auth callback API URL resolution
- Symptom: repeated `404` on `/api/auth/currently-playing` when API base was misconfigured or unavailable in runtime environment.
- Fix: introduced shared API base resolver (`env -> localhost in dev -> same-origin in prod`) and reused it across callback/login/dashboard/poller paths. Poller now disables further currently-playing requests when endpoint returns `404`.
- Verification: `cd frontend && npm run lint && npm run build` passed.

## 2026-03-07 - Commit 19 protected shell extraction and navbar session menu hardening
- Area: Frontend protected routing shell + session controls (`App.jsx`, `components/ProtectedRoute.jsx`, `components/ProtectedLayout.jsx`, `components/Navbar.jsx`)
- Risk: inline route guards/layout wrappers and broad `localStorage.clear()` logout can cause brittle app-shell composition and unintended client-state deletion.
- Fix: extracted reusable `ProtectedRoute` and `ProtectedLayout` components, moved protected screens to the shared shell, added navbar session dropdown (profile deep-link + logout), and replaced `localStorage.clear()` with scoped auth/session key cleanup.
- Verification: `cd frontend && npm run lint && npm run build` passed.

## 2026-03-07 - Commit 20 frontend test harness + player/route/poller coverage
- Area: Frontend test infrastructure and real-time interaction safety (`vite.config.js`, `src/test/setup.js`, `src/components/ProtectedRoute.test.jsx`, `src/pages/Player.test.jsx`, `src/App.poller.test.jsx`)
- Risk: no automated regression checks existed for route protection, live polling state updates, or player rendering contract.
- Fix: introduced Vitest + Testing Library stack, jsdom setup with deterministic `localStorage` mock, and commit-scoped tests for:
- protected route redirects and authorized pass-through
- global playback poller endpoint call + state updater behavior
- player page rendering from hydrated app-state inputs
- Verification: `cd frontend && npm run lint && npm run build && npm run test` passed.
