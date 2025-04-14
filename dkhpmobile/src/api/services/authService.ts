import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from '../config/api-config';

/**
 * Service for handling authentication operations
 */
export const authService = {
  /**
   * Login user with username and password
   * @param username - User's username
   * @param password - User's password
   * @param role - User role (student or admin)
   */
  login: async (username: string, password: string, role: 'student' | 'admin') => {
    try {
      console.log(`Attempting login: ${username} with role: ${role}`);
      
      // Use a simplified endpoint - your server likely just uses /auth/login
      const response = await apiClient.post('/auth/login', { 
        username, 
        password,
        role
      });
      
      console.log('Login response status:', response.status);
      
      // Extract token and user data
      const { token, user } = response.data;
      
      if (!token) {
        throw new Error('No token received from server');
      }
      
      // Store token and user data
      await AsyncStorage.setItem('auth_token', token);
      await AsyncStorage.setItem('user_role', role);
      await AsyncStorage.setItem('user_data', JSON.stringify(user));
      
      console.log('Authentication data stored successfully');
      return response.data;
    } catch (error: any) {
      console.error('Login service error:', error.message);
      // Add more context to the error for better troubleshooting
      if (error.code === 'ERR_NETWORK') {
        error.message = 'Network error: Unable to connect to the server. Check if the server is running.';
      }
      throw error;
    }
  },
  
  /**
   * Register a new user
   * @param userData - User registration data
   */
  register: async (userData: any) => {
    try {
      const response = await apiClient.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  },
  
  /**
   * Logout user and clear stored data
   */
  logout: async () => {
    try {
      await AsyncStorage.removeItem('auth_token');
      await AsyncStorage.removeItem('user_role');
      await AsyncStorage.removeItem('user_data');
      console.log('User logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  },
  
  /**
   * Check if user is logged in
   */
  isLoggedIn: async (): Promise<boolean> => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      return !!token;
    } catch (error) {
      console.error('Check login status error:', error);
      return false;
    }
  },
  
  /**
   * Get current user data
   */
  getUserData: async () => {
    try {
      const userData = await AsyncStorage.getItem('user_data');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Get user data error:', error);
      return null;
    }
  },
  
  /**
   * Get current user role
   */
  getUserRole: async (): Promise<string | null> => {
    try {
      return await AsyncStorage.getItem('user_role');
    } catch (error) {
      console.error('Get user role error:', error);
      return null;
    }
  },
  
  /**
   * Update user profile
   * @param userData - Updated user data
   */
  updateProfile: async (userData: any) => {
    try {
      const response = await apiClient.put('/students/profile', userData);
      // Update stored user data
      const updatedUser = response.data;
      const currentUserData = await AsyncStorage.getItem('user_data');
      if (currentUserData) {
        const parsedData = JSON.parse(currentUserData);
        const newUserData = { ...parsedData, ...updatedUser };
        await AsyncStorage.setItem('user_data', JSON.stringify(newUserData));
      }
      return updatedUser;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  },
  
  /**
   * Change user password
   * @param currentPassword - Current password
   * @param newPassword - New password
   */
  changePassword: async (currentPassword: string, newPassword: string) => {
    try {
      const response = await apiClient.post('/auth/change-password', {
        currentPassword,
        newPassword,
      });
      return response.data;
    } catch (error) {
      console.error('Change password error:', error);
      throw error;
    }
  },
  
  /**
   * Request password reset
   * @param email - User's email
   */
  requestPasswordReset: async (email: string) => {
    try {
      const response = await apiClient.post('/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      console.error('Request password reset error:', error);
      throw error;
    }
  }
};