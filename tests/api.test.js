import { apiFetch } from '../src/api';

describe('apiFetch', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Mock fetch
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      })
    );
    process.env = { ...originalEnv, REACT_APP_API_URL: 'https://example.com/' };
  });

  afterEach(() => {
    jest.resetAllMocks();
    process.env = originalEnv;
  });

  test('appends endpoint to REACT_APP_API_URL and includes credentials', async () => {
    await apiFetch('/test-endpoint');

    expect(global.fetch).toHaveBeenCalledWith('https://example.com/test-endpoint', {
      credentials: 'include',
    });
  });

  test('adds leading slash to endpoint if missing', async () => {
    await apiFetch('test-endpoint');

    expect(global.fetch).toHaveBeenCalledWith('https://example.com/test-endpoint', {
      credentials: 'include',
    });
  });

  test('merges custom fetch options', async () => {
    await apiFetch('/another', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ foo: 'bar' }),
    });

    expect(global.fetch).toHaveBeenCalledWith('https://example.com/another', {
      credentials: 'include',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ foo: 'bar' }),
    });
  });
});