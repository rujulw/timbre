import { Navigate } from 'react-router-dom';
import { useAppState } from '../state/appState.js';

const ProtectedRoute = ({ children }) => {
  const { appState } = useAppState();
  const legacyToken = window.localStorage.getItem('spotify_access_token');

  if (!appState?.accessToken && !legacyToken) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
