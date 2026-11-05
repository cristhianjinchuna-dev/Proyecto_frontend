import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { refreshAccessToken, setSessionExpiredHandler } from '../api/client';
import { tokenStorage } from '../api/tokenStorage';
import type { AuthResponse, AuthUser } from '../types/auth';

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isRestoring: boolean;
  signIn: (response: AuthResponse) => void;
  signOut: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  // True while we try to recover the session after a page reload
  const [isRestoring, setIsRestoring] = useState(() => Boolean(tokenStorage.getRefreshToken()));

  const signIn = useCallback((response: AuthResponse) => {
    const authUser: AuthUser = { id: response.id, role: response.rol };
    tokenStorage.saveSession(response.token, response.refreshToken, authUser);
    setUser(authUser);
  }, []);

  const signOut = useCallback(() => {
    tokenStorage.clear();
    setUser(null);
  }, []);

  // If the interceptor can't renew the token, log the user out
  useEffect(() => {
    setSessionExpiredHandler(() => setUser(null));
    return () => setSessionExpiredHandler(null);
  }, []);

  // Page reload: the access token (memory) is lost -> recover it with the refresh token (EP 005)
  useEffect(() => {
    if (!tokenStorage.getRefreshToken()) return;

    let active = true;
    refreshAccessToken()
      .then((response) => {
        if (active) setUser({ id: response.id, role: response.rol });
      })
      .catch(() => tokenStorage.clear())
      .finally(() => {
        if (active) setIsRestoring(false);
      });

    return () => {
      active = false; // cleanup: ignore the result if the provider unmounted
    };
  }, []);

  const value = useMemo(
    () => ({ user, isAuthenticated: user !== null, isRestoring, signIn, signOut }),
    [user, isRestoring, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}