import { useCallback, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, BadgeCheck, Clock, Trash2, X } from 'lucide-react';
import { isUploadConfigured, uploadImage, validateImageFile } from '../../api/cloudinary';
import { deleteLandlord, getLandlord, updateLandlord } from '../../api/landlords';
import { getErrorMessage, getErrorStatus, mapFieldErrors } from '../../api/errors';
import { AuthCard } from '../../components/auth/AuthCard';
import { Alert } from '../../components/ui/Alert';
import { AvatarUpload } from '../../components/ui/AvatarUpload';
import { Button } from '../../components/ui/Button';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { ErrorState } from '../../components/ui/ErrorState';
import { ImageDropzone } from '../../components/ui/ImageDropzone';
import { PageLoader } from '../../components/ui/PageLoader';
import { TextField } from '../../components/ui/TextField';
import { useAuth } from '../../hooks/useAuth';
import { useCurrentProfile } from '../../hooks/useCurrentProfile';
import { useFetch } from '../../hooks/useFetch';
import { useForm, type FormErrors } from '../../hooks/useForm';
import { useToast } from '../../hooks/useToast';
import { PATHS } from '../../routes/paths';
import type { Landlord } from '../../types/landlord';
import { validateName, validateUrl } from '../../utils/validators';

interface ProfileFormValues {
  name: string;
  dniPhotoUrl: string;
}

const SERVER_FIELDS: Record<string, keyof ProfileFormValues> = {
  nombre: 'name',
  dniFoto: 'dniPhotoUrl',
};

function validateProfileForm(values: ProfileFormValues): FormErrors<ProfileFormValues> {
  return {
    name: validateName(values.name),
    dniPhotoUrl: validateUrl(values.dniPhotoUrl, { required: false }),
  };
}

export default function LandlordProfilePage() {
  const { user } = useAuth();
  const landlordId = user?.id ?? 0;
  const { data, loading, error, reload } = useFetch((signal) => getLandlord(landlordId, signal), [landlordId]);

  if (loading) return <PageLoader />;
  if (error || !data) {
    return (
      <section className="py-12">
        <ErrorState message={error ?? 'No se pudo cargar tu perfil'} onRetry={reload} />
      </section>
    );
  }

  // The form is a separate component so useForm starts with the loaded data
  return <ProfileForm landlord={data} />;
}

function ProfileForm({ landlord }: { landlord: Landlord }) {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { refreshProfile } = useCurrentProfile();
  const { showToast } = useToast();
  const { values, setValue, getError, validateAll, setServerErrors } = useForm(
    { name: landlord.nombre, dniPhotoUrl: '' },
    validateProfileForm,
  );
  const [submitting, setSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);

  const [photo, setPhoto] = useState<string | null>(landlord.fotoPerfil);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingDni, setUploadingDni] = useState(false);
  const [dniProgress, setDniProgress] = useState(0);
  const [dniError, setDniError] = useState<string | null>(null);

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const closeDialog = useCallback(() => setConfirmDelete(false), []);

  // DNI photo: computer -> Cloudinary -> URL in the form (it is saved with "Guardar cambios")
  async function handleDniFile([file]: File[]) {
    setDniError(null);
    const fileError = validateImageFile(file);
    if (fileError) {
      setDniError(fileError);
      return;
    }

    setUploadingDni(true);
    setDniProgress(0);
    try {
      setValue('dniPhotoUrl', await uploadImage(file, 'dni', setDniProgress));
    } catch (err) {
      setDniError(err instanceof Error ? err.message : 'No se pudo subir la foto');
    } finally {
      setUploadingDni(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setGeneralError(null);
    if (!validateAll()) return;

    setSubmitting(true);
    try {
      await updateLandlord(landlord.id, {
        nombre: values.name.trim(),
        dniFoto: values.dniPhotoUrl.trim() || null, // null = keep the current DNI
        fotoPerfil: photo ?? '', // '' = the user removed the photo
      });
      refreshProfile(); // the Navbar shows the new photo and name
      showToast('Perfil actualizado');
      navigate(PATHS.landlordDashboard);
    } catch (err) {
      setServerErrors(mapFieldErrors(err, SERVER_FIELDS));
      setGeneralError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  // EP 040 - if it works, the account no longer exists: log out
  async function handleDeleteAccount() {
    setDeleting(true);
    try {
      await deleteLandlord(landlord.id);
      signOut();
      showToast('Tu cuenta fue eliminada', 'info');
      navigate(PATHS.home, { replace: true });
    } catch (err) {
      setConfirmDelete(false);
      setDeleting(false);
      showToast(
        getErrorStatus(err) === 409
          ? 'No puedes eliminar tu cuenta porque tus habitaciones tienen reservas o calificaciones.'
          : getErrorMessage(err),
        'error',
      );
    }
  }

  return (
    <AuthCard title="Mi perfil" subtitle={landlord.correo}>
      {landlord.verificado ? (
        <p className="flex items-center justify-center gap-2 rounded-lg bg-green-50 py-2 text-sm font-medium text-green-700">
          <BadgeCheck className="h-5 w-5" aria-hidden /> Cuenta verificada
        </p>
      ) : (
        <p className="flex items-center justify-center gap-2 rounded-lg bg-amber-50 py-2 text-sm font-medium text-amber-700">
          <Clock className="h-5 w-5" aria-hidden /> Pendiente de verificación
        </p>
      )}

      <AvatarUpload name={values.name || landlord.nombre} value={photo} onChange={setPhoto} onUploadingChange={setUploadingPhoto} />

      {generalError && <Alert variant="error">{generalError}</Alert>}

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <TextField
          label="Nombre"
          name="name"
          autoComplete="name"
          value={values.name}
          onChange={(e) => setValue('name', e.target.value)}
          error={getError('name')}
        />

        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">Foto de tu DNI</p>
          <p className="text-xs text-gray-500">
            El administrador la revisa para verificar tu cuenta. Si no eliges una nueva, se mantiene la actual.
          </p>

          {!isUploadConfigured() && <Alert variant="error">Falta configurar Cloudinary para subir fotos.</Alert>}
          {(dniError || getError('dniPhotoUrl')) && (
            <p className="text-sm text-red-600">{dniError ?? getError('dniPhotoUrl')}</p>
          )}

          {values.dniPhotoUrl ? (
            <div className="relative overflow-hidden rounded-xl ring-1 ring-gray-200">
              <img src={values.dniPhotoUrl} alt="Foto de tu DNI" className="max-h-56 w-full object-contain" />
              <button
                type="button"
                onClick={() => setValue('dniPhotoUrl', '')}
                aria-label="Quitar la foto del DNI"
                className="absolute right-2 top-2 rounded-full bg-black/60 p-1.5 text-white hover:bg-black/80"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            </div>
          ) : uploadingDni ? (
            <div className="space-y-1 rounded-xl border-2 border-dashed border-gray-300 px-4 py-8 text-center" aria-live="polite">
              <p className="text-sm text-gray-600">Subiendo foto... {dniProgress}%</p>
              <div className="mx-auto h-2 max-w-xs overflow-hidden rounded-full bg-gray-200">
                <div className="h-full bg-blue-600 transition-all" style={{ width: `${dniProgress}%` }} />
              </div>
            </div>
          ) : (
            <ImageDropzone onFiles={handleDniFile} disabled={!isUploadConfigured()} label="Elige la foto de tu DNI" />
          )}
        </div>

        <div className="flex gap-3">
          <Button type="button" variant="secondary" onClick={() => navigate(PATHS.landlordDashboard)}>
            Cancelar
          </Button>
          <Button type="submit" loading={submitting} disabled={uploadingDni || uploadingPhoto}>
            {submitting ? 'Guardando...' : 'Guardar cambios'}
          </Button>
        </div>
      </form>

      {/* Danger zone */}
      <div className="space-y-3 rounded-xl border border-red-200 p-4">
        <h2 className="flex items-center gap-2 font-semibold text-red-700">
          <AlertTriangle className="h-4 w-4" aria-hidden /> Zona de peligro
        </h2>
        <p className="text-sm text-gray-600">
          Eliminar tu cuenta también borra todas tus habitaciones. No se puede si tienen reservas o
          calificaciones.
        </p>
        <Button type="button" variant="danger" onClick={() => setConfirmDelete(true)}>
          <Trash2 className="h-4 w-4" aria-hidden /> Eliminar mi cuenta
        </Button>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title="¿Eliminar tu cuenta?"
        message="Se borrarán tu cuenta y todas tus habitaciones. Esta acción no se puede deshacer."
        confirmLabel="Sí, eliminar"
        loading={deleting}
        onConfirm={handleDeleteAccount}
        onCancel={closeDialog}
      />
    </AuthCard>
  );
}