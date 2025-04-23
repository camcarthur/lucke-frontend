// src/api.js
const API = process.env.REACT_APP_API_URL?.replace(/\/$/, '');
console.log('🛠️ API base URL =', API);

export const apiFetch = async (endpoint, options = {}) => {
  const url = `${API}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  console.log('🛠️ Fetching URL', url);
  return fetch(url, {
    credentials: 'include',
    ...options,
  });
};
