import React, { createContext, useState, useContext, ReactNode } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  devBypassAuth: boolean;
  login: () => void;
  logout: () => void;
  toggleDevBypass: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  // Development mode flag to bypass authentication
  const [devBypassAuth, setDevBypassAuth] = useState(true); // Set to true by default for development

  const login = () => setIsAuthenticated(true);
  const logout = () => setIsAuthenticated(false);
  const toggleDevBypass = () => setDevBypassAuth(!devBypassAuth);

  return (
    <AuthContext.Provider value={{ isAuthenticated, devBypassAuth, login, logout, toggleDevBypass }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};