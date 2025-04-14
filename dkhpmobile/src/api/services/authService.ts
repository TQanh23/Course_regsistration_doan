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
      // Determine which endpoint to use based on role
      const endpoint = role === 'admin' ? '/auth/admin/login' : '/auth/student/login';
      
      // Make login request
      const response = await apiClient.post(endpoint, { username, password });
      
      // Extract token and user data
      const { token, user } = response.data;
      
      // Store token and user data
      await AsyncStorage.setItem('auth_token', token);
      await AsyncStorage.setItem('user_role', role);
      await AsyncStorage.setItem('user_data', JSON.stringify(user));
      
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },
  
  /**
   * Register a new user
   * @param userData - User registration data
   */
  register: async (userData: any) => {
    try {
      const response = await apiClient.post('/auth/student/register', userData);
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
      const response = await apiClient.put('/auth/change-password', {
        current_password: currentPassword,
        new_password: newPassword,
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