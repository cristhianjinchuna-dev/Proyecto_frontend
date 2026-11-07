import { Home } from 'lucide-react';
import { getRooms } from '../api/rooms';
import { RoomGrid } from '../components/rooms/RoomGrid';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorState } from '../components/ui/ErrorState';
import { Pagination } from '../components/ui/Pagination';
import { useFetch } from '../hooks/useFetch';
import { usePagination } from '../hooks/usePagination';

export default function HomePage() {
  const { page, size, setPage, setSize } = usePagination();
  const { data, loading, error, reload } = useFetch(
    (signal) => getRooms({ page, size }, signal),
    [page, size],
  );

  function handlePageChange(newPage: number) {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function renderContent() {
    if (error) return <ErrorState message={error} onRetry={reload} />;
    if (loading) return <RoomGrid rooms={[]} loading skeletonCount={Math.min(size, 8)} />;

    if (!data || data.content.length === 0) {
      const pageOutOfRange = (data?.page.totalElements ?? 0) > 0;
      return (
        <EmptyState
          icon={<Home className="h-10 w-10" aria-hidden />}
          title={pageOutOfRange ? 'Esta página no tiene resultados' : 'Aún no hay habitaciones publicadas'}
          description={
            pageOutOfRange
              ? 'Vuelve a la primera página para ver las habitaciones disponibles.'
              : 'Pronto los arrendadores publicarán habitaciones cerca de tu universidad.'
          }
          action={
            pageOutOfRange && (
              <button
                type="button"
                onClick={() => setPage(0)}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Ir a la primera página
              </button>
            )
          }
        />
      );
    }

    return (
      <>
        <RoomGrid rooms={data.content} />
        <Pagination
          page={data.page.number}
          totalPages={data.page.totalPages}
          totalElements={data.page.totalElements}
          size={data.page.size}
          onPageChange={handlePageChange}
          onSizeChange={setSize}
        />
      </>
    );
  }

  return (
    <section className="space-y-8 py-8">
      <header className="rounded-2xl bg-linear-to-r from-blue-600 to-violet-600 px-6 py-10 text-white shadow-lg sm:px-10">
        <h1 className="text-3xl font-bold sm:text-4xl">Encuentra tu habitación ideal</h1>
        <p className="mt-2 max-w-xl text-blue-100">
          Habitaciones cerca de tu universidad. Las destacadas aparecen primero.
        </p>
      </header>

      {renderContent()}
    </section>
  );
}