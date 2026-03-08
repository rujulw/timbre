import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppState } from '../state/appState.js';
import { getApiBaseUrl } from '../lib/apiBaseUrl.js';

const Callback = () => {
  const navigate = useNavigate();
  const hasFetched = useRef(false);
  const { setHydratedState } = useAppState();
  const apiBaseUrl = getApiBaseUrl();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const state = params.get('state');

    if (code && state && !hasFetched.current) {
      hasFetched.current = true;
      fetch(`${apiBaseUrl}/api/auth/callback?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state)}`)
        .then((res) => {
          if (!res.ok) throw new Error('Backend failed');
          return res.json();
        })
        .then((data) => {
            if (data.accessToken) {
              localStorage.setItem('spotify_access_token', data.accessToken);
            }
            if (data.refreshToken) {
              localStorage.setItem('spotify_refresh_token', data.refreshToken);
            } else {
              console.warn('No refreshToken found. Auto-refresh will fail.');
            }

            if (data.userImageUrl) {
              localStorage.setItem('user_image', data.userImageUrl);
            }
            if (data.profileUrl) {
              localStorage.setItem('profile_url', data.profileUrl);
            }
            const resolvedDisplayName = data.displayName ?? data?.user?.display_name ?? null;
            if (resolvedDisplayName) {
              localStorage.setItem('display_name', resolvedDisplayName);
            }

            const currentlyPlayingTrack = data?.currentlyPlaying?.item || data?.currentlyPlaying?.track || null;
            const currentlyPlayingStatus = data?.currentlyPlaying?.is_playing ?? data?.currentlyPlaying?.isPlaying ?? false;

            setHydratedState({
              status: data.status ?? 'dashboard_hydrated',
              userId: data.userId ?? null,
              spotifyId: data.spotifyId ?? data?.user?.id ?? null,
              accessToken: data.accessToken ?? localStorage.getItem('spotify_access_token'),
              refreshToken: data.refreshToken ?? localStorage.getItem('spotify_refresh_token'),
              expiresIn: data.expiresIn ?? null,
              user: data.user ?? null,
              profileUrl: data.profileUrl ?? data?.user?.externalUrls?.spotify ?? null,
              songs: data.songs || [],
              artists: data.artists || [],
              albums: data.albums || [],
              playlists: data.playlists || [],
              recentlyPlayed: data.recentlyPlayed || [],
              liveHistory: data.recentlyPlayed || [],
              currentlyPlaying: data.currentlyPlaying || null,
              activeTrack: currentlyPlayingTrack
                ? { track: currentlyPlayingTrack, isPlaying: currentlyPlayingStatus }
                : null,
            });

            navigate('/dashboard', { replace: true });
        })
        .catch(() => {
          navigate('/');
        });
    }
  }, [apiBaseUrl, navigate, setHydratedState]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <h1 className="text-2xl animate-pulse lowercase font-light tracking-widest">
        authenticating...
      </h1>
    </div>
  );
};

export default Callback;
