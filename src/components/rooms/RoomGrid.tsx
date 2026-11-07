import type { Room } from '../../types/room';
import { RoomCard } from './RoomCard';
import { RoomCardSkeleton } from './RoomCardSkeleton';

interface RoomGridProps {
  rooms: Room[];
  loading?: boolean;
  skeletonCount?: number;
}

const GRID = 'grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';

export function RoomGrid({ rooms, loading = false, skeletonCount = 8 }: RoomGridProps) {
  if (loading) {
    return (
      <div className={GRID} aria-busy="true" aria-label="Cargando habitaciones">
        {Array.from({ length: skeletonCount }, (_, index) => (
          <RoomCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  return (
    <div className={GRID}>
      {rooms.map((room) => (
        <RoomCard key={room.id} room={room} />
      ))}
    </div>
  );
}