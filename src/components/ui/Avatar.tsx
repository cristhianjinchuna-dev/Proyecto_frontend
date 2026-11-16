import { useState } from 'react';

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

const SIZES: Record<AvatarSize, string> = {
  xs: 'h-6 w-6 text-xs',
  sm: 'h-8 w-8 text-sm',
  md: 'h-10 w-10 text-base',
  lg: 'h-14 w-14 text-xl',
  xl: 'h-24 w-24 text-3xl',
};

interface AvatarProps {
  name: string;
  src?: string | null;
  size?: AvatarSize;
}

// Profile photo; with no photo (or a broken link) it shows the first letter of the name
export function Avatar({ name, src, size = 'md' }: AvatarProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const initial = name.trim().charAt(0).toUpperCase() || '?';
  const showImage = Boolean(src) && failedSrc !== src;

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-blue-100 font-semibold text-blue-700 ${SIZES[size]}`}
    >
      {showImage ? (
        <img src={src!} alt={`Foto de ${name}`} className="h-full w-full object-cover" onError={() => setFailedSrc(src!)} />
      ) : (
        <span aria-hidden>{initial}</span>
      )}
    </span>
  );
}
