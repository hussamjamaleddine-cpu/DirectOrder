import React, { createContext, useContext, useState } from 'react';
import { store } from '@/lib/store';

export type UserRole = 'owner' | 'manager' | 'staff' | null;

interface AuthContextType {
  role: UserRole;
  isAuthenticated: boolean;
  login: (role: 'owner' | 'manager' | 'staff', pin: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<UserRole>(null);

  const login = (selectedRole: 'owner' | 'manager' | 'staff', pin: string): boolean => {
    if (store.validatePIN(selectedRole, pin)) {
      setRole(selectedRole);
      return true;
    }
    return false;
  };

  const logout = () => {
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{ role, isAuthenticated: role !== null, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
