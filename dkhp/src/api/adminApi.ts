import api from './apiUtils';

/**
 * API functions for admin operations
 */
export const adminApi = {
  /**
   * Get all users (both admin and students)
   * @returns List of all users
   */
  async getAllUsers() {
    try {
      const response = await api.get('/admin/users');
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  /**
   * Create a new user (admin or student)
   * @param userData User data to create
   * @returns Created user data
   */
  async createUser(userData: any) {
    try {
      const response = await api.post('/admin/users', userData);
      return response.data;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  /**
   * Update an existing user
   * @param userId User ID to update
   * @param userData Updated user data
   * @returns Updated user data
   */
  async updateUser(userId: number, userData: any) {
    try {
      const response = await api.put(`/admin/users/${userId}`, userData);
      return response.data;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },

  /**
   * Delete a user
   * @param userId User ID to delete
   * @returns Deletion status
   */
  async deleteUser(userId: number) {
    try {
      const response = await api.delete(`/admin/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  },

  /**
   * Get user by ID
   * @param userId User ID to fetch
   * @returns User data
   */
  async getUserById(userId: number) {
    try {
      const response = await api.get(`/admin/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  }
};