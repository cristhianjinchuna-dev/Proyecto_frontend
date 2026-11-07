import { Link } from 'react-router-dom';
import { Eye, ImagePlus, Pencil, Sparkles, Trash2 } from 'lucide-react';
import { buildEditRoomPath, buildRoomImagesPath, buildRoomPath } from '../../routes/paths';
import type { Room } from '../../types/room';
import { formatArea, formatPrice } from '../../utils/format';

const ACTION_BASE =
  'inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition';

interface LandlordRoomRowProps {
  room: Room;
  onDelete: (room: Room) => void;
  onAdvertise: (room: Room) => void;
}

export function LandlordRoomRow({ room, onDelete, onAdvertise }: LandlordRoomRowProps) {
  return (
    <li className="flex flex-col gap-3 rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-200 lg:flex-row lg:items-center lg:justify-between">
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

      <div className="flex shrink-0 flex-wrap gap-2">
        <Link
          to={buildRoomPath(room.id)}
          className={`${ACTION_BASE} border border-gray-300 text-gray-700 hover:bg-gray-50`}
        >
          <Eye className="h-4 w-4" aria-hidden /> Ver
        </Link>
        <Link
          to={buildEditRoomPath(room.id)}
          className={`${ACTION_BASE} border border-gray-300 text-gray-700 hover:bg-gray-50`}
        >
          <Pencil className="h-4 w-4" aria-hidden /> Editar
        </Link>
        <Link
          to={buildRoomImagesPath(room.id)}
          className={`${ACTION_BASE} bg-blue-600 text-white hover:bg-blue-700`}
        >
          <ImagePlus className="h-4 w-4" aria-hidden /> Fotos
        </Link>
        <button
          type="button"
          onClick={() => onAdvertise(room)}
          aria-label={`Destacar habitación ${room.direccion}`}
          className={`${ACTION_BASE} border border-amber-300 text-amber-700 hover:bg-amber-50`}
        >
          <Sparkles className="h-4 w-4" aria-hidden /> Destacar
        </button>
        <button
          type="button"
          onClick={() => onDelete(room)}
          aria-label={`Eliminar habitación ${room.direccion}`}
          className={`${ACTION_BASE} border border-red-200 text-red-600 hover:bg-red-600 hover:text-white`}
        >
          <Trash2 className="h-4 w-4" aria-hidden /> Eliminar
        </button>
      </div>
    </li>
  );
}