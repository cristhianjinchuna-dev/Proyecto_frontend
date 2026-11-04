import { useEffect, useState } from 'react';
import axios from 'axios';
import { getUniversities } from '../api/universities';
import { getErrorMessage } from '../api/errors';  
import type { University } from '../types/university';

export function useUniversities() {
  const [universities, setUniversities] = useState<University[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    getUniversities(controller.signal)
      .then(setUniversities)
      .catch((err) => {
        if (axios.isCancel(err)) return; // cancelled on unmount: not an error
        setError(getErrorMessage(err));
      })
      .finally(() => setLoading(false));

    return () => controller.abort(); // cleanup: cancel the request on unmount
  }, []);

  return { universities, loading, error };
}