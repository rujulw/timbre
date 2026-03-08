import { getApiBaseUrl } from '../lib/apiBaseUrl.js';

const LandingPage = () => {
  const apiBaseUrl = getApiBaseUrl();

  const handleLogin = () => {
    window.location.href = `${apiBaseUrl}/api/auth/login`;
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-black p-10 text-white">
      <h1 className="animate-pulse text-9xl font-bold tracking-tighter lowercase">timbre.</h1>
      <p className="text-xl lowercase text-gray-400">your spotify stats. redefined.</p>

      <button
        onClick={handleLogin}
        className="rounded-full bg-green-500 px-10 py-4 text-xl font-bold lowercase text-black transition hover:scale-105"
      >
        connect spotify
      </button>
    </div>
  );
};

export default LandingPage;
