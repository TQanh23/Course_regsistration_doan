import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import authService from './auth-service';

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  [key: string]: any;
}

interface AuthContextType {
  isLoggedIn: boolean;
  user: User | null;
  isLoading: boolean;
  isAuthenticating: boolean;
  login: (username: string, password: string, role?: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuthStatus: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  user: null,
  isLoading: false,
  isAuthenticating: false,
  login: async () => {},
  logout: async () => {},
  checkAuthStatus: async () => false
});

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);

  // Initialize authentication state
  useEffect(() => {
    const initAuth = async () => {
      try {
        const isValid = await authService.checkAuthStatus();
        if (isValid) {
          const userData = authService.getCurrentUser();
          if (userData) {
            setUser(userData);
            setIsLoggedIn(true);
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (username: string, password: string, role: string = 'admin'): Promise<void> => {
    setIsAuthenticating(true);
    try {
      const response = await authService.login(username, password, role);
      if (response.success && response.user) {
        setUser(response.user);
        setIsLoggedIn(true);
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } finally {
      setIsAuthenticating(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await authService.logout();
    } finally {
      setUser(null);
      setIsLoggedIn(false);
    }
  };

  const checkAuthStatus = async (): Promise<boolean> => {
    try {
      const isValid = await authService.checkAuthStatus();
      if (isValid) {
        const userData = authService.getCurrentUser();
        if (userData) {
          setUser(userData);
          setIsLoggedIn(true);
          return true;
        }
      }
      setUser(null);
      setIsLoggedIn(false);
      return false;
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
      setIsLoggedIn(false);
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        user,
        isLoading,
        isAuthenticating,
        login,
        logout,
        checkAuthStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for using auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default { AuthProvider, useAuth };