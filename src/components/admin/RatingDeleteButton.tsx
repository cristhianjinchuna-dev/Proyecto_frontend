import { useCallback, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { getErrorMessage } from '../../api/errors';
import { deleteRating } from '../../api/ratings';
import { useToast } from '../../hooks/useToast';
import type { Rating } from '../../types/rating';
import { ModerationDialog } from './ModerationDialog';

// ADMIN: removes an inappropriate review; the author gets an email with the reason
export function RatingDeleteButton({ rating, onDeleted }: { rating: Rating; onDeleted: () => void }) {
  const { showToast } = useToast();
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const close = useCallback(() => setOpen(false), []);

  async function handleDelete(reason: string) {
    setDeleting(true);
    try {
      await deleteRating(rating.id, reason);
      showToast('Reseña eliminada. Se avisó al autor por correo.', 'info');
      setOpen(false);
      onDeleted();
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`Eliminar la reseña de ${rating.autorNombre}`}
        className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-2.5 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-100"
      >
        <Trash2 className="h-3.5 w-3.5" aria-hidden /> Eliminar
      </button>
      <ModerationDialog
        open={open}
        title="¿Eliminar esta reseña?"
        message={`Se borrará la reseña de ${rating.autorNombre} y se recalculará el puntaje del arrendador. No se puede deshacer.`}
        confirmLabel="Eliminar reseña"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={close}
      />
    </>
  );
}
