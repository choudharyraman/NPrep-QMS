// src/context/AuthContext.tsx
import React, { createContext, useContext, useState } from 'react';
import { MOCK_USERS, MockUser } from '../lib/mockData';

interface AuthContextType {
  user: MockUser | null;
  isLoggedIn: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<MockUser | null>(() => {
    try {
      const stored = localStorage.getItem('nprep_qms_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const isLoggedIn = !!user;

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    // Simulate network delay
    await new Promise(r => setTimeout(r, 700));
    const found = MOCK_USERS.find(u => u.email === email && u.password === password);
    if (found) {
      setUser(found);
      localStorage.setItem('nprep_qms_user', JSON.stringify(found));
      // Request notification permission on login
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
      }
      return { success: true };
    }
    return { success: false, error: 'Invalid email or password. Try the demo accounts below.' };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('nprep_qms_user');
  };

  return (
    <AuthContext.Provider value={{ user, isLoggedIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
