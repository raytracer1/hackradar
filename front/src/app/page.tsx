import { Suspense } from 'react';
import { listHackathons } from '@/backend/services/hackathon-service';
import { listPlatforms } from '@/backend/services/platform-service';
import HackathonListClient from './_components/HackathonListClient';

function LoadingFallback() {
  return (
    <div className="space-y-4">
      <div>
        <div className="h-9 w-64 animate-pulse rounded bg-gray-200" />
        <div className="mt-1 h-5 w-96 animate-pulse rounded bg-gray-200" />
      </div>
      <div className="flex flex-col sm:flex-row gap-0 rounded-xl border border-gray-200 bg-white overflow-hidden" style={{ minHeight: 500 }}>
        <div className="w-full sm:w-96 flex-shrink-0 border-b sm:border-b-0 sm:border-r border-gray-200 p-4 space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />
              <div className="h-3 w-1/2 animate-pulse rounded bg-gray-200" />
            </div>
          ))}
        </div>
        <div className="hidden sm:flex flex-1 items-center justify-center p-8">
          <div className="h-5 w-48 animate-pulse rounded bg-gray-200" />
        </div>
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

  // Serialize Date objects to strings for client component
  const serialized = result.data.map((h) => ({
    ...h,
    startDate: h.startDate instanceof Date ? h.startDate.toISOString() : String(h.startDate),
    endDate: h.endDate instanceof Date ? h.endDate.toISOString() : String(h.endDate),
    createdAt: h.createdAt instanceof Date ? h.createdAt.toISOString() : String(h.createdAt),
    updatedAt: h.updatedAt instanceof Date ? h.updatedAt.toISOString() : String(h.updatedAt),
  }));

  return (
    <Suspense fallback={<LoadingFallback />}>
      <HackathonListClient
        data={serialized}
        pagination={result.pagination}
        platforms={platforms.map((p) => ({ slug: p.slug, name: p.name }))}
        initialParams={sp}
      />
    </Suspense>
  );
}
