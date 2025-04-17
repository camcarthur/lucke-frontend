import React, { createContext, useState, useEffect } from 'react';
//import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
//import API from '../config/api';
import { apiFetch } from '../api';

export const AuthContext = createContext();

function AuthProvider({ children }) {
  const [auth, setAuth] = useState({ isLoggedIn: false, role: '', user: null, loading: true });

  // Check session on mount
  const checkSession = async () => {
    try {
      const res = await apiFetch( {
        credentials: 'include'
      });
      if (!res.ok) {
        setAuth({ isLoggedIn: false, role: '', user: null, loading: false });
        return;
      }
      const data = await res.json();
      setAuth({ isLoggedIn: true, role: data.user.role, user: data.user, loading: false });
    } catch (error) {
      setAuth({ isLoggedIn: false, role: '', user: null, loading: false });
    }
  };

  useEffect(() => {
    checkSession();
  }, []);

  const login = async (username, password) => {
    try {
      const res = await apiFetch('/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      if (!res.ok) {
        throw new Error('Login failed');
      }
      const data = await res.json();
      setAuth({ isLoggedIn: true, role: data.user.role, user: data.user, loading: false });
      return data;
    } catch (error) {
      setAuth({ isLoggedIn: false, role: '', user: null, loading: false });
      throw error;
    }
  };

  const logout = async () => {
    try {
      await apiFetch('/logout', {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
    setAuth({ isLoggedIn: false, role: '', user: null, loading: false });
  };

  return (
    <AuthContext.Provider value={{ auth, login, logout }}>
      {!auth.loading && children}
    </AuthContext.Provider>
  );
}

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default AuthProvider;
