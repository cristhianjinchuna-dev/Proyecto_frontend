import { useEffect, useState } from 'react';
import { ImageOff, X } from 'lucide-react';
import { Button } from '../ui/Button';
import type { LandlordAdmin } from '../../types/landlord';

interface DniPhotoDialogProps {
  landlord: LandlordAdmin;
  verifying: boolean;
  onVerify: () => void;
  onClose: () => void;
}

// The admin looks at the DNI photo before verifying the landlord (EP 036)
export function DniPhotoDialog({ landlord, verifying, onVerify, onClose }: DniPhotoDialogProps) {
  const [failed, setFailed] = useState(false);

  // Close with Escape
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !verifying) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [verifying, onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => !verifying && onClose()}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="dni-title"
        className="w-full max-w-lg space-y-4 rounded-2xl bg-white p-6 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 id="dni-title" className="text-lg font-semibold text-gray-900">
              DNI de {landlord.nombre}
            </h2>
            <p className="text-sm text-gray-500">{landlord.correo}</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Cerrar" className="rounded-lg p-1 text-gray-500 hover:bg-gray-100">
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>

        {landlord.dniFoto && !failed ? (
          <a href={landlord.dniFoto} target="_blank" rel="noopener noreferrer" title="Abrir en tamaño completo">
            <img
              src={landlord.dniFoto}
              alt={`DNI de ${landlord.nombre}`}
              onError={() => setFailed(true)}
              className="max-h-80 w-full rounded-lg bg-gray-100 object-contain"
            />
          </a>
        ) : (
          <div className="flex flex-col items-center gap-2 rounded-lg bg-gray-100 px-4 py-10 text-center text-sm text-gray-500">
            <ImageOff className="h-8 w-8" aria-hidden />
            {landlord.dniFoto ? 'No se pudo cargar la imagen del DNI.' : 'Este arrendador todavía no subió su DNI.'}
          </div>
        )}

        <div className="flex gap-3">
          <Button type="button" variant="secondary" onClick={onClose} disabled={verifying}>
            Cerrar
          </Button>
          {!landlord.verificado && (
            <Button type="button" onClick={onVerify} loading={verifying} disabled={!landlord.dniFoto}>
              Verificar arrendador
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
