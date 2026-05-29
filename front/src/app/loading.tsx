import { HackathonCardSkeleton } from '@/frontend/components/ui/Skeleton';

export default function Loading() {
  return (
    <div className="space-y-6">
      <div>
        <div className="h-9 w-64 animate-pulse rounded bg-gray-200" />
        <div className="mt-1 h-5 w-96 animate-pulse rounded bg-gray-200" />
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <HackathonCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
