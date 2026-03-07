import { useEffect, useMemo, useRef, useState } from 'react';
import { useAppState } from '../state/appState.js';

const TIME_RANGES = [
  { value: 'short_term', label: '4 Weeks' },
  { value: 'medium_term', label: '6 Months' },
  { value: 'long_term', label: 'All Time' },
];

const Dashboard = () => {
  const { appState, clearAppState } = useAppState();
  const [selectedRange, setSelectedRange] = useState('short_term');
  const [showMenu, setShowMenu] = useState(false);
  const [songs, setSongs] = useState(appState?.songs ?? []);
  const [artists, setArtists] = useState(appState?.artists ?? []);
  const [albums, setAlbums] = useState(appState?.albums ?? []);
  const [playlists] = useState(appState?.playlists ?? []);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [artistPage, setArtistPage] = useState(0);
  const [albumPage, setAlbumPage] = useState(0);
  const [playlistPage, setPlaylistPage] = useState(0);
  const switcherRef = useRef(null);
  const itemsPerPage = 5;

  useEffect(() => {
    if (!appState?.accessToken) {
      return;
    }

    if (selectedRange === 'short_term' && (appState?.songs || appState?.artists || appState?.albums)) {
      setSongs(appState?.songs ?? []);
      setArtists(appState?.artists ?? []);
      setAlbums(appState?.albums ?? []);
      setLoadError('');
      return;
    }

    let cancelled = false;

    async function loadRangeData() {
      setIsLoading(true);
      setLoadError('');

      try {
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080';
        const token = encodeURIComponent(appState.accessToken);
        const range = encodeURIComponent(selectedRange);

        const [tracksResponse, artistsResponse] = await Promise.all([
          fetch(`${apiBaseUrl}/api/auth/top-tracks?token=${token}&range=${range}`),
          fetch(`${apiBaseUrl}/api/auth/top-artists?token=${token}&range=${range}`),
        ]);

        if (!tracksResponse.ok || !artistsResponse.ok) {
          throw new Error('failed to load dashboard range');
        }

        const [tracksData, artistsData] = await Promise.all([tracksResponse.json(), artistsResponse.json()]);

        if (!cancelled) {
          setSongs(Array.isArray(tracksData) ? tracksData : []);
          setArtists(Array.isArray(artistsData) ? artistsData : []);
          setAlbums(calculateTopAlbums(Array.isArray(tracksData) ? tracksData : []));
        }
      } catch (error) {
        if (!cancelled) {
          setLoadError(error instanceof Error ? error.message : 'failed to load dashboard range');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadRangeData();

    return () => {
      cancelled = true;
    };
  }, [appState, selectedRange]);

  useEffect(() => {
    setArtistPage(0);
    setAlbumPage(0);
    setPlaylistPage(0);
  }, [selectedRange]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (switcherRef.current && !switcherRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMenu]);

  const stats = useMemo(
    () => ({
      songs: songs.length,
      artists: artists.length,
      albums: albums.length,
      playlists: playlists.length,
      recentlyPlayed: appState?.recentlyPlayed?.length ?? 0,
    }),
    [albums.length, appState?.recentlyPlayed?.length, artists.length, playlists.length, songs.length]
  );

  const getPage = (list, page) => list.slice(page * itemsPerPage, (page + 1) * itemsPerPage);

  const handleRedirect = (type, id, webUrl) => {
    if (!id) {
      return;
    }
    window.location.href = `spotify:${type}:${id}`;
    setTimeout(() => {
      if (document.hasFocus() && webUrl) {
        window.open(webUrl, '_blank');
      }
    }, 500);
  };

  return (
    <div className="mx-auto max-w-[90vw] px-4 pb-10 md:px-8">
      <main className="space-y-12">
        <p className="text-sm text-zinc-400">
          signed in as {appState?.user?.displayName ?? appState?.spotifyId ?? 'unknown user'}
        </p>

        {loadError ? <p className="text-xs text-red-400">load error: {loadError}</p> : null}

        <div className="flex flex-col items-start gap-10 lg:flex-row">
          <section className="w-full rounded-2xl border border-white/5 bg-[#121212] p-4 shadow-2xl lg:w-[35%]">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold tracking-tighter lowercase">top tracks</h2>
              <button
                type="button"
                className="h-7 rounded-full border border-white/10 px-3 py-1 text-[10px] font-medium lowercase tracking-widest text-white/30"
                disabled
              >
                make playlist
              </button>
            </div>
            <div className="h-[36.625rem] space-y-1 overflow-y-auto pr-2">
              {isLoading
                ? [...Array(10)].map((_, index) => <SkeletonTrack key={index} />)
                : songs.map((song, index) => (
                    <button
                      key={song.id ?? `${song.name}-${index}`}
                      type="button"
                      onClick={() => handleRedirect('track', song.id, song.externalUrls?.spotify)}
                      className="group flex w-full items-center gap-4 rounded-lg p-2 text-left transition-all duration-300 hover:bg-white/5"
                    >
                      <span className="w-4 text-[10px] font-mono text-zinc-700">{index + 1}</span>
                      <img src={song.album?.images?.[0]?.url} className="h-10 w-10 shadow-md" alt="" />
                      <div className="flex-1 truncate">
                        <h3 className="truncate text-sm font-bold group-hover:text-green-400">{song.name}</h3>
                        <p className="truncate text-[11px] font-bold text-zinc-400">{song.artists?.[0]?.name}</p>
                      </div>
                    </button>
                  ))}
            </div>
          </section>

          <div className="w-full flex-1 space-y-4 overflow-hidden">
            <div className="fixed right-10 top-24 z-50" ref={switcherRef}>
              <button
                type="button"
                onClick={() => setShowMenu((prev) => !prev)}
                className={`flex h-12 w-12 items-center justify-center rounded-full border transition-all duration-500 ${
                  isLoading ? 'animate-pulse border-white/40 bg-white/10' : 'border-white/10 bg-white/5 hover:bg-white/10'
                }`}
              >
                <div className="grid grid-cols-2 gap-1">
                  {[1, 2, 3, 4].map((item) => (
                    <div key={item} className={`h-1.5 w-1.5 rounded-sm ${isLoading ? 'bg-white' : 'bg-white/40'}`} />
                  ))}
                </div>
              </button>

              {showMenu ? (
                <div className="absolute right-0 top-14 w-40 rounded-2xl border border-white/10 bg-[#121212]/90 p-2 shadow-2xl backdrop-blur-xl">
                  {TIME_RANGES.map((range) => (
                    <button
                      key={range.value}
                      type="button"
                      onClick={() => {
                        setSelectedRange(range.value);
                        setShowMenu(false);
                      }}
                      className={`w-full rounded-xl p-3 text-left text-[10px] font-bold tracking-widest lowercase transition-all ${
                        selectedRange === range.value
                          ? 'bg-white/10 text-white'
                          : 'text-white/30 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

            <section>
              <PagerHeader
                title="top albums"
                onPrev={() => setAlbumPage((p) => Math.max(0, p - 1))}
                onNext={() => setAlbumPage((p) => p + 1)}
                disablePrev={albumPage === 0}
                disableNext={(albumPage + 1) * itemsPerPage >= albums.length}
              />
              <div className="grid grid-cols-5 gap-4">
                {isLoading
                  ? [...Array(5)].map((_, index) => <SkeletonAlbum key={index} />)
                  : getPage(albums, albumPage).map((album) => (
                      <button
                        key={album.id}
                        type="button"
                        onClick={() => handleRedirect('album', album.id, album.externalUrls?.spotify)}
                        className="group flex flex-col text-left"
                      >
                        <div className="mb-2 aspect-square overflow-hidden bg-white/5 shadow-2xl">
                          <img src={album.images?.[0]?.url} className="h-full w-full object-cover" alt="" />
                        </div>
                        <p className="truncate text-[10px] font-bold leading-tight text-zinc-300">{album.name}</p>
                      </button>
                    ))}
              </div>
            </section>

            <section>
              <PagerHeader
                title="top artists"
                onPrev={() => setArtistPage((p) => Math.max(0, p - 1))}
                onNext={() => setArtistPage((p) => p + 1)}
                disablePrev={artistPage === 0}
                disableNext={(artistPage + 1) * itemsPerPage >= artists.length}
              />
              <div className="grid grid-cols-5 gap-4">
                {isLoading
                  ? [...Array(5)].map((_, index) => <SkeletonArtist key={index} />)
                  : getPage(artists, artistPage).map((artist) => (
                      <button
                        key={artist.id}
                        type="button"
                        onClick={() => handleRedirect('artist', artist.id, artist.externalUrls?.spotify)}
                        className="group flex flex-col items-center p-1 text-center"
                      >
                        <div className="mb-4 aspect-square w-full overflow-hidden rounded-full border border-white/5 bg-white/5">
                          <img src={artist.images?.[0]?.url} className="h-full w-full object-cover" alt="" />
                        </div>
                        <p className="w-full truncate text-[15px] font-bold text-zinc-300 group-hover:text-white">{artist.name}</p>
                      </button>
                    ))}
              </div>
            </section>

            <section>
              <PagerHeader
                title="top playlists"
                onPrev={() => setPlaylistPage((p) => Math.max(0, p - 1))}
                onNext={() => setPlaylistPage((p) => p + 1)}
                disablePrev={playlistPage === 0}
                disableNext={(playlistPage + 1) * itemsPerPage >= playlists.length}
              />
              <div className="grid grid-cols-5 gap-4">
                {isLoading
                  ? [...Array(5)].map((_, index) => <SkeletonPlaylist key={index} />)
                  : getPage(playlists, playlistPage).map((playlist) => (
                      <button
                        key={playlist.id}
                        type="button"
                        onClick={() => handleRedirect('playlist', playlist.id, playlist.externalUrls?.spotify)}
                        className="group flex flex-col text-left"
                      >
                        <div className="mb-2 aspect-square overflow-hidden bg-white/5 shadow-2xl">
                          <img src={playlist.images?.[0]?.url} className="h-full w-full object-cover" alt="" />
                        </div>
                        <p className="truncate text-[13px] font-bold leading-tight text-zinc-300">{playlist.name}</p>
                        <p className="truncate text-[9px] uppercase tracking-tighter text-zinc-500">
                          {playlist.tracks?.total ?? 0} tracks
                        </p>
                      </button>
                    ))}
              </div>
            </section>
          </div>
        </div>

        <div className="flex items-center gap-6 text-xs uppercase tracking-[0.15em] text-zinc-500">
          <span>songs {stats.songs}</span>
          <span>artists {stats.artists}</span>
          <span>albums {stats.albums}</span>
          <span>playlists {stats.playlists}</span>
          <span>recent {stats.recentlyPlayed}</span>
          <button type="button" className="rounded-full border border-white/10 px-3 py-1 text-white/40" onClick={clearAppState}>
            clear session
          </button>
        </div>
      </main>
    </div>
  );
};

function PagerHeader({ title, onPrev, onNext, disablePrev, disableNext }) {
  return (
    <div className="mb-3 mt-3 flex items-center justify-between">
      <h2 className="text-xl font-bold tracking-tighter lowercase">{title}</h2>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onPrev}
          disabled={disablePrev}
          className="rounded-full bg-white/5 p-1 transition-all duration-200 hover:bg-white/10 disabled:opacity-10"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={disableNext}
          className="rounded-full bg-white/5 p-1 transition-all duration-200 hover:bg-white/10 disabled:opacity-10"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>
    </div>
  );
}

function SkeletonTrack() {
  return (
    <div className="flex items-center gap-4 p-2 animate-pulse">
      <div className="h-3 w-4 rounded bg-white/5 text-[10px]" />
      <div className="h-10 w-10 rounded bg-white/5 shadow-md" />
      <div className="flex-1 space-y-2">
        <div className="h-3 w-3/4 rounded bg-white/10" />
        <div className="h-2 w-1/2 rounded bg-white/5" />
      </div>
    </div>
  );
}

function SkeletonArtist() {
  return (
    <div className="flex flex-col items-center p-1 animate-pulse">
      <div className="mb-4 aspect-square w-full rounded-full bg-white/5" />
      <div className="h-3 w-1/2 rounded bg-white/10" />
    </div>
  );
}

function SkeletonAlbum() {
  return (
    <div className="flex flex-col animate-pulse">
      <div className="mb-2 aspect-square w-full rounded-lg bg-white/5" />
      <div className="mb-1 h-3 w-3/4 rounded bg-white/10" />
      <div className="h-2 w-1/2 rounded bg-white/5" />
    </div>
  );
}

function SkeletonPlaylist() {
  return (
    <div className="flex flex-col animate-pulse">
      <div className="mb-2 aspect-square w-full rounded-lg bg-white/5" />
      <div className="mb-1 h-3 w-full rounded bg-white/10" />
      <div className="h-2 w-1/3 rounded bg-white/5" />
    </div>
  );
}

function calculateTopAlbums(topTracks) {
  if (!topTracks.length) {
    return [];
  }

  const albumFrequency = new Map();

  topTracks.forEach((track) => {
    const album = track?.album;
    if (!album?.id) {
      return;
    }
    const key = album.id;
    const current = albumFrequency.get(key) ?? { album, count: 0 };
    current.count += 1;
    albumFrequency.set(key, current);
  });

  return Array.from(albumFrequency.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)
    .map((entry) => entry.album);
}

export default Dashboard;
