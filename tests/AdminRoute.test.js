import React from 'react';
import { render, screen } from '@testing-library/react';
import AdminRoute from '../src/components/AdminRoute';
import { AuthContext } from '../src/context/AuthContext';

describe('AdminRoute', () => {
  const renderWithAuth = (authValue, children = <div>Protected Content</div>) => {
    return render(
      <AuthContext.Provider value={{ auth: authValue }}>
        <AdminRoute>{children}</AdminRoute>
      </AuthContext.Provider>
    );
  };

  test('shows loading message when auth is loading', () => {
    renderWithAuth({ loading: true });
    expect(screen.getByText(/loading.../i)).toBeInTheDocument();
  });

  test('denies access when not logged in', () => {
    renderWithAuth({ loading: false, isLoggedIn: false, user: {} });
    expect(screen.getByText(/access denied/i)).toBeInTheDocument();
    expect(screen.getByText(/do not have permission/i)).toBeInTheDocument();
  });

  test('denies access when user is not admin', () => {
    renderWithAuth({ loading: false, isLoggedIn: true, user: { role: 'user' } });
    expect(screen.getByText(/access denied/i)).toBeInTheDocument();
  });

  test('renders children when user is admin', () => {
    renderWithAuth({ loading: false, isLoggedIn: true, user: { role: 'admin' } });
    expect(screen.getByText(/protected content/i)).toBeInTheDocument();
  });
});