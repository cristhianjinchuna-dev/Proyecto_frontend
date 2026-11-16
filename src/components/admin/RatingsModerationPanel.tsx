import { MessageSquare } from 'lucide-react';
import { getAllRatings } from '../../api/ratings';
import { useFetch } from '../../hooks/useFetch';
import { usePagination } from '../../hooks/usePagination';
import { RatingCard } from '../ratings/RatingCard';
import { RoomAddressLink } from '../rooms/RoomAddressLink';
import { EmptyState } from '../ui/EmptyState';
import { ErrorState } from '../ui/ErrorState';
import { PageLoader } from '../ui/PageLoader';
import { Pagination } from '../ui/Pagination';
import { RatingDeleteButton } from './RatingDeleteButton';

// GET /calificaciones (ADMIN) - every review, newest first, to remove the inappropriate ones
export function RatingsModerationPanel() {
  const { page, size, setPage, setSize } = usePagination({ pageParam: 'ratingsPage', sizeParam: 'ratingsSize' });
  const { data, loading, error, reload } = useFetch(
    (signal) => getAllRatings({ page, size }, signal),
    [page, size],
  );

  if (!data) {
    if (loading) return <PageLoader />;
    return <ErrorState message={error ?? 'No se pudieron cargar las reseñas'} onRetry={reload} />;
  }

  if (data.content.length === 0) {
    return <EmptyState icon={<MessageSquare className="h-10 w-10" aria-hidden />} title="Aún no hay reseñas" />;
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        Elimina las reseñas ofensivas o falsas. El autor recibe un correo con el motivo.
      </p>
      <ul className="space-y-3">
        {data.content.map((rating) => (
          <RatingCard
            key={rating.id}
            rating={rating}
            header={
              <span className="flex min-w-0 items-center gap-1">
                Habitación: <RoomAddressLink roomId={rating.habitacionId} />
              </span>
            }
            actions={<RatingDeleteButton rating={rating} onDeleted={reload} />}
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
    </div>
  );
}
