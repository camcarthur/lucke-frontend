import React, { useContext } from 'react';
import { render, waitFor, screen, fireEvent, act } from '@testing-library/react';
import AuthProvider, { AuthContext } from '../src/context/AuthContext';
import '@testing-library/jest-dom';
import { apiFetch } from '../src/api';

jest.mock('../src/api', () => ({
  apiFetch: jest.fn(),
}));

const TestComponent = () => {
  const { auth, login, signup, logout } = useContext(AuthContext);

  return (
    <>
      <div data-testid="auth-state">{auth.isLoggedIn ? 'logged-in' : 'logged-out'}</div>
      <button onClick={() => login('user', 'pass')}>Login</button>
      <button onClick={() => signup('user', 'email@test.com', 'pass')}>Signup</button>
      <button onClick={logout}>Logout</button>
    </>
  );
};

describe('AuthProvider', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('calls checkSession on mount and sets auth', async () => {
    apiFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ user: { role: 'admin', username: 'test' } }),
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() =>
      expect(screen.getByTestId('auth-state')).toHaveTextContent('logged-in')
    );
  });

  test('login sets auth state on success', async () => {
    apiFetch.mockResolvedValueOnce({ ok: false }); // checkSession
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() =>
      expect(screen.getByTestId('auth-state')).toHaveTextContent('logged-out')
    );

    apiFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ user: { role: 'admin', username: 'test' } }),
    });

    fireEvent.click(screen.getByText('Login'));

    await waitFor(() =>
      expect(screen.getByTestId('auth-state')).toHaveTextContent('logged-in')
    );
  });

  test('login sets auth state on failure and throws', async () => {
    apiFetch.mockResolvedValueOnce({ ok: false }); // checkSession
    let loginFn;

    const LoginWrapper = () => {
      const { auth, login } = useContext(AuthContext);
      loginFn = login;
      return <div data-testid="auth-state">{auth.isLoggedIn ? 'logged-in' : 'logged-out'}</div>;
    };

    render(
      <AuthProvider>
        <LoginWrapper />
      </AuthProvider>
    );

    await waitFor(() =>
      expect(screen.getByTestId('auth-state')).toHaveTextContent('logged-out')
    );

    apiFetch.mockResolvedValueOnce({ ok: false }); // login fails

    let errorCaught = null;

    await act(async () => {
      try {
        await loginFn('wronguser', 'wrongpass');
      } catch (err) {
        errorCaught = err;
      }
    });

    expect(errorCaught).toBeTruthy();
    expect(errorCaught.message).toBe('Login failed');
    expect(screen.getByTestId('auth-state')).toHaveTextContent('logged-out');
  });

  test('signup sets auth state on success', async () => {
    apiFetch.mockResolvedValueOnce({ ok: false }); // checkSession
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() =>
      expect(screen.getByTestId('auth-state')).toHaveTextContent('logged-out')
    );

    apiFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ user: { role: 'admin', username: 'newuser' } }),
    });

    fireEvent.click(screen.getByText('Signup'));

    await waitFor(() =>
      expect(screen.getByTestId('auth-state')).toHaveTextContent('logged-in')
    );
  });

  test('logout clears auth state', async () => {
    apiFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ user: { role: 'admin', username: 'test' } }),
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() =>
      expect(screen.getByTestId('auth-state')).toHaveTextContent('logged-in')
    );

    apiFetch.mockResolvedValueOnce({ ok: true });

    fireEvent.click(screen.getByText('Logout'));

    await waitFor(() =>
      expect(screen.getByTestId('auth-state')).toHaveTextContent('logged-out')
    );
  });
});