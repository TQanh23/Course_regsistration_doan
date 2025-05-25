import axios from 'axios';
import authService from './auth-service';

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // 15 seconds
});

// Request interceptor
apiClient.interceptors.request.use(
  async (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh authentication
        const isValid = await authService.checkAuthStatus();
        
        if (isValid) {
          const token = localStorage.getItem('authToken');
          if (token) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          }
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
      }

      // If we get here, auth refresh failed
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

export default apiClient;
