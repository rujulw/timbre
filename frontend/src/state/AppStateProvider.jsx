import { useMemo, useState } from 'react';
import { AppStateContext } from './appState.js';

const STORAGE_KEY = 'timbre.app_state.v1';
const LEGACY_ACCESS_TOKEN_KEY = 'spotify_access_token';
const LEGACY_REFRESH_TOKEN_KEY = 'spotify_refresh_token';
const LEGACY_DISPLAY_NAME_KEY = 'display_name';
const LEGACY_USER_IMAGE_KEY = 'user_image';
const LEGACY_PROFILE_URL_KEY = 'profile_url';

function readLegacyState() {
  try {
    const accessToken = window.localStorage.getItem(LEGACY_ACCESS_TOKEN_KEY);
    if (!accessToken) {
      return null;
    }

    const refreshToken = window.localStorage.getItem(LEGACY_REFRESH_TOKEN_KEY);
    const displayName = window.localStorage.getItem(LEGACY_DISPLAY_NAME_KEY);
    const userImage = window.localStorage.getItem(LEGACY_USER_IMAGE_KEY);
    const profileUrl = window.localStorage.getItem(LEGACY_PROFILE_URL_KEY);

    return {
      accessToken,
      refreshToken: refreshToken ?? null,
      user: {
        displayName: displayName ?? null,
        images: userImage ? [{ url: userImage }] : [],
        externalUrls: profileUrl ? { spotify: profileUrl } : {},
      },
    };
  } catch {
    return null;
  }
}

function readInitialState() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.accessToken) {
        return parsed;
      }
    }
  } catch {
    // Fall back to legacy keys below.
  }

  return readLegacyState();
}

function syncLegacyStorage(state) {
  if (!state?.accessToken) {
    window.localStorage.removeItem(LEGACY_ACCESS_TOKEN_KEY);
    window.localStorage.removeItem(LEGACY_REFRESH_TOKEN_KEY);
    window.localStorage.removeItem(LEGACY_DISPLAY_NAME_KEY);
    window.localStorage.removeItem(LEGACY_USER_IMAGE_KEY);
    window.localStorage.removeItem(LEGACY_PROFILE_URL_KEY);
    return;
  }

  window.localStorage.setItem(LEGACY_ACCESS_TOKEN_KEY, state.accessToken);

  if (state.refreshToken) {
    window.localStorage.setItem(LEGACY_REFRESH_TOKEN_KEY, state.refreshToken);
  }

  const displayName = state?.user?.displayName;
  if (displayName) {
    window.localStorage.setItem(LEGACY_DISPLAY_NAME_KEY, displayName);
  }

  const userImageUrl = state?.user?.images?.[0]?.url;
  if (userImageUrl) {
    window.localStorage.setItem(LEGACY_USER_IMAGE_KEY, userImageUrl);
  }

  const profileUrl = state?.profileUrl ?? state?.user?.externalUrls?.spotify;
  if (profileUrl) {
    window.localStorage.setItem(LEGACY_PROFILE_URL_KEY, profileUrl);
  }
}

export function AppStateProvider({ children }) {
  const [appState, setAppState] = useState(readInitialState);

  const value = useMemo(
    () => ({
      appState,
      setHydratedState: (nextState) => {
        setAppState(nextState);
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
        syncLegacyStorage(nextState);
      },
      updateAuthTokens: (accessToken, refreshToken) => {
        setAppState((prev) => {
          const nextState = {
            ...(prev ?? {}),
            accessToken,
            refreshToken: refreshToken ?? prev?.refreshToken ?? null,
          };
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
          syncLegacyStorage(nextState);
          return nextState;
        });
      },
      clearAppState: () => {
        setAppState(null);
        window.localStorage.removeItem(STORAGE_KEY);
        syncLegacyStorage(null);
      },
    }),
    [appState]
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}
