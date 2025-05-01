import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AuthPage from '../src/pages/AuthPage';
import { AuthContext } from '../src/context/AuthContext';
import { BrowserRouter } from 'react-router-dom';

jest.mock('react-router-dom', () => {
  const original = jest.requireActual('react-router-dom');
  return {
    ...original,
    useNavigate: () => jest.fn(),
  };
});

const renderWithContext = (authOverrides = {}) => {
  const login = jest.fn().mockResolvedValue({});
  const signup = jest.fn().mockResolvedValue({});
  const contextValue = { login, signup, ...authOverrides };

  render(
    <AuthContext.Provider value={contextValue}>
      <BrowserRouter>
        <AuthPage />
      </BrowserRouter>
    </AuthContext.Provider>
  );

  return { login, signup };
};

const getSubmitButton = (label) =>
  screen
    .getAllByRole('button', { name: new RegExp(label, 'i') })
    .find(btn => btn.type === 'submit');

describe('AuthPage', () => {
  test('renders login form by default', () => {
    renderWithContext();
    expect(screen.getByPlaceholderText(/username or email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
    expect(getSubmitButton('login')).toBeInTheDocument();
  });

  test('shows error if required fields are empty', async () => {
    renderWithContext();
    fireEvent.click(getSubmitButton('login'));

    expect(await screen.findByText(/please fill in all fields/i)).toBeInTheDocument();
  });

  test('calls login function with entered values', async () => {
    const { login } = renderWithContext();

    fireEvent.input(screen.getByPlaceholderText(/username or email/i), {
      target: { value: 'user' },
    });
    fireEvent.input(screen.getByPlaceholderText(/password/i), {
      target: { value: 'pass' },
    });

    fireEvent.click(getSubmitButton('login'));

    await waitFor(() => {
      expect(login).toHaveBeenCalledWith('user', 'pass');
    });
  });

  test('switches to signup and shows email + confirmPassword fields', () => {
    renderWithContext();
    fireEvent.click(screen.getByRole('button', { name: /signup/i }));

    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/confirm password/i)).toBeInTheDocument();
  });

  test('shows password mismatch error on signup', async () => {
    renderWithContext();
    fireEvent.click(screen.getByRole('button', { name: /signup/i }));

    fireEvent.input(screen.getByPlaceholderText(/username/i), {
      target: { value: 'newuser' },
    });
    fireEvent.input(screen.getByPlaceholderText(/email/i), {
      target: { value: 'test@test.com' },
    });
    fireEvent.input(screen.getByPlaceholderText(/^password$/i), {
      target: { value: 'abc123' },
    });
    fireEvent.input(screen.getByPlaceholderText(/confirm password/i), {
      target: { value: 'xyz123' },
    });

    fireEvent.click(getSubmitButton('sign up'));

    expect(await screen.findByText(/passwords don’t match/i)).toBeInTheDocument();
  });

  test('calls signup with correct data', async () => {
    const { signup } = renderWithContext();
    fireEvent.click(screen.getByRole('button', { name: /signup/i }));

    fireEvent.input(screen.getByPlaceholderText(/username/i), {
      target: { value: 'newuser' },
    });
    fireEvent.input(screen.getByPlaceholderText(/email/i), {
      target: { value: 'test@test.com' },
    });
    fireEvent.input(screen.getByPlaceholderText(/^password$/i), {
      target: { value: 'abc123' },
    });
    fireEvent.input(screen.getByPlaceholderText(/confirm password/i), {
      target: { value: 'abc123' },
    });

    fireEvent.click(getSubmitButton('sign up'));

    await waitFor(() =>
      expect(signup).toHaveBeenCalledWith('newuser', 'test@test.com', 'abc123')
    );
  });
});