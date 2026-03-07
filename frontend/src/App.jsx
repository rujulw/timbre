import { useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import LandingPage from './pages/LandingPage.jsx';
import Callback from './pages/Callback.jsx';
import Dashboard from './pages/Dashboard.jsx';
import { AppStateProvider } from './state/AppStateProvider.jsx';
import { useAppState } from './state/appState.js';
import Navbar from './components/Navbar.jsx';
import UnderConstruction from './components/UnderConstruction.jsx';

function ProtectedRoute({ children }) {
  const { appState } = useAppState();
  const legacyToken = window.localStorage.getItem('spotify_access_token');

  if (!appState?.accessToken && !legacyToken) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function ProtectedLayout({ children }) {
  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <div className="pt-[4.5rem]">{children}</div>
    </div>
  );
}

function GlobalPlaybackPoller() {
  const { appState, updateAuthTokens, updateAppState } = useAppState();

  useEffect(() => {
    const fetchLivePlayback = async () => {
      const accessToken = appState?.accessToken ?? window.localStorage.getItem('spotify_access_token');
      const refreshToken = appState?.refreshToken ?? window.localStorage.getItem('spotify_refresh_token');
      if (!accessToken) {
        return;
      }

      try {
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080';
        const response = await fetch(
          `${apiBaseUrl}/api/auth/currently-playing?token=${encodeURIComponent(accessToken)}${
            refreshToken ? `&refresh=${encodeURIComponent(refreshToken)}` : ''
          }`
        );

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
            const isPlaying = live.is_playing ?? live.isPlaying ?? false;
            const isNewTrack = live.item.id !== previousActiveTrack?.track?.id;
            const isPlayStatusChange = isPlaying !== previousActiveTrack?.isPlaying;

            if (isNewTrack || isPlayStatusChange) {
              nextActiveTrack = { track: live.item, isPlaying };
            }

            const firstTrackId = previousHistory[0]?.track?.id ?? previousHistory[0]?.id ?? null;
            if (firstTrackId !== live.item.id) {
              nextHistory = [{ track: live.item, played_at: new Date().toISOString() }, ...previousHistory].slice(0, 20);
            }

            nextCurrentlyPlaying = live;
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
                  <UnderConstruction pageName="player" />
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
