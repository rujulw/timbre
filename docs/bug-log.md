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
