import { useEffect, useRef } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import LandingPage from './pages/LandingPage.jsx';
import Callback from './pages/Callback.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Player from './pages/Player.jsx';
import { AppStateProvider } from './state/AppStateProvider.jsx';
import { useAppState } from './state/appState.js';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import ProtectedLayout from './components/ProtectedLayout.jsx';
import UnderConstruction from './components/UnderConstruction.jsx';
import { getApiBaseUrl } from './lib/apiBaseUrl.js';
import { getTrackIdentity, normalizeTrack } from './lib/trackCompat.js';

export function GlobalPlaybackPoller() {
  const { appState, updateAuthTokens, updateAppState } = useAppState();
  const endpointMissingRef = useRef(false);

  useEffect(() => {
    const fetchLivePlayback = async () => {
      if (endpointMissingRef.current) {
        return;
      }

      const accessToken = appState?.accessToken ?? window.localStorage.getItem('spotify_access_token');
      const refreshToken = appState?.refreshToken ?? window.localStorage.getItem('spotify_refresh_token');
      if (!accessToken) {
        return;
      }

      try {
        const apiBaseUrl = getApiBaseUrl();
        const response = await fetch(
          `${apiBaseUrl}/api/auth/currently-playing?token=${encodeURIComponent(accessToken)}${
            refreshToken ? `&refresh=${encodeURIComponent(refreshToken)}` : ''
          }`
        );

        if (response.status === 404) {
          endpointMissingRef.current = true;
          return;
        }

        if (!response.ok) {
          return;
        }

        const payload = await response.json();
        if (payload?.newAccessToken) {
          updateAuthTokens(payload.newAccessToken, refreshToken);
        }

        const live = payload?.currentlyPlaying ?? payload;
        updateAppState((prevState) => {
          const prev = prevState ?? {};
          const previousActiveTrack = prev.activeTrack ?? null;
          const previousHistory = Array.isArray(prev.liveHistory) ? prev.liveHistory : [];

          let nextActiveTrack = previousActiveTrack;
          let nextHistory = previousHistory;
          let nextCurrentlyPlaying = prev.currentlyPlaying ?? null;

          if (live && live.item) {
            const normalizedLiveTrack = normalizeTrack(live.item);
            const currentTrackKey = getTrackIdentity(normalizedLiveTrack);
            const isPlaying = live.is_playing ?? live.isPlaying ?? false;
            const previousTrackKey = getTrackIdentity(previousActiveTrack?.track);
            const isNewTrack = currentTrackKey !== previousTrackKey;
            const isPlayStatusChange = isPlaying !== previousActiveTrack?.isPlaying;

            if (isNewTrack || isPlayStatusChange) {
              nextActiveTrack = { track: normalizedLiveTrack, isPlaying };
            }

            const firstTrackKey = getTrackIdentity(previousHistory[0]?.track ?? previousHistory[0]);
            if (firstTrackKey !== currentTrackKey) {
              const deDuplicatedHistory = previousHistory.filter((entry) => {
                const entryKey = getTrackIdentity(entry?.track ?? entry);
                return entryKey !== currentTrackKey;
              });
              nextHistory = [{ track: normalizedLiveTrack, played_at: new Date().toISOString() }, ...deDuplicatedHistory].slice(0, 20);
            }

            nextCurrentlyPlaying = { ...live, item: normalizedLiveTrack };
          } else {
            const wasPlaying = previousActiveTrack?.isPlaying ?? false;
            if (wasPlaying && previousActiveTrack?.track) {
              nextActiveTrack = { ...previousActiveTrack, isPlaying: false };
            }
            nextCurrentlyPlaying = null;
          }

          if (
            nextActiveTrack === previousActiveTrack &&
            nextHistory === previousHistory &&
            nextCurrentlyPlaying === (prev.currentlyPlaying ?? null)
          ) {
            return prev;
          }

          return {
            ...prev,
            activeTrack: nextActiveTrack,
            liveHistory: nextHistory,
            currentlyPlaying: nextCurrentlyPlaying,
          };
        });
      } catch (error) {
        console.error('Global poll error:', error);
      }
    };

    fetchLivePlayback();
    const intervalId = window.setInterval(fetchLivePlayback, 5000);
    return () => window.clearInterval(intervalId);
  }, [appState?.accessToken, appState?.refreshToken, updateAppState, updateAuthTokens]);

  return null;
}

function App() {
  return (
    <AppStateProvider>
      <BrowserRouter>
        <GlobalPlaybackPoller />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/callback" element={<Callback />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <Dashboard />
                </ProtectedLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/player"
            element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <Player />
                </ProtectedLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/stats"
            element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <UnderConstruction pageName="stats" />
                </ProtectedLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <UnderConstruction pageName="settings" />
                </ProtectedLayout>
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AppStateProvider>
  );
}

export default App;
