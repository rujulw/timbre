# Roadmap

## Goal
Build timbre in a clean, showcaseable, industry-standard GitHub Flow, using the existing project as reference while producing a cleaner v1 codebase.

## Current Position (As Of 2026-03-07)
- Active stream: `feat/make-playlist`.
- Current target: local-file compatibility safety layer and release hardening.
- Delivery style from this point onward:
- Read `old-backend/` and `old-frontend/` first for behavior parity.
- Port to `backend/` and `frontend/` with commit-scoped changes.
- Continue strict sequence through the remaining milestones.

## Immediate Baseline
- [x] Monorepo scaffold (`backend`, `frontend`, `docs`)
- [x] Architecture conventions, naming, and folder boundaries

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
- [x] Live currently playing endpoint + refresh fallback
- [x] Global polling and session history behavior
- [x] Player page and vinyl interaction design
- [x] Navbar/session shell on protected routes
- [x] Frontend tests for player + routing behavior

## Milestone 5 — Snapshot Workflow
- [x] Playlist snapshot backend endpoint
- [x] Dashboard snapshot action integration
- [x] API base-url consistency cleanup
- [x] Integration tests for snapshot + range transitions

## Milestone 6 — Local File Compatibility + Release
- [ ] Local-files compatibility placeholder and null-safe metadata handling
- [ ] Final UI consistency checks and pre-release polish pass
- [ ] Release `v1.0.0`
