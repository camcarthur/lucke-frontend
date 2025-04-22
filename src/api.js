// src/api.js

// Safely get the backend URL from the environment or fallback
const rawEnvUrl = import.meta.env.VITE_API_URL;
const API = rawEnvUrl ? rawEnvUrl.replace(/\/$/, '') : 'https://lucke.eba-idu3y2uj.us-east-2.elasticbeanstalk.com';

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