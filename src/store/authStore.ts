import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '../types';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  setUser: (user: User) => void;
}

const syncAuthStorage = (user: User | null, token: string | null) => {
  if (typeof window === 'undefined') {
    return;
  }

  if (token) {
    window.localStorage.setItem('agro_token', token);
  } else {
    window.localStorage.removeItem('agro_token');
  }

  if (user?.id) {
    window.localStorage.setItem('agro_user_id', user.id);
  } else {
    window.localStorage.removeItem('agro_user_id');
  }
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,
      login: (user, token) => {
        syncAuthStorage(user, token);
        set({
          user,
          accessToken: token,
          isAuthenticated: true,
        });
      },
      logout: () => {
        syncAuthStorage(null, null);
        set({ user: null, accessToken: null, isAuthenticated: false });
      },
      setUser: (user) => {
        const token = typeof window === 'undefined'
          ? null
          : window.localStorage.getItem('agro_token');
        syncAuthStorage(user, user ? token : null);
        set({ user });
      },
    }),
    {
      name: 'agro_auth',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
