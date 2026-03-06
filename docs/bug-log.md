# Bug Log

## 2026-03-06 - Commit 8 DTO annotation import mismatch
- Area: Backend auth DTOs (`SpotifyTokenResponse`, `SpotifyUserDTO`)
- Symptom: Maven compile failure (`package tools.jackson.annotation does not exist`)
- Root cause: Used `tools.jackson.annotation.JsonProperty` instead of `com.fasterxml.jackson.annotation.JsonProperty`.
- Fix: Replaced incorrect imports in both DTO files.
- Verification: `cd backend && ./mvnw test` passed.
