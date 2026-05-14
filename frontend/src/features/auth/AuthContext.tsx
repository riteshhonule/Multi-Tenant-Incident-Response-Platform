import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User } from '../../types';
import api from '../../api/axios';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (accessToken: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        try {
          // In a real app, you might have a /me endpoint
          // For now, we'll assume the token is valid or will be caught by interceptor
          // Or we decode the JWT to get user info
          const payload = JSON.parse(atob(token.split('.')[1]));
          setUser({
            id: payload.sub,
            email: payload.email,
            role: payload.role,
            tenantId: payload.tenantId,
          });
        } catch (e) {
          localStorage.removeItem('accessToken');
        }
      }
      setIsLoading(false);
    };
    checkAuth();
  }, []);

  const login = (accessToken: string, user: User) => {
    localStorage.setItem('accessToken', accessToken);
    setUser(user);
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      localStorage.removeItem('accessToken');
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
