import { Link } from 'react-router-dom';
import { BedDouble, Home, MessageSquare, PlusCircle, Star, UserPen } from 'lucide-react';
import { getLandlord, getLandlordRooms } from '../../api/landlords';
import { LandlordRoomRow } from '../../components/landlord/LandlordRoomRow';
import { Alert } from '../../components/ui/Alert';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorState } from '../../components/ui/ErrorState';
import { PageLoader } from '../../components/ui/PageLoader';
import { Pagination } from '../../components/ui/Pagination';
import { StatCard } from '../../components/ui/StatCard';
import { useAuth } from '../../hooks/useAuth';
import { useFetch } from '../../hooks/useFetch';
import { usePagination } from '../../hooks/usePagination';
import { PATHS } from '../../routes/paths';

export default function LandlordDashboardPage() {
  const { user } = useAuth();
  const landlordId = user?.id ?? 0; // PrivateRoute guarantees a logged-in ARRENDADOR

  const profile = useFetch((signal) => getLandlord(landlordId, signal), [landlordId]);

  const { page, size, setPage, setSize } = usePagination();
  const rooms = useFetch(
    (signal) => getLandlordRooms(landlordId, { page, size }, signal),
    [landlordId, page, size],
  );

  if (profile.loading) return <PageLoader />;
  if (profile.error || !profile.data) {
    return (
      <section className="py-12">
        <ErrorState message={profile.error ?? 'No se pudo cargar tu perfil'} onRetry={profile.reload} />
      </section>
    );
  }

  const landlord = profile.data;

  return (
    <section className="space-y-8 py-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Hola, {landlord.nombre}</h1>
          <p className="mt-1 text-gray-600">{landlord.correo}</p>
        </div>
        <div className="flex gap-2">
          <Link
            to={PATHS.landlordProfile}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            <UserPen className="h-4 w-4" aria-hidden /> Editar perfil
          </Link>
          {landlord.verificado && (
            <Link
              to={PATHS.createRoom}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              <PlusCircle className="h-4 w-4" aria-hidden /> Publicar habitación
            </Link>
          )}
        </div>
      </header>

      {!landlord.verificado && (
        <Alert variant="info">
          Tu cuenta está <strong>pendiente de verificación</strong>. Agrega la foto de tu DNI en{' '}
          <Link to={PATHS.landlordProfile} className="font-semibold underline">
            Editar perfil
          </Link>{' '}
          para que un administrador la revise. Cuando te verifiquen podrás publicar habitaciones.
        </Alert>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          icon={<BedDouble className="h-6 w-6" aria-hidden />}
          label="Habitaciones"
          value={landlord.cantidadHabitaciones}
        />
        <StatCard
          icon={<Star className="h-6 w-6" aria-hidden />}
          label="Puntaje promedio"
          value={landlord.puntajePromedio != null ? landlord.puntajePromedio.toFixed(1) : '—'}
        />
        <StatCard
          icon={<MessageSquare className="h-6 w-6" aria-hidden />}
          label="Calificaciones"
          value={landlord.totalCalificaciones}
        />
      </div>

      <section aria-labelledby="my-rooms-title" className="space-y-4">
        <h2 id="my-rooms-title" className="text-xl font-bold text-gray-900">
          Mis habitaciones
        </h2>

        {rooms.error ? (
          <ErrorState message={rooms.error} onRetry={rooms.reload} />
        ) : rooms.loading ? (
          <div className="space-y-3" aria-busy="true">
            {Array.from({ length: 3 }, (_, index) => (
              <div key={index} className="h-20 animate-pulse rounded-xl bg-gray-200" />
            ))}
          </div>
        ) : !rooms.data || rooms.data.content.length === 0 ? (
          <EmptyState
            icon={<Home className="h-10 w-10" aria-hidden />}
            title="Aún no publicaste habitaciones"
            description={
              landlord.verificado
                ? 'Publica tu primera habitación para que los estudiantes puedan encontrarla.'
                : 'Podrás publicar cuando un administrador verifique tu cuenta.'
            }
            action={
              landlord.verificado && (
                <Link
                  to={PATHS.createRoom}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  Publicar habitación
                </Link>
              )
            }
          />
        ) : (
          <>
            <ul className="space-y-3">
              {rooms.data.content.map((room) => (
                <LandlordRoomRow key={room.id} room={room} />
              ))}
            </ul>
            <Pagination
              page={rooms.data.page.number}
              totalPages={rooms.data.page.totalPages}
              totalElements={rooms.data.page.totalElements}
              size={rooms.data.page.size}
              onPageChange={setPage}
              onSizeChange={setSize}
            />
          </>
        )}
      </section>
    </section>
  );
}