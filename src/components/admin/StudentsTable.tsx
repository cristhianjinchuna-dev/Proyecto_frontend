import { GraduationCap } from 'lucide-react';
import { getStudents } from '../../api/students';
import { EmptyState } from '../ui/EmptyState';
import { ErrorState } from '../ui/ErrorState';
import { PageLoader } from '../ui/PageLoader';
import { Pagination } from '../ui/Pagination';
import { useFetch } from '../../hooks/useFetch';
import { usePagination } from '../../hooks/usePagination';

// EP 037 - GET /estudiantes (paginated list for the admin)
export function StudentsTable() {
  // Own URL params so this tab does not share its page with the landlords tab
  const { page, size, setPage, setSize } = usePagination({ pageParam: 'studentsPage', sizeParam: 'studentsSize' });
  const { data, loading, error, reload } = useFetch(
    (signal) => getStudents({ page, size }, signal),
    [page, size],
  );

  if (!data) {
    if (loading) return <PageLoader />;
    return <ErrorState message={error ?? 'No se pudo cargar la lista'} onRetry={reload} />;
  }

  if (data.content.length === 0) {
    return (
      <EmptyState
        icon={<GraduationCap className="h-10 w-10" aria-hidden />}
        title="No hay estudiantes registrados"
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-xl bg-white shadow-sm ring-1 ring-gray-200">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-4 py-3 font-medium">Nombre</th>
              <th className="px-4 py-3 font-medium">Correo</th>
              <th className="px-4 py-3 font-medium">Universidad</th>
              <th className="px-4 py-3 font-medium">Verificado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.content.map((student) => (
              <tr key={student.id}>
                <td className="px-4 py-3 font-medium text-gray-900">{student.nombre}</td>
                <td className="px-4 py-3 text-gray-700">{student.correo}</td>
                <td className="px-4 py-3 text-gray-700">{student.universidadNombre}</td>
                <td className="px-4 py-3 text-gray-700">{student.verificado ? 'Sí' : 'No'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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
