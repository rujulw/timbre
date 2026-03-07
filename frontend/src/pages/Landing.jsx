const Landing = () => {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080';

  return (
    <main>
      <h1>timbre</h1>
      <p>Landing page scaffold. Start Spotify auth to hydrate dashboard state.</p>
      <a href={`${apiBaseUrl}/api/auth/login`}>Connect Spotify</a>
    </main>
  );
};

export default Landing;
