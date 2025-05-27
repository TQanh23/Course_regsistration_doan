import { axiosInstance } from './api-config';

// Create API client with additional interceptor for auth handling
const apiClient = axiosInstance;

// Add auth-specific response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Handle token expiration by redirecting to login
      localStorage.removeItem('authToken');
      delete apiClient.defaults.headers.common['Authorization'];

      // Redirect to login if not already there
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

// Export the apiClient instance
export { apiClient };
