import { useRef, useState } from 'react';
import { Camera, X } from 'lucide-react';
import { isUploadConfigured, uploadImage, validateImageFile } from '../../api/cloudinary';
import { Avatar } from './Avatar';

interface AvatarUploadProps {
  name: string;
  value: string | null; // current photo URL
  onChange: (url: string | null) => void;
  onUploadingChange?: (uploading: boolean) => void;
}

// Profile photo picker: computer -> Cloudinary -> URL (saved with "Guardar cambios")
export function AvatarUpload({ name, value, onChange, onUploadingChange }: AvatarUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setError(null);
    const fileError = validateImageFile(file);
    if (fileError) {
      setError(fileError);
      return;
    }

    setUploading(true);
    onUploadingChange?.(true);
    setProgress(0);
    try {
      onChange(await uploadImage(file, 'avatars', setProgress));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo subir la foto');
    } finally {
      setUploading(false);
      onUploadingChange?.(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative">
        <Avatar name={name} src={value} size="xl" />
        {uploading && (
          <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 text-sm font-semibold text-white">
            {progress}%
          </span>
        )}
        {value && !uploading && (
          <button
            type="button"
            onClick={() => onChange(null)}
            aria-label="Quitar foto de perfil"
            className="absolute -right-1 -top-1 rounded-full bg-gray-900/70 p-1 text-white hover:bg-gray-900"
          >
            <X className="h-3.5 w-3.5" aria-hidden />
          </button>
        )}
      </div>

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading || !isUploadConfigured()}
        className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Camera className="h-4 w-4" aria-hidden />
        {uploading ? 'Subiendo...' : value ? 'Cambiar foto' : 'Agregar foto de perfil'}
      </button>
      {error && <p className="text-center text-sm text-red-600">{error}</p>}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        hidden
        onChange={(event) => {
          void handleFile(event.target.files?.[0]);
          event.target.value = '';
        }}
      />
    </div>
  );
}
