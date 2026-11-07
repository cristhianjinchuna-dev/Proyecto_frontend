import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ImageOff, MapPin, Ruler, Sparkles } from 'lucide-react';
import { getRoomImages } from '../../api/rooms';
import { useFetch } from '../../hooks/useFetch';
import { buildRoomPath } from '../../routes/paths';
import type { Room } from '../../types/room';
import { formatArea, formatPrice } from '../../utils/format';

export function RoomCard({ room }: { room: Room }) {
  // EP 010: the list (EP 008) has no images, so each card loads its own cover
  const { data: images, loading } = useFetch(
    (signal) => getRoomImages(room.id, signal),
    [room.id],
  );
  const [imageFailed, setImageFailed] = useState(false);
  const coverUrl = images?.[0]?.url;

  return (
    <Link
      to={buildRoomPath(room.id)}
      className="group block overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 transition duration-200 hover:-translate-y-1 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
        {loading ? (
          <div className="h-full w-full animate-pulse bg-gray-200" />
        ) : coverUrl && !imageFailed ? (
          <img
            src={coverUrl}
            alt={`Habitación en ${room.direccion}`}
            loading="lazy"
            onError={() => setImageFailed(true)}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-400">
            <ImageOff className="h-10 w-10" aria-hidden />
          </div>
        )}

        {room.esDestacada && (
          <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-amber-400 px-2.5 py-1 text-xs font-semibold text-amber-950 shadow">
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
            Destacada
          </span>
        )}
      </div>

      <div className="space-y-2 p-4">
        <p className="text-xl font-bold text-gray-900">
          {formatPrice(room.precio)}
          <span className="text-sm font-normal text-gray-500"> /mes</span>
        </p>
        <p className="flex items-start gap-1.5 text-sm text-gray-700">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" aria-hidden />
          <span className="line-clamp-2">{room.direccion}</span>
        </p>
        <p className="flex items-center gap-1.5 text-sm text-gray-500">
          <Ruler className="h-4 w-4 shrink-0" aria-hidden />
          {formatArea(room.area)}
        </p>
      </div>
    </Link>
  );
}