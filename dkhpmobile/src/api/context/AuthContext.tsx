import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

// Define types for the auth context
type User = {
  id: number;
  username: string;
  full_name: string;
  email: string;
  student_id?: string;
  program_id?: number;
  [key: string]: any; // For any additional properties
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  userRole: string | null;
  isLoggedIn: boolean; // Add this missing property
  isLoading: boolean; // Add this missing property
  login: (username: string, password: string, role: 'student' | 'admin') => Promise<void>;
  logout: () => Promise<void>;
  register: (registerData: any) => Promise<void>;
  updateUserProfile: (userData: any) => Promise<void>;
};

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAuthenticated: false,
  userRole: null,
  isLoggedIn: false, // Include default value
  isLoading: true,   // Include default value
  login: async () => {},
  logout: async () => {},
  register: async () => {},
  updateUserProfile: async () => {},
});

// Create AuthProvider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  // Check authentication status when app starts
  useEffect(() => {
    const loadUser = async () => {
      try {
        setLoading(true);
        const isLoggedIn = await authService.isLoggedIn();
        
        if (isLoggedIn) {
          const userData = await authService.getUserData();
          const role = await authService.getUserRole();
          
          setUser(userData);
          setUserRole(role);
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setUserRole(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Error loading user:', error);
        setUser(null);
        setUserRole(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // Login function
  const login = async (username: string, password: string, role: 'student' | 'admin') => {
    try {
      setLoading(true);
      const result = await authService.login(username, password, role);
      setUser(result.user);
      setUserRole(role);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      setLoading(true);
      await authService.logout();
      setUser(null);
      setUserRole(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (registerData: any) => {
    try {
      setLoading(true);
      await authService.register(registerData);
      // Note: typically we would auto-login after registration,
      // but for this app we'll require explicit login
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Update user profile
  const updateUserProfile = async (userData: any) => {
    try {
      setLoading(true);
      const updatedUser = await authService.updateProfile(userData);
      setUser(prevUser => ({ ...prevUser, ...updatedUser }));
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Provide auth context to all child components
  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated,
        userRole,
        isLoggedIn: isAuthenticated,
        isLoading: loading,
        login,
        logout,
        register,
        updateUserProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => useContext(AuthContext);

export default AuthContext;