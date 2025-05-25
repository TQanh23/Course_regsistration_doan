import apiClient from './api-client';

export interface AuthResponse {
  success: boolean;
  token: string;
  user: {
    id: number;
    username: string;
    email: string;
    role: string;
  };
  message: string;
}

const authService = {
  async checkAuthStatus(): Promise<boolean> {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        return false;
      }

      // Configure axios with token
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Validate token with backend
      const response = await apiClient.get('/auth/me');
      const userData = response.data.user;
      
      if (userData) {
        // Update stored user data
        localStorage.setItem('userData', JSON.stringify(userData));
        // Ensure token is in headers
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        return true;
      }
      
      // Clear invalid data
      this.logout();
      return false;
    } catch (error) {
      console.error('Auth check failed:', error);
      // Clear invalid data
      this.logout();
      return false;
    }
  },

  getCurrentUser() {
    try {
      const userDataString = localStorage.getItem('userData');
      if (!userDataString) return null;
      const userData = JSON.parse(userDataString);
      return userData || null;
    } catch {
      return null;
    }
  },

  isLoggedIn() {
    const token = localStorage.getItem('authToken');
    const user = this.getCurrentUser();
    return !!token && !!user;
  },

  async login(username: string, password: string, role: string = 'admin'): Promise<AuthResponse> {
    try {
      const response = await apiClient.post('/auth/login', {
        username,
        password,
        role
      });

      const { token, user } = response.data;
      
      if (token && user) {
        // Store token
        localStorage.setItem('authToken', token);
        // Store user data
        localStorage.setItem('userData', JSON.stringify(user));
        // Set authorization header
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        return response.data;
      }

      throw new Error('Invalid response from server');
    } catch (error: any) {
      console.error('Login failed:', error);
      throw error.response?.data?.message || 'Login failed';
    }
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout').catch(() => {});
    } finally {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      delete apiClient.defaults.headers.common['Authorization'];
    }
  },

  async register(registerData: { username: string; email: string; password: string; role: string }): Promise<void> {
    try {
      const response = await apiClient.post('/auth/register', registerData);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Registration failed');
      }
    } catch (error: any) {
      console.error('Registration failed:', error);
      throw error.response?.data?.message || 'Registration failed';
    }
  }
};

export default authService;
