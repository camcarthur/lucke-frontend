// src/api.js

const API =
  process.env.REACT_APP_API_URL?.replace(/\/$/, '') ||
  'https://api.luckecalcutta.com';

export async function apiFetch(endpoint, options = {}) {
  const url = `${API}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  console.log('🛠️ Fetching URL', url);
  const res = await fetch(url, {
    credentials: 'include',
    ...options,
  });

  if (res.status === 401) {
    const err = new Error('Unauthorized');
    err.status = 401;
    throw err;
  }

  return res;
}
