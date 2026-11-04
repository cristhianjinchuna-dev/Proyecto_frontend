import { useAuth } from '../hooks/useAuth';

export default function HomePage() {
  const { user } = useAuth();

  return (
    <section className="py-10">
      <h1 className="text-3xl font-bold text-gray-900">Encuentra tu habitación</h1>
      <p className="mt-2 text-gray-600">
        {user ? `Sesión iniciada como ${user.role}` : 'Aquí irá el listado de habitaciones (EP 008).'}
      </p>
    </section>
  );
}