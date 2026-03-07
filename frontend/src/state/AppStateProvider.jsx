import { useMemo, useState } from 'react';
import { AppStateContext } from './appState.js';

const STORAGE_KEY = 'timbre.app_state.v1';

function readInitialState() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }
    return JSON.parse(raw);
  } catch {
    return null;
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
      },
      clearAppState: () => {
        setAppState(null);
        window.localStorage.removeItem(STORAGE_KEY);
      },
    }),
    [appState]
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}
