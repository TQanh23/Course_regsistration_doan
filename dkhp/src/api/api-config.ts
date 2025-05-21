/**
 * API Configuration File
 * 
 * This file contains configuration settings for API endpoints
 * Used by both web admin and mobile applications
 */

// Default API URL - change this to match your environment
const DEFAULT_API_URL = 'http://localhost:3000/api';

// Get the API URL from environment variables if available (for production builds)
// For Vite + React web app
let API_URL = import.meta.env.VITE_API_URL || DEFAULT_API_URL;

// For React Native, try to access EXPO variables if they exist
if (typeof import.meta.env.EXPO_PUBLIC_API_URL !== 'undefined') {
  API_URL = import.meta.env.EXPO_PUBLIC_API_URL;
}

// API version
const API_VERSION = 'v1';

// API timeout in milliseconds
const API_TIMEOUT = 30000; // 30 seconds

// Whether to include credentials (cookies) with requests
const INCLUDE_CREDENTIALS = true;

// Common endpoints
const ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REGISTER: '/auth/register',
    VERIFY_EMAIL: '/auth/verify-email',
    RESEND_VERIFICATION: '/auth/resend-verification',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
  },
  USER: {
    PROFILE: '/user/profile',
    UPDATE_PROFILE: '/user/update-profile',
    CHANGE_PASSWORD: '/user/change-password',
    VERIFY_EMAIL: '/user/verify-email',
    RESEND_VERIFICATION: '/user/resend-verification',
  },
  ADMIN: {
    DASHBOARD: '/admin/dashboard',
    USERS: '/admin/users',
    SETTINGS: '/admin/settings',
    ACCOUNTS: '/admin/accounts',
    ACCOUNT_DETAIL: '/admin/accounts/:id',
    RESET_ACCOUNT_PASSWORD: '/admin/accounts/:id/reset-password',
  },
  STUDENT: {
    COURSES: '/student/courses',
    REGISTRATION: '/student/registration',
    SCHEDULE: '/student/schedule',
  }
};

// Export configuration
export {
  API_URL,
  API_VERSION,
  API_TIMEOUT,
  INCLUDE_CREDENTIALS,
  ENDPOINTS
};