import { useMemo } from 'react';
import { useAppState } from '../state/appState.js';

const Dashboard = () => {
  const { appState, clearAppState } = useAppState();

  const stats = useMemo(
    () => ({
      songs: appState?.songs?.length ?? 0,
      artists: appState?.artists?.length ?? 0,
      albums: appState?.albums?.length ?? 0,
      recentlyPlayed: appState?.recentlyPlayed?.length ?? 0,
    }),
    [appState]
  );

  return (
    <main>
      <h1>Dashboard</h1>
      <p>Hydrated from callback payload.</p>
      <p>Signed in as: {appState?.user?.displayName ?? appState?.spotifyId ?? 'unknown user'}</p>
      <ul>
        <li>top songs: {stats.songs}</li>
        <li>top artists: {stats.artists}</li>
        <li>top albums: {stats.albums}</li>
        <li>recently played: {stats.recentlyPlayed}</li>
      </ul>
      <button type="button" onClick={clearAppState}>
        Clear Session State
      </button>
    </main>
  );
};

export default Dashboard;
