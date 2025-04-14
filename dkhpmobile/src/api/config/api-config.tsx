import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Base URL for our API
const API_URL = 'http://10.0.2.2:5000/api'; // Use 10.0.2.2 for Android emulator to access localhost

// Create axios instance
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to add auth token to requests
apiClient.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;