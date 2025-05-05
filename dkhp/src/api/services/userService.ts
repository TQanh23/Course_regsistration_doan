import { apiClient } from '../config/axiosConfig';
import type { 
  User, 
  LoginCredentials, 
  RegistrationData,
  VerificationData,
  PasswordResetRequest,
  PasswordResetConfirm,
  UpdateProfileData
} from '../types/user.types';
import type { ApiResponse } from '../types/common.types';

export const userService = {
  // Authentication
  login: (credentials: LoginCredentials) => 
    apiClient.post<ApiResponse<{ token: string; user: User }>>('/auth/login', credentials),
    
  register: (data: RegistrationData) => 
    apiClient.post<ApiResponse<{ message: string }>>('/auth/register', data),
    
  verifyEmail: (data: VerificationData) => 
    apiClient.post<ApiResponse<{ message: string }>>('/auth/verify-email', data),
    
  resendVerification: (email: string) => 
    apiClient.post<ApiResponse<{ message: string }>>('/auth/resend-verification', { email }),

  // Password Management
  requestPasswordReset: (data: PasswordResetRequest) => 
    apiClient.post<ApiResponse<{ message: string }>>('/auth/forgot-password', data),
    
  resetPassword: (data: PasswordResetConfirm) => 
    apiClient.post<ApiResponse<{ message: string }>>('/auth/reset-password', data),
    
  changePassword: (userId: string, currentPassword: string, newPassword: string) => 
    apiClient.put<ApiResponse<{ message: string }>>(`/users/${userId}/password`, {
      currentPassword,
      newPassword
    }),

  // Profile Management
  getCurrentUser: () => 
    apiClient.get<ApiResponse<User>>('/users/me'),
    
  updateProfile: (userId: string, data: UpdateProfileData) => 
    apiClient.put<ApiResponse<User>>(`/users/${userId}`, data),

  // Session Management
  logout: () => {
    localStorage.removeItem('token');
    return Promise.resolve();
  },

  // Token Management
  refreshToken: () => 
    apiClient.post<ApiResponse<{ token: string }>>('/auth/refresh-token'),

  // User verification helpers
  isAuthenticated: () => {
    const token = localStorage.getItem('token');
    return !!token;
  },

  getAuthToken: () => {
    return localStorage.getItem('token');
  }
};