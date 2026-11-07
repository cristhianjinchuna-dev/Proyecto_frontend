import { CheckCircle2, Eye, Inbox } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getReservations } from '../../api/reservations';
import { ReservationCard } from '../../components/reservations/ReservationCard';
import { Breadcrumbs } from '../../components/ui/Breadcrumbs';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorState } from '../../components/ui/ErrorState';
import { Pagination } from '../../components/ui/Pagination';
import { useFetch } from '../../hooks/useFetch';
import { usePagination } from '../../hooks/usePagination';
import { useReservationAction } from '../../hooks/useReservationAction';
import { buildReservationPath, PATHS } from '../../routes/paths';

const ACTION_BASE = 'inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition';

// EP 022 (landlord view: reservations of my rooms) + EP 026 (confirm)
export default function ReservationRequestsPage() {
  const { page, size, setPage, setSize } = usePagination();
  const { data, loading, error, reload } = useFetch(
    (signal) => getReservations({ page, size }, signal),
    [page, size],
  );
  const { request, dialogProps } = useReservationAction(() => reload());

  function renderContent() {
    if (error) return <ErrorState message={error} onRetry={reload} />;
    if (loading && !data) {
      return (
        <div className="space-y-3" aria-busy="true">
          {Array.from({ length: 3 }, (_, index) => (
            <div key={index} className="h-32 animate-pulse rounded-xl bg-gray-200" />
          ))}
        </div>
      );
    }
    if (!data || data.content.length === 0) {
      return (
        <EmptyState
          icon={<Inbox className="h-10 w-10" aria-hidden />}
          title="No tienes solicitudes"
          description="Cuando un estudiante reserve una de tus habitaciones, aparecerá aquí."
        />
      );
    }

    return (
      <>
        <ul className="space-y-3">
          {data.content.map((reservation) => (
            <ReservationCard
              key={reservation.id}
              reservation={reservation}
              showStudent
              actions={
                <>
                  <Link
                    to={buildReservationPath(reservation.id)}
                    className={`${ACTION_BASE} border border-gray-300 text-gray-700 hover:bg-gray-50`}
                  >
                    <Eye className="h-4 w-4" aria-hidden /> Ver solicitud
                  </Link>
                  {reservation.estado === 'PENDIENTE' && (
                    <button
                      type="button"
                      onClick={() => request(reservation, 'confirm')}
                      className={`${ACTION_BASE} bg-blue-600 text-white hover:bg-blue-700`}
                    >
                      <CheckCircle2 className="h-4 w-4" aria-hidden /> Confirmar
                    </button>
                  )}
                </>
              }
            />
          ))}
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
      <Breadcrumbs items={[{ label: 'Mi panel', to: PATHS.landlordDashboard }, { label: 'Solicitudes' }]} />
      <header>
        <h1 className="text-3xl font-bold text-gray-900">Solicitudes de reserva</h1>
        <p className="mt-1 text-gray-600">
          Revisa el perfil del estudiante en "Ver solicitud" antes de confirmar.
        </p>
      </header>

      {renderContent()}

      <ConfirmDialog {...dialogProps} />
    </section>
  );
}