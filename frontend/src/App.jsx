import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Landing from './pages/Landing.jsx';
import Callback from './pages/Callback.jsx';
import Dashboard from './pages/Dashboard.jsx';
import { AppStateProvider } from './state/AppStateProvider.jsx';
import { useAppState } from './state/appState.js';
import Navbar from './components/Navbar.jsx';
import UnderConstruction from './components/UnderConstruction.jsx';

function ProtectedRoute({ children }) {
  const { appState } = useAppState();

  if (!appState?.accessToken) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function ProtectedLayout({ children }) {
  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <div className="pt-20">{children}</div>
    </div>
  );
}

function App() {
  return (
    <AppStateProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
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
