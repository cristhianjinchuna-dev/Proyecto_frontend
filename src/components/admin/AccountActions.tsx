import { useCallback, useState } from 'react';
import { Ban, RotateCcw, Trash2 } from 'lucide-react';
import { getErrorMessage, getErrorStatus } from '../../api/errors';
import { deleteLandlord } from '../../api/landlords';
import { setUserSuspension } from '../../api/moderation';
import { deleteStudent } from '../../api/students';
import { useToast } from '../../hooks/useToast';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { ModerationDialog } from './ModerationDialog';

type AccountKind = 'student' | 'landlord';

interface AccountActionsProps {
  account: { id: number; nombre: string; suspendido?: boolean | null };
  kind: AccountKind;
  onChanged: () => void; // reload the table
}

const ICON_BUTTON =
  'inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50';

// Moderation of one account: suspend / reactivate (reversible) or delete (only without history)
export function AccountActions({ account, kind, onChanged }: AccountActionsProps) {
  const { showToast } = useToast();
  const [dialog, setDialog] = useState<'suspend' | 'delete' | null>(null);
  const [working, setWorking] = useState(false);
  const close = useCallback(() => setDialog(null), []);
  const suspended = Boolean(account.suspendido);
  const consequence =
    kind === 'landlord'
      ? 'No podrá iniciar sesión y sus habitaciones dejarán de aparecer en las búsquedas.'
      : 'No podrá iniciar sesión ni hacer reservas.';

  async function handleSuspension(reason: string) {
    setWorking(true);
    try {
      await setUserSuspension(account.id, !suspended, reason);
      showToast(
        suspended ? `${account.nombre} fue reactivado.` : `${account.nombre} fue suspendido. Se le envió un correo.`,
        suspended ? 'success' : 'info',
      );
      setDialog(null);
      onChanged();
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    } finally {
      setWorking(false);
    }
  }

  async function handleDelete() {
    setWorking(true);
    try {
      await (kind === 'landlord' ? deleteLandlord(account.id) : deleteStudent(account.id));
      showToast(`La cuenta de ${account.nombre} fue eliminada.`, 'info');
      setDialog(null);
      onChanged();
    } catch (err) {
      setDialog(null);
      showToast(
        getErrorStatus(err) === 409
          ? `No se puede eliminar a ${account.nombre} porque tiene reservas, calificaciones o pagos. Suspende la cuenta en su lugar.`
          : getErrorMessage(err),
        'error',
      );
    } finally {
      setWorking(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setDialog('suspend')}
        className={`${ICON_BUTTON} ${
          suspended ? 'border-blue-200 text-blue-700 hover:bg-blue-50' : 'border-amber-300 text-amber-700 enabled:hover:bg-amber-50'
        }`}
      >
        {suspended ? <RotateCcw className="h-3.5 w-3.5" aria-hidden /> : <Ban className="h-3.5 w-3.5" aria-hidden />}
        {suspended ? 'Reactivar' : 'Suspender'}
      </button>
      <button
        type="button"
        onClick={() => setDialog('delete')}
        aria-label={`Eliminar la cuenta de ${account.nombre}`}
        className={`${ICON_BUTTON} border-red-200 text-red-700 hover:bg-red-100`}
      >
        <Trash2 className="h-3.5 w-3.5" aria-hidden /> Eliminar
      </button>

      <ModerationDialog
        open={dialog === 'suspend'}
        title={suspended ? `¿Reactivar a ${account.nombre}?` : `¿Suspender a ${account.nombre}?`}
        message={suspended ? 'Podrá volver a iniciar sesión y usar MuvU con normalidad.' : consequence + ' Puedes reactivarlo cuando quieras.'}
        confirmLabel={suspended ? 'Reactivar' : 'Suspender'}
        variant={suspended ? 'primary' : 'danger'}
        loading={working}
        onConfirm={handleSuspension}
        onCancel={close}
      />
      <ConfirmDialog
        open={dialog === 'delete'}
        title={`¿Eliminar la cuenta de ${account.nombre}?`}
        message="Es permanente. Solo se puede si no tiene reservas, calificaciones ni pagos; si los tiene, suspéndela."
        confirmLabel="Sí, eliminar"
        loading={working}
        onConfirm={handleDelete}
        onCancel={close}
      />
    </>
  );
}
