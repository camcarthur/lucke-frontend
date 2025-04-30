import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import Archive from '../src/pages/Archive';
import { BrowserRouter } from 'react-router-dom';
import { apiFetch } from '../src/api';

jest.mock('../src/api', () => ({
  apiFetch: jest.fn(),
}));

const renderWithRouter = (ui) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

describe('Archive Page', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders heading and back button', async () => {
    apiFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    renderWithRouter(<Archive />);

    expect(await screen.findByText('Archived Events')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /← Back/i })).toBeInTheDocument();
  });

  test('shows "No archived events yet." when list is empty', async () => {
    apiFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    renderWithRouter(<Archive />);

    expect(await screen.findByText(/No archived events yet/i)).toBeInTheDocument();
  });

  test('displays archived events from API', async () => {
    apiFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [
        { id: 1, name: 'Closed Event 1', status: 'closed' },
        { id: 2, name: 'Open Event', status: 'open' }, // should not appear
        { id: 3, name: 'Closed Event 2', status: 'closed' },
      ],
    });

    renderWithRouter(<Archive />);

    expect(await screen.findByText('Closed Event 1')).toBeInTheDocument();
    expect(screen.getByText('Closed Event 2')).toBeInTheDocument();
    expect(screen.queryByText('Open Event')).not.toBeInTheDocument();

    // Check badges
    const badges = screen.getAllByText('Closed');
    expect(badges.length).toBe(2);
  });

  test('clicking back button navigates (visually renders)', async () => {
    apiFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    renderWithRouter(<Archive />);
    const backBtn = await screen.findByRole('button', { name: /← Back/i });

    expect(backBtn).toBeVisible();
    fireEvent.click(backBtn);
    // NOTE: You would mock `useNavigate` and assert call if navigation testing needed
  });
});