import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MapPinned, SearchX } from 'lucide-react';
import { getNearbyRooms } from '../api/rooms';
import { getUniversityById } from '../api/universities';
import { LocationMap } from '../components/LocationMap';
import { RadiusSlider } from '../components/rooms/RadiusSlider';
import { RoomGrid } from '../components/rooms/RoomGrid';
import { UniversityCard } from '../components/UniversityCard';
import { UniversitySelect } from '../components/UniversitySelect';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorState } from '../components/ui/ErrorState';
import { Pagination } from '../components/ui/Pagination';
import { useDebounce } from '../hooks/useDebounce';
import { useFetch } from '../hooks/useFetch';
import { PAGE_SIZE_OPTIONS, usePagination } from '../hooks/usePagination';
import type { Page } from '../types/page';
import type { Room } from '../types/room';

const RADIUS_MIN = 1;
const RADIUS_MAX = 10;
const DEFAULT_RADIUS = 5;

export default function NearbyRoomsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { page, size, setPage, setSize } = usePagination();

  // Filters live in the URL: /rooms/nearby?universityId=1&radiusKm=5&page=2
  const universityParam = Number(searchParams.get('universityId'));
  const universityId = Number.isInteger(universityParam) && universityParam > 0 ? universityParam : null;

  const radiusParam = Number(searchParams.get('radiusKm'));
  const radiusKm = radiusParam >= RADIUS_MIN && radiusParam <= RADIUS_MAX ? radiusParam : DEFAULT_RADIUS;

  // While the user drags, the slider shows a local "draft"; the URL is only
  // updated when they stop (debounce). With no draft, the slider shows the URL value.
  const [radiusDraft, setRadiusDraft] = useState<number | null>(null);
  const debouncedDraft = useDebounce(radiusDraft, 400);
  const sliderValue = radiusDraft ?? radiusKm;

  // The user stopped moving the slider: save it in the URL (and go back to page 1)
  useEffect(() => {
    if (debouncedDraft === null || debouncedDraft !== radiusDraft) return; // still dragging
    if (debouncedDraft !== radiusKm) {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.set('radiusKm', String(debouncedDraft));
        next.delete('page');
        return next;
      });
    }
    setRadiusDraft(null); // from now on the slider follows the URL again (back/forward works)
  }, [debouncedDraft, radiusDraft, radiusKm, setSearchParams]);

  function handleUniversityChange(id: number | '') {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (id === '') next.delete('universityId');
      else next.set('universityId', String(id));
      next.delete('page');
      return next;
    });
  }

  const { data, loading, error, reload } = useFetch<Page<Room> | null>(
    (signal) =>
      universityId
        ? getNearbyRooms({ universidadId: universityId, radioKm: radiusKm, page, size }, signal)
        : Promise.resolve(null),
    [universityId, radiusKm, page, size],
  );
  const { data: selectedUniversity } = useFetch(
    (signal) => universityId ? getUniversityById(universityId, signal) : Promise.resolve(null),
    [universityId],
  );
  const circleCenter = useMemo(
    () => selectedUniversity ? { lat: selectedUniversity.latitud, lng: selectedUniversity.longitud } : undefined,
    [selectedUniversity?.latitud, selectedUniversity?.longitud],
  );

  function renderResults() {
    if (!universityId) {
      return (
        <EmptyState
          icon={<MapPinned className="h-10 w-10" aria-hidden />}
          title="Elige tu universidad"
          description="Te mostraremos las habitaciones más cercanas, con la distancia en kilómetros."
        />
      );
    }
    if (error) return <ErrorState message={error} onRetry={reload} />;
    if (loading && !data) return <RoomGrid rooms={[]} loading skeletonCount={Math.min(size, 8)} />;

    if (!data || data.content.length === 0) {
      return (
        <EmptyState
          icon={<SearchX className="h-10 w-10" aria-hidden />}
          title={`No hay habitaciones a menos de ${radiusKm} km`}
          description="Prueba ampliando el radio de búsqueda."
          action={
            radiusKm < RADIUS_MAX && (
              <button
                type="button"
                onClick={() => setRadiusDraft(Math.min(radiusKm + 5, RADIUS_MAX))}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Ampliar a {Math.min(radiusKm + 5, RADIUS_MAX)} km
              </button>
            )
          }
        />
      );
    }

    return (
      <>
        {data.content.length > 0 && <LocationMap
          title={`Habitaciones dentro de ${radiusKm} km`}
          rooms={data.content}
          circleCenter={circleCenter}
          radiusKm={radiusKm}
          circleCenterTitle={selectedUniversity?.nombre ?? 'Universidad seleccionada'}
        />}
        <RoomGrid rooms={data.content} />
        <Pagination
          page={data.page.number}
          totalPages={data.page.totalPages}
          totalElements={data.page.totalElements}
          size={data.page.size}
          onPageChange={(newPage) => {
            setPage(newPage);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      </>
    );
  }

  return (
    <section className="space-y-8 py-8">
      <header>
        <h1 className="text-3xl font-bold text-gray-900">Habitaciones cerca de tu universidad</h1>
        <p className="mt-1 text-gray-600">Las destacadas aparecen primero y luego las más cercanas.</p>
      </header>

      <div className="grid gap-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200 sm:grid-cols-2 lg:grid-cols-3">
        <div className="space-y-1">
          <label htmlFor="universityId" className="block text-sm font-medium text-gray-700">
            Universidad
          </label>
          <UniversitySelect
            id="universityId"
            value={universityId ?? ''}
            onChange={handleUniversityChange}
          />
        </div>
        <RadiusSlider value={sliderValue} min={RADIUS_MIN} max={RADIUS_MAX} onChange={setRadiusDraft} />
        <div className="space-y-2">
          <label htmlFor="nearby-page-size" className="block text-sm font-medium text-gray-700">Habitaciones a mostrar</label>
          <select
            id="nearby-page-size"
            value={size}
            onChange={(event) => setSize(Number(event.target.value))}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {PAGE_SIZE_OPTIONS.map((option) => <option key={option} value={option}>{option} por página</option>)}
          </select>
          <p className="text-xs text-gray-500">Elige cuántas ubicaciones mostrar en el mapa y en los resultados.</p>
        </div>
      </div>

      {/* EP 013 - selected university */}
      {universityId && <UniversityCard universityId={universityId} />}

      {renderResults()}
    </section>
  );
}
