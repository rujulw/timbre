import { useEffect, useMemo, useState } from 'react';
import { ColorExtractor } from 'react-color-extractor';
import { useAppState } from '../state/appState.js';
import VinylDisplay from '../components/VinylDisplay.jsx';

const Player = () => {
  const { appState } = useAppState();
  const [accentColor, setAccentColor] = useState('#22c55e');

  const liveHistory = Array.isArray(appState?.liveHistory) ? appState.liveHistory : [];
  const activeTrack = appState?.activeTrack ?? null;
  const currentTrack = activeTrack?.track || activeTrack;
  const currentId = currentTrack?.id;
  const currentUrl = currentTrack?.externalUrls?.spotify ?? currentTrack?.external_urls?.spotify;
  const currentTrackArt = (activeTrack?.track?.album || activeTrack?.album)?.images?.[0]?.url;
  const isPlaying = activeTrack?.isPlaying === true;
  const [motionTick, setMotionTick] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setMotionTick((tick) => tick + 1);
    }, 50);
    return () => window.clearInterval(interval);
  }, []);

  const visualizerConfig = useMemo(
    () =>
      [...Array(40)].map((_, i) => {
        const seeded = Math.abs(Math.sin((i + 1) * 12.9898 + 0.137));
        const seededSpeed = Math.abs(Math.sin((i + 1) * 4.1234 + 0.777));
        const seededPhase = Math.abs(Math.sin((i + 1) * 7.439 + 1.337));
        return {
          id: i,
          base: seeded * 0.42 + 0.12,
          swing: seeded * 0.38 + 0.15,
          speed: seededSpeed * 0.25 + 0.2,
          phase: seededPhase * Math.PI * 2,
        };
      }),
    []
  );

  const visualizerLevels = useMemo(() => {
    const mid = (visualizerConfig.length - 1) / 2;
    return visualizerConfig.map((bar) => {
      const centerDistance = Math.abs((bar.id - mid) / mid);
      const centerWeight = 1 - centerDistance;

      if (isPlaying) {
        const phase = motionTick * bar.speed * 0.72 + bar.phase;
        const primaryWave = (Math.sin(phase) + 1) / 2;
        const secondaryWave = (Math.sin(phase * 0.53 + bar.id * 0.7) + 1) / 2;
        const energeticLevel =
          0.08 +
          bar.base * 0.26 +
          bar.swing * 0.52 * primaryWave +
          0.24 * secondaryWave +
          centerWeight * 0.2;
        return Math.min(1, Math.max(0.07, energeticLevel));
      }

      // Keep a static profile while paused.
      const pausedLevel = 0.12 + bar.base * 0.2 + centerWeight * 0.1;
      return Math.min(0.4, Math.max(0.1, pausedLevel));
    });
  }, [isPlaying, motionTick, visualizerConfig]);

  const formatTimeAgo = (dateString) => {
    if (!dateString) {
      return '';
    }
    const now = new Date();
    const playedAt = new Date(dateString);
    const diffInMinutes = Math.floor((now - playedAt) / 60000);
    if (diffInMinutes < 1) {
      return 'now';
    }
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    }
    return `${Math.floor(diffInMinutes / 60)}h ago`;
  };

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

  const handleColors = (colors) => {
    if (colors?.length > 0) {
      setAccentColor(colors[0]);
    }
  };

  return (
    <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-450 flex-col gap-5 overflow-hidden px-4 py-4 lg:grid lg:h-[calc(100vh-5rem)] lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:gap-8 lg:px-8 lg:py-6">
      {currentTrackArt ? (
        <div className="hidden">
          <ColorExtractor key={currentTrackArt} src={currentTrackArt} getColors={handleColors} />
        </div>
      ) : null}

      <section className="relative flex min-h-[clamp(18rem,46vh,33rem)] w-full items-center justify-center lg:h-full">
        <div className="group relative flex h-full w-full items-center justify-center overflow-hidden rounded-[clamp(2rem,4vw,3rem)] border border-white/5 bg-[#2c2c2c] shadow-[0_0_100px_rgba(0,0,0,0.5)]">
          <div className="absolute left-[clamp(1rem,2.2vw,2.5rem)] top-[clamp(1rem,2.2vw,2.5rem)] text-[10px] font-black uppercase tracking-[0.5em] text-white/10">
            direct drive system / quartz lock
          </div>
          <div className="absolute bottom-[clamp(1rem,2.2vw,2.5rem)] right-[clamp(1rem,2.2vw,2.5rem)] z-50 text-[10px] font-bold uppercase tracking-[0.4em] text-white/15">
            timbre. audio / mk-7
          </div>
          <VinylDisplay track={activeTrack} isPlaying={isPlaying} key={activeTrack?.track?.id || 'vinyl-key'} />
        </div>
      </section>

      <section className="flex h-full min-h-0 w-full flex-col gap-5 lg:grid lg:grid-rows-[minmax(0,0.42fr)_minmax(0,0.58fr)] lg:gap-6">
        <div className="relative overflow-hidden rounded-[clamp(1.5rem,3vw,2rem)] border border-white/5 bg-panel p-[clamp(1.25rem,2.4vw,2rem)] shadow-2xl lg:min-h-0">
          <div className="mb-[clamp(1.5rem,2.6vw,2.5rem)] flex items-center gap-[clamp(1rem,2vw,1.5rem)]">
            <div className="group relative">
              <div onClick={() => handleRedirect('track', currentId, currentUrl)}>
                <img
                  src={currentTrackArt}
                  className="h-[clamp(4.25rem,8vw,6rem)] w-[clamp(4.25rem,8vw,6rem)] cursor-pointer shadow-2xl transition-transform duration-500 group-hover:scale-105"
                  alt=""
                />
              </div>

              {isPlaying ? (
                <div
                  className="absolute -right-2 -top-2 h-4 w-4 rounded-full animate-ping opacity-75"
                  style={{ backgroundColor: accentColor }}
                />
              ) : null}
            </div>

            <div className="min-w-0 flex-1">
              <h2 className="mb-1 text-xl font-bold tracking-tighter lowercase" style={{ color: accentColor }}>
                currently playing
              </h2>
              <h3 className="mb-1 truncate text-[clamp(1.25rem,2.2vw,1.5rem)] leading-none font-black tracking-tighter">
                {activeTrack?.track?.name || activeTrack?.name || 'nothing playing'}
              </h3>
              <p className="truncate text-sm font-bold text-white/40">
                {(activeTrack?.track?.artists || activeTrack?.artists)?.[0]?.name || '- -'}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="relative h-14 overflow-hidden rounded-xl border border-white/5 bg-white/3 px-2 py-1">
              <div className="relative z-10 flex h-full items-end justify-between gap-[0.18rem]">
                {visualizerLevels.map((level, index) => (
                  <div
                    key={visualizerConfig[index].id}
                    className="min-w-0.5 flex-1 rounded-full transition-[height,opacity] duration-150 ease-linear"
                    style={{
                      height: `${Math.round(level * 100)}%`,
                      backgroundColor: accentColor,
                      opacity: isPlaying ? 0.82 : 0.45,
                    }}
                  />
                ))}
              </div>
            </div>

            <div className="h-0.5 w-full overflow-hidden rounded-full bg-white/5">
              <div
                className="h-full transition-all duration-700"
                style={{
                  width: isPlaying ? '100%' : '38%',
                  backgroundColor: accentColor,
                  boxShadow: `0 0 10px ${accentColor}`,
                  opacity: isPlaying ? 1 : 0.45,
                }}
              />
            </div>
          </div>
        </div>

        <div className="flex min-h-[clamp(14rem,30vh,22rem)] flex-1 flex-col rounded-[clamp(1.25rem,2.4vw,1.75rem)] border border-white/5 bg-panel p-4 shadow-2xl lg:min-h-0">
          <h2 className="mb-1 text-xl font-bold tracking-tighter lowercase">recently played</h2>
          <div className="custom-scroll flex-1 space-y-1 overflow-y-auto pr-2">
            {liveHistory.slice(1).map((item, i) => {
              const trackData = item.track || item;
              const trackId = trackData?.id;
              const trackUrl = trackData?.externalUrls?.spotify ?? trackData?.external_urls?.spotify;
              return (
                <div
                  key={`${trackId}-${i}`}
                  onClick={() => handleRedirect('track', trackId, trackUrl)}
                  className={`group flex cursor-pointer items-center gap-3 rounded-xl p-3 transition-all ${
                    activeTrack?.track?.id === trackData?.id ? 'bg-white/10' : 'hover:bg-white/5'
                  }`}
                >
                  <img src={trackData?.album?.images?.[0]?.url} className="h-12 w-12 shadow-md transition-all duration-500" alt="" />
                  <div className="flex-1 truncate">
                    <div className="mb-0.5 flex items-center justify-between">
                      <h3 className="truncate text-[14px] font-bold tracking-tight text-white/90">{trackData?.name}</h3>
                      <span className="text-[10px] font-bold lowercase tracking-widest text-white/50">
                        played {formatTimeAgo(item.played_at) || 'just now'}
                      </span>
                    </div>
                    <p className="truncate text-[11px] font-bold tracking-tighter text-white/30">{trackData?.artists?.[0]?.name}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Player;
