// src/api.js

const API =
  import.meta.env.VITE_API_URL?.replace(/\/$/, '') ||
  'https://lucke.eba-idu3y2uj.us-east-2.elasticbeanstalk.com';

export const apiFetch = async (endpoint, options = {}) => {
  const url = `${API}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  console.log('Fetching URL:', url);
  return fetch(url, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });
};