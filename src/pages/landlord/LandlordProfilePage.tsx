import { useCallback, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, BadgeCheck, Clock, Trash2 } from 'lucide-react';
import { deleteLandlord, getLandlord, updateLandlord } from '../../api/landlords';
import { getErrorMessage, getErrorStatus, mapFieldErrors } from '../../api/errors';
import { AuthCard } from '../../components/auth/AuthCard';
import { Alert } from '../../components/ui/Alert';
import { Button } from '../../components/ui/Button';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { ErrorState } from '../../components/ui/ErrorState';
import { PageLoader } from '../../components/ui/PageLoader';
import { TextField } from '../../components/ui/TextField';
import { useAuth } from '../../hooks/useAuth';
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
  const { showToast } = useToast();
  const { values, setValue, getError, validateAll, setServerErrors } = useForm(
    { name: landlord.nombre, dniPhotoUrl: '' },
    validateProfileForm,
  );
  const [submitting, setSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const closeDialog = useCallback(() => setConfirmDelete(false), []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setGeneralError(null);
    if (!validateAll()) return;

    setSubmitting(true);
    try {
      await updateLandlord(landlord.id, {
        nombre: values.name.trim(),
        dniFoto: values.dniPhotoUrl.trim() || null,
      });
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

        <TextField
          label="Foto de tu DNI (URL)"
          name="dniPhotoUrl"
          type="url"
          placeholder="https://..."
          hint="Enlace a una imagen de tu DNI para que el administrador verifique tu cuenta"
          value={values.dniPhotoUrl}
          onChange={(e) => setValue('dniPhotoUrl', e.target.value)}
          error={getError('dniPhotoUrl')}
        />

        <div className="flex gap-3">
          <Button type="button" variant="secondary" onClick={() => navigate(PATHS.landlordDashboard)}>
            Cancelar
          </Button>
          <Button type="submit" loading={submitting}>
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