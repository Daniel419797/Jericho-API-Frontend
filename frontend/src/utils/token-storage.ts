import { AuthTokens } from '@/types/auth';

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

export const tokenStorage = {
  getAccessToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  },

  getRefreshToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },

  setTokens: (tokens: AuthTokens | null | undefined): void => {
    if (typeof window === 'undefined') return;
    if (!tokens || !tokens.accessToken || !tokens.refreshToken) {
      // Log for easier debugging and surface a clear error to callers
      console.error('Invalid tokens provided to tokenStorage.setTokens:', tokens);
      throw new Error('Invalid auth tokens');
    }

    localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
  },

  clearTokens: (): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },

  hasTokens: (): boolean => {
    return Boolean(tokenStorage.getAccessToken() && tokenStorage.getRefreshToken());
  },
};
