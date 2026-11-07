import { Link } from 'react-router-dom';
import { getRoomById } from '../../api/rooms';
import { useFetch } from '../../hooks/useFetch';
import { buildRoomPath } from '../../routes/paths';

// Reservations and ratings only have habitacionId, so we load the address (EP 009)
export function RoomAddressLink({ roomId }: { roomId: number }) {
  const { data: room, loading } = useFetch((signal) => getRoomById(roomId, signal), [roomId]);

  if (loading) return <span className="inline-block h-4 w-48 animate-pulse rounded bg-gray-200" />;

  return (
    <Link to={buildRoomPath(roomId)} className="truncate hover:text-blue-600 hover:underline">
      {room?.direccion ?? `Habitación #${roomId}`}
    </Link>
  );
}