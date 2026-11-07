import { Link, useLocation, useParams } from 'react-router-dom';
import { Images, MapPin, Ruler, SearchX } from 'lucide-react';
import { getRoomById } from '../api/rooms';
import { RoomRatings } from '../components/ratings/RoomRatings';
import { RoomGallery } from '../components/rooms/RoomGallery';
import { Breadcrumbs } from '../components/ui/Breadcrumbs';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorState } from '../components/ui/ErrorState';
import { PageLoader } from '../components/ui/PageLoader';
import { useAuth } from '../hooks/useAuth';
import { useFetch } from '../hooks/useFetch';
import { PATHS } from '../routes/paths';
import { formatArea, formatPrice } from '../utils/format';

export default function RoomDetailPage() {
  const { id } = useParams();
  const roomId = Number(id);
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();

  const { data: room, loading, error, errorStatus, reload } = useFetch(
    (signal) => getRoomById(roomId, signal),
    [roomId],
  );

  if (loading) return <PageLoader />;

  // 404 (doesn't exist) or 400 (id is not a number, e.g. /rooms/abc)
  if (errorStatus === 404 || errorStatus === 400 || !Number.isInteger(roomId)) {
    return (
      <section className="py-12">
        <EmptyState
          icon={<SearchX className="h-12 w-12" aria-hidden />}
          title="Esta habitación no existe"
          description="Puede que haya sido eliminada o que el enlace sea incorrecto."
          action={
            <Link
              to={PATHS.home}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Ver habitaciones
            </Link>
          }
        />
      </section>
    );
  }

  if (error || !room) {
    return (
      <section className="py-12">
        <ErrorState message={error ?? 'No se pudo cargar la habitación'} onRetry={reload} />
      </section>
    );
  }

  return (
    <section className="space-y-8 py-8">
      <Breadcrumbs items={[{ label: 'Inicio', to: PATHS.home }, { label: room.direccion }]} />

      <div className="grid gap-8 lg:grid-cols-[3fr_2fr]">
        <RoomGallery images={room.imagenes} alt={`Habitación en ${room.direccion}`} />

        <aside className="h-fit space-y-5 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200 lg:sticky lg:top-24">
          <p className="text-3xl font-bold text-gray-900">
            {formatPrice(room.precio)}
            <span className="text-base font-normal text-gray-500"> /mes</span>
          </p>

          <h1 className="flex items-start gap-2 text-lg font-semibold text-gray-900">
            <MapPin className="mt-1 h-5 w-5 shrink-0 text-blue-600" aria-hidden />
            {room.direccion}
          </h1>

          <dl className="grid grid-cols-2 gap-4 border-y border-gray-100 py-4 text-sm">
            <div>
              <dt className="flex items-center gap-1.5 text-gray-500">
                <Ruler className="h-4 w-4" aria-hidden /> Área
              </dt>
              <dd className="mt-1 font-semibold text-gray-900">{formatArea(room.area)}</dd>
            </div>
            <div>
              <dt className="flex items-center gap-1.5 text-gray-500">
                <Images className="h-4 w-4" aria-hidden /> Fotos
              </dt>
              <dd className="mt-1 font-semibold text-gray-900">{room.imagenes.length}</dd>
            </div>
          </dl>

          {/* EP 021 (create reservation) will replace this block */}
          {!isAuthenticated ? (
            <Link
              to={PATHS.login}
              state={{ from: location.pathname + location.search }}
              className="block w-full rounded-lg bg-blue-600 px-4 py-3 text-center font-semibold text-white transition hover:bg-blue-700"
            >
              Inicia sesión para reservar
            </Link>
          ) : user?.role === 'ESTUDIANTE' ? (
            <button
              type="button"
              disabled
              className="w-full cursor-not-allowed rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white opacity-60"
            >
              Reservar
            </button>
          ) : (
            <p className="rounded-lg bg-gray-50 px-4 py-3 text-center text-sm text-gray-600">
              Solo los estudiantes pueden reservar habitaciones.
            </p>
          )}
        </aside>
      </div>

      <RoomRatings roomId={room.id} />
    </section>
  );
}