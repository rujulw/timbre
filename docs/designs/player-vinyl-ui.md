# Player Vinyl UI (Commit 18)

## Scope
Commit 18 delivers the player page visual surface and interaction model:
- Vinyl deck panel (left)
- Currently playing card with reactive accent color (right, top)
- Session history rail (right, bottom)

## Reference Source
Parity source:
- `old-frontend/src/pages/Player.jsx`
- `old-frontend/src/components/VinylDisplay.jsx`

Implementation rule:
- Keep old structure/interactions intact.
- Only adapt hardcoded sizing values into responsive constraints.

## Ratio Preservation Strategy
Old layout split:
- deck panel: `flex-[0.6]`
- info/history panel: `flex-[0.4]`

Commit 18 keeps that ratio (`60/40`) on large screens and stacks on small screens.
Hardcoded pixels were converted to viewport-aware `clamp()` bounds to preserve proportions across monitor sizes.

## Styling And Motion Parity
- `animate-vinyl` + `pause-vinyl` for record spin state
- `animate-hyper` visualizer bars tied to playback status
- hover/redirect behavior for currently playing art and history rows
- custom scrollbar styling for history list

## Implementation Notes
- Added `Player` route implementation in main frontend app shell.
- Added reusable `VinylDisplay` component.
- Added CSS keyframes/utilities required by old player behavior.
- Added `react-color-extractor` dependency for dominant-color accent extraction parity.

## Verification
- `cd frontend && npm run lint`
- `cd frontend && npm run build`

## Post-Implementation Stability
- Frontend API base resolution is now centralized in `frontend/src/lib/apiBaseUrl.js`.
- Playback poller halts repeated requests if `/api/auth/currently-playing` returns `404`.
