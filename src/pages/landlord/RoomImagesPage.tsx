import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import { ImageOff, Trash2, X } from 'lucide-react';
import { isUploadConfigured, uploadImage, validateImageFile } from '../../api/cloudinary';
import { addRoomImage, deleteImage } from '../../api/images';
import { getRoomById } from '../../api/rooms';
import { getErrorMessage, getErrorStatus } from '../../api/errors';
import { Alert } from '../../components/ui/Alert';
import { Breadcrumbs } from '../../components/ui/Breadcrumbs';
import { Button } from '../../components/ui/Button';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { ErrorState } from '../../components/ui/ErrorState';
import { ImageDropzone } from '../../components/ui/ImageDropzone';
import { PageLoader } from '../../components/ui/PageLoader';
import { useFetch } from '../../hooks/useFetch';
import { useToast } from '../../hooks/useToast';
import { buildRoomPath, PATHS } from '../../routes/paths';
import type { RoomImage } from '../../types/room';

const MAX_FILES_PER_UPLOAD = 6;

interface PendingPhoto {
  id: number;
  file: File;
  preview: string; // local object URL, only for the thumbnail
}

let nextPendingId = 1;

export default function RoomImagesPage() {
  const { id } = useParams();
  const roomId = Number(id);
  const { showToast } = useToast();

  const { data: room, loading, error, errorStatus, reload } = useFetch(
    (signal) => getRoomById(roomId, signal),
    [roomId],
  );

  // Photos chosen but not uploaded yet
  const [pending, setPending] = useState<PendingPhoto[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<{ current: number; total: number; percent: number } | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const [imageToDelete, setImageToDelete] = useState<RoomImage | null>(null);
  const [deleting, setDeleting] = useState(false);
  const closeDialog = useCallback(() => setImageToDelete(null), []);

  // Free the local previews when leaving the page
  const pendingRef = useRef(pending);
  useEffect(() => {
    pendingRef.current = pending;
  }, [pending]);
  useEffect(() => () => pendingRef.current.forEach((photo) => URL.revokeObjectURL(photo.preview)), []);

  function handleFiles(files: File[]) {
    setFormError(null);
    const errors: string[] = [];
    const valid: PendingPhoto[] = [];

    for (const file of files) {
      const fileError = validateImageFile(file);
      if (fileError) errors.push(fileError);
      else valid.push({ id: nextPendingId++, file, preview: URL.createObjectURL(file) });
    }

    const freeSlots = MAX_FILES_PER_UPLOAD - pending.length;
    if (valid.length > freeSlots) {
      errors.push(`Puedes subir hasta ${MAX_FILES_PER_UPLOAD} fotos a la vez`);
      valid.splice(freeSlots).forEach((photo) => URL.revokeObjectURL(photo.preview));
    }

    setPending((prev) => [...prev, ...valid]);
    if (errors.length > 0) setFormError(errors.join('. '));
  }

  function removePending(photoId: number) {
    setPending((prev) => {
      const photo = prev.find((item) => item.id === photoId);
      if (photo) URL.revokeObjectURL(photo.preview);
      return prev.filter((item) => item.id !== photoId);
    });
  }

  // Cloudinary (photo -> URL) and then EP 017 (save the URL), one photo after another
  async function handleUpload() {
    setFormError(null);
    setUploading(true);
    let uploaded = 0;

    try {
      for (const [index, photo] of pending.entries()) {
        setProgress({ current: index + 1, total: pending.length, percent: 0 });
        const url = await uploadImage(photo.file, 'rooms', (percent) =>
          setProgress({ current: index + 1, total: pending.length, percent }),
        );
        await addRoomImage(roomId, { url });
        removePending(photo.id);
        uploaded++;
      }
      showToast(uploaded === 1 ? 'Foto agregada' : `${uploaded} fotos agregadas`);
    } catch (err) {
      if (getErrorStatus(err) === 403) setFormError('Solo el dueño puede agregar fotos a esta habitación.');
      else if (axios.isAxiosError(err)) setFormError(getErrorMessage(err)); // our backend
      else setFormError(err instanceof Error ? err.message : 'No se pudo subir la foto'); // Cloudinary
    } finally {
      setUploading(false);
      setProgress(null);
      if (uploaded > 0) reload();
    }
  }

  // EP 018
  async function handleConfirmDelete() {
    if (!imageToDelete) return;
    setDeleting(true);
    try {
      await deleteImage(imageToDelete.id);
      showToast('Imagen eliminada');
      setImageToDelete(null);
      reload();
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    } finally {
      setDeleting(false);
    }
  }

  if (loading && !room) return <PageLoader />;
  if (errorStatus === 404 || !Number.isInteger(roomId)) {
    return (
      <section className="py-12">
        <ErrorState message="Esta habitación no existe." />
      </section>
    );
  }
  if (error || !room) {
    return (
      <section className="py-12">
        <ErrorState message={error ?? 'No se pudo cargar la habitación'} onRetry={reload} />
      </section>
    );
  }

  return (
    <section className="space-y-8 py-8">
      <Breadcrumbs
        items={[
          { label: 'Mi panel', to: PATHS.landlordDashboard },
          { label: room.direccion, to: buildRoomPath(room.id) },
          { label: 'Fotos' },
        ]}
      />

      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-blue-600">Paso 2 de 2 · Fotos</p>
          <h1 className="text-2xl font-bold text-gray-900">Fotos de la habitación</h1>
          <p className="mt-1 text-gray-600">{room.direccion}</p>
        </div>
        <Link
          to={buildRoomPath(room.id)}
          className="rounded-lg bg-blue-600 px-4 py-2 text-center text-sm font-semibold text-white hover:bg-blue-700"
        >
          Finalizar y ver publicación
        </Link>
      </header>

      <div className="grid gap-8 lg:grid-cols-[2fr_3fr]">
        {/* Add photos (Cloudinary + EP 017) */}
        <div className="h-fit space-y-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Agregar fotos</h2>

          {!isUploadConfigured() && (
            <Alert variant="error">
              Falta configurar Cloudinary (VITE_CLOUDINARY_CLOUD_NAME y VITE_CLOUDINARY_UPLOAD_PRESET).
            </Alert>
          )}
          {formError && <Alert variant="error">{formError}</Alert>}

          <ImageDropzone
            multiple
            onFiles={handleFiles}
            disabled={uploading || pending.length >= MAX_FILES_PER_UPLOAD || !isUploadConfigured()}
          />

          {pending.length > 0 && (
            <>
              <ul className="grid grid-cols-3 gap-2">
                {pending.map((photo) => (
                  <li key={photo.id} className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
                    <img src={photo.preview} alt={photo.file.name} className="h-full w-full object-cover" />
                    {!uploading && (
                      <button
                        type="button"
                        onClick={() => removePending(photo.id)}
                        aria-label={`Quitar ${photo.file.name}`}
                        className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white hover:bg-black/80"
                      >
                        <X className="h-3.5 w-3.5" aria-hidden />
                      </button>
                    )}
                  </li>
                ))}
              </ul>

              {progress && (
                <div className="space-y-1" aria-live="polite">
                  <p className="text-sm text-gray-600">
                    Subiendo foto {progress.current} de {progress.total}... {progress.percent}%
                  </p>
                  <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                    <div className="h-full bg-blue-600 transition-all" style={{ width: `${progress.percent}%` }} />
                  </div>
                </div>
              )}

              <Button type="button" onClick={handleUpload} loading={uploading}>
                {uploading
                  ? 'Subiendo...'
                  : pending.length === 1
                    ? 'Subir 1 foto'
                    : `Subir ${pending.length} fotos`}
              </Button>
            </>
          )}
        </div>

        {/* Current images (EP 018 to delete) */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Imágenes actuales <span className="font-normal text-gray-500">({room.imagenes.length})</span>
          </h2>

          {room.imagenes.length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-12 text-center text-gray-500">
              <ImageOff className="h-10 w-10" aria-hidden />
              <p>Todavía no hay fotos. Las habitaciones con fotos reciben más reservas.</p>
            </div>
          ) : (
            <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {room.imagenes.map((image, index) => (
                <li key={image.id} className="group relative aspect-square overflow-hidden rounded-xl bg-gray-100">
                  <img src={image.url} alt={`Foto ${index + 1}`} className="h-full w-full object-cover" />
                  {index === 0 && (
                    <span className="absolute left-2 top-2 rounded-full bg-blue-600 px-2 py-0.5 text-xs font-semibold text-white">
                      Portada
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => setImageToDelete(image)}
                    aria-label={`Eliminar foto ${index + 1}`}
                    className="absolute right-2 top-2 rounded-full bg-white/90 p-2 text-red-600 shadow transition hover:bg-red-600 hover:text-white"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={imageToDelete !== null}
        title="¿Eliminar esta imagen?"
        message="La imagen se quitará de la publicación. Esta acción no se puede deshacer."
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={closeDialog}
      />
    </section>
  );
}