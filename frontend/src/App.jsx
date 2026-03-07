import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Landing from './pages/Landing.jsx';
import Callback from './pages/Callback.jsx';
import Dashboard from './pages/Dashboard.jsx';
import { AppStateProvider } from './state/AppStateProvider.jsx';
import { useAppState } from './state/appState.js';

function ProtectedDashboard() {
  const { appState } = useAppState();

  if (!appState?.accessToken) {
    return <Navigate to="/" replace />;
  }

  return <Dashboard />;
}

function App() {
  return (
    <AppStateProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/callback" element={<Callback />} />
          <Route path="/dashboard" element={<ProtectedDashboard />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AppStateProvider>
  );
}

export default App;
