const FALLBACK_TRACK_ART = 'https://via.placeholder.com/600/1a1a1a/ffffff?text=Timbre';
const VINYL_THEME_COLORS = ['#f4d35e', '#ff7a59', '#6ee7ff', '#7dd56f', '#f78fb3', '#a78bfa', '#34d399', '#60a5fa'];

function hashString(value) {
  let hash = 0;
  const input = String(value ?? 'timbre');

  for (let i = 0; i < input.length; i += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }

  return Math.abs(hash);
}

function normalizeArtists(artists) {
  if (!Array.isArray(artists) || artists.length === 0) {
    return [{ name: '- -' }];
  }

  return artists
    .map((artist) => ({
      ...artist,
      name: artist?.name?.trim() || '- -',
    }))
    .filter((artist) => artist.name);
}

export function isSpotifyTrackUri(value) {
  return typeof value === 'string' && value.startsWith('spotify:track:');
}

export function isSpotifyLocalUri(value) {
  return typeof value === 'string' && value.startsWith('spotify:local:');
}

export function resolveTrackSource(track) {
  if (!track) {
    return 'spotify';
  }

  if (track.source === 'local' || track.is_local === true || isSpotifyLocalUri(track.uri)) {
    return 'local';
  }

  return 'spotify';
}

export function normalizeTrack(track) {
  const raw = track ?? {};
  const source = resolveTrackSource(raw);
  const albumImages = Array.isArray(raw?.album?.images) ? raw.album.images : [];
  const hasArtwork = albumImages.some((image) => Boolean(image?.url));

  return {
    ...raw,
    source,
    id: raw?.id ?? null,
    uri: raw?.uri ?? null,
    name: raw?.name?.trim() || (source === 'local' ? 'Unknown local file' : 'Unknown track'),
    artists: normalizeArtists(raw?.artists),
    album: {
      ...(raw?.album ?? {}),
      name: raw?.album?.name?.trim() || (source === 'local' ? 'Local Files' : raw?.album?.name ?? ''),
      images: hasArtwork ? albumImages : [{ url: FALLBACK_TRACK_ART }],
      hasArtwork,
    },
  };
}

export function getTrackThemeColor(track) {
  const normalized = normalizeTrack(track);
  const firstArtist = normalized.artists?.[0]?.name ?? '- -';
  const seed = normalized.uri || normalized.id || `${normalized.name}:${firstArtist}`;
  const paletteIndex = hashString(seed) % VINYL_THEME_COLORS.length;
  return VINYL_THEME_COLORS[paletteIndex];
}

export function getTrackIdentity(track) {
  const normalized = normalizeTrack(track);

  if (normalized.source === 'spotify') {
    return normalized.id || normalized.uri || normalized.name;
  }

  const firstArtist = normalized.artists?.[0]?.name ?? '- -';
  return normalized.uri || `${normalized.name}:${firstArtist}`;
}

export function getSpotifyTrackUri(track) {
  const normalized = normalizeTrack(track);

  if (normalized.source !== 'spotify') {
    return null;
  }

  if (isSpotifyTrackUri(normalized.uri)) {
    return normalized.uri;
  }

  if (isSpotifyTrackUri(normalized.id)) {
    return normalized.id;
  }

  if (typeof normalized.id === 'string' && normalized.id.trim()) {
    if (isSpotifyLocalUri(normalized.id)) {
      return null;
    }
    return `spotify:track:${normalized.id}`;
  }

  return null;
}
