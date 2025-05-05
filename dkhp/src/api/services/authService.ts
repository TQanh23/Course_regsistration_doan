import { apiClient } from '../config/axiosConfig';
import type { 
  LoginRequest, 
  RegisterRequest, 
  AuthResponse, 
  VerifyEmailRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest
} from '../types/auth.types';

export const authService = {
  login: (data: LoginRequest) => 
    apiClient.post<AuthResponse>('/auth/login', data),
    
  register: (data: RegisterRequest) => 
    apiClient.post<AuthResponse>('/auth/register', data),
    
  verifyEmail: (data: VerifyEmailRequest) => 
    apiClient.post('/auth/verify-email', data),
    
  resendVerification: (email: string) => 
    apiClient.post('/auth/resend-verification', { email }),
    
  forgotPassword: (data: ForgotPasswordRequest) => 
    apiClient.post('/auth/forgot-password', data),
    
  resetPassword: (data: ResetPasswordRequest) => 
    apiClient.post('/auth/reset-password', data),
    
  logout: () => {
    localStorage.removeItem('token');
    return Promise.resolve();
  }
};