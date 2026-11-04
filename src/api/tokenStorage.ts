import type { AuthUser } from '../types/auth';

const REFRESH_TOKEN_KEY = 'muvu.refreshToken';
const USER_KEY = 'muvu.user';

// Access token lives only in memory (not in localStorage)
let accessToken: string | null = null;

export const tokenStorage = {
  getAccessToken: () => accessToken,

  getRefreshToken: () => sessionStorage.getItem(REFRESH_TOKEN_KEY),

  getUser(): AuthUser | null {
    const raw = sessionStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  },

  saveSession(token: string, refreshToken: string, user: AuthUser) {
    accessToken = token;
    sessionStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    sessionStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  clear() {
    accessToken = null;
    sessionStorage.removeItem(REFRESH_TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
  },
};