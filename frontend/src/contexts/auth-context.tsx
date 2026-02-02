"use client";

import { ReactNode } from 'react';
import useAuthStore from '@/stores/authStore';

// Thin adapter kept for backward compatibility with existing imports.
export function AuthProvider({ children }: { children: ReactNode }) {
  // Providers now initialize the store; this component simply renders children.
  return <>{children}</>;
}

export function useAuth() {
  const state = useAuthStore();
  return {
    user: state.user,
    isLoading: state.isLoading,
    isAuthenticated: state.isAuthenticated,
    login: state.login,
    logout: state.logout,
    register: state.register,
  };
}
