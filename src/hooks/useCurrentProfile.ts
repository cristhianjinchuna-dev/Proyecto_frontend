import { useContext } from 'react';
import { CurrentProfileContext } from '../context/CurrentProfileContext';

export function useCurrentProfile() {
  const context = useContext(CurrentProfileContext);
  if (!context) {
    throw new Error('useCurrentProfile must be used inside <CurrentProfileProvider>');
  }
  return context;
}
