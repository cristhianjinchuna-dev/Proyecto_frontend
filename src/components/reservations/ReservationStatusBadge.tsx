import { CheckCircle2, Clock, XCircle } from 'lucide-react';
import type { ReservationStatus } from '../../types/reservation';

const STATUS_CONFIG: Record<ReservationStatus, { label: string; className: string; Icon: typeof Clock }> = {
  PENDIENTE: { label: 'Pendiente', className: 'bg-amber-100 text-amber-800', Icon: Clock },
  CONFIRMADO: { label: 'Confirmada', className: 'bg-green-100 text-green-800', Icon: CheckCircle2 },
  CANCELADO: { label: 'Cancelada', className: 'bg-gray-200 text-gray-700', Icon: XCircle },
};

export function ReservationStatusBadge({ status }: { status: ReservationStatus }) {
  const { label, className, Icon } = STATUS_CONFIG[status];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${className}`}>
      <Icon className="h-3.5 w-3.5" aria-hidden /> {label}
    </span>
  );
}