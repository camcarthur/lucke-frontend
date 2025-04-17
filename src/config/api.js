// src/api.js

const API = process.env.REACT_APP_API_URL?.replace(/\/$/, '');

export const apiFetch = async (endpoint, options = {}) => {
  const url = `${API}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  return fetch(url, {
    credentials: 'include', // needed for cookies/session
    ...options,
  });
};