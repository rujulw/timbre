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
