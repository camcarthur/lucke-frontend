import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ProtectedRoute from '../src/components/ProtectedRoute';
import { AuthContext } from '../src/context/AuthContext';
import '@testing-library/jest-dom';

describe('ProtectedRoute', () => {
  const renderWithAuth = (authValue, children = <div>Protected Content</div>) => {
    return render(
      <MemoryRouter initialEntries={['/protected']}>
        <AuthContext.Provider value={{ auth: authValue }}>
          <ProtectedRoute>{children}</ProtectedRoute>
        </AuthContext.Provider>
      </MemoryRouter>
    );
  };

  test('displays loading message when auth is loading', () => {
    renderWithAuth({ loading: true, isLoggedIn: false });
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  test('redirects to login if not authenticated', () => {
    renderWithAuth({ loading: false, isLoggedIn: false });

    // Because <Navigate> doesn't render DOM, we check what's missing
    expect(screen.queryByText(/protected content/i)).not.toBeInTheDocument();
  });

  test('renders children if authenticated', () => {
    renderWithAuth({ loading: false, isLoggedIn: true });
    expect(screen.getByText(/protected content/i)).toBeInTheDocument();
  });
});