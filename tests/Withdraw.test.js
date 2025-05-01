import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Withdraw from '../src/pages/Withdraw';
import { BrowserRouter } from 'react-router-dom';

jest.mock('react-router-dom', () => {
  const original = jest.requireActual('react-router-dom');
  return {
    ...original,
    useNavigate: () => jest.fn(),
  };
});

describe('Withdraw Page', () => {
  test('renders updated title and subtitle', () => {
    render(
      <BrowserRouter>
        <Withdraw />
      </BrowserRouter>
    );

    expect(screen.getByText('💸 Withdrawal')).toBeInTheDocument();
    expect(
      screen.getByText(/withdrawal feature coming soon/i)
    ).toBeInTheDocument();
  });

  test('clicking back button navigates to /betting', () => {
    const mockNavigate = jest.fn();
    jest
      .spyOn(require('react-router-dom'), 'useNavigate')
      .mockImplementation(() => mockNavigate);

    render(
      <BrowserRouter>
        <Withdraw />
      </BrowserRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: /← Back/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/betting');
  });
});