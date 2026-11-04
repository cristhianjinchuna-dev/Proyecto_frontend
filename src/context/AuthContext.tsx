import { createContext, useCallback, useMemo, useState, type ReactNode } from 'react';
import { tokenStorage } from '../api/tokenStorage';
import type { AuthResponse, AuthUser } from '../types/auth';

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  signIn: (response: AuthResponse) => void;
  signOut: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  // Only restore the user if we still have an access token (memory).
  // After a page reload this is null until EP 005 (refresh) is implemented.
  const [user, setUser] = useState<AuthUser | null>(() =>
    tokenStorage.getAccessToken() ? tokenStorage.getUser() : null,
  );

  const signIn = useCallback((response: AuthResponse) => {
    const authUser: AuthUser = { id: response.id, role: response.rol };
    tokenStorage.saveSession(response.token, response.refreshToken, authUser);
    setUser(authUser);
  }, []);

  const signOut = useCallback(() => {
    tokenStorage.clear();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, isAuthenticated: user !== null, signIn, signOut }),
    [user, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}