import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Withdraw from '../src/pages/Deposit';
import { BrowserRouter } from 'react-router-dom';

jest.mock('react-router-dom', () => {
  const original = jest.requireActual('react-router-dom');
  return {
    ...original,
    useNavigate: () => jest.fn(),
  };
});

describe('Withdraw Page', () => {
  test('renders title and subtitle', () => {
    render(
      <BrowserRouter>
        <Withdraw />
      </BrowserRouter>
    );

    expect(screen.getByText('💸 Deposit')).toBeInTheDocument();
    expect(screen.getByText(/deposit feature coming soon/i)).toBeInTheDocument();
  });

  test('renders back button and allows clicking it', () => {
    const mockNavigate = jest.fn();
    jest.spyOn(require('react-router-dom'), 'useNavigate').mockImplementation(() => mockNavigate);

    render(
      <BrowserRouter>
        <Withdraw />
      </BrowserRouter>
    );

    const backButton = screen.getByRole('button', { name: /← Back/i });
    expect(backButton).toBeInTheDocument();

    fireEvent.click(backButton);
    expect(mockNavigate).toHaveBeenCalledWith('/betting');
  });
});