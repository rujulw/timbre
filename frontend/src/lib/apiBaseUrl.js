export function getApiBaseUrl() {
  const configured = import.meta.env.VITE_API_BASE_URL;
  if (configured && configured.trim().length > 0) {
    return configured.replace(/\/$/, '');
  }

  if (import.meta.env.DEV) {
    return 'http://localhost:8080';
  }

  return '';
}
