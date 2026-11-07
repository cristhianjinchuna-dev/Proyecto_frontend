import { useState } from 'react';
import { BadgeCheck, Building2, Clock } from 'lucide-react';
import { getErrorMessage } from '../../api/errors';
import { getLandlords, verifyLandlord } from '../../api/landlords';
import { Button } from '../ui/Button';
import { EmptyState } from '../ui/EmptyState';
import { ErrorState } from '../ui/ErrorState';
import { PageLoader } from '../ui/PageLoader';
import { Pagination } from '../ui/Pagination';
import { useFetch } from '../../hooks/useFetch';
import { usePagination } from '../../hooks/usePagination';
import { useToast } from '../../hooks/useToast';
import type { Landlord } from '../../types/landlord';

// EP 036 - the admin verifies landlords (the list comes from GET /arrendadores)
export function LandlordsTable() {
  const { page, size, setPage, setSize } = usePagination({ pageParam: 'landlordsPage', sizeParam: 'landlordsSize' });
  const { data, loading, error, reload } = useFetch(
    (signal) => getLandlords({ page, size }, signal),
    [page, size],
  );
  const { showToast } = useToast();
  const [verifyingId, setVerifyingId] = useState<number | null>(null); // landlord being verified

  async function handleVerify(landlord: Landlord) {
    setVerifyingId(landlord.id);
    try {
      await verifyLandlord(landlord.id);
      showToast(`${landlord.nombre} fue verificado. Se le envió un correo.`);
      reload();
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    } finally {
      setVerifyingId(null);
    }
  }

  if (!data) {
    if (loading) return <PageLoader />;
    return <ErrorState message={error ?? 'No se pudo cargar la lista'} onRetry={reload} />;
  }

  if (data.content.length === 0) {
    return <EmptyState icon={<Building2 className="h-10 w-10" aria-hidden />} title="No hay arrendadores registrados" />;
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-xl bg-white shadow-sm ring-1 ring-gray-200">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-4 py-3 font-medium">Nombre</th>
              <th className="px-4 py-3 font-medium">Correo</th>
              <th className="px-4 py-3 font-medium">Habitaciones</th>
              <th className="px-4 py-3 font-medium">Estado</th>
              <th className="px-4 py-3 font-medium">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.content.map((landlord) => (
              <tr key={landlord.id}>
                <td className="px-4 py-3 font-medium text-gray-900">{landlord.nombre}</td>
                <td className="px-4 py-3 text-gray-700">{landlord.correo}</td>
                <td className="px-4 py-3 text-gray-700">{landlord.cantidadHabitaciones}</td>
                <td className="px-4 py-3">
                  {landlord.verificado ? (
                    <span className="inline-flex items-center gap-1 font-medium text-green-700">
                      <BadgeCheck className="h-4 w-4" aria-hidden /> Verificado
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 font-medium text-amber-700">
                      <Clock className="h-4 w-4" aria-hidden /> Pendiente
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {!landlord.verificado && (
                    <Button
                      className="w-auto px-3 py-1.5 text-sm"
                      loading={verifyingId === landlord.id}
                      disabled={verifyingId !== null}
                      onClick={() => handleVerify(landlord)}
                    >
                      Verificar
                    </Button>
                  )}
                </td>
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
