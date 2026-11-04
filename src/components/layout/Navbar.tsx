import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { PATHS } from '../../routes/paths';

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-lg px-4 py-2 text-sm font-medium transition ${
    isActive ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'
  }`;

export function Navbar() {
  const { isAuthenticated, user, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-10 border-b border-gray-200 bg-white/90 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to={PATHS.home} className="text-xl font-bold text-blue-600">
          MuvU
        </Link>

        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <>
              <span className="hidden text-sm text-gray-500 sm:inline">{user?.role}</span>
              <button
                type="button"
                onClick={signOut}
                className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
              >
                Cerrar sesión
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