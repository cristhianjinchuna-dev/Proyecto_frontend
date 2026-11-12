import { useState, type FormEvent } from 'react';
import { getErrorMessage, getErrorStatus, mapFieldErrors } from '../../api/errors';
import { Alert } from '../ui/Alert';
import { Button } from '../ui/Button';
import { TextField } from '../ui/TextField';
import { useForm, type FormErrors } from '../../hooks/useForm';
import type { RoomRequest } from '../../types/room';
import { validatePositiveNumber, validateRequiredText } from '../../utils/validators';
import { RoomLocationPicker } from './RoomLocationPicker';

export interface RoomFormValues {
  address: string;
  price: string;
  area: string;
  latitud?: number | null;
  longitud?: number | null;
}

export const EMPTY_ROOM_FORM: RoomFormValues = { address: '', price: '', area: '', latitud: null, longitud: null };

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

interface RoomFormProps {
  initialValues: RoomFormValues;
  submitLabel: string;
  submittingLabel: string;
  onSubmit: (body: RoomRequest) => Promise<void>;
  onCancel: () => void;
}

// Shared by "Publicar habitación" (EP 016) and "Editar habitación" (EP 019)
export function RoomForm({ initialValues, submitLabel, submittingLabel, onSubmit, onCancel }: RoomFormProps) {
  const { values, setValue, getError, validateAll, setServerErrors } = useForm(
    initialValues,
    validateRoomForm,
  );
  const [submitting, setSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(
    initialValues.latitud != null && initialValues.longitud != null
      ? { lat: initialValues.latitud, lng: initialValues.longitud }
      : null,
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setGeneralError(null);
    if (!validateAll()) return;
    if (!location) {
      setGeneralError('Selecciona una sugerencia de Google Maps o usa tu ubicación actual antes de continuar.');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        direccion: values.address.trim(),
        precio: Number(values.price),
        area: Number(values.area),
        latitud: location.lat,
        longitud: location.lng,
      });
    } catch (err) {
      const status = getErrorStatus(err);
      const fieldErrors = mapFieldErrors(err, SERVER_FIELDS);
      setServerErrors(fieldErrors);

      if (status === 502) {
        setGeneralError('No pudimos ubicar esa dirección en el mapa. Revisa que esté completa (calle, número, distrito).');
      } else if (status === 400 && Object.keys(fieldErrors).length === 0) {
        setGeneralError('No encontramos esa dirección. Escríbela más completa, por ejemplo: "Av. Universitaria 1020, San Miguel, Lima".');
      } else if (status === 403) {
        setGeneralError('No tienes permiso para esta acción: tu cuenta no está verificada o la habitación no es tuya.');
      } else {
        setGeneralError(getErrorMessage(err));
      }
      setSubmitting(false); // only on error: on success the page navigates away
    }
  }

  return (
    <>
      {generalError && <Alert variant="error">{generalError}</Alert>}

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <RoomLocationPicker
          address={values.address}
          onAddressChange={(address) => {
            setValue('address', address);
          }}
          coordinates={location}
          onCoordinatesChange={setLocation}
        />
        {getError('address') && <p className="text-sm text-red-600">{getError('address')}</p>}

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
          <Button type="button" variant="secondary" onClick={onCancel} disabled={submitting}>
            Cancelar
          </Button>
          <Button type="submit" loading={submitting}>
            {submitting ? submittingLabel : submitLabel}
          </Button>
        </div>
      </form>
    </>
  );
}
