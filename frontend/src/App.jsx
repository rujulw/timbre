import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import LandingPage from './pages/LandingPage.jsx';
import Callback from './pages/Callback.jsx';
import Dashboard from './pages/Dashboard.jsx';
import { AppStateProvider } from './state/AppStateProvider.jsx';
import { useAppState } from './state/appState.js';
import Navbar from './components/Navbar.jsx';
import UnderConstruction from './components/UnderConstruction.jsx';

function ProtectedRoute({ children }) {
  const { appState } = useAppState();
  const legacyToken = window.localStorage.getItem('spotify_access_token');

  if (!appState?.accessToken && !legacyToken) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function ProtectedLayout({ children }) {
  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <div className="pt-[4.5rem]">{children}</div>
    </div>
  );
}

function App() {
  return (
    <AppStateProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/callback" element={<Callback />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <Dashboard />
                </ProtectedLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/player"
            element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <UnderConstruction pageName="player" />
                </ProtectedLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/stats"
            element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <UnderConstruction pageName="stats" />
                </ProtectedLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <UnderConstruction pageName="settings" />
                </ProtectedLayout>
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AppStateProvider>
  );
}

export default App;
