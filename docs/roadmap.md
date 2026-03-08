# Roadmap

## Goal
Build timbre in a clean, showcaseable, industry-standard GitHub Flow, using the existing project as reference while producing a cleaner v1 codebase.

## Current Position (As Of 2026-03-07)
- Active stream: `feat-player-experience`.
- Current commit target: **Commit 19** (`[impl] add navbar profile/session controls and protected layout shell`).
- Delivery style from this point onward:
- Read `old-backend/` and `old-frontend/` first for behavior parity.
- Port to `backend/` and `frontend/` with commit-scoped changes.
- Continue strict sequence through commits 16-25.

## Immediate Baseline
- [x] Commit 1: monorepo scaffold (`backend`, `frontend`, `docs`)
- [x] Commit 2: architecture conventions, naming, and folder boundaries

## Milestone 1 — Foundation
- [x] Scaffold repo layout
- [x] Define conventions and architecture baseline
- [x] Bootstrap backend Spring Boot skeleton
- [x] Bootstrap frontend React/Vite skeleton
- [x] Add baseline CI checks (build/lint/smoke)

## Milestone 2 — Auth Foundation
- [x] Spotify configuration wiring
- [x] Auth login + callback skeleton
- [x] Spotify token/profile service
- [x] User persistence for token metadata
- [x] Auth-focused test coverage

## Milestone 3 — Dashboard Data Flow
- [x] Top tracks/artists/recent endpoints
- [x] Aggregated hydration payload
- [x] Frontend callback hydration + global state bootstrap
- [x] Dashboard overview + range switcher
- [x] Routing/state guard stabilization

## Milestone 4 — Player Experience
- [x] Live currently playing endpoint + refresh fallback (Commit 16)
- [x] Global polling and session history behavior (Commit 17)
- [x] Player page and vinyl interaction design (Commit 18)
- [x] Navbar/session shell on protected routes (Commit 19)
- [ ] Frontend tests for player + routing behavior

## Milestone 5 — Snapshot + Release
- [ ] Playlist snapshot backend endpoint
- [ ] Dashboard snapshot action integration
- [ ] API base-url consistency cleanup
- [ ] Integration tests for snapshot + range transitions
- [ ] Release `v1.0.0`
