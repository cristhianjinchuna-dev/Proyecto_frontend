import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { createRoom } from '../../api/rooms';
import { getErrorMessage, getErrorStatus, mapFieldErrors } from '../../api/errors';
import { AuthCard } from '../../components/auth/AuthCard';
import { Alert } from '../../components/ui/Alert';
import { Breadcrumbs } from '../../components/ui/Breadcrumbs';
import { Button } from '../../components/ui/Button';
import { TextField } from '../../components/ui/TextField';
import { useForm, type FormErrors } from '../../hooks/useForm';
import { useToast } from '../../hooks/useToast';
import { buildRoomImagesPath, PATHS } from '../../routes/paths';
import { validatePositiveNumber, validateRequiredText } from '../../utils/validators';

interface RoomFormValues {
  address: string;
  price: string;
  area: string;
}

const INITIAL_VALUES: RoomFormValues = { address: '', price: '', area: '' };

const SERVER_FIELDS: Record<string, keyof RoomFormValues> = {
  direccion: 'address',
  precio: 'price',
  area: 'area',
};

function validateRoomForm(values: RoomFormValues): FormErrors<RoomFormValues> {
  return {
    address: validateRequiredText(values.address, 'La dirección es obligatoria', 255),
    price: validatePositiveNumber(values.price, 'Ingresa el precio mensual'),
    area: validatePositiveNumber(values.area, 'Ingresa el área', { integer: true }),
  };
}

export default function CreateRoomPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { values, setValue, getError, validateAll, setServerErrors } = useForm(
    INITIAL_VALUES,
    validateRoomForm,
  );
  const [submitting, setSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setGeneralError(null);
    if (!validateAll()) return;

    setSubmitting(true);
    try {
      const room = await createRoom({
        direccion: values.address.trim(),
        precio: Number(values.price),
        area: Number(values.area),
      });
      showToast('Habitación publicada. Ahora agrega sus fotos.');
      navigate(buildRoomImagesPath(room.id)); // next step of the mockup: add images
    } catch (err) {
      const status = getErrorStatus(err);
      setServerErrors(mapFieldErrors(err, SERVER_FIELDS));
      if (status === 502) {
        setGeneralError('No pudimos ubicar esa dirección en el mapa. Revisa que esté completa (calle, número, distrito).');
      } else if (status === 400 && !Object.keys(mapFieldErrors(err, SERVER_FIELDS)).length) {
        setGeneralError('No encontramos esa dirección. Escríbela más completa, por ejemplo: "Av. Universitaria 1020, San Miguel, Lima".');
      } else {
        setGeneralError(getErrorMessage(err)); // 403: account not verified yet
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="pt-6">
      <Breadcrumbs
        items={[
          { label: 'Mi panel', to: PATHS.landlordDashboard },
          { label: 'Publicar habitación' },
        ]}
      />
      <AuthCard title="Publicar habitación" subtitle="Paso 1 de 2 · Datos de la habitación">
        {generalError && <Alert variant="error">{generalError}</Alert>}

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <TextField
            label="Dirección"
            name="address"
            placeholder="Av. Universitaria 1020, San Miguel, Lima"
            hint="Usamos Google Maps para ubicarla y calcular la distancia a las universidades"
            value={values.address}
            onChange={(e) => setValue('address', e.target.value)}
            error={getError('address')}
          />
          <TextField
            label="Precio mensual (S/)"
            name="price"
            type="number"
            inputMode="decimal"
            min={1}
            step="0.01"
            placeholder="850"
            value={values.price}
            onChange={(e) => setValue('price', e.target.value)}
            error={getError('price')}
          />
          <TextField
            label="Área (m²)"
            name="area"
            type="number"
            inputMode="numeric"
            min={1}
            step={1}
            placeholder="16"
            value={values.area}
            onChange={(e) => setValue('area', e.target.value)}
            error={getError('area')}
          />

          <div className="flex gap-3">
            <Button type="button" variant="secondary" onClick={() => navigate(PATHS.landlordDashboard)}>
              Cancelar
            </Button>
            <Button type="submit" loading={submitting}>
              {submitting ? 'Publicando...' : 'Continuar'}
            </Button>
          </div>
        </form>
      </AuthCard>
    </div>
  );
}