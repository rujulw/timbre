# Roadmap

## Current Goal
Ship a stable, deployable `v1.0.0` with consistent UI behavior, hardened auth flow, and clean docs.

## Completed

- OAuth login + callback bootstrap
- Dashboard range data flow
- Player view with live polling and history
- Snapshot playlist creation flow
- Local-track normalization/fallback support
- Frontend and backend test coverage for critical contracts

## Remaining Finalization Work

### Release Hardening
- Validate production env configuration end-to-end
- Run manual smoke tests for all major user flows
- Confirm no token/query leakage in runtime paths

### UX Polish
- Verify responsive behavior across small and large monitors
- Validate local-file visual fallback consistency
- Final footer/navbar/layout pass

### Documentation Finalization
- Keep all docs synchronized with current contracts and env vars
- Preserve one terminology set (`frontend`, `backend`, `api`)
- Keep release checklist authoritative and current

## Release Exit Criteria (`v1.0.0`)

- Frontend lint/test/build green
- Backend test/package green
- Manual smoke test complete
- Documentation reviewed and consistent
