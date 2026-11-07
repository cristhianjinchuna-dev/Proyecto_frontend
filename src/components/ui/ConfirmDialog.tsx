import { useEffect } from 'react';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Button } from './Button';

type ConfirmVariant = 'danger' | 'primary';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  variant?: ConfirmVariant;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const ICONS: Record<ConfirmVariant, { className: string; Icon: typeof AlertTriangle }> = {
  danger: { className: 'bg-red-100 text-red-600', Icon: AlertTriangle },
  primary: { className: 'bg-blue-100 text-blue-600', Icon: CheckCircle2 },
};

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Eliminar',
  variant = 'danger',
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  // Close with Escape
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !loading) onCancel();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, loading, onCancel]);

  if (!open) return null;

  const { className, Icon } = ICONS[variant];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={() => !loading && onCancel()}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-message"
        className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start gap-3">
          <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${className}`}>
            <Icon className="h-5 w-5" aria-hidden />
          </span>
          <div>
            <h2 id="confirm-title" className="text-lg font-semibold text-gray-900">
              {title}
            </h2>
            <p id="confirm-message" className="mt-1 text-sm text-gray-600">
              {message}
            </p>
          </div>
        </div>
        <div className="mt-6 flex gap-3">
          <Button variant="secondary" onClick={onCancel} disabled={loading}>
            Volver
          </Button>
          <Button variant={variant} onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}