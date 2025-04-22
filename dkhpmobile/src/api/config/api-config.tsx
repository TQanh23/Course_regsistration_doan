import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Base URL for our API - corrected port to 3000 (server's default port in app.js)
// Different IP addresses based on platform
const getApiUrl = () => {
  if (Platform.OS === 'android') {
    return 'http://192.168.31.203:3000/api'; // Android emulator
  } else if (Platform.OS === 'ios') {
    return 'http://192.168.31.203:3000/api'; // iOS simulator
  } else {
    return 'http://localhost:3000/api'; // Web
  }
};

const API_URL = getApiUrl();

// Create axios instance
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // Increased timeout for slow connections
});

// Add request interceptor to add auth token to requests
apiClient.interceptors.request.use(
  async (config) => {
    try {
      // Changed key from 'authToken' to 'auth_token' to match your AuthContext
      const token = await AsyncStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
      return config;
    } catch (error) {
      console.error('Error in request interceptor:', error);
      return config;
    }
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for better error handling
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.code === 'ERR_NETWORK') {
      console.error('Network Error Details:', {
        message: 'Cannot connect to the server. Please check your network connection or server status.',
        url: error.config?.url,
        baseURL: error.config?.baseURL
      });
    } else if (error.response) {
      console.error('API Error Response:', {
        status: error.response.status,
        data: error.response.data
      });
    } else {
      console.error('API Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default apiClient;
export { API_URL };