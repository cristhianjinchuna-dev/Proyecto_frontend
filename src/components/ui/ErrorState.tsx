import { AlertTriangle, RotateCw } from 'lucide-react';

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-6 py-10 text-center"
    >
      <AlertTriangle className="h-10 w-10 text-red-500" aria-hidden />
      <p className="font-medium text-red-700">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-red-700 ring-1 ring-red-200 transition hover:bg-red-100"
        >
          <RotateCw className="h-4 w-4" aria-hidden />
          Reintentar
        </button>
      )}
    </div>
  );
}