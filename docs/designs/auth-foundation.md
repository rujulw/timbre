# Auth Foundation Design

## Scope
This design note covers commits 6-9:
- Spotify configuration model and environment wiring
- OAuth login redirect and callback skeleton
- Spotify client service for token exchange/profile fetch
- User persistence for Spotify identity + token metadata

## Request Flow
1. Frontend navigates to backend `GET /api/auth/login`.
2. Backend builds the Spotify authorize URL from `SpotifyProperties` and redirects.
3. Spotify calls backend `GET /api/auth/callback?code=...`.
4. Backend exchanges `code` for token pair via `SpotifyAuthService`.
5. Backend fetches `/me` profile with the access token.
6. Backend upserts the `User` record via `UserService.syncUser(...)`.
7. Backend returns callback payload with token/profile snapshot.

## Data Mapping
- `SpotifyUserDTO.id` -> `User.spotifyId` (unique key)
- `SpotifyUserDTO.displayName` -> `User.displayName`
- `SpotifyUserDTO.email` -> `User.email`
- `SpotifyUserDTO.images[0].url` -> `User.profileImageUrl`
- `SpotifyTokenResponse.accessToken` -> `User.accessToken`
- `SpotifyTokenResponse.refreshToken` -> `User.refreshToken`
- `Instant.now() + expiresIn` -> `User.tokenExpiresAt`

## Design Constraints
- Keep OAuth/service persistence concerns in backend only.
- Keep DTOs external-facing; persist only normalized domain entities.
- Keep commit boundaries strict to the planned 25-commit flow.

## Follow-up
- Commit 10 delivered:
- `SpotifyAuthServiceTest` for token exchange and profile fetch happy-path requests/responses.
- `AuthControllerTest` for login redirect URL composition and callback payload contract.
