import { useLocation, useNavigate } from 'react-router-dom';
import { useAppState } from '../state/appState.js';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { appState, clearAppState } = useAppState();

  const userImg = appState?.user?.images?.[0]?.url ?? localStorage.getItem('user_image');
  const name = appState?.user?.displayName ?? appState?.spotifyId ?? localStorage.getItem('display_name') ?? 'User';
  const profileLink = localStorage.getItem('profile_url') ?? 'https://open.spotify.com';

  const handleNav = (path) => {
    navigate(path);
  };

  const handleLogout = () => {
    clearAppState();
    localStorage.clear();
    navigate('/', { replace: true });
  };

  return (
    <nav className="fixed inset-x-0 top-0 z-50 flex h-20 items-center justify-between border-b border-white/5 bg-black/80 px-10 backdrop-blur-md">
      <div className="text-2xl font-bold tracking-tighter lowercase">timbre.</div>

      <div className="flex gap-8 text-sm font-medium lowercase text-gray-400">
        <button
          type="button"
          onClick={() => handleNav('/dashboard')}
          className={location.pathname === '/dashboard' ? 'text-white' : 'text-gray-400 transition hover:text-white'}
        >
          overview
        </button>
        <button
          type="button"
          onClick={() => handleNav('/stats')}
          className={location.pathname === '/stats' ? 'text-white' : 'text-gray-400 transition hover:text-white'}
        >
          stats
        </button>
        <button
          type="button"
          onClick={() => handleNav('/player')}
          className={location.pathname === '/player' ? 'text-white' : 'text-gray-400 transition hover:text-white'}
        >
          player
        </button>
        <button
          type="button"
          onClick={() => handleNav('/settings')}
          className={location.pathname === '/settings' ? 'text-white' : 'text-gray-400 transition hover:text-white'}
        >
          settings
        </button>
      </div>

      <div className="flex items-center gap-4">
        <a href={profileLink} target="_blank" rel="noopener noreferrer" className="transition-transform duration-300 hover:scale-110">
          <img
            src={userImg || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1a1a1a&color=fff`}
            alt="profile"
            className="h-12 w-12 rounded-full border border-white/10 object-cover shadow-xl"
          />
        </a>
        <button
          type="button"
          onClick={handleLogout}
          className="rounded-full border border-white/10 px-4 py-1.5 text-xs lowercase transition-all duration-300 hover:bg-white hover:text-black"
        >
          logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
