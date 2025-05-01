import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import BettingPortal from '../src/pages/bettorPortal';
import { AuthContext } from '../src/context/AuthContext';
import { apiFetch } from '../src/api';

jest.mock('../src/api', () => ({
  apiFetch: jest.fn(),
}));

// Mock navigate to avoid real navigation
jest.mock('react-router-dom', () => {
  const original = jest.requireActual('react-router-dom');
  return {
    ...original,
    useNavigate: () => jest.fn(),
    useLocation: () => ({ search: '' }),
  };
});

describe('BettorPortal', () => {
  const mockUser = {
    id: 1,
    username: 'bettor123',
    balance: '100.00',
    role: 'user',
  };

  const renderWithContext = () => {
    const mockLogout = jest.fn();
    const auth = {
      auth: {
        user: mockUser,
        isLoggedIn: true,
        role: 'user',
      },
      logout: mockLogout,
    };

    return render(
      <AuthContext.Provider value={auth}>
        <BrowserRouter>
          <BettingPortal />
        </BrowserRouter>
      </AuthContext.Provider>
    );
  };

  beforeEach(() => {
    apiFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders the Betting Portal title and no event selected fallback', async () => {
    renderWithContext();

    expect(await screen.findByText(/Betting Portal/i)).toBeInTheDocument();
    expect(screen.getByText(/Select an event/i)).toBeInTheDocument();
  });

  test('calls fetchAllEvents on mount', async () => {
    renderWithContext();

    await waitFor(() => {
      expect(apiFetch).toHaveBeenCalledWith('/api/events', { credentials: 'include' });
    });
  });
});