import { Ban, CheckCircle2 } from 'lucide-react';

// "Activa" / "Suspendida" badge for the admin tables
export function AccountStatus({ suspended }: { suspended?: boolean | null }) {
  return suspended ? (
    <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">
      <Ban className="h-3 w-3" aria-hidden /> Suspendida
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 text-sm font-medium text-green-700">
      <CheckCircle2 className="h-4 w-4" aria-hidden /> Activa
    </span>
  );
}
