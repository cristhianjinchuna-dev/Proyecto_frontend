import { MessageSquare } from 'lucide-react';
import { getRoomRatings } from '../../api/ratings';
import { useFetch } from '../../hooks/useFetch';
import { usePagination } from '../../hooks/usePagination';
import { EmptyState } from '../ui/EmptyState';
import { ErrorState } from '../ui/ErrorState';
import { Pagination } from '../ui/Pagination';
import { RatingCard } from './RatingCard';

export function RoomRatings({ roomId }: { roomId: number }) {
  // Own query params so they don't clash with other paginations: ?reviewsPage=2&reviewsSize=10
  const { page, size, setPage, setSize } = usePagination({
    pageParam: 'reviewsPage',
    sizeParam: 'reviewsSize',
  });
  const { data, loading, error, reload } = useFetch(
    (signal) => getRoomRatings(roomId, { page, size }, signal),
    [roomId, page, size],
  );

  return (
    <section aria-labelledby="ratings-title" className="space-y-4">
      <h2 id="ratings-title" className="text-xl font-bold text-gray-900">
        Calificaciones
        {data && (
          <span className="ml-2 text-base font-normal text-gray-500">({data.page.totalElements})</span>
        )}
      </h2>

      {error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : loading ? (
        <div className="space-y-3" aria-busy="true">
          {Array.from({ length: 3 }, (_, index) => (
            <div key={index} className="h-24 animate-pulse rounded-xl bg-gray-200" />
          ))}
        </div>
      ) : !data || data.content.length === 0 ? (
        <EmptyState
          icon={<MessageSquare className="h-10 w-10" aria-hidden />}
          title="Aún no hay calificaciones"
          description="Cuando un estudiante se hospede aquí, podrá dejar su opinión."
        />
      ) : (
        <>
          <ul className="space-y-3">
            {data.content.map((rating) => (
              <RatingCard key={rating.id} rating={rating} />
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
      )}
    </section>
  );
}