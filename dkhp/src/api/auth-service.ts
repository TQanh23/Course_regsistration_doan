import { axiosInstance } from './api-config';

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
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Validate token with backend
        const response = await axiosInstance.get('/auth/me');
        const userData = response.data.user || response.data.data;
        
        if (userData) {
          // Update stored user data
          localStorage.setItem('userData', JSON.stringify(userData));
          // Ensure token is in headers
          axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          return true;
        }
        
        // If we get here, no valid user data was found
        await this.logout();
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
      console.log('Attempting login with:', { username, role });
      
      const response = await axiosInstance.post('/auth/login', {
        username,
        password,
        role
      });

      // Handle both possible response structures
      const data = response.data.data || response.data;
      const { token, user } = data;
      
      if (!token || !user) {
        console.error('Invalid response structure:', response.data);
        throw new Error('Invalid response from server: missing token or user data');
      }
      
      // Store token
      localStorage.setItem('authToken', token);
      // Store user data
      localStorage.setItem('userData', JSON.stringify(user));
      // Set authorization header
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      return {
        success: true,
        token,
        user,
        message: 'Login successful'
      };
    } catch (error: any) {
      console.error('Login failed:', error);
      throw error.response?.data?.message || 'Login failed';
    }
  },

  async logout(): Promise<void> {
    try {
      await axiosInstance.post('/auth/logout').catch(() => {});
    } finally {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      delete axiosInstance.defaults.headers.common['Authorization'];
    }
  },

  async register(registerData: { username: string; email: string; password: string; role: string }): Promise<void> {
    try {
      const response = await axiosInstance.post('/auth/register', registerData);
      
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
