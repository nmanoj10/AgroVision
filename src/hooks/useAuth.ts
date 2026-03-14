// src/hooks/useAuth.ts

import { useAuthStore } from '../store/authStore';

export const useAuth = () => {
  const { user, isAuthenticated, login, logout, isLoading } = useAuthStore();
  
  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout
  };
};
