import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Dashboard from './Dashboard.jsx';

const mockUseAppState = vi.fn();

vi.mock('../state/appState.js', () => ({
  useAppState: () => mockUseAppState(),
}));

describe('Dashboard integration behaviors', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
    window.localStorage.removeItem('spotify_access_token');
    window.localStorage.removeItem('spotify_refresh_token');
  });

  it('creates snapshot playlist with contextual name and normalized uris', async () => {
    mockUseAppState.mockReturnValue({
      appState: {
        accessToken: 'token-abc',
        songs: [
          {
            id: 'track-1',
            name: 'Song One',
            artists: [{ name: 'Artist One' }],
            album: { images: [{ url: 'https://example.com/a.jpg' }] },
            externalUrls: { spotify: 'https://open.spotify.com/track/track-1' },
          },
          {
            id: 'spotify:track:track-2',
            name: 'Song Two',
            artists: [{ name: 'Artist Two' }],
            album: { images: [{ url: 'https://example.com/b.jpg' }] },
            externalUrls: { spotify: 'https://open.spotify.com/track/track-2' },
          },
          {
            id: null,
            uri: 'spotify:local:Artist:Album:Title',
            source: 'local',
            name: 'Local Song',
            artists: [{ name: 'Artist Local' }],
            album: { images: [] },
          },
        ],
        artists: [],
        albums: [],
        playlists: [],
      },
      updateAuthTokens: vi.fn(),
    });

    globalThis.fetch = vi.fn((url) => {
      if (url.includes('/top-tracks') || url.includes('/top-artists') || url.includes('/playlists')) {
        return Promise.resolve({ ok: true, status: 200, json: async () => [] });
      }

      if (url.includes('/create-snapshot')) {
        return Promise.resolve({ ok: true, status: 200, json: async () => ({ snapshot_id: 'snap-1' }) });
      }

      return Promise.resolve({ ok: true, status: 200, json: async () => ({}) });
    });

    render(<Dashboard />);

    fireEvent.click(screen.getByRole('button', { name: /make playlist/i }));

    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/auth/create-snapshot'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({ Authorization: 'Bearer token-abc' }),
        })
      );
    });

    const snapshotCall = globalThis.fetch.mock.calls.find((call) => call[0].includes('/api/auth/create-snapshot'));
    const [url, options] = snapshotCall;
    expect(url).toContain('/api/auth/create-snapshot');
    expect(options.method).toBe('POST');

    const payload = JSON.parse(options.body);
    const now = new Date();
    const yearShort = now.getFullYear().toString().slice(-2);
    const monthFull = now.toLocaleString('default', { month: 'long' }).toLowerCase();
    expect(payload.name).toBe(`${monthFull} '${yearShort}`);
    expect(payload.uris).toEqual([
      'spotify:track:track-1',
      'spotify:track:track-2',
    ]);
  });

  it('fetches top data with selected medium_term range', async () => {
    mockUseAppState.mockReturnValue({
      appState: {
        accessToken: 'token-xyz',
      },
      updateAuthTokens: vi.fn(),
    });

    globalThis.fetch = vi.fn((url) => {
      const authHeader = 'Bearer token-xyz';

      if (url.includes('/top-tracks')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ([
            {
              id: 'track-medium-1',
              name: 'Medium Song',
              artists: [{ name: 'Medium Artist' }],
              album: {
                id: 'album-medium-1',
                name: 'Medium Album',
                images: [{ url: 'https://example.com/c.jpg' }],
              },
              externalUrls: { spotify: 'https://open.spotify.com/track/track-medium-1' },
            },
          ]),
          headers: { Authorization: authHeader },
        });
      }

      if (url.includes('/top-artists')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ([
            {
              id: 'artist-medium-1',
              name: 'Medium Artist',
              images: [{ url: 'https://example.com/artist.jpg' }],
              externalUrls: { spotify: 'https://open.spotify.com/artist/artist-medium-1' },
            },
          ]),
          headers: { Authorization: authHeader },
        });
      }

      return Promise.resolve({
        ok: true,
        status: 200,
        json: async () => ([
          {
            id: 'playlist-medium-1',
            name: 'Medium Playlist',
            images: [{ url: 'https://example.com/pl.jpg' }],
            tracks: { total: 5 },
            externalUrls: { spotify: 'https://open.spotify.com/playlist/playlist-medium-1' },
          },
        ]),
        headers: { Authorization: authHeader },
      });
    });

    render(<Dashboard />);

    fireEvent.click(screen.getByRole('button', { name: /toggle time range menu/i }));
    fireEvent.click(screen.getByRole('button', { name: '6 Months' }));

    await waitFor(() => {
      const requestedUrls = globalThis.fetch.mock.calls.map((call) => call[0]);
      expect(requestedUrls.some((url) => url.includes('/top-tracks') && url.includes('range=medium_term'))).toBe(true);
      expect(requestedUrls.some((url) => url.includes('/top-artists') && url.includes('range=medium_term'))).toBe(true);
    });

    expect(await screen.findByText('Medium Song')).toBeInTheDocument();
  });
});
