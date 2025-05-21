import axios from 'axios';
import { API_URL, API_TIMEOUT, INCLUDE_CREDENTIALS } from './api-config';

// Create axios instance with default config
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: Number(import.meta.env.VITE_API_TIMEOUT),
  withCredentials: import.meta.env.VITE_INCLUDE_CREDENTIALS,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('authToken');
    
    // If token exists, add to headers
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // If the error is due to an expired token (401) and we haven't tried to refresh yet
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Try to refresh the token
        const refreshToken = localStorage.getItem('refreshToken');
        
        if (refreshToken) {
          const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/refresh-token`, {
            refreshToken
          });
          
          const { token } = response.data;
          
          // Store the new token
          localStorage.setItem('authToken', token);
          
          // Update the Authorization header
          originalRequest.headers.Authorization = `Bearer ${token}`;
          
          // Retry the original request
          return api(originalRequest);
        }
      } catch (refreshError) {
        // If refresh token fails, redirect to login
        console.error('Token refresh failed', refreshError);
        
        // Clear auth data
        localStorage.removeItem('authToken');
        localStorage.removeItem('refreshToken');
        
        // Check if we're in a browser environment
        if (typeof window !== 'undefined') {
          // For web apps, redirect to login
          window.location.href = '/login';
        }
      }
    }
    
    return Promise.reject(error);
  }
);

// Export the configured API instance
export default api;

// Helper methods for common API operations
export const apiHelper = {
  /**
   * Authenticate user and store tokens
   * @param username User's username or email
   * @param password User's password
   * @param role User's role (optional)
   * @returns User data
   */
  async login(username: string, password: string, role?: string) {
    try {
      const payload = role ? { username, password, role } : { username, password };
      const response = await api.post('/auth/login', payload);
      
      const { token, refreshToken, user } = response.data;
      
      // Store tokens
      localStorage.setItem('authToken', token);
      localStorage.setItem('refreshToken', refreshToken);
      
      return user;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  },
  
  /**
   * Log out user and clear stored tokens
   */
  async logout() {
    try {
      // Call logout endpoint
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout API error:', error);
      // Continue with local logout even if API call fails
    } finally {
      // Clear local storage
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
    }
  },
  
  /**
   * Check if user is currently authenticated
   * @returns Boolean indicating authentication status
   */
  isAuthenticated() {
    return !!localStorage.getItem('authToken');
  },
  
  /**
   * Register a new user
   * @param userData User registration data
   * @returns Registration response
   */
  async register(userData: any) {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  },
  
  /**
   * Verify email with verification code
   * @param email User's email
   * @param code Verification code
   * @returns Verification response
   */
  async verifyEmail(email: string, code: string) {
    try {
      const response = await api.post('/auth/verify-email', { email, code });
      return response.data;
    } catch (error) {
      console.error('Email verification failed:', error);
      throw error;
    }
  },
  
  /**
   * Request password reset
   * @param email User's email
   * @returns Reset request response
   */
  async forgotPassword(email: string) {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      console.error('Password reset request failed:', error);
      throw error;
    }
  }
};