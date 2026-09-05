import React, { createContext, useContext, useState, useEffect } from 'react';
import type { UserProfile, UserRole } from '../types';
import { INITIAL_USER } from '../data/mockData';

interface AuthContextType {
  user: UserProfile | null;
  activeRole: UserRole;
  isAuthenticated: boolean;
  login: (email: string) => void;
  logout: () => void;
  switchRole: (role: UserRole) => void;
  updateProfile: (updated: Partial<UserProfile>) => void;
  openAuthModal: (mode?: 'login' | 'signup') => void;
  closeAuthModal: () => void;
  isAuthModalOpen: boolean;
  authModalMode: 'login' | 'signup';
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('spaceshare_user');
    return saved ? JSON.parse(saved) : INITIAL_USER;
  });

  const [activeRole, setActiveRole] = useState<UserRole>(user?.role || 'guest');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('login');

  useEffect(() => {
    if (user) {
      localStorage.setItem('spaceshare_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('spaceshare_user');
    }
  }, [user]);

  const login = (email: string) => {
    const loggedUser: UserProfile = {
      ...INITIAL_USER,
      email,
      fullName: email.split('@')[0].replace('.', ' '),
    };
    setUser(loggedUser);
    setActiveRole(loggedUser.role);
    setIsAuthModalOpen(false);
  };

  const logout = () => {
    setUser(null);
  };

  const switchRole = (role: UserRole) => {
    setActiveRole(role);
    if (user) {
      const updated = { ...user, role };
      setUser(updated);
    }
  };

  const updateProfile = (updated: Partial<UserProfile>) => {
    if (user) {
      setUser((prev) => (prev ? { ...prev, ...updated } : null));
    }
  };

  const openAuthModal = (mode: 'login' | 'signup' = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        activeRole,
        isAuthenticated: !!user,
        login,
        logout,
        switchRole,
        updateProfile,
        openAuthModal,
        closeAuthModal,
        isAuthModalOpen,
        authModalMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
