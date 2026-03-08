import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ProtectedRoute from './ProtectedRoute.jsx';

const mockUseAppState = vi.fn();

vi.mock('../state/appState.js', () => ({
  useAppState: () => mockUseAppState(),
}));

describe('ProtectedRoute', () => {
  beforeEach(() => {
    window.localStorage.removeItem('spotify_access_token');
    mockUseAppState.mockReset();
  });

  it('redirects to landing route when auth state is missing', () => {
    mockUseAppState.mockReturnValue({ appState: null });

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route path="/" element={<div>landing</div>} />
          <Route
            path="/dashboard"
            element={(
              <ProtectedRoute>
                <div>dashboard</div>
              </ProtectedRoute>
            )}
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('landing')).toBeInTheDocument();
    expect(screen.queryByText('dashboard')).not.toBeInTheDocument();
  });

  it('allows navigation when access token exists', () => {
    mockUseAppState.mockReturnValue({ appState: { accessToken: 'token-123' } });

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route path="/" element={<div>landing</div>} />
          <Route
            path="/dashboard"
            element={(
              <ProtectedRoute>
                <div>dashboard</div>
              </ProtectedRoute>
            )}
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('dashboard')).toBeInTheDocument();
  });
});
