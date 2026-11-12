import { Link, useNavigate, useParams } from 'react-router-dom';
import { SearchX } from 'lucide-react';
import { getRoomById, updateRoom } from '../../api/rooms';
import { AuthCard } from '../../components/auth/AuthCard';
import { RoomForm } from '../../components/landlord/RoomForm';
import { Breadcrumbs } from '../../components/ui/Breadcrumbs';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorState } from '../../components/ui/ErrorState';
import { PageLoader } from '../../components/ui/PageLoader';
import { useFetch } from '../../hooks/useFetch';
import { useToast } from '../../hooks/useToast';
import { buildRoomImagesPath, PATHS } from '../../routes/paths';
import type { RoomRequest } from '../../types/room';

// EP 019 - PUT /habitaciones/{id} (form preloaded with the current data from EP 009)
export default function EditRoomPage() {
  const { id } = useParams();
  const roomId = Number(id);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const { data: room, loading, error, errorStatus, reload } = useFetch(
    (signal) => getRoomById(roomId, signal),
    [roomId],
  );

  async function handleUpdate(body: RoomRequest) {
    await updateRoom(roomId, body); // errors are shown by RoomForm
    showToast('Habitación actualizada');
    navigate(PATHS.landlordDashboard);
  }

  if (loading) return <PageLoader />;

  if (errorStatus === 404 || errorStatus === 400 || !Number.isInteger(roomId)) {
    return (
      <section className="py-12">
        <EmptyState
          icon={<SearchX className="h-12 w-12" aria-hidden />}
          title="Esta habitación no existe"
          description="Puede que la hayas eliminado o que el enlace sea incorrecto."
          action={
            <Link
              to={PATHS.landlordDashboard}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Volver a mi panel
            </Link>
          }
        />
      </section>
    );
  }

  if (error || !room) {
    return (
      <section className="py-12">
        <ErrorState message={error ?? 'No se pudo cargar la habitación'} onRetry={reload} />
      </section>
    );
  }

  return (
    <div className="pt-6">
      <Breadcrumbs
        items={[
          { label: 'Mi panel', to: PATHS.landlordDashboard },
          { label: room.direccion },
          { label: 'Editar' },
        ]}
      />
      <AuthCard title="Editar habitación" subtitle="Si cambias la dirección, volvemos a ubicarla en el mapa">
        <RoomForm
          initialValues={{
            address: room.direccion,
            price: String(room.precio),
            area: String(room.area),
            latitud: room.latitud,
            longitud: room.longitud,
          }}
          submitLabel="Guardar cambios"
          submittingLabel="Guardando..."
          onSubmit={handleUpdate}
          onCancel={() => navigate(PATHS.landlordDashboard)}
        />
        <p className="text-center text-sm text-gray-600">
          ¿Quieres cambiar las fotos?{' '}
          <Link to={buildRoomImagesPath(room.id)} className="font-semibold text-blue-600 hover:underline">
            Administrar fotos
          </Link>
        </p>
      </AuthCard>
    </div>
  );
}
