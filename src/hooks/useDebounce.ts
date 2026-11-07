import { useEffect, useState } from 'react';

// Returns `value` only after it stopped changing for `delay` ms
export function useDebounce<T>(value: T, delay = 400): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(timer); // cleanup: cancel if value changes again
  }, [value, delay]);

  return debounced;
}