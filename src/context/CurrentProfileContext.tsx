import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { getLandlord } from '../api/landlords';
import { getStudent } from '../api/students';
import { useAuth } from '../hooks/useAuth';

export interface CurrentProfile {
  name: string;
  photo: string | null;
}

interface CurrentProfileContextValue {
  profile: CurrentProfile | null;
  refreshProfile: () => void;
}

export const CurrentProfileContext = createContext<CurrentProfileContextValue | null>(null);

// Name and photo of the logged-in user (Navbar). Profile pages call refreshProfile() after saving
export function CurrentProfileProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<CurrentProfile | null>(null);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    if (!user || user.role === 'ADMIN') return; // the admin has no profile endpoint

    const controller = new AbortController();
    const request =
      user.role === 'ESTUDIANTE' ? getStudent(user.id, controller.signal) : getLandlord(user.id, controller.signal);

    request
      .then((data) => setProfile({ name: data.nombre, photo: data.fotoPerfil }))
      .catch(() => setProfile(null)); // not critical: the Navbar falls back to the initial
    return () => controller.abort();
  }, [user, version]);

  const refreshProfile = useCallback(() => setVersion((current) => current + 1), []);

  const value = useMemo(
    () => ({ profile: user && user.role !== 'ADMIN' ? profile : null, refreshProfile }),
    [user, profile, refreshProfile],
  );

  return <CurrentProfileContext.Provider value={value}>{children}</CurrentProfileContext.Provider>;
}
