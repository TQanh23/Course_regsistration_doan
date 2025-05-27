import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

// Configure API URL - should be moved to environment variables in production
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Types
type User = {
  id: string;
  username: string;
  role: string;
  permissions?: string[];
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  isLoggedIn: boolean;
  login: (username: string, password: string, role?: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
};

// Create Auth Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth Provider Component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check if user is already logged in on component mount
  useEffect(() => {
    const checkLoggedIn = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          setIsLoading(false);
          return;
        }

        // Configure axios header
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Verify token and get user info
        const response = await axios.get(`${API_URL}/auth/me`, {
          withCredentials: true,
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.data && response.data.user) {
          setUser(response.data.user);
          setIsLoggedIn(true);
        }
      } catch (err) {
        console.error('Session verification failed:', err);
        // Clear invalid token
        localStorage.removeItem('authToken');
        delete axios.defaults.headers.common['Authorization'];
      } finally {
        setIsLoading(false);
      }
    };

    checkLoggedIn();
  }, []);

  const login = async (username: string, password: string, role: string = 'admin') => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('Attempting login with:', { username, role, apiUrl: API_URL });
      
      const response = await axios.post(`${API_URL}/auth/login`, {
        username,
        password,
        role,
      }, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const { token, user } = response.data;
      
      // Store token
      localStorage.setItem('authToken', token);
      
      // Set auth header for future requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Update state
      setUser(user);
      setIsLoggedIn(true);
      
      console.log('Login successful:', user);
      
      return user;
    } catch (err: any) {
      console.error('Login error:', err);
      
      let message = 'Đăng nhập thất bại';
      
      if (err.code === 'ERR_NETWORK') {
        message = 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng hoặc máy chủ.';
      } else if (err.response) {
        // Server responded with error
        message = err.response.data?.message || 'Tên đăng nhập hoặc mật khẩu không đúng';
      }
      
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    // Remove token
    localStorage.removeItem('authToken');
    delete axios.defaults.headers.common['Authorization'];
    
    // Update state
    setUser(null);
    setIsLoggedIn(false);
  };

  const clearError = () => {
    setError(null);
  };

  // Create context value object
  const value: AuthContextType = {
    user,
    isLoading,
    error,
    isLoggedIn,
    login,
    logout,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for using auth context
export const useAuth = () => {
  const login = async (username: string, password: string, role: string) => {
    await authAxios.post('/login', { username, password, role })
  }

  return { login }
};

// HTTP client with authentication
export const authAxios = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to include auth token in all requests
authAxios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle authentication errors
authAxios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default {
  useAuth,
  AuthProvider,
  authAxios
};