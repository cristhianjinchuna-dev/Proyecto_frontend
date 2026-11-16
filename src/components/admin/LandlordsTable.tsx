import { useCallback, useState } from 'react';
import { BadgeCheck, Building2, Clock, IdCard } from 'lucide-react';
import { getErrorMessage } from '../../api/errors';
import { getLandlords, verifyLandlord } from '../../api/landlords';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { EmptyState } from '../ui/EmptyState';
import { ErrorState } from '../ui/ErrorState';
import { PageLoader } from '../ui/PageLoader';
import { Pagination } from '../ui/Pagination';
import { useFetch } from '../../hooks/useFetch';
import { usePagination } from '../../hooks/usePagination';
import { useToast } from '../../hooks/useToast';
import type { LandlordAdmin } from '../../types/landlord';
import { AccountActions } from './AccountActions';
import { AccountStatus } from './AccountStatus';
import { DniPhotoDialog } from './DniPhotoDialog';

// EP 036 - the admin verifies landlords (the list comes from GET /arrendadores)
export function LandlordsTable() {
  const { page, size, setPage, setSize } = usePagination({ pageParam: 'landlordsPage', sizeParam: 'landlordsSize' });
  const { data, loading, error, reload } = useFetch(
    (signal) => getLandlords({ page, size }, signal),
    [page, size],
  );
  const { showToast } = useToast();
  const [verifyingId, setVerifyingId] = useState<number | null>(null); // landlord being verified
  const [dniLandlord, setDniLandlord] = useState<LandlordAdmin | null>(null); // DNI dialog open
  const closeDni = useCallback(() => setDniLandlord(null), []);

  async function handleVerify(landlord: LandlordAdmin) {
    setVerifyingId(landlord.id);
    try {
      await verifyLandlord(landlord.id);
      showToast(`${landlord.nombre} fue verificado. Se le envió un correo.`);
      setDniLandlord(null);
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
              <th className="px-4 py-3 font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.content.map((landlord) => (
              <tr key={landlord.id}>
                <td className="px-4 py-3 font-medium text-gray-900">
                  <span className="flex items-center gap-2">
                    <Avatar name={landlord.nombre} src={landlord.fotoPerfil} size="sm" />
                    {landlord.nombre}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-700">{landlord.correo}</td>
                <td className="px-4 py-3 text-gray-700">{landlord.cantidadHabitaciones}</td>
                <td className="space-y-1 px-4 py-3">
                  {landlord.suspendido && <AccountStatus suspended />}
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
                  <div className="flex flex-wrap items-center gap-2">
                  <Button
                    variant={landlord.verificado ? 'secondary' : 'primary'}
                    className="w-auto px-3 py-1.5 text-sm"
                    disabled={verifyingId !== null}
                    onClick={() => setDniLandlord(landlord)}
                  >
                    <IdCard className="h-4 w-4" aria-hidden />
                    {landlord.verificado ? 'Ver DNI' : 'Revisar DNI'}
                  </Button>
                  <AccountActions account={landlord} kind="landlord" onChanged={reload} />
                  </div>
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

      {dniLandlord && (
        <DniPhotoDialog
          landlord={dniLandlord}
          verifying={verifyingId === dniLandlord.id}
          onVerify={() => handleVerify(dniLandlord)}
          onClose={closeDni}
        />
      )}
    </div>
  );
}
