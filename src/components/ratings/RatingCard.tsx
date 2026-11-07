import type { Rating } from '../../types/rating';
import { RatingStars } from './RatingStars';

export function RatingCard({ rating }: { rating: Rating }) {
  const initial = rating.autorNombre.trim().charAt(0).toUpperCase() || '?';

  return (
    <li className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-200">
      <div className="flex items-center gap-3">
        <span
          aria-hidden
          className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-700"
        >
          {initial}
        </span>
        <div>
          <p className="font-medium text-gray-900">{rating.autorNombre}</p>
          <RatingStars value={rating.puntuacion} />
        </div>
      </div>
      {rating.descripcion && <p className="mt-3 text-sm text-gray-700">{rating.descripcion}</p>}
    </li>
  );
}