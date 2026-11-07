import { useCallback, useEffect, useState, type DependencyList } from 'react';
import axios from 'axios';
import { getErrorMessage, getErrorStatus } from '../api/errors';

export function useFetch<T>(
  fetcher: (signal: AbortSignal) => Promise<T>,
  deps: DependencyList,
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorStatus, setErrorStatus] = useState<number | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    setErrorStatus(null);

    fetcher(controller.signal)
      .then((result) => setData(result))
      .catch((err) => {
        if (axios.isCancel(err)) return; // cancelled on unmount / new request
        setError(getErrorMessage(err));
        setErrorStatus(getErrorStatus(err));
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, reloadKey]);

  // Retry logic: run the same request again
  const reload = useCallback(() => setReloadKey((key) => key + 1), []);

  return { data, loading, error, errorStatus, reload };
}