import axios from 'axios';
import { API_URL, ENDPOINTS } from './api-config';
import api from './apiUtils';

// Types
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  code: string;
  dob: string;
  role: string;
  studentDetails?: {
    major: string;
    specialization: string;
    faculty: string;
    trainingType: string;
    universitySystem: string;
    classGroup: string;
    classSection: string;
  };
}

export interface PasswordChangeRequest {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

/**
 * Get the current user's profile
 */
export const getUserProfile = async (): Promise<UserProfile> => {
  try {
    const response = await api.get(ENDPOINTS.USER.PROFILE);
    return response.data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

/**
 * Update the user's profile information
 */
export const updateUserProfile = async (profileData: Partial<UserProfile>): Promise<UserProfile> => {
  try {
    const response = await api.put(ENDPOINTS.USER.UPDATE_PROFILE, profileData);
    return response.data;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

/**
 * Change the user's password
 */
export const changePassword = async (passwordData: PasswordChangeRequest): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await api.post(ENDPOINTS.USER.CHANGE_PASSWORD, passwordData);
    return response.data;
  } catch (error) {
    console.error('Error changing password:', error);
    throw error;
  }
};

/**
 * Verify email when user changes their email address
 */
export const verifyEmail = async (verificationCode: string): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await api.post(ENDPOINTS.AUTH.VERIFY_EMAIL, { verificationCode });
    return response.data;
  } catch (error) {
    console.error('Error verifying email:', error);
    throw error;
  }
};

/**
 * Resend verification email
 */
export const resendVerificationEmail = async (email: string): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await api.post(ENDPOINTS.AUTH.RESEND_VERIFICATION, { email });
    return response.data;
  } catch (error) {
    console.error('Error resending verification email:', error);
    throw error;
  }
};