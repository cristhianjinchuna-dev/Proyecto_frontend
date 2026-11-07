import { Star } from 'lucide-react';

interface RatingStarsProps {
  value: number;
  max?: number;
}

export function RatingStars({ value, max = 5 }: RatingStarsProps) {
  return (
    <div role="img" aria-label={`${value} de ${max} estrellas`} className="flex items-center gap-0.5">
      {Array.from({ length: max }, (_, index) => (
        <Star
          key={index}
          aria-hidden
          className={`h-4 w-4 ${
            index < Math.round(value) ? 'fill-amber-400 text-amber-400' : 'text-gray-300'
          }`}
        />
      ))}
    </div>
  );
}