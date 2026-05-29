interface SkeletonProps {
  className?: string;
}

export default function Skeleton({ className = '' }: SkeletonProps) {
  return <div className={`animate-pulse rounded-lg bg-gray-200 ${className}`} />;
}

export function HackathonCardSkeleton() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <Skeleton className="mb-3 h-4 w-20" />
      <Skeleton className="mb-2 h-5 w-3/4" />
      <Skeleton className="mb-4 h-4 w-full" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  );
}
