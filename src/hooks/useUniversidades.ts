import { useEffect, useState } from 'react';
import { getUniversidades } from '../api/universidades';
import { getErrorMessage } from '../api/client';
import type { Universidad } from '../types/universidad';

export function useUniversidades() {
  const [universidades, setUniversidades] = useState<Universidad[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getUniversidades()
      .then(setUniversidades)
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []); // MOUNT: se pide una sola vez

  return { universidades, loading, error };
}