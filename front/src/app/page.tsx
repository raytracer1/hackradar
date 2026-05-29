import { Suspense } from 'react';
import { listHackathons } from '@/backend/services/hackathon-service';
import { listPlatforms } from '@/backend/services/platform-service';
import HackathonListClient from './_components/HackathonListClient';
import { HackathonCardSkeleton } from '@/frontend/components/ui/Skeleton';

function LoadingGrid() {
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

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const params = new URLSearchParams();
  Object.entries(sp).forEach(([k, v]) => {
    if (v) params.set(k, v);
  });

  const [result, platforms] = await Promise.all([
    listHackathons(params),
    listPlatforms(),
  ]);

  return (
    <Suspense fallback={<LoadingGrid />}>
      <HackathonListClient
        data={result.data}
        pagination={result.pagination}
        platforms={platforms.map((p) => ({ slug: p.slug, name: p.name }))}
        initialParams={sp}
      />
    </Suspense>
  );
}
