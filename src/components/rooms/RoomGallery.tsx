import { useState } from 'react';
import { ImageOff } from 'lucide-react';
import type { RoomImage } from '../../types/room';

interface RoomGalleryProps {
  images: RoomImage[];
  alt: string;
}

export function RoomGallery({ images, alt }: RoomGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (images.length === 0) {
    return (
      <div className="flex aspect-[16/10] items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
        <div className="flex flex-col items-center gap-2">
          <ImageOff className="h-12 w-12" aria-hidden />
          <span className="text-sm">Esta habitación aún no tiene fotos</span>
        </div>
      </div>
    );
  }

  const selected = images[Math.min(selectedIndex, images.length - 1)];

  return (
    <div className="space-y-3">
      <div className="aspect-[16/10] overflow-hidden rounded-2xl bg-gray-100">
        <img src={selected.url} alt={alt} className="h-full w-full object-cover" />
      </div>

      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((image, index) => (
            <button
              key={image.id}
              type="button"
              onClick={() => setSelectedIndex(index)}
              aria-label={`Ver imagen ${index + 1} de ${images.length}`}
              aria-pressed={index === selectedIndex}
              className={`h-20 w-28 shrink-0 overflow-hidden rounded-lg ring-2 transition ${
                index === selectedIndex ? 'ring-blue-600' : 'ring-transparent opacity-70 hover:opacity-100'
              }`}
            >
              <img src={image.url} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}