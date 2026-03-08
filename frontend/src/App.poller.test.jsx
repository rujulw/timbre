import { render, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GlobalPlaybackPoller } from './App.jsx';

const mockUseAppState = vi.fn();
const mockGetApiBaseUrl = vi.fn();

vi.mock('./state/appState.js', () => ({
  useAppState: () => mockUseAppState(),
}));

vi.mock('./lib/apiBaseUrl.js', () => ({
  getApiBaseUrl: () => mockGetApiBaseUrl(),
}));

describe('GlobalPlaybackPoller', () => {
  beforeEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
    window.localStorage.removeItem('spotify_access_token');
    window.localStorage.removeItem('spotify_refresh_token');
    mockGetApiBaseUrl.mockReturnValue('http://api.test');
  });

  it('polls currently-playing endpoint and updates active track/history state', async () => {
    const updateAuthTokens = vi.fn();
    const updateAppState = vi.fn();

    mockUseAppState.mockReturnValue({
      appState: { accessToken: 'access-1', refreshToken: 'refresh-1' },
      updateAuthTokens,
      updateAppState,
    });

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        currentlyPlaying: {
          is_playing: true,
          item: { id: 'track-123', name: 'Track 123' },
        },
      }),
    });

    render(<GlobalPlaybackPoller />);

    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalledWith(
        'http://api.test/api/auth/currently-playing',
        {
          headers: {
            Authorization: 'Bearer access-1',
            'X-Refresh-Token': 'refresh-1',
          },
        }
      );
      expect(updateAppState).toHaveBeenCalled();
    });

    const updater = updateAppState.mock.calls[0][0];
    const nextState = updater({ liveHistory: [], currentlyPlaying: null, activeTrack: null });

    expect(nextState.activeTrack).toEqual(
      expect.objectContaining({
        track: expect.objectContaining({ id: 'track-123', name: 'Track 123' }),
        isPlaying: true,
      })
    );
    expect(nextState.liveHistory[0].track.id).toBe('track-123');
    expect(nextState.currentlyPlaying.item.id).toBe('track-123');
  });
});
