import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Home from '../src/pages/home';
import { BrowserRouter } from 'react-router-dom';

jest.mock('react-router-dom', () => {
  const original = jest.requireActual('react-router-dom');
  return {
    ...original,
    useNavigate: () => jest.fn(),
  };
});

describe('Home Page', () => {
  test('renders title, description, and login button', () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );

    expect(screen.getByText(/Join the Calcutta Showdown/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Compete, bid, and own your favorite contestants/i)
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  test('clicking login button navigates to /login', () => {
    const mockNavigate = jest.fn();
    jest.spyOn(require('react-router-dom'), 'useNavigate').mockImplementation(() => mockNavigate);

    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: /login/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });
});