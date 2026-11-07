import { Link } from 'react-router-dom';
import { Eye, ImagePlus, Sparkles } from 'lucide-react';
import { buildRoomImagesPath, buildRoomPath } from '../../routes/paths';
import type { Room } from '../../types/room';
import { formatArea, formatPrice } from '../../utils/format';

const LINK_BASE =
  'inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition';

export function LandlordRoomRow({ room }: { room: Room }) {
  return (
    <li className="flex flex-col gap-3 rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-200 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="truncate font-semibold text-gray-900">{room.direccion}</p>
        <p className="mt-1 flex flex-wrap items-center gap-x-2 text-sm text-gray-500">
          <span>{formatPrice(room.precio)} /mes</span>
          <span aria-hidden>·</span>
          <span>{formatArea(room.area)}</span>
          {room.esDestacada && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">
              <Sparkles className="h-3 w-3" aria-hidden /> Destacada
            </span>
          )}
        </p>
      </div>

      <div className="flex shrink-0 gap-2">
        <Link
          to={buildRoomPath(room.id)}
          className={`${LINK_BASE} border border-gray-300 text-gray-700 hover:bg-gray-50`}
        >
          <Eye className="h-4 w-4" aria-hidden /> Ver
        </Link>
        <Link
          to={buildRoomImagesPath(room.id)}
          className={`${LINK_BASE} bg-blue-600 text-white hover:bg-blue-700`}
        >
          <ImagePlus className="h-4 w-4" aria-hidden /> Fotos
        </Link>
      </div>
    </li>
  );
}