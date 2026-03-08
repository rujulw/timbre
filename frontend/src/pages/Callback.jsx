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
    const code = params.get("code");

    if (code && !hasFetched.current) {
      hasFetched.current = true;
      
      console.log("Exchanging code for token...");
      
      fetch(`${apiBaseUrl}/api/auth/callback?code=${code}`)
        .then(res => {
          if (!res.ok) throw new Error("Backend failed");
          return res.json();
        })
        .then(data => {
            console.log("Success! Data received:", data);
            // see if history actually exists here
            console.log("History Count:", data.recentlyPlayed?.length || 0);
            
            
            if (data.accessToken) {
                localStorage.setItem('spotify_access_token', data.accessToken);
            }
            if (data.refreshToken) { 
                localStorage.setItem('spotify_refresh_token', data.refreshToken);
            } else {
                console.warn("No refreshToken found. Auto-refresh will fail.");
            }


            // profile data
            if (data.userImageUrl) {
                localStorage.setItem('user_image', data.userImageUrl);
                console.log("Saved Image:", data.userImageUrl);
            }
            if (data.profileUrl) {
                localStorage.setItem('profile_url', data.profileUrl);
                console.log("Saved Profile Link:", data.profileUrl);
            }
            if (data.displayName) {
                localStorage.setItem('display_name', data.displayName);
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
        .catch(err => {
          console.error("Fetch error:", err);
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
