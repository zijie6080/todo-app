import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { callApi } from '../api/client';

export interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: { newFullName?: string; newAvatarUrl?: string }) => Promise<void>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);
const SESSION_KEY = 'todo_session_v3';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = localStorage.getItem(SESSION_KEY);
    if (session) {
      try { setUser(JSON.parse(session)); } catch { localStorage.removeItem(SESSION_KEY); }
    }
    setLoading(false);
  }, []);

  const persist = (u: User) => {
    setUser(u);
    localStorage.setItem(SESSION_KEY, JSON.stringify(u));
  };

  const login = async (email: string, password: string) => {
    const { user } = await callApi('auth', { action: 'login', email, password });
    persist(user);
  };

  const register = async (email: string, password: string, fullName: string) => {
    const { user } = await callApi('auth', { action: 'register', email, password, fullName });
    persist(user);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(SESSION_KEY);
  };

  const updateProfile = async (data: { newFullName?: string; newAvatarUrl?: string }) => {
    const { user: updated } = await callApi('auth', { action: 'updateProfile', userId: user!.id, ...data });
    persist(updated);
  };

  const changePassword = async (oldPassword: string, newPassword: string) => {
    await callApi('auth', { action: 'changePassword', userId: user!.id, oldPassword, newPassword });
  };

  const refreshUser = async () => {
    if (!user) return;
    const { user: fresh } = await callApi('auth', { action: 'getUser', userId: user.id });
    persist(fresh);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile, changePassword, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
