// EduNova API Client Module

const API = (() => {
  const BASE_URL = '/api';

  async function request(endpoint, options = {}) {
    const token = AppState.getState().token;
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
      ...options,
      headers
    };

    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, config);
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        if (response.status === 401) {
          AppState.logout();
        }
        throw new Error(data.error || `HTTP error ${response.status}`);
      }

      return data;
    } catch (err) {
      console.error(`API Error [${endpoint}]:`, err.message);
      throw err;
    }
  }

  return {
    get: (endpoint) => request(endpoint, { method: 'GET' }),
    post: (endpoint, body) => request(endpoint, { method: 'POST', body }),
    put: (endpoint, body) => request(endpoint, { method: 'PUT', body }),
    delete: (endpoint) => request(endpoint, { method: 'DELETE' })
  };
})();
