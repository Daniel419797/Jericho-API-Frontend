"use client";

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { User, LoginCredentials } from '@/types/auth';
import { tokenStorage } from '@/utils/token-storage';
import { decodeJwtPayload, msUntilExpiry } from '@/utils/jwt-utils';
import { authService } from '@/services/authService';
import { API_BASE_URL } from '@/services/api-client';
import { useUserStore } from '@/stores/userStore';

type Tokens = { accessToken: string; refreshToken: string };

type AuthState = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  init: () => void;
  setTokens: (tokens: Tokens) => Promise<void>;
  clearTokens: () => void;
  login: (creds: LoginCredentials) => Promise<void>;
  adminLogin: (creds: LoginCredentials) => Promise<void>;
  register: (data: { name: string; email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
};

export const useAuthStore = create<AuthState>()(
  devtools((set, get) => {
    let refreshTimer: number | null = null;
    let lastRefreshAt: number | null = null;
    let initialized = false;
    let storageListenerAdded = false;
    const MIN_REFRESH_INTERVAL = 5000; // ms

    const scheduleRefresh = () => {
      if (typeof window === 'undefined') return;
      // Don't schedule the network refresh in test/node environments where `fetch` is not available
      if (typeof fetch !== 'function') return;
      const access = tokenStorage.getAccessToken();
      const ms = msUntilExpiry(access);
      if (ms == null) return;

      const refreshBefore = 60_000;
      const timeout = Math.max(0, ms - refreshBefore);
      const effectiveTimeout = timeout === 0 ? MIN_REFRESH_INTERVAL : timeout;

      if (refreshTimer) window.clearTimeout(refreshTimer);
      refreshTimer = window.setTimeout(async () => {
        // prevent rapid re-entrancy
        const now = Date.now();
        if (lastRefreshAt && (now - lastRefreshAt) < MIN_REFRESH_INTERVAL) {
          // reschedule to avoid tight loop
          scheduleRefresh();
          return;
        }
        lastRefreshAt = now;
        try {
          const refreshToken = tokenStorage.getRefreshToken();
          if (!refreshToken) {
            // In dev we keep the access until expiry; otherwise clear
            const isDevVisible = (typeof window !== 'undefined') && (process.env.NEXT_PUBLIC_ENABLE_DEV_ADMIN === 'true' || ['localhost','127.0.0.1'].includes(window.location.hostname));
            if (isDevVisible) {
              const msUntilExp = msUntilExpiry(tokenStorage.getAccessToken());
              if (msUntilExp != null) {
                window.setTimeout(() => {
                  tokenStorage.clearTokens();
                  set({ user: null, isAuthenticated: false });
                }, msUntilExp);
                return;
              }
            }
            get().clearTokens();
            return;
          }

          const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken }),
          });

          if (!res.ok) {
            get().clearTokens();
            return;
          }

          const data = await res.json();
          const any = data as any;
          const tokens = any.tokens ?? any;
          const accessToken = tokens.accessToken || tokens.token;
          const newRefresh = tokens.refreshToken;
          if (!accessToken || !newRefresh) {
            get().clearTokens();
            return;
          }

          tokenStorage.setTokens({ accessToken, refreshToken: newRefresh });
          lastRefreshAt = Date.now();
          scheduleRefresh();
        } catch (err) {
          console.error('Token refresh failed:', err);
          get().clearTokens();
        }
      }, effectiveTimeout);
    };

    const init = async () => {
      if (initialized) return;
      initialized = true;
      set({ isLoading: true });
      if (tokenStorage.hasTokens()) {
        try {
          const userData = await authService.getCurrentUser();
          set({ user: userData, isAuthenticated: true });
          useUserStore.setState({ user: userData });
        } catch (err) {
          const isDevVisible = (typeof window !== 'undefined') && (process.env.NEXT_PUBLIC_ENABLE_DEV_ADMIN === 'true' || ['localhost','127.0.0.1'].includes(window.location.hostname));
          const access = tokenStorage.getAccessToken();
          if (isDevVisible && access) {
            const payload = decodeJwtPayload(access);
            if (payload && payload.sub) {
              const user = { id: payload.sub, email: payload.email || '', name: payload.name || (payload.email || ''), role: payload.isAdmin ? 'admin' : 'user' };
              set({ user, isAuthenticated: true });
              useUserStore.setState({ user });
            } else {
              tokenStorage.clearTokens();
            }
          } else {
            tokenStorage.clearTokens();
          }
        }
      }

      scheduleRefresh();

      // Storage listener for cross-tab sync (only add once)
      if (typeof window !== 'undefined' && !storageListenerAdded) {
        storageListenerAdded = true;
        window.addEventListener('storage', (e: StorageEvent) => {
          if (e.key === 'access_token' || e.key === 'refresh_token') {
            scheduleRefresh();
          }
        });
      }

      set({ isLoading: false });
    };

    const setTokens = async (tokens: Tokens) => {
      tokenStorage.setTokens(tokens);
      // try to fetch user or decode access token
      try {
        const userData = await authService.getCurrentUser();
        set({ user: userData, isAuthenticated: true });
        useUserStore.setState({ user: userData });
      } catch (err) {
        const payload = decodeJwtPayload(tokens.accessToken);
        if (payload && payload.sub) {
          const user = { id: payload.sub, email: payload.email || '', name: payload.name || (payload.email || ''), role: payload.isAdmin ? 'admin' : 'user' };
          set({ user, isAuthenticated: true });
          useUserStore.setState({ user });
        } else {
          set({ user: null, isAuthenticated: false });
        }
      }
      scheduleRefresh();
    };

    const clearTokens = () => {
      tokenStorage.clearTokens();
      set({ user: null, isAuthenticated: false });
      useUserStore.setState({ user: null });
      if (refreshTimer) {
        window.clearTimeout(refreshTimer);
        refreshTimer = null;
        lastRefreshAt = null;
      }
    };

    const login = async (creds: LoginCredentials) => {
      const response = await authService.login(creds);
      const any = response as any;
      const tokens = any.tokens ?? any;
      const accessToken = tokens.accessToken || tokens.token;
      const refreshToken = tokens.refreshToken;
      if (!accessToken || !refreshToken) throw new Error('No tokens received');
      await get().setTokens({ accessToken, refreshToken });
      // If the login response included a user object, set it immediately
      if (any.user) {
        set({ user: any.user, isAuthenticated: true });
        useUserStore.setState({ user: any.user });
      }
    };

    const adminLogin = async (creds: LoginCredentials) => {
      const response = await authService.adminLogin(creds);
      const any = response as any;
      const tokens = any.tokens ?? any;
      const accessToken = tokens.accessToken || tokens.token;
      const refreshToken = tokens.refreshToken;
      if (!accessToken || !refreshToken) throw new Error('No tokens received');
      await get().setTokens({ accessToken, refreshToken });
      // If the login response included a user object, set it immediately
      if (any.user) {
        set({ user: any.user, isAuthenticated: true });
        useUserStore.setState({ user: any.user });
      }
    };

    const register = async (data: { name: string; email: string; password: string }) => {
      const response = await authService.register(data);
      const any = response as any;
      const tokens = any.tokens ?? any;
      const accessToken = tokens.accessToken || tokens.token;
      const refreshToken = tokens.refreshToken;
      if (!accessToken || !refreshToken) throw new Error('No tokens received');
      await get().setTokens({ accessToken, refreshToken });
      // If the register response included a user object, set it immediately
      if (any.user) {
        set({ user: any.user, isAuthenticated: true });
        useUserStore.setState({ user: any.user });
      }
    };

    const logout = async () => {
      try {
        const refreshToken = tokenStorage.getRefreshToken();
        if (refreshToken) {
          await authService.logout(refreshToken);
        }
      } catch (err) {
        console.error('Logout request failed:', err);
      }
      clearTokens();
    };

    return {
      user: null,
      isLoading: true,
      isAuthenticated: false,
      init,
      setTokens,
      clearTokens,
      login,
      adminLogin,
      register,
      logout,
    };
  })
);

export default useAuthStore;
