import { Link, NavLink } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { PATHS } from '../../routes/paths';
import type { Role } from '../../types/auth';

const ROLE_LABELS: Record<Role, string> = {
  ESTUDIANTE: 'Estudiante',
  ARRENDADOR: 'Arrendador',
  ADMIN: 'Administrador',
};

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-lg px-3 py-2 text-sm font-medium transition ${
    isActive ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'
  }`;

export function Navbar() {
  const { isAuthenticated, user, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-10 border-b border-gray-200 bg-white/90 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-3">
        <Link to={PATHS.home} className="text-xl font-bold text-blue-600">
          MuvU
        </Link>

        <div className="flex flex-wrap items-center gap-1">
          <NavLink to={PATHS.nearbyRooms} className={navLinkClass}>
            Cerca de mi universidad
          </NavLink>

          {user?.role === 'ESTUDIANTE' && (
            <>
              <NavLink to={PATHS.myReservations} className={navLinkClass}>
                Mis reservas
              </NavLink>
              <NavLink to={PATHS.myReviews} className={navLinkClass}>
                Mis reseñas
              </NavLink>
              <NavLink to={PATHS.studentProfile} className={navLinkClass}>
                Mi perfil
              </NavLink>
            </>
          )}

          {user?.role === 'ARRENDADOR' && (
            <>
              <NavLink to={PATHS.landlordDashboard} end className={navLinkClass}>
                Mi panel
              </NavLink>
              <NavLink to={PATHS.reservationRequests} className={navLinkClass}>
                Solicitudes
              </NavLink>
            </>
          )}

          {isAuthenticated && user ? (
            <>
              <span className="hidden px-2 text-sm text-gray-500 sm:inline">{ROLE_LABELS[user.role]}</span>
              <button
                type="button"
                onClick={signOut}
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
              >
                <LogOut className="h-4 w-4" aria-hidden />
                Salir
              </button>
            </>
          ) : (
            <>
              <NavLink to={PATHS.register} className={navLinkClass}>
                Registrarse
              </NavLink>
              <NavLink to={PATHS.login} className={navLinkClass}>
                Iniciar sesión
              </NavLink>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}