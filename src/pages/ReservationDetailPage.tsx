import { Link, useParams } from 'react-router-dom';
import { CalendarDays, CheckCircle2, MapPin, SearchX, ShieldAlert, XCircle } from 'lucide-react';
import { getReservationById } from '../api/reservations';
import { getRoomById } from '../api/rooms';
import { ReservationStatusBadge } from '../components/reservations/ReservationStatusBadge';
import { StudentProfileCard } from '../components/reservations/StudentProfileCard';
import { Breadcrumbs } from '../components/ui/Breadcrumbs';
import { Button } from '../components/ui/Button';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorState } from '../components/ui/ErrorState';
import { PageLoader } from '../components/ui/PageLoader';
import { useAuth } from '../hooks/useAuth';
import { useFetch } from '../hooks/useFetch';
import { useReservationAction } from '../hooks/useReservationAction';
import { buildRoomPath, PATHS } from '../routes/paths';
import { countNights, formatDate } from '../utils/dates';
import { formatPrice } from '../utils/format';

// EP 023 - detail for the student owner or the landlord owner of the room
export default function ReservationDetailPage() {
  const { id } = useParams();
  const reservationId = Number(id);
  const { user } = useAuth();
  const isLandlord = user?.role === 'ARRENDADOR';
  const listPath = isLandlord ? PATHS.reservationRequests : PATHS.myReservations;

  const { data: reservation, loading, error, errorStatus, reload } = useFetch(
    (signal) => getReservationById(reservationId, signal),
    [reservationId],
  );
  const roomId = reservation?.habitacionId;
  const room = useFetch(
    (signal) => (roomId ? getRoomById(roomId, signal) : Promise.resolve(null)),
    [roomId],
  );
  const { request, dialogProps } = useReservationAction(() => reload());

  if (loading && !reservation) return <PageLoader />;

  if (errorStatus === 404 || errorStatus === 400 || !Number.isInteger(reservationId)) {
    return (
      <section className="py-12">
        <EmptyState
          icon={<SearchX className="h-12 w-12" aria-hidden />}
          title="Esta reserva no existe"
          action={
            <Link to={listPath} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
              Volver a mis reservas
            </Link>
          }
        />
      </section>
    );
  }

  if (errorStatus === 403) {
    return (
      <section className="py-12">
        <EmptyState
          icon={<ShieldAlert className="h-12 w-12" aria-hidden />}
          title="No tienes acceso a esta reserva"
          description="Solo la puede ver el estudiante que la hizo o el dueño de la habitación."
        />
      </section>
    );
  }

  if (error || !reservation) {
    return (
      <section className="py-12">
        <ErrorState message={error ?? 'No se pudo cargar la reserva'} onRetry={reload} />
      </section>
    );
  }

  const nights = countNights(reservation.fecha_inicio, reservation.fecha_fin);
  const isPending = reservation.estado === 'PENDIENTE';

  return (
    <section className="space-y-6 py-8">
      <Breadcrumbs
        items={[
          { label: isLandlord ? 'Solicitudes' : 'Mis reservas', to: listPath },
          { label: `Reserva #${reservation.id}` },
        ]}
      />

      <div className="grid gap-6 lg:grid-cols-[3fr_2fr]">
        <article className="space-y-5 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
          <header className="flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-2xl font-bold text-gray-900">Reserva #{reservation.id}</h1>
            <ReservationStatusBadge status={reservation.estado} />
          </header>

          <div className="flex items-start gap-2 text-gray-700">
            <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" aria-hidden />
            {room.data ? (
              <div>
                <Link to={buildRoomPath(room.data.id)} className="font-semibold hover:text-blue-600 hover:underline">
                  {room.data.direccion}
                </Link>
                <p className="text-sm text-gray-500">{formatPrice(room.data.precio)} /mes</p>
              </div>
            ) : (
              <span className="inline-block h-5 w-56 animate-pulse rounded bg-gray-200" />
            )}
          </div>

          <dl className="grid grid-cols-3 gap-4 border-y border-gray-100 py-4 text-sm">
            <div>
              <dt className="flex items-center gap-1.5 text-gray-500">
                <CalendarDays className="h-4 w-4" aria-hidden /> Ingreso
              </dt>
              <dd className="mt-1 font-semibold text-gray-900">{formatDate(reservation.fecha_inicio)}</dd>
            </div>
            <div>
              <dt className="flex items-center gap-1.5 text-gray-500">
                <CalendarDays className="h-4 w-4" aria-hidden /> Salida
              </dt>
              <dd className="mt-1 font-semibold text-gray-900">{formatDate(reservation.fecha_fin)}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Duración</dt>
              <dd className="mt-1 font-semibold text-gray-900">
                {nights} {nights === 1 ? 'noche' : 'noches'}
              </dd>
            </div>
          </dl>

          {isPending && !isLandlord && (
            <Button variant="danger" onClick={() => request(reservation, 'cancel')} className="sm:w-auto">
              <XCircle className="h-4 w-4" aria-hidden /> Cancelar reserva
            </Button>
          )}
          {isPending && isLandlord && (
            <Button onClick={() => request(reservation, 'confirm')} className="sm:w-auto">
              <CheckCircle2 className="h-4 w-4" aria-hidden /> Confirmar reserva
            </Button>
          )}
          {!isPending && (
            <p className="text-sm text-gray-500">
              {reservation.estado === 'CONFIRMADO'
                ? 'Esta reserva ya está confirmada.'
                : 'Esta reserva fue cancelada.'}
            </p>
          )}
        </article>

        {/* EP 025 - only the landlord can see the student profile */}
        {isLandlord && <StudentProfileCard studentId={reservation.estudianteId} />}
      </div>

      <ConfirmDialog {...dialogProps} />
    </section>
  );
}