import axios from 'axios';

/**
 * Create a configured API client instance.
 * Each app calls this with its own base URL and redirect path.
 */
export function createApiClient(options?: { baseURL?: string; loginPath?: string }) {
  const baseURL = options?.baseURL || '/api/v1';
  const loginPath = options?.loginPath || '/login';

  const api = axios.create({
    baseURL,
    headers: { 'Content-Type': 'application/json' },
  });

  // Request interceptor — attach access token
  api.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

  // Response interceptor — auto-refresh on token expiry
  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (error.response?.status === 401 && error.response?.data?.code === 'TOKEN_EXPIRED') {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          try {
            const { data } = await axios.post(`${baseURL}/auth/refresh`, { refreshToken });
            localStorage.setItem('accessToken', data.data.accessToken);
            error.config.headers.Authorization = `Bearer ${data.data.accessToken}`;
            return api(error.config);
          } catch {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            window.location.href = loginPath;
          }
        }
      }
      return Promise.reject(error);
    },
  );

  return api;
}

// Default instance (for backwards compatibility)
const api = createApiClient();
export default api;
