import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarX2, CheckCircle2, Eye, Star, XCircle } from 'lucide-react';
import { getReservations } from '../api/reservations';
import { RatingDialog } from '../components/ratings/RatingDialog';
import { ReservationCard } from '../components/reservations/ReservationCard';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorState } from '../components/ui/ErrorState';
import { Pagination } from '../components/ui/Pagination';
import { useAuth } from '../hooks/useAuth';
import { useFetch } from '../hooks/useFetch';
import { usePagination } from '../hooks/usePagination';
import { useRatedReservations } from '../hooks/useRatedReservations';
import { useReservationAction } from '../hooks/useReservationAction';
import { buildReservationPath, PATHS } from '../routes/paths';

const ACTION_BASE = 'inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition';

// EP 022 (student view) + EP 024 (cancel) + EP 027 (rate a confirmed reservation)
export default function MyReservationsPage() {
  const { user } = useAuth();
  const studentId = user?.id ?? 0;

  const { page, size, setPage, setSize } = usePagination();
  const { data, loading, error, reload } = useFetch(
    (signal) => getReservations({ page, size }, signal),
    [page, size],
  );
  const { request, dialogProps } = useReservationAction(() => reload());

  const { ratedIds, reload: reloadRated } = useRatedReservations(studentId);
  const [reservationToRate, setReservationToRate] = useState<number | null>(null);

  function renderContent() {
    if (error) return <ErrorState message={error} onRetry={reload} />;
    if (loading && !data) {
      return (
        <div className="space-y-3" aria-busy="true">
          {Array.from({ length: 3 }, (_, index) => (
            <div key={index} className="h-28 animate-pulse rounded-xl bg-gray-200" />
          ))}
        </div>
      );
    }
    if (!data || data.content.length === 0) {
      return (
        <EmptyState
          icon={<CalendarX2 className="h-10 w-10" aria-hidden />}
          title="Aún no tienes reservas"
          description="Busca una habitación y envía tu primera solicitud."
          action={
            <Link
              to={PATHS.nearbyRooms}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Buscar habitaciones
            </Link>
          }
        />
      );
    }

    return (
      <>
        <ul className="space-y-3">
          {data.content.map((reservation) => {
            const isConfirmed = reservation.estado === 'CONFIRMADO';
            const isRated = ratedIds.has(reservation.id);

            return (
              <ReservationCard
                key={reservation.id}
                reservation={reservation}
                actions={
                  <>
                    <Link
                      to={buildReservationPath(reservation.id)}
                      className={`${ACTION_BASE} border border-gray-300 text-gray-700 hover:bg-gray-50`}
                    >
                      <Eye className="h-4 w-4" aria-hidden /> Ver
                    </Link>
                    {reservation.estado === 'PENDIENTE' && (
                      <button
                        type="button"
                        onClick={() => request(reservation, 'cancel')}
                        className={`${ACTION_BASE} border border-red-200 text-red-600 hover:bg-red-600 hover:text-white`}
                      >
                        <XCircle className="h-4 w-4" aria-hidden /> Cancelar
                      </button>
                    )}
                    {isConfirmed && !isRated && (
                      <button
                        type="button"
                        onClick={() => setReservationToRate(reservation.id)}
                        className={`${ACTION_BASE} bg-amber-500 text-white hover:bg-amber-600`}
                      >
                        <Star className="h-4 w-4" aria-hidden /> Calificar
                      </button>
                    )}
                    {isConfirmed && isRated && (
                      <span className={`${ACTION_BASE} text-green-700`}>
                        <CheckCircle2 className="h-4 w-4" aria-hidden /> Calificada
                      </span>
                    )}
                  </>
                }
              />
            );
          })}
        </ul>
        <Pagination
          page={data.page.number}
          totalPages={data.page.totalPages}
          totalElements={data.page.totalElements}
          size={data.page.size}
          onPageChange={setPage}
          onSizeChange={setSize}
        />
      </>
    );
  }

  return (
    <section className="space-y-6 py-8">
      <header>
        <h1 className="text-3xl font-bold text-gray-900">Mis reservas</h1>
        <p className="mt-1 text-gray-600">
          Puedes cancelar una solicitud mientras esté pendiente y calificar las reservas confirmadas.
        </p>
      </header>

      {renderContent()}

      <ConfirmDialog {...dialogProps} />

      {reservationToRate !== null && (
        <RatingDialog
          reservationId={reservationToRate}
          onClose={() => setReservationToRate(null)}
          onCreated={() => {
            setReservationToRate(null);
            reloadRated();
          }}
        />
      )}
    </section>
  );
}