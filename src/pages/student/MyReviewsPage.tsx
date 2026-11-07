import { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, MessageSquareOff, Trash2 } from 'lucide-react';
import { deleteRating, getStudentRatings } from '../../api/ratings';
import { getErrorMessage } from '../../api/errors';
import { RatingCard } from '../../components/ratings/RatingCard';
import { RoomAddressLink } from '../../components/rooms/RoomAddressLink';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorState } from '../../components/ui/ErrorState';
import { Pagination } from '../../components/ui/Pagination';
import { useAuth } from '../../hooks/useAuth';
import { useFetch } from '../../hooks/useFetch';
import { usePagination } from '../../hooks/usePagination';
import { useToast } from '../../hooks/useToast';
import { PATHS } from '../../routes/paths';
import type { Rating } from '../../types/rating';

// EP 029 (my ratings, paginated) + EP 030 (delete one)
export default function MyReviewsPage() {
  const { user } = useAuth();
  const studentId = user?.id ?? 0;
  const { showToast } = useToast();

  const { page, size, setPage, setSize } = usePagination();
  const { data, loading, error, reload } = useFetch(
    (signal) => getStudentRatings(studentId, { page, size }, signal),
    [studentId, page, size],
  );

  const [ratingToDelete, setRatingToDelete] = useState<Rating | null>(null);
  const [deleting, setDeleting] = useState(false);
  const closeDialog = useCallback(() => setRatingToDelete(null), []);

  async function handleConfirmDelete() {
    if (!ratingToDelete) return;
    setDeleting(true);
    try {
      await deleteRating(ratingToDelete.id);
      showToast('Reseña eliminada');
      setRatingToDelete(null);
      // If it was the last one of this page, go back one page
      if (data?.content.length === 1 && page > 0) setPage(page - 1);
      else reload();
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    } finally {
      setDeleting(false);
    }
  }

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
          icon={<MessageSquareOff className="h-10 w-10" aria-hidden />}
          title="Aún no escribiste reseñas"
          description="Cuando tengas una reserva confirmada, podrás calificarla desde Mis reservas."
          action={
            <Link
              to={PATHS.myReservations}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Ir a Mis reservas
            </Link>
          }
        />
      );
    }

    return (
      <>
        <ul className="space-y-3">
          {data.content.map((rating) => (
            <RatingCard
              key={rating.id}
              rating={rating}
              header={
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 shrink-0 text-gray-400" aria-hidden />
                  <RoomAddressLink roomId={rating.habitacionId} />
                </span>
              }
              actions={
                <button
                  type="button"
                  onClick={() => setRatingToDelete(rating)}
                  aria-label="Eliminar reseña"
                  className="rounded-lg p-2 text-red-600 transition hover:bg-red-600 hover:text-white"
                >
                  <Trash2 className="h-4 w-4" aria-hidden />
                </button>
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
      <header>
        <h1 className="text-3xl font-bold text-gray-900">Mis reseñas</h1>
        <p className="mt-1 text-gray-600">Las calificaciones que dejaste en las habitaciones donde te hospedaste.</p>
      </header>

      {renderContent()}

      <ConfirmDialog
        open={ratingToDelete !== null}
        title="¿Eliminar esta reseña?"
        message="Se quitará de la habitación y se recalculará el puntaje del arrendador. No se puede deshacer."
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={closeDialog}
      />
    </section>
  );
}