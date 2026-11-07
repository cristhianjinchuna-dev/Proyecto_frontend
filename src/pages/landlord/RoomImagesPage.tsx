import { useCallback, useState, type FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ImageOff, Trash2 } from 'lucide-react';
import { addRoomImage, deleteImage } from '../../api/images';
import { getRoomById } from '../../api/rooms';
import { getErrorMessage, getErrorStatus, mapFieldErrors } from '../../api/errors';
import { Alert } from '../../components/ui/Alert';
import { Breadcrumbs } from '../../components/ui/Breadcrumbs';
import { Button } from '../../components/ui/Button';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { ErrorState } from '../../components/ui/ErrorState';
import { PageLoader } from '../../components/ui/PageLoader';
import { TextField } from '../../components/ui/TextField';
import { useFetch } from '../../hooks/useFetch';
import { useForm, type FormErrors } from '../../hooks/useForm';
import { useToast } from '../../hooks/useToast';
import { buildRoomPath, PATHS } from '../../routes/paths';
import type { RoomImage } from '../../types/room';
import { validateUrl } from '../../utils/validators';

interface ImageFormValues {
  url: string;
}

const INITIAL_VALUES: ImageFormValues = { url: '' };

function validateImageForm(values: ImageFormValues): FormErrors<ImageFormValues> {
  return { url: validateUrl(values.url) };
}

export default function RoomImagesPage() {
  const { id } = useParams();
  const roomId = Number(id);
  const { showToast } = useToast();

  const { data: room, loading, error, errorStatus, reload } = useFetch(
    (signal) => getRoomById(roomId, signal),
    [roomId],
  );

  const { values, setValue, getError, validateAll, setServerErrors, reset } = useForm(
    INITIAL_VALUES,
    validateImageForm,
  );
  const [adding, setAdding] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [previewFailed, setPreviewFailed] = useState(false);

  const [imageToDelete, setImageToDelete] = useState<RoomImage | null>(null);
  const [deleting, setDeleting] = useState(false);

  const closeDialog = useCallback(() => setImageToDelete(null), []);

  // EP 017
  async function handleAdd(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    if (!validateAll()) return;

    setAdding(true);
    try {
      await addRoomImage(roomId, { url: values.url.trim() });
      showToast('Imagen agregada');
      reset();
      setPreviewFailed(false);
      reload();
    } catch (err) {
      setServerErrors(mapFieldErrors(err, { url: 'url' }));
      setFormError(
        getErrorStatus(err) === 403 ? 'Solo el dueño puede agregar fotos a esta habitación.' : getErrorMessage(err),
      );
    } finally {
      setAdding(false);
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

  const previewUrl = values.url.trim();
  const showPreview = previewUrl !== '' && !validateUrl(previewUrl);

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
        {/* Add image (EP 017) */}
        <div className="h-fit space-y-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Agregar imagen</h2>
          {formError && <Alert variant="error">{formError}</Alert>}

          <form onSubmit={handleAdd} noValidate className="space-y-4">
            <TextField
              label="URL de la imagen"
              name="url"
              type="url"
              placeholder="https://..."
              hint="Pega el enlace de una imagen ya publicada en internet"
              value={values.url}
              onChange={(e) => {
                setValue('url', e.target.value);
                setPreviewFailed(false);
              }}
              error={getError('url')}
            />

            {showPreview && (
              <div className="aspect-[4/3] overflow-hidden rounded-lg bg-gray-100">
                {previewFailed ? (
                  <div className="flex h-full flex-col items-center justify-center gap-2 text-sm text-gray-500">
                    <ImageOff className="h-8 w-8" aria-hidden />
                    No se pudo cargar la vista previa
                  </div>
                ) : (
                  <img
                    src={previewUrl}
                    alt="Vista previa de la imagen"
                    onError={() => setPreviewFailed(true)}
                    className="h-full w-full object-cover"
                  />
                )}
              </div>
            )}

            <Button type="submit" loading={adding}>
              {adding ? 'Agregando...' : 'Agregar imagen'}
            </Button>
          </form>
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