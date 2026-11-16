import { useCallback, useState } from 'react';
import { Eye, EyeOff, ShieldAlert } from 'lucide-react';
import { getErrorMessage } from '../../api/errors';
import { setRoomVisibility } from '../../api/moderation';
import { useToast } from '../../hooks/useToast';
import type { RoomDetail } from '../../types/room';
import { Button } from '../ui/Button';
import { ModerationDialog } from './ModerationDialog';

// ADMIN in the room detail: hide an inappropriate listing (or publish it again)
export function RoomModerationCard({ room, onChanged }: { room: RoomDetail; onChanged: () => void }) {
  const { showToast } = useToast();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  const hidden = Boolean(room.oculta);

  async function handleConfirm(reason: string) {
    setSaving(true);
    try {
      await setRoomVisibility(room.id, !hidden, reason);
      showToast(hidden ? 'La habitación vuelve a estar publicada.' : 'Habitación ocultada. Se avisó al arrendador.', 'info');
      setOpen(false);
      onChanged();
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-3 rounded-xl border border-red-200 p-4">
      <p className="flex items-center gap-2 text-sm font-semibold text-red-700">
        <ShieldAlert className="h-4 w-4" aria-hidden /> Moderación
      </p>
      <p className="text-sm text-gray-600">
        {hidden
          ? 'Está oculta: no aparece en las búsquedas y no se puede reservar.'
          : 'Si la publicación es inapropiada o engañosa, ocúltala. El arrendador recibe un correo.'}
      </p>
      <Button variant={hidden ? 'secondary' : 'danger'} onClick={() => setOpen(true)}>
        {hidden ? <Eye className="h-4 w-4" aria-hidden /> : <EyeOff className="h-4 w-4" aria-hidden />}
        {hidden ? 'Volver a publicar' : 'Ocultar habitación'}
      </Button>

      <ModerationDialog
        open={open}
        title={hidden ? '¿Volver a publicar esta habitación?' : '¿Ocultar esta habitación?'}
        message={
          hidden
            ? 'Volverá a aparecer en las búsquedas y se podrá reservar.'
            : 'Dejará de aparecer en las búsquedas y nadie podrá reservarla. Las reservas que ya existen se mantienen.'
        }
        confirmLabel={hidden ? 'Publicar' : 'Ocultar'}
        variant={hidden ? 'primary' : 'danger'}
        loading={saving}
        onConfirm={handleConfirm}
        onCancel={close}
      />
    </div>
  );
}
