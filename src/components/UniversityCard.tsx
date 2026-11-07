import { ExternalLink, GraduationCap, MapPin } from 'lucide-react';
import { getUniversityById } from '../api/universities';
import { useFetch } from '../hooks/useFetch';

// EP 013 - shows the selected university (name, address and a Google Maps link)
export function UniversityCard({ universityId }: { universityId: number }) {
  const { data: university, loading, errorStatus } = useFetch(
    (signal) => getUniversityById(universityId, signal),
    [universityId],
  );

  if (loading) {
    return <div className="h-20 animate-pulse rounded-2xl bg-gray-200" aria-busy="true" />;
  }

  if (errorStatus === 404) {
    return (
      <p className="rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
        Esa universidad no existe. Elige otra de la lista.
      </p>
    );
  }

  if (!university) return null; // other errors: the results section already shows them

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${university.latitud},${university.longitud}`;

  return (
    <article className="flex flex-col gap-3 rounded-2xl bg-blue-50 p-4 ring-1 ring-blue-100 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white">
          <GraduationCap className="h-5 w-5" aria-hidden />
        </span>
        <div>
          <h2 className="font-semibold text-gray-900">{university.nombre}</h2>
          <p className="flex items-center gap-1 text-sm text-gray-600">
            <MapPin className="h-4 w-4 shrink-0" aria-hidden /> {university.direccion}
          </p>
        </div>
      </div>
      <a
        href={mapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-700 hover:underline"
      >
        Ver en Google Maps <ExternalLink className="h-4 w-4" aria-hidden />
      </a>
    </article>
  );
}