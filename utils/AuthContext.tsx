import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import { jwtDecode } from 'jwt-decode';

interface User {
    _id: string;
    name: string;
    username: string;
    email: string;
    status: 'free' | 'premium';
    trial_due_date?: string; // Optional, only for free users
    token?: string;
}

interface JWTPayload extends User {
  exp?: number;
  iat?: number;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (token: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuthState: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const login = async (token: string) => {
    try {
      // Store token in SecureStore
      await SecureStore.setItemAsync('access_token', token);
      
      // Decode JWT to get user info
      const decoded = jwtDecode<JWTPayload>(token);
      setUser(decoded);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Remove token from SecureStore
      await SecureStore.deleteItemAsync('access_token');
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const checkAuthState = async () => {
    try {
      setIsLoading(true);
      const token = await SecureStore.getItemAsync('access_token');
      
      if (token) {
        // Decode and validate token
        const decoded = jwtDecode<JWTPayload>(token);
        
        // Check if token is expired (basic check)
        const currentTime = Date.now() / 1000;
        if (decoded.exp && decoded.exp < currentTime) {
          // Token expired, remove it
          await logout();
        } else {
          setUser(decoded);
          setIsAuthenticated(true);
        }
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      await logout();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuthState();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        login,
        logout,
        checkAuthState,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
