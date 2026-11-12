const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:8001/api/v1';

export function getAuthToken() {
  return localStorage.getItem('threadyol_token');
}

export function authHeaders(extra = {}) {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  };
}

export function apiRequest(path, options = {}) {
  const url = `${API_BASE}${path}`;
  return fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      ...(options.headers && options.headers.Authorization ? {} : authHeaders()),
    },
  }).then(async (response) => {
    const text = await response.text();
    const json = text ? JSON.parse(text) : null;
    if (!response.ok) {
      throw new Error(json?.error || json?.message || response.statusText || 'Request failed');
    }
    return json;
  });
}

export default API_BASE;
