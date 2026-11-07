import { useNavigate } from 'react-router-dom';
import { createRoom } from '../../api/rooms';
import { AuthCard } from '../../components/auth/AuthCard';
import { EMPTY_ROOM_FORM, RoomForm } from '../../components/landlord/RoomForm';
import { Breadcrumbs } from '../../components/ui/Breadcrumbs';
import { useToast } from '../../hooks/useToast';
import { buildRoomImagesPath, PATHS } from '../../routes/paths';
import type { RoomRequest } from '../../types/room';

// EP 016 - POST /habitaciones
export default function CreateRoomPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  async function handleCreate(body: RoomRequest) {
    const room = await createRoom(body); // errors are shown by RoomForm
    showToast('Habitación publicada. Ahora agrega sus fotos.');
    navigate(buildRoomImagesPath(room.id)); // next step of the mockup: add images
  }

  return (
    <div className="pt-6">
      <Breadcrumbs
        items={[
          { label: 'Mi panel', to: PATHS.landlordDashboard },
          { label: 'Publicar habitación' },
        ]}
      />
      <AuthCard title="Publicar habitación" subtitle="Paso 1 de 2 · Datos de la habitación">
        <RoomForm
          initialValues={EMPTY_ROOM_FORM}
          submitLabel="Continuar"
          submittingLabel="Publicando..."
          onSubmit={handleCreate}
          onCancel={() => navigate(PATHS.landlordDashboard)}
        />
      </AuthCard>
    </div>
  );
}