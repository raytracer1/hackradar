'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useCallback, useState } from 'react';
import HackathonListItem from '@/frontend/components/hackathons/HackathonListItem';
import HackathonDetail from '@/frontend/components/hackathons/HackathonDetail';
import HackathonFilters from '@/frontend/components/hackathons/HackathonFilters';
import HackathonSearchBar from '@/frontend/components/hackathons/HackathonSearchBar';
import Pagination from '@/frontend/components/ui/Pagination';
import EmptyState from '@/frontend/components/ui/EmptyState';

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

interface Props {
  data: HackathonData[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
  platforms: { slug: string; name: string }[];
  initialParams: Record<string, string | undefined>;
}

export default function HackathonListClient({ data, pagination, platforms, initialParams }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const pushParams = useCallback(
    (updates: Record<string, string | undefined>) => {
      const params = new URLSearchParams();
      const merged = { ...initialParams, ...updates };
      Object.entries(merged).forEach(([k, v]) => {
        if (v) params.set(k, v);
      });
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, initialParams]
  );

  const selected = data.find((h) => h.id === selectedId) || null;

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
          {/* Left panel: list */}
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

          {/* Right panel: detail */}
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
