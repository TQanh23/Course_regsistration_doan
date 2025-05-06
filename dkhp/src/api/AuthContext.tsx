import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import api, { apiHelper } from './apiUtils';
import axios from 'axios';
// import { API_URL } from './api-config';

// Define user type
interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  firstName?: string;
  lastName?: string;
  [key: string]: any; // Allow for additional properties
}

// Define context type
interface AuthContextType {
  isLoggedIn: boolean;
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string, role?: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuthStatus: () => Promise<boolean>;
}

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  user: null,
  isLoading: true,
  login: async () => {},
  logout: async () => {},
  checkAuthStatus: async () => false
});

// Provider component
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Check authentication status on mount
  useEffect(() => {
    checkAuthStatus().finally(() => {
      setIsLoading(false);
    });
  }, []);

  // Login function
  const login = async (username: string, password: string, role?: string) => {
    setIsLoading(true);
    
    try {
      // Use the apiHelper login method
      const userData = await apiHelper.login(username, password, role);
      const response = await axios.post('/api/login', { username, password });
      setUser(userData);
      setIsLoggedIn(true);
      
      return userData;
    } catch (error) {
      console.error('Login error in context:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    setIsLoading(true);
    
    try {
      await apiHelper.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear user state regardless of API success
      setUser(null);
      setIsLoggedIn(false);
      setIsLoading(false);
    }
  };

  // Check if user is already logged in
  const checkAuthStatus = async (): Promise<boolean> => {
    // Check for token in localStorage
    const token = localStorage.getItem('authToken');
    
    if (!token) {
      setIsLoggedIn(false);
      setUser(null);
      return false;
    }
    
    try {
      // Validate token and get user data
      const response = await api.get('/auth/me');
      const userData = response.data;
      
      setUser(userData);
      setIsLoggedIn(true);
      return true;
    } catch (error) {
      console.error('Auth check failed:', error);
      
      // Clear invalid auth data
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
      
      setIsLoggedIn(false);
      setUser(null);
      return false;
    }
  };

  const value = {
    isLoggedIn,
    user,
    isLoading,
    login,
    logout,
    checkAuthStatus
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook for using auth context
export const useAuth = () => useContext(AuthContext);

// Web version of the auth hook
export default { AuthProvider, useAuth };