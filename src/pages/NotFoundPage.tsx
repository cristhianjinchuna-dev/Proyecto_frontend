import { Link } from 'react-router-dom';
import { PATHS } from '../routes/paths';

export default function NotFoundPage() {
  return (
    <section className="py-20 text-center">
      <p className="text-6xl font-bold text-blue-600">404</p>
      <h1 className="mt-4 text-2xl font-semibold text-gray-900">Página no encontrada</h1>
      <p className="mt-2 text-gray-600">La página que buscas no existe o fue movida.</p>
      <Link
        to={PATHS.home}
        className="mt-6 inline-block rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700"
      >
        Volver al inicio
      </Link>
    </section>
  );
}