import { useState } from 'react';
import { Star } from 'lucide-react';

const LABELS = ['', 'Muy mala', 'Mala', 'Regular', 'Buena', 'Excelente'];

interface StarRatingInputProps {
  value: number; // 0 = nothing selected
  onChange: (value: number) => void;
  error?: string;
}

// Clickable 1-5 stars. It is a radio group, so it also works with the keyboard
export function StarRatingInput({ value, onChange, error }: StarRatingInputProps) {
  const [hovered, setHovered] = useState(0);
  const shown = hovered || value;

  return (
    <fieldset className="space-y-1">
      <legend className="text-sm font-medium text-gray-700">Puntuación</legend>
      <div className="flex items-center gap-3">
        <div className="flex gap-1" onMouseLeave={() => setHovered(0)}>
          {[1, 2, 3, 4, 5].map((star) => (
            <label key={star} className="cursor-pointer" onMouseEnter={() => setHovered(star)}>
              <input
                type="radio"
                name="puntuacion"
                value={star}
                checked={value === star}
                onChange={() => onChange(star)}
                className="peer sr-only"
              />
              <Star
                aria-hidden
                className={`h-8 w-8 rounded transition peer-focus-visible:ring-2 peer-focus-visible:ring-blue-500 ${
                  star <= shown ? 'fill-amber-400 text-amber-400' : 'text-gray-300'
                }`}
              />
              <span className="sr-only">
                {star} {star === 1 ? 'estrella' : 'estrellas'}
              </span>
            </label>
          ))}
        </div>
        <span className="text-sm font-medium text-gray-600">{LABELS[shown]}</span>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </fieldset>
  );
}