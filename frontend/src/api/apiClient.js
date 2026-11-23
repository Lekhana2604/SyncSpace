import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 8000,
});

let autoLoginPromise = null;

async function getOrFetchToken() {
  const currentToken = localStorage.getItem('syncspace_token');
  if (currentToken) return currentToken;

  if (!autoLoginPromise) {
    autoLoginPromise = axios
      .post(`${API_BASE_URL}/auth/login`, {
        email: 'alex.rivera@syncspace.dev',
        password: 'DemoPass123!',
      })
      .then((res) => {
        if (res.data?.token) {
          localStorage.setItem('syncspace_token', res.data.token);
          if (res.data.user) {
            localStorage.setItem('syncspace_user', JSON.stringify(res.data.user));
          }
          return res.data.token;
        }
        return null;
      })
      .catch((err) => {
        console.warn('[apiClient] Auto-auth failed:', err.message);
        return null;
      })
      .finally(() => {
        autoLoginPromise = null;
      });
  }

  return autoLoginPromise;
}

// Request interceptor: injects JWT Bearer token into headers
apiClient.interceptors.request.use(
  async (config) => {
    let token = localStorage.getItem('syncspace_token');
    if (!token && !config.url?.includes('/auth/')) {
      token = await getOrFetchToken();
    }
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: unwraps responses and catches 401 unauthenticated
apiClient.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/')
    ) {
      originalRequest._retry = true;
      localStorage.removeItem('syncspace_token');
      const newToken = await getOrFetchToken();
      if (newToken) {
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        const retryRes = await axios(originalRequest);
        return retryRes.data;
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
