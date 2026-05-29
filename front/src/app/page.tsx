'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import HackathonListItem from '@/frontend/components/hackathons/HackathonListItem';
import HackathonDetail from '@/frontend/components/hackathons/HackathonDetail';
import HackathonFilters from '@/frontend/components/hackathons/HackathonFilters';
import HackathonSearchBar from '@/frontend/components/hackathons/HackathonSearchBar';
import Pagination from '@/frontend/components/ui/Pagination';
import EmptyState from '@/frontend/components/ui/EmptyState';
import Skeleton from '@/frontend/components/ui/Skeleton';

interface HackathonData {
  id: string;
  title: string;
  description: string | null;
  url: string;
  imageUrl: string | null;
  mode: string;
  location: string | null;
  startDate: string;
  endDate: string;
  timezone: string | null;
  prizePool: string | null;
  themes: string;
  platform: { name: string; slug: string };
}

export default function Home() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [data, setData] = useState<HackathonData[]>([]);
  const [platforms, setPlatforms] = useState<{ slug: string; name: string }[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams(searchParams.toString());
      if (!params.get('status')) params.set('status', 'active');

      const [hRes, pRes] = await Promise.all([
        fetch(`/api/hackathons?${params.toString()}`),
        fetch('/api/platforms'),
      ]);
      const hJson = await hRes.json();
      const pJson = await pRes.json();

      setData(hJson.data || []);
      setPagination(hJson.pagination || { page: 1, limit: 20, total: 0, totalPages: 0 });
      setPlatforms((pJson.data || []).map((p: any) => ({ slug: p.slug, name: p.name })));
    } catch (e) {
      console.error('Failed to fetch data:', e);
    }
    setLoading(false);
  }, [searchParams]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const pushParams = useCallback(
    (updates: Record<string, string | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([k, v]) => {
        if (v) params.set(k, v);
        else params.delete(k);
      });
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams]
  );

  const initialParams: Record<string, string | undefined> = {};
  searchParams.forEach((v, k) => { initialParams[k] = v; });

  const selected = data.find((h) => h.id === selectedId) || null;

  if (loading && data.length === 0) {
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
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Discover Hackathons</h2>
        <p className="mt-1 text-gray-500">Browse and find upcoming hackathons from across the web.</p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="w-full sm:w-72">
          <HackathonSearchBar
            value={initialParams.search || ''}
            onChange={(v) => pushParams({ search: v || undefined, page: undefined })}
          />
        </div>
        <HackathonFilters
          mode={initialParams.mode || ''}
          platform={initialParams.platform || ''}
          sortBy={initialParams.sortBy || 'startDate'}
          platforms={platforms}
          onModeChange={(v) => pushParams({ mode: v || undefined, page: undefined })}
          onPlatformChange={(v) => pushParams({ platform: v || undefined, page: undefined })}
          onSortByChange={(v) => pushParams({ sortBy: v || undefined, page: undefined })}
          onClear={() => { router.push(pathname); setSelectedId(null); }}
        />
      </div>

      <p className="text-sm text-gray-500">
        {pagination.total} hackathon{pagination.total !== 1 ? 's' : ''} found
      </p>

      {data.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="flex flex-col sm:flex-row gap-0 rounded-xl border border-gray-200 bg-white overflow-hidden" style={{ minHeight: 500 }}>
          <div className="w-full sm:w-96 flex-shrink-0 border-b sm:border-b-0 sm:border-r border-gray-200 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 280px)' }}>
            {data.map((h) => (
              <HackathonListItem
                key={h.id}
                id={h.id}
                title={h.title}
                mode={h.mode}
                startDate={h.startDate}
                endDate={h.endDate}
                platform={h.platform}
                prizePool={h.prizePool}
                selected={selectedId === h.id}
                onClick={() => setSelectedId(h.id)}
              />
            ))}
          </div>

          <div className="flex flex-1 flex-col overflow-y-auto" style={{ maxHeight: 'calc(100vh - 280px)' }}>
            {selected ? (
              <div className="p-6">
                <HackathonDetail
                  title={selected.title}
                  description={selected.description}
                  url={selected.url}
                  imageUrl={selected.imageUrl}
                  mode={selected.mode}
                  location={selected.location}
                  startDate={selected.startDate}
                  endDate={selected.endDate}
                  timezone={selected.timezone}
                  prizePool={selected.prizePool}
                  themes={selected.themes}
                  platform={selected.platform}
                />
              </div>
            ) : (
              <div className="flex h-full flex-col items-center justify-center p-8 text-center text-gray-400">
                <div className="mb-3 text-5xl">←</div>
                <p className="text-sm">Select a hackathon from the list</p>
                <p className="mt-1 text-xs">to view details here</p>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="mt-4">
        <Pagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={(page) => pushParams({ page: String(page) })}
        />
      </div>
    </div>
  );
}
