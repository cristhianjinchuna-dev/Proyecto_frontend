import { useCallback, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, BadgeCheck, Clock, Mail, Trash2 } from 'lucide-react';
import { deleteStudent, getStudent, updateStudent } from '../../api/students';
import { getErrorMessage, getErrorStatus, mapFieldErrors } from '../../api/errors';
import { AuthCard } from '../../components/auth/AuthCard';
import { UniversitySelect } from '../../components/UniversitySelect';
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
import { useUniversities } from '../../hooks/useUniversities';
import { PATHS } from '../../routes/paths';
import type { Student } from '../../types/student';
import { validateName } from '../../utils/validators';

interface ProfileFormValues {
  name: string;
  universityId: number | '';
}

const SERVER_FIELDS: Record<string, keyof ProfileFormValues> = {
  nombre: 'name',
  universidadId: 'universityId',
};

function validateProfile(values: ProfileFormValues): FormErrors<ProfileFormValues> {
  return {
    name: validateName(values.name),
    universityId: values.universityId === '' ? 'Selecciona tu universidad' : undefined,
  };
}

// EP 031 (see) + EP 032 (edit) + EP 033 (delete account)
export default function StudentProfilePage() {
  const { user } = useAuth();
  const studentId = user?.id ?? 0;
  const { data, loading, error, reload } = useFetch((signal) => getStudent(studentId, signal), [studentId]);
  const { universities, loading: loadingUniversities } = useUniversities();

  if (loading || loadingUniversities) return <PageLoader />;
  if (error || !data) {
    return (
      <section className="py-12">
        <ErrorState message={error ?? 'No se pudo cargar tu perfil'} onRetry={reload} />
      </section>
    );
  }

  // The backend returns the university NAME, the form needs its ID
  const currentUniversityId = universities.find((u) => u.nombre === data.universidadNombre)?.id ?? '';

  return <ProfileForm student={data} initialUniversityId={currentUniversityId} />;
}

function ProfileForm({ student, initialUniversityId }: { student: Student; initialUniversityId: number | '' }) {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { showToast } = useToast();

  const { values, setValue, getError, validateAll, setServerErrors } = useForm<ProfileFormValues>(
    { name: student.nombre, universityId: initialUniversityId },
    validateProfile,
  );
  const [submitting, setSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const closeDialog = useCallback(() => setConfirmDelete(false), []);

  // EP 032
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setGeneralError(null);
    if (!validateAll() || values.universityId === '') return;

    setSubmitting(true);
    try {
      await updateStudent(student.id, { nombre: values.name.trim(), universidadId: values.universityId });
      showToast('Perfil actualizado');
    } catch (err) {
      setServerErrors(mapFieldErrors(err, SERVER_FIELDS));
      setGeneralError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  // EP 033 - if it works, the account no longer exists: log out
  async function handleDeleteAccount() {
    setDeleting(true);
    try {
      await deleteStudent(student.id);
      signOut();
      showToast('Tu cuenta fue eliminada', 'info');
      navigate(PATHS.home, { replace: true });
    } catch (err) {
      setConfirmDelete(false);
      setDeleting(false);
      showToast(
        getErrorStatus(err) === 409
          ? 'No puedes eliminar tu cuenta porque tienes reservas o calificaciones registradas.'
          : getErrorMessage(err),
        'error',
      );
    }
  }

  return (
    <AuthCard title="Mi perfil" subtitle="Actualiza tu nombre y tu universidad">
      <div className="space-y-2 rounded-lg bg-gray-50 p-3 text-sm">
        <p className="flex items-center gap-2 text-gray-700">
          <Mail className="h-4 w-4 text-gray-400" aria-hidden /> {student.correo}
        </p>
        {student.verificado ? (
          <p className="flex items-center gap-2 font-medium text-green-700">
            <BadgeCheck className="h-4 w-4" aria-hidden /> Cuenta verificada
          </p>
        ) : (
          <p className="flex items-center gap-2 font-medium text-amber-700">
            <Clock className="h-4 w-4" aria-hidden /> Cuenta sin verificar
          </p>
        )}
      </div>

      {generalError && <Alert variant="error">{generalError}</Alert>}

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <TextField
          label="Nombre completo"
          name="name"
          autoComplete="name"
          value={values.name}
          onChange={(e) => setValue('name', e.target.value)}
          error={getError('name')}
        />

        <div className="space-y-1">
          <label htmlFor="universityId" className="block text-sm font-medium text-gray-700">
            Universidad
          </label>
          <UniversitySelect
            id="universityId"
            value={values.universityId}
            onChange={(id) => setValue('universityId', id)}
            invalid={Boolean(getError('universityId'))}
          />
          {getError('universityId') && <p className="text-sm text-red-600">{getError('universityId')}</p>}
        </div>

        <p className="text-xs text-gray-500">El correo y la contraseña no se pueden cambiar desde aquí.</p>

        <Button type="submit" loading={submitting}>
          {submitting ? 'Guardando...' : 'Guardar cambios'}
        </Button>
      </form>

      {/* Danger zone */}
      <div className="space-y-3 rounded-xl border border-red-200 p-4">
        <h2 className="flex items-center gap-2 font-semibold text-red-700">
          <AlertTriangle className="h-4 w-4" aria-hidden /> Zona de peligro
        </h2>
        <p className="text-sm text-gray-600">
          Eliminar tu cuenta es permanente. No se puede si tienes reservas o calificaciones.
        </p>
        <Button type="button" variant="danger" onClick={() => setConfirmDelete(true)}>
          <Trash2 className="h-4 w-4" aria-hidden /> Eliminar mi cuenta
        </Button>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title="¿Eliminar tu cuenta?"
        message="Perderás el acceso a MuvU con este correo. Esta acción no se puede deshacer."
        confirmLabel="Sí, eliminar"
        loading={deleting}
        onConfirm={handleDeleteAccount}
        onCancel={closeDialog}
      />
    </AuthCard>
  );
}