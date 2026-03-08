# Player Vinyl UI Design

## Scope
Player screen visual composition and behavior.

## Layout

- Left: vinyl deck panel
- Right top: currently playing + visualizer
- Right bottom: recently played list

## Visual Behavior

- Vinyl spin animates only while playing.
- Accent colors are extracted from artwork when available.
- For local/no-art tracks, accent color is deterministic from a curated palette.

## Interaction Behavior

- Spotify-deeplink actions are disabled for local-only tracks.
- Recently played row highlighting uses normalized track identity.
- Internal list scrolling remains available with custom scrollbar style.
