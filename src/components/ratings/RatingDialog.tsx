import { useEffect, useState, type FormEvent } from 'react';
import { createRating } from '../../api/ratings';
import { getErrorMessage, mapFieldErrors } from '../../api/errors';
import { useForm, type FormErrors } from '../../hooks/useForm';
import { useToast } from '../../hooks/useToast';
import type { Rating } from '../../types/rating';
import { Alert } from '../ui/Alert';
import { Button } from '../ui/Button';
import { StarRatingInput } from './StarRatingInput';

const MAX_DESCRIPTION = 255;

interface RatingFormValues {
  score: number;
  description: string;
}

const INITIAL_VALUES: RatingFormValues = { score: 0, description: '' };

const SERVER_FIELDS: Record<string, keyof RatingFormValues> = {
  puntuacion: 'score',
  descripcion: 'description',
};

function validateRating(values: RatingFormValues): FormErrors<RatingFormValues> {
  return {
    score: values.score < 1 || values.score > 5 ? 'Elige de 1 a 5 estrellas' : undefined,
    description:
      values.description.length > MAX_DESCRIPTION ? `Máximo ${MAX_DESCRIPTION} caracteres` : undefined,
  };
}

interface RatingDialogProps {
  reservationId: number;
  onClose: () => void;
  onCreated: (rating: Rating) => void;
}

// EP 027 - modal to rate a CONFIRMADO reservation. Mount it only while it is open
export function RatingDialog({ reservationId, onClose, onCreated }: RatingDialogProps) {
  const { showToast } = useToast();
  const { values, setValue, getError, validateAll, setServerErrors } = useForm(INITIAL_VALUES, validateRating);
  const [submitting, setSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);

  // Close with Escape (not while sending)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !submitting) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [submitting, onClose]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setGeneralError(null);
    if (!validateAll()) return;

    setSubmitting(true);
    try {
      const rating = await createRating({
        puntuacion: values.score,
        descripcion: values.description.trim() || null,
        reservaId: reservationId,
      });
      showToast('¡Gracias! Tu calificación fue publicada');
      onCreated(rating);
    } catch (err) {
      // 409: not confirmed or already rated -> the backend message explains it
      setServerErrors(mapFieldErrors(err, SERVER_FIELDS));
      setGeneralError(getErrorMessage(err));
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={() => !submitting && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="rating-title"
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="rating-title" className="text-lg font-semibold text-gray-900">
          Califica tu estadía
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          Tu opinión ayuda a otros estudiantes y se suma al puntaje del arrendador.
        </p>

        <form onSubmit={handleSubmit} noValidate className="mt-5 space-y-4">
          {generalError && <Alert variant="error">{generalError}</Alert>}

          <StarRatingInput
            value={values.score}
            onChange={(score) => setValue('score', score)}
            error={getError('score')}
          />

          <div className="space-y-1">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Comentario <span className="font-normal text-gray-400">(opcional)</span>
            </label>
            <textarea
              id="description"
              rows={4}
              value={values.description}
              onChange={(e) => setValue('description', e.target.value)}
              placeholder="¿Qué tal la habitación, el arrendador y la zona?"
              aria-invalid={Boolean(getError('description'))}
              className={`w-full resize-none rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 ${
                getError('description') ? 'border-red-500 focus:ring-red-300' : 'border-gray-300 focus:ring-blue-500'
              }`}
            />
            <div className="flex justify-between text-xs">
              <span className="text-red-600">{getError('description')}</span>
              <span className={values.description.length > MAX_DESCRIPTION ? 'text-red-600' : 'text-gray-500'}>
                {values.description.length}/{MAX_DESCRIPTION}
              </span>
            </div>
          </div>

          <div className="flex gap-3">
            <Button type="button" variant="secondary" onClick={onClose} disabled={submitting}>
              Volver
            </Button>
            <Button type="submit" loading={submitting}>
              {submitting ? 'Publicando...' : 'Publicar'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}