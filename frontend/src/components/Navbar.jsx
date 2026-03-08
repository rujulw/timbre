import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppState } from '../state/appState.js';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { appState, clearAppState } = useAppState();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const userImg = appState?.user?.images?.[0]?.url ?? window.localStorage.getItem('user_image');
  const name =
    appState?.user?.displayName ??
    appState?.user?.display_name ??
    window.localStorage.getItem('display_name') ??
    appState?.spotifyId ??
    'User';
  const profileLink = appState?.profileUrl ?? appState?.user?.externalUrls?.spotify ?? window.localStorage.getItem('profile_url') ?? 'https://open.spotify.com';

  const handleNav = (path) => {
    navigate(path);
  };

  const handleLogout = () => {
    setIsLoggingOut(true);
    clearAppState();
    window.localStorage.removeItem('spotify_access_token');
    window.localStorage.removeItem('spotify_refresh_token');
    window.localStorage.removeItem('display_name');
    window.localStorage.removeItem('user_image');
    window.localStorage.removeItem('profile_url');
    navigate('/', { replace: true });
  };

  const navItems = [
    { path: '/dashboard', label: 'overview' },
    { path: '/stats', label: 'stats' },
    { path: '/player', label: 'player' },
    { path: '/settings', label: 'settings' },
  ];

  return (
    <nav className="fixed inset-x-0 top-0 z-50 h-20 border-b border-white/5 bg-black/80 backdrop-blur-md">
      <div className="mx-auto grid h-full w-full max-w-450 grid-cols-[1fr_auto_1fr] items-center gap-4 px-4 md:px-8">

        <div className="justify-self-start text-2xl font-bold tracking-tighter lowercase">timbre.</div>

        <div className="flex items-center gap-8 text-sm font-medium lowercase text-gray-400">
          {navItems.map((item) => (
            <button
              key={item.path}
              type="button"
              onClick={() => handleNav(item.path)}
              className={location.pathname === item.path ? 'text-white' : 'text-gray-400 transition hover:text-white'}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-self-end gap-3">
          <a
            href={profileLink}
            target="_blank"
            rel="noopener noreferrer"
            className="relative h-10 w-10 overflow-hidden rounded-full border border-white/10 transition-all duration-200 hover:border-white/25"
          >
            <img
              src={userImg || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1a1a1a&color=fff`}
              alt="profile"
              className="h-full w-full object-cover"
            />
          </a>
          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="rounded-full border border-white/10 px-4 py-1.5 text-xs font-medium lowercase text-white/80 transition-all duration-200 hover:bg-white hover:text-black disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoggingOut ? 'logging out...' : 'log out'}
          </button>
        </div>

      </div>
    </nav>
  );
};

export default Navbar;
