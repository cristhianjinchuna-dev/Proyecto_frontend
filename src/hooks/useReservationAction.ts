import { useCallback, useState } from 'react';
import { cancelReservation, confirmReservation } from '../api/reservations';
import { getErrorMessage } from '../api/errors';
import type { Reservation } from '../types/reservation';
import { useToast } from './useToast';

export type ReservationAction = 'cancel' | 'confirm';

const ACTION_TEXT = {
  cancel: {
    title: '¿Cancelar esta reserva?',
    message: 'Le avisaremos al arrendador por correo. Esta acción no se puede deshacer.',
    confirmLabel: 'Sí, cancelar',
    variant: 'danger',
    success: 'Reserva cancelada',
  },
  confirm: {
    title: '¿Confirmar esta reserva?',
    message: 'Le avisaremos al estudiante por correo y esas fechas quedarán ocupadas.',
    confirmLabel: 'Confirmar',
    variant: 'primary',
    success: 'Reserva confirmada',
  },
} as const;

// EP 024 (cancel) and EP 026 (confirm): asks first with ConfirmDialog, calls the API,
// shows a toast and tells the page to reload. Returns the props for <ConfirmDialog />.
export function useReservationAction(onDone: (updated: Reservation) => void) {
  const { showToast } = useToast();
  const [pending, setPending] = useState<{ reservation: Reservation; action: ReservationAction } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const request = useCallback(
    (reservation: Reservation, action: ReservationAction) => setPending({ reservation, action }),
    [],
  );
  const close = useCallback(() => setPending(null), []);

  async function run() {
    if (!pending) return;
    setSubmitting(true);
    try {
      const updated =
        pending.action === 'cancel'
          ? await cancelReservation(pending.reservation.id)
          : await confirmReservation(pending.reservation.id);
      showToast(ACTION_TEXT[pending.action].success);
      setPending(null);
      onDone(updated);
    } catch (err) {
      // 409: "ya estaba cancelada o confirmada" -> the backend message explains it
      showToast(getErrorMessage(err), 'error');
      setPending(null);
      onDone(pending.reservation); // reload anyway: the status may have changed
    } finally {
      setSubmitting(false);
    }
  }

  const text = ACTION_TEXT[pending?.action ?? 'cancel'];

  return {
    request,
    dialogProps: {
      open: pending !== null,
      title: text.title,
      message: text.message,
      confirmLabel: text.confirmLabel,
      variant: text.variant,
      loading: submitting,
      onConfirm: run,
      onCancel: close,
    },
  };
}