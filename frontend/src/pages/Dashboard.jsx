import { useEffect, useRef, useState } from 'react';
import { useAppState } from '../state/appState.js';
import { getApiBaseUrl } from '../lib/apiBaseUrl.js';

const TIME_RANGES = [
  { value: 'short_term', label: '4 Weeks' },
  { value: 'medium_term', label: '6 Months' },
  { value: 'long_term', label: 'All Time' },
];
const VISIBLE_TRACK_ROWS = 10;
const TRACK_ROW_GAP = '0.2rem';
const TRACK_VIEWPORT_HEIGHT = 'clamp(32rem, 62vh, 44rem)';
const RAIL_TILE_SIZE = 'clamp(6.6rem, 8.6vw, 9.6rem)';
const ARTIST_TILE_SIZE = RAIL_TILE_SIZE;

const trackRowHeight = `calc((${TRACK_VIEWPORT_HEIGHT} - (${VISIBLE_TRACK_ROWS} - 1) * ${TRACK_ROW_GAP}) / ${VISIBLE_TRACK_ROWS})`;

const Dashboard = () => {
  const { appState, updateAuthTokens } = useAppState();
  const [selectedRange, setSelectedRange] = useState('short_term');
  const [showMenu, setShowMenu] = useState(false);
  const [songs, setSongs] = useState(appState?.songs ?? []);
  const [artists, setArtists] = useState(appState?.artists ?? []);
  const [albums, setAlbums] = useState(appState?.albums ?? []);
  const [playlists, setPlaylists] = useState(appState?.playlists ?? []);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [artistPage, setArtistPage] = useState(0);
  const [albumPage, setAlbumPage] = useState(0);
  const [playlistPage, setPlaylistPage] = useState(0);
  const switcherRef = useRef(null);
  const itemsPerPage = 5;

  useEffect(() => {
    const accessToken = appState?.accessToken ?? window.localStorage.getItem('spotify_access_token');
    const refreshToken = appState?.refreshToken ?? window.localStorage.getItem('spotify_refresh_token');

    if (!accessToken) {
      return;
    }

    if (selectedRange === 'short_term' && (appState?.songs || appState?.artists || appState?.albums)) {
      setSongs(appState?.songs ?? []);
      setArtists(appState?.artists ?? []);
      setAlbums(appState?.albums ?? []);
      setPlaylists(appState?.playlists ?? []);
      setLoadError('');
      return;
    }

    let cancelled = false;

    async function loadRangeData() {
      setIsLoading(true);
      setLoadError('');

      try {
        const apiBaseUrl = getApiBaseUrl();
        const range = encodeURIComponent(selectedRange);
        let activeToken = accessToken;

        const loadTopData = (tokenValue) =>
          Promise.all([
            fetch(`${apiBaseUrl}/api/auth/top-tracks?token=${encodeURIComponent(tokenValue)}&range=${range}`),
            fetch(`${apiBaseUrl}/api/auth/top-artists?token=${encodeURIComponent(tokenValue)}&range=${range}`),
            fetch(`${apiBaseUrl}/api/auth/playlists?token=${encodeURIComponent(tokenValue)}`),
          ]);

        let [tracksResponse, artistsResponse, playlistsResponse] = await loadTopData(activeToken);

        if (
          (tracksResponse.status === 401 || artistsResponse.status === 401 || playlistsResponse.status === 401) &&
          refreshToken
        ) {
          const refreshResponse = await fetch(
            `${apiBaseUrl}/api/auth/refresh-token?refreshToken=${encodeURIComponent(refreshToken)}`
          );
          if (refreshResponse.ok) {
            const refreshed = await refreshResponse.json();
            if (refreshed?.accessToken) {
              activeToken = refreshed.accessToken;
              updateAuthTokens(refreshed.accessToken, refreshed.refreshToken);
              [tracksResponse, artistsResponse, playlistsResponse] = await loadTopData(activeToken);
            }
          }
        }

        if (!tracksResponse.ok || !artistsResponse.ok || !playlistsResponse.ok) {
          throw new Error('failed to load dashboard range');
        }

        const [tracksData, artistsData, playlistsData] = await Promise.all([
          tracksResponse.json(),
          artistsResponse.json(),
          playlistsResponse.json(),
        ]);

        if (!cancelled) {
          setSongs(Array.isArray(tracksData) ? tracksData : []);
          setArtists(Array.isArray(artistsData) ? artistsData : []);
          setAlbums(calculateTopAlbums(Array.isArray(tracksData) ? tracksData : []));
          setPlaylists(Array.isArray(playlistsData) ? playlistsData : []);
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
  }, [appState, selectedRange, updateAuthTokens]);

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

  const getPage = (list, page) => list?.slice(page * itemsPerPage, (page + 1) * itemsPerPage) || [];

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
    <div className="w-full px-4 pb-10 md:px-8 xl:px-12">
      <main className="mx-auto w-full max-w-355 space-y-7">
        {loadError ? <p className="text-xs text-red-400">load error: {loadError}</p> : null}

        <div className="flex w-full flex-col items-stretch gap-8 xl:gap-10 lg:flex-row">
          <section className="flex w-full flex-col rounded-2xl border border-white/5 bg-panel p-4 shadow-2xl lg:basis-[35%] lg:min-w-92ax-w-[34rem]">
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

            <div
              className="flex flex-col overflow-y-auto pr-2"
              style={{
                height: TRACK_VIEWPORT_HEIGHT,
                gap: TRACK_ROW_GAP,
              }}
            >
              {isLoading
                ? [...Array(10)].map((_, index) => <SkeletonTrack key={index} />)
                : songs.map((song, index) => (
                    <button
                      key={`${song.id ?? 'song'}-${index}`}
                      type="button"
                      onClick={() => handleRedirect('track', song.id, song.externalUrls?.spotify)}
                      className="group flex w-full shrink-0 items-center gap-3 rounded-lg px-2 py-1 text-left transition-all duration-300 hover:bg-white/5 cursor-pointer"
                      style={{ height: trackRowHeight }}
                    >
                      <span className="w-4 shrink-0 text-[10px] font-mono text-zinc-700">{index + 1}</span>
                      <img
                        src={song.album?.images?.[0]?.url}
                        className="h-9 w-9 shrink-0 shadow-md"
                        alt=""
                      />
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate text-sm font-bold group-hover:text-green-400">{song.name}</h3>
                        <p className="truncate text-[11px] font-bold text-zinc-400">
                          {song.artists?.[0]?.name}
                        </p>
                      </div>
                    </button>
                  ))}
            </div>
          </section>

          <div className="w-full space-y-2 overflow-hidden lg:basis-[65%]">
            <div className="fixed right-4 top-24 z-50" ref={switcherRef}>
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
                <div className="absolute right-0 top-14 w-40 rounded-2xl border border-white/10 bg-panel/90 p-2 shadow-2xl backdrop-blur-xl">
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
                disableNext={(albumPage + 1) * itemsPerPage >= (albums?.length || 0)}
              />
              <div className="grid grid-cols-5 gap-3">
                {isLoading
                  ? [...Array(5)].map((_, index) => <SkeletonAlbum key={index} />)
                  : getPage(albums, albumPage).map((album, i) => (
                      <button
                        key={`${album.id ?? 'album'}-${albumPage}-${i}`}
                        type="button"
                        onClick={() => handleRedirect('album', album.id, album.externalUrls?.spotify)}
                        className="relative flex flex-col group cursor-pointer hover:bg-white/3 animate-in fade-in slide-in-from-right-8 text-left"
                        style={{
                          width: RAIL_TILE_SIZE,
                          animationDelay: `${i * 40}ms`,
                          animationFillMode: 'both',
                        }}
                      >
                        <div className="mb-2 overflow-hidden bg-white/5 shadow-2xl" style={{ width: RAIL_TILE_SIZE, height: RAIL_TILE_SIZE }}>
                          <img
                            src={album.images?.[0]?.url}
                            className="w-full h-full object-cover transition-transform duration-700"
                            alt=""
                          />
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
                disableNext={(artistPage + 1) * itemsPerPage >= (artists?.length || 0)}
              />
              <div key={artistPage} className="grid grid-cols-5 gap-4 -mx-2 px-2 overflow-visible">
                {isLoading
                  ? [...Array(5)].map((_, index) => <SkeletonArtist key={index} />)
                  : getPage(artists, artistPage).map((artist, i) => (
                      <button
                        key={`${artist.id ?? 'artist'}-${artistPage}-${i}`}
                        type="button"
                        onClick={() => handleRedirect('artist', artist.id, artist.externalUrls?.spotify)}
                        className="relative flex flex-col items-center p-1 transition-all duration-300 ease-out group cursor-pointer hover:bg-white/3 hover:z-50 active:scale-95 animate-in fade-in slide-in-from-right-8 text-center"
                        style={{
                          width: ARTIST_TILE_SIZE,
                          animationDelay: `${i * 40}ms`,
                          animationFillMode: 'both',
                        }}
                      >
                        <div
                          className="w-full aspect-square rounded-full overflow-hidden border border-white/5 transition-transform duration-500 group-hover:scale-105 bg-white/5 mb-4"
                        >
                          <img
                            src={artist.images?.[0]?.url}
                            className="w-full aspect-square object-cover h-full transition-all duration-700"
                            alt=""
                          />
                        </div>
                        <p className="w-full truncate text-[15px] font-bold text-gray-300 hover:text-white">{artist.name}</p>
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
                disableNext={(playlistPage + 1) * itemsPerPage >= (playlists?.length || 0)}
              />
              <div className="grid grid-cols-5 gap-3">
                {isLoading
                  ? [...Array(5)].map((_, index) => <SkeletonPlaylist key={index} />)
                  : getPage(playlists, playlistPage).map((playlist, i) => (
                      <button
                        key={`${playlist.id ?? 'playlist'}-${playlistPage}-${i}`}
                        type="button"
                        onClick={() =>
                          handleRedirect('playlist', playlist.id, playlist.externalUrls?.spotify ?? playlist.external_urls?.spotify)
                        }
                        className="relative flex flex-col group cursor-pointer hover:bg-white/3 animate-in fade-in slide-in-from-right-8 text-left"
                        style={{
                          width: RAIL_TILE_SIZE,
                          animationDelay: `${i * 40}ms`,
                          animationFillMode: 'both',
                        }}
                      >
                        <div className="mb-2 overflow-hidden bg-white/5 shadow-2xl" style={{ width: RAIL_TILE_SIZE, height: RAIL_TILE_SIZE }}>
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
          className="rounded-full bg-white/5 p-1 transition-all duration-200 hover:bg-white/10 active:scale-90 disabled:opacity-10"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={disableNext}
          className="rounded-full bg-white/5 p-1 transition-all duration-200 hover:bg-white/10 active:scale-90 disabled:opacity-10"
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
    <div
      className="flex shrink-0 items-center gap-3 p-2 animate-pulse"
      style={{ height: trackRowHeight }}
    >
      <div className="h-3 w-4 rounded bg-white/5 text-[10px]" />
      <div className="h-9 w-9 rounded bg-white/5 shadow-md" />
      <div className="min-w-0 flex-1 space-y-2">
        <div className="h-3 w-3/4 rounded bg-white/10" />
        <div className="h-2 w-1/2 rounded bg-white/5" />
      </div>
    </div>
  );
}

function SkeletonArtist() {
  return (
    <div className="flex flex-col items-center p-1 animate-pulse">
      <div className="mb-3 rounded-full bg-white/5" style={{ width: ARTIST_TILE_SIZE, height: ARTIST_TILE_SIZE }} />
      <div className="h-3 w-1/2 rounded bg-white/10" />
    </div>
  );
}

function SkeletonAlbum() {
  return (
    <div className="flex flex-col animate-pulse">
      <div className="mb-2 rounded-lg bg-white/5" style={{ width: RAIL_TILE_SIZE, height: RAIL_TILE_SIZE }} />
      <div className="mb-1 h-3 w-3/4 rounded bg-white/10" />
      <div className="h-2 w-1/2 rounded bg-white/5" />
    </div>
  );
}

function SkeletonPlaylist() {
  return (
    <div className="flex flex-col animate-pulse">
      <div className="mb-2 rounded-lg bg-white/5" style={{ width: RAIL_TILE_SIZE, height: RAIL_TILE_SIZE }} />
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
