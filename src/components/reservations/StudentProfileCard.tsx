import { BadgeCheck, GraduationCap, UserRound } from 'lucide-react';
import { getStudentProfile } from '../../api/students';
import { RatingStars } from '../ratings/RatingStars';
import { ErrorState } from '../ui/ErrorState';
import { useFetch } from '../../hooks/useFetch';

// EP 025 - the landlord checks who the student is before confirming
export function StudentProfileCard({ studentId }: { studentId: number }) {
  const { data: student, loading, error, reload } = useFetch(
    (signal) => getStudentProfile(studentId, signal),
    [studentId],
  );

  if (loading) return <div className="h-40 animate-pulse rounded-2xl bg-gray-200" aria-busy="true" />;
  if (error || !student) return <ErrorState message={error ?? 'No se pudo cargar el estudiante'} onRetry={reload} />;

  const average = student.puntuacionPromedio;

  return (
    <article className="space-y-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Estudiante</h2>

      <div className="flex items-center gap-3">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700">
          <UserRound className="h-6 w-6" aria-hidden />
        </span>
        <div>
          <p className="flex items-center gap-1.5 font-semibold text-gray-900">
            {student.nombre}
            {student.verificado && <BadgeCheck className="h-4 w-4 text-green-600" aria-label="Verificado" />}
          </p>
          <p className="flex items-center gap-1 text-sm text-gray-600">
            <GraduationCap className="h-4 w-4" aria-hidden /> {student.universidadNombre}
          </p>
        </div>
      </div>

      <div className="rounded-xl bg-gray-50 p-3 text-sm">
        <p className="text-gray-500">Calificaciones que ha dado</p>
        {average != null ? (
          <div className="mt-1 flex items-center gap-2">
            <RatingStars value={Math.round(average)} />
            <span className="font-semibold text-gray-900">{average.toFixed(1)}</span>
            <span className="text-gray-500">({student.totalCalificaciones})</span>
          </div>
        ) : (
          <p className="mt-1 font-medium text-gray-700">Aún no ha calificado habitaciones</p>
        )}
      </div>
    </article>
  );
}