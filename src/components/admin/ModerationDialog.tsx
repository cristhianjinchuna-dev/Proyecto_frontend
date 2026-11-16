import { useEffect, useState } from 'react';
import { ShieldAlert, ShieldCheck } from 'lucide-react';
import { Button } from '../ui/Button';
import { TextAreaField } from '../ui/TextAreaField';

const REASON_MAX = 300;

interface ModerationDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  variant?: 'danger' | 'primary'; // danger = sanction, primary = undo it
  askReason?: boolean; // the reason goes in the email the user receives
  loading?: boolean;
  onConfirm: (reason: string) => void;
  onCancel: () => void;
}

// Like ConfirmDialog, plus an optional "reason" that is emailed to the affected user
export function ModerationDialog(props: ModerationDialogProps) {
  // Mounted only while open, so the reason starts empty every time
  return props.open ? <ModerationDialogContent {...props} /> : null;
}

function ModerationDialogContent({
  title,
  message,
  confirmLabel,
  variant = 'danger',
  askReason = true,
  loading = false,
  onConfirm,
  onCancel,
}: ModerationDialogProps) {
  const [reason, setReason] = useState('');

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !loading) onCancel();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [loading, onCancel]);

  const Icon = variant === 'danger' ? ShieldAlert : ShieldCheck;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => !loading && onCancel()}>
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="moderation-title"
        className="w-full max-w-md space-y-4 rounded-2xl bg-white p-6 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start gap-3">
          <span
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
              variant === 'danger' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
            }`}
          >
            <Icon className="h-5 w-5" aria-hidden />
          </span>
          <div>
            <h2 id="moderation-title" className="text-lg font-semibold text-gray-900">
              {title}
            </h2>
            <p className="mt-1 text-sm text-gray-600">{message}</p>
          </div>
        </div>

        {askReason && (
          <TextAreaField
            label="Motivo (opcional)"
            name="moderationReason"
            rows={3}
            maxLength={REASON_MAX}
            placeholder="Ej. Publicó fotos que no corresponden a la habitación"
            hint="Se incluye en el correo que recibe el usuario"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        )}

        <div className="flex gap-3">
          <Button variant="secondary" onClick={onCancel} disabled={loading}>
            Volver
          </Button>
          <Button variant={variant} onClick={() => onConfirm(reason.trim())} loading={loading}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
