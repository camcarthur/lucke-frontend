import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AdminPortal from '../src/pages/adminPortal';
import { apiFetch } from '../src/api';
import { BrowserRouter } from 'react-router-dom';

jest.mock('../src/api', () => ({
  apiFetch: jest.fn(),
}));

jest.mock('react-qr-code', () => () => <div data-testid="QRCode" />); // mock QRCode

const renderWithRouter = (ui) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

describe('AdminPortal', () => {
  beforeEach(() => {
    apiFetch.mockResolvedValue({
      ok: true,
      json: async () => [],
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders Admin Portal and New Event button', async () => {
    renderWithRouter(<AdminPortal />);
    expect(await screen.findByText(/Admin Portal/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /New Event/i })).toBeInTheDocument();
  });

  test('shows event creation form when New Event is clicked', async () => {
    renderWithRouter(<AdminPortal />);
    fireEvent.click(screen.getByRole('button', { name: /New Event/i }));

    expect(await screen.findByText(/Create New Event/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Add Sub Event/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Create Event/i })).toBeInTheDocument();
  });

  test('calls apiFetch to load events on mount', async () => {
    renderWithRouter(<AdminPortal />);
    await waitFor(() => {
      expect(apiFetch).toHaveBeenCalledWith('/api/events');
    });
  });

  test('disables Create Event button if eventName or subEvents are empty', async () => {
    renderWithRouter(<AdminPortal />);
    fireEvent.click(screen.getByRole('button', { name: /New Event/i }));

    const createButton = await screen.findByRole('button', { name: /Create Event/i });
    expect(createButton).toBeDisabled();
  });
});