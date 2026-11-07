import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import type { Role } from '../types/auth';
import { PATHS } from './paths';

interface PrivateRouteProps {
  allowedRoles?: Role[];
}

export function PrivateRoute({ allowedRoles }: PrivateRouteProps) {
  const { user } = useAuth();
  const location = useLocation();

  // Not logged in -> login, and come back here afterwards
  if (!user) {
    return <Navigate to={PATHS.login} replace state={{ from: location.pathname + location.search }} />;
  }

  // Logged in but wrong role -> home
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={PATHS.home} replace />;
  }

  return <Outlet />;
}