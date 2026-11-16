import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarDays } from 'lucide-react';
import { createReservation } from '../../api/reservations';
import { getErrorMessage, getErrorStatus, mapFieldErrors } from '../../api/errors';
import { Alert } from '../ui/Alert';
import { Button } from '../ui/Button';
import { TextAreaField } from '../ui/TextAreaField';
import { TextField } from '../ui/TextField';
import { useForm, type FormErrors } from '../../hooks/useForm';
import { useToast } from '../../hooks/useToast';
import { PATHS } from '../../routes/paths';
import { addDays, countNights, todayIso } from '../../utils/dates';
import { validateOptionalText } from '../../utils/validators';

interface ReservationFormValues {
  startDate: string;
  endDate: string;
  message: string;
}

const MESSAGE_MAX = 500;

const INITIAL_VALUES: ReservationFormValues = { startDate: '', endDate: '', message: '' };

const SERVER_FIELDS: Record<string, keyof ReservationFormValues> = {
  fecha_inicio: 'startDate',
  fecha_fin: 'endDate',
  mensaje: 'message',
};

// Same rules as ReservaRequestDTO: start today or later, end after start
function validateReservation(values: ReservationFormValues): FormErrors<ReservationFormValues> {
  const today = todayIso();
  const errors: FormErrors<ReservationFormValues> = {};

  if (!values.startDate) errors.startDate = 'Elige la fecha de ingreso';
  else if (values.startDate < today) errors.startDate = 'La fecha de ingreso no puede ser pasada';

  if (!values.endDate) errors.endDate = 'Elige la fecha de salida';
  else if (values.startDate && values.endDate <= values.startDate) {
    errors.endDate = 'La salida debe ser posterior al ingreso';
  }
  errors.message = validateOptionalText(values.message, MESSAGE_MAX);
  return errors;
}

// EP 021 - reservation form shown in the room detail (students only)
export function ReservationForm({ roomId }: { roomId: number }) {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { values, setValue, getError, validateAll, setServerErrors, isValid } = useForm(
    INITIAL_VALUES,
    validateReservation,
  );
  const [submitting, setSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);

  const today = todayIso();
  const nights = isValid ? countNights(values.startDate, values.endDate) : 0;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setGeneralError(null);
    if (!validateAll()) return;

    setSubmitting(true);
    try {
      await createReservation({
        fecha_inicio: values.startDate,
        fecha_fin: values.endDate,
        habitacionId: roomId,
        mensaje: values.message.trim() || undefined, // optional
      });
      showToast('Solicitud enviada. Te avisaremos por correo cuando el arrendador la confirme.');
      navigate(PATHS.myReservations);
    } catch (err) {
      const status = getErrorStatus(err);
      setServerErrors(mapFieldErrors(err, SERVER_FIELDS));
      setGeneralError(
        status === 409
          ? 'La habitación ya está reservada en esas fechas. Prueba con otras.'
          : getErrorMessage(err),
      );
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <h2 className="flex items-center gap-2 font-semibold text-gray-900">
        <CalendarDays className="h-5 w-5 text-blue-600" aria-hidden /> Reservar
      </h2>

      {generalError && <Alert variant="error">{generalError}</Alert>}

      <div className="grid grid-cols-2 gap-3">
        <TextField
          label="Ingreso"
          name="startDate"
          type="date"
          min={today}
          value={values.startDate}
          onChange={(e) => setValue('startDate', e.target.value)}
          error={getError('startDate')}
        />
        <TextField
          label="Salida"
          name="endDate"
          type="date"
          min={values.startDate ? addDays(values.startDate, 1) : addDays(today, 1)}
          value={values.endDate}
          onChange={(e) => setValue('endDate', e.target.value)}
          error={getError('endDate')}
        />
      </div>

      {nights > 0 && (
        <p className="rounded-lg bg-blue-50 px-3 py-2 text-sm text-blue-800">
          {nights} {nights === 1 ? 'noche' : 'noches'} · el arrendador debe confirmar tu solicitud
        </p>
      )}

      <TextAreaField
        label="Mensaje para el arrendador (opcional)"
        name="message"
        rows={3}
        maxLength={MESSAGE_MAX}
        placeholder="Preséntate: qué estudias, cuándo te mudas, alguna pregunta..."
        value={values.message}
        onChange={(e) => setValue('message', e.target.value)}
        error={getError('message')}
      />

      <Button type="submit" loading={submitting}>
        {submitting ? 'Enviando...' : 'Solicitar reserva'}
      </Button>
    </form>
  );
}