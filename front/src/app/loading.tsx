import Skeleton from '@/frontend/components/ui/Skeleton';

export default function Loading() {
  return (
    <div className="space-y-4">
      <div>
        <div className="h-9 w-64 animate-pulse rounded bg-gray-200" />
        <div className="mt-1 h-5 w-96 animate-pulse rounded bg-gray-200" />
      </div>
      <div className="flex rounded-xl border border-gray-200 bg-white overflow-hidden" style={{ minHeight: 500 }}>
        <div className="w-96 flex-shrink-0 border-r border-gray-200 p-4 space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
        <div className="flex flex-1 items-center justify-center p-8">
          <Skeleton className="h-5 w-48" />
        </div>
      </div>
    </div>
  );
}
