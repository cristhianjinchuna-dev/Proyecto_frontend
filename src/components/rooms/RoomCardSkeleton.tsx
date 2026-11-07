export function RoomCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-gray-200" aria-hidden>
      <div className="aspect-[4/3] animate-pulse bg-gray-200" />
      <div className="space-y-3 p-4">
        <div className="h-6 w-1/3 animate-pulse rounded bg-gray-200" />
        <div className="h-4 w-5/6 animate-pulse rounded bg-gray-200" />
        <div className="h-4 w-1/4 animate-pulse rounded bg-gray-200" />
      </div>
    </div>
  );
}