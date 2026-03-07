import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAppState } from '../state/appState.js';

const Callback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setHydratedState } = useAppState();
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function hydrateFromCallbackCode() {
      const code = searchParams.get('code');
      if (!code) {
        setError('missing spotify oauth code');
        return;
      }

      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080';
      const response = await fetch(`${apiBaseUrl}/api/auth/callback?code=${encodeURIComponent(code)}`);
      if (!response.ok) {
        throw new Error(`callback failed with status ${response.status}`);
      }

      const payload = await response.json();
      if (!cancelled) {
        setHydratedState(payload);
        navigate('/dashboard', { replace: true });
      }
    }

    hydrateFromCallbackCode().catch((err) => {
      if (!cancelled) {
        setError(err instanceof Error ? err.message : 'failed to hydrate state');
      }
    });

    return () => {
      cancelled = true;
    };
  }, [navigate, searchParams, setHydratedState]);

  return (
    <main>
      <h1>authenticating...</h1>
      {error ? <p>callback error: {error}</p> : <p>hydrating dashboard state...</p>}
    </main>
  );
};

export default Callback;
