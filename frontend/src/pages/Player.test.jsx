import { useEffect } from 'react';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Player from './Player.jsx';

const mockUseAppState = vi.fn();

vi.mock('../state/appState.js', () => ({
  useAppState: () => mockUseAppState(),
}));

vi.mock('react-color-extractor', () => ({
  ColorExtractor: ({ getColors }) => {
    useEffect(() => {
      getColors?.(['#a855f7']);
    }, [getColors]);
    return null;
  },
}));

describe('Player page', () => {
  beforeEach(() => {
    window.localStorage.removeItem('player_accent_color');
    mockUseAppState.mockReset();
  });

  it('renders currently playing and recently played sections from app state', () => {
    mockUseAppState.mockReturnValue({
      appState: {
        activeTrack: {
          isPlaying: true,
          track: {
            id: 'track-1',
            name: 'Touch',
            artists: [{ name: 'KATSEYE' }],
            album: { images: [{ url: 'https://example.com/cover.jpg' }] },
            externalUrls: { spotify: 'https://open.spotify.com/track/track-1' },
          },
        },
        liveHistory: [
          { track: { id: 'track-1', name: 'Touch', artists: [{ name: 'KATSEYE' }], album: { images: [{ url: 'https://example.com/cover.jpg' }] } } },
          { track: { id: 'track-2', name: 'Debut', artists: [{ name: 'KATSEYE' }], album: { images: [{ url: 'https://example.com/cover2.jpg' }] } }, played_at: new Date().toISOString() },
        ],
      },
    });

    render(<Player />);

    expect(screen.getByText('currently playing')).toBeInTheDocument();
    expect(screen.getByText('Touch')).toBeInTheDocument();
    expect(screen.getByText('recently played')).toBeInTheDocument();
    expect(screen.getByText('Debut')).toBeInTheDocument();
  });
});
