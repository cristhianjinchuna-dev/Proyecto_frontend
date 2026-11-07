import { useCallback, useState, type FormEvent } from 'react';
import { Trash2 } from 'lucide-react';
import { getErrorMessage, getErrorStatus, mapFieldErrors } from '../../api/errors';
import { createUniversity, deleteUniversity, getUniversities } from '../../api/universities';
import { Alert } from '../ui/Alert';
import { Button } from '../ui/Button';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { ErrorState } from '../ui/ErrorState';
import { PageLoader } from '../ui/PageLoader';
import { TextField } from '../ui/TextField';
import { useFetch } from '../../hooks/useFetch';
import { useForm, type FormErrors } from '../../hooks/useForm';
import { useToast } from '../../hooks/useToast';
import type { University } from '../../types/university';
import { validateRequiredText } from '../../utils/validators';

interface UniversityFormValues {
  name: string;
  address: string;
}

const EMPTY_FORM: UniversityFormValues = { name: '', address: '' };

// Backend field name -> form field name
const SERVER_FIELDS: Record<string, keyof UniversityFormValues> = {
  nombre: 'name',
  direccion: 'address',
};

function validateUniversityForm(values: UniversityFormValues): FormErrors<UniversityFormValues> {
  return {
    name: validateRequiredText(values.name, 'El nombre es obligatorio', 150),
    address: validateRequiredText(values.address, 'La dirección es obligatoria', 255),
  };
}

// EP 038 (create) + EP 039 (delete) universities, plus the list from EP 001
export function UniversitiesPanel() {
  const { data, loading, error, reload } = useFetch((signal) => getUniversities(signal), []);
  const { showToast } = useToast();

  // ----- Create form (EP 038) -----
  const { values, setValue, getError, validateAll, setServerErrors, reset } = useForm(
    EMPTY_FORM,
    validateUniversityForm,
  );
  const [creating, setCreating] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setGeneralError(null);
    if (!validateAll()) return;

    setCreating(true);
    try {
      await createUniversity({ nombre: values.name.trim(), direccion: values.address.trim() });
      showToast('Universidad creada');
      reset();
      reload();
    } catch (err) {
      setServerErrors(mapFieldErrors(err, SERVER_FIELDS));
      // 409 = the name already exists, 502 = Google Maps failed
      setGeneralError(
        getErrorStatus(err) === 409 ? 'Ya existe una universidad con ese nombre' : getErrorMessage(err),
      );
    } finally {
      setCreating(false);
    }
  }

  // ----- Delete (EP 039) -----
  const [toDelete, setToDelete] = useState<University | null>(null);
  const [deleting, setDeleting] = useState(false);
  const closeDialog = useCallback(() => setToDelete(null), []);

  async function handleConfirmDelete() {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await deleteUniversity(toDelete.id);
      showToast('Universidad eliminada');
      setToDelete(null);
      reload();
    } catch (err) {
      setToDelete(null);
      showToast(
        getErrorStatus(err) === 409
          ? 'No se puede eliminar: tiene estudiantes registrados.'
          : getErrorMessage(err),
        'error',
      );
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <form
        onSubmit={handleCreate}
        noValidate
        className="space-y-4 self-start rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-200 lg:col-span-1"
      >
        <h2 className="text-lg font-semibold text-gray-900">Nueva universidad</h2>
        {generalError && <Alert variant="error">{generalError}</Alert>}
        <TextField
          label="Nombre"
          name="name"
          value={values.name}
          onChange={(e) => setValue('name', e.target.value)}
          error={getError('name')}
        />
        <TextField
          label="Dirección"
          name="address"
          hint="Se usa para calcular las coordenadas con Google Maps"
          value={values.address}
          onChange={(e) => setValue('address', e.target.value)}
          error={getError('address')}
        />
        <Button type="submit" loading={creating}>
          {creating ? 'Creando...' : 'Crear universidad'}
        </Button>
      </form>

      <div className="lg:col-span-2">
        {!data ? (
          loading ? (
            <PageLoader />
          ) : (
            <ErrorState message={error ?? 'No se pudo cargar la lista'} onRetry={reload} />
          )
        ) : (
          <ul className="space-y-3">
            {data.map((university) => (
              <li
                key={university.id}
                className="flex items-center justify-between gap-3 rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-200"
              >
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900">{university.nombre}</p>
                  <p className="truncate text-sm text-gray-500">{university.direccion}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setToDelete(university)}
                  aria-label={`Eliminar ${university.nombre}`}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-600 hover:text-white"
                >
                  <Trash2 className="h-4 w-4" aria-hidden /> Eliminar
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <ConfirmDialog
        open={toDelete !== null}
        title="¿Eliminar esta universidad?"
        message={`Se eliminará "${toDelete?.nombre ?? ''}". No se puede si tiene estudiantes registrados.`}
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={closeDialog}
      />
    </div>
  );
}
