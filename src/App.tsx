import { PageLoader } from './components/ui/PageLoader';
import { useAuth } from './hooks/useAuth';
import { AppRouter } from './routes/AppRouter';

export default function App() {
  const { isRestoring } = useAuth();

  // Wait until we know if there is a session before showing any page
  if (isRestoring) return <PageLoader />;

  return <AppRouter />;
}