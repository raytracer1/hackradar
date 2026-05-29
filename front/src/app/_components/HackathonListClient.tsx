'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useCallback } from 'react';
import HackathonGrid from '@/frontend/components/hackathons/HackathonGrid';
import HackathonFilters from '@/frontend/components/hackathons/HackathonFilters';
import HackathonSearchBar from '@/frontend/components/hackathons/HackathonSearchBar';
import Pagination from '@/frontend/components/ui/Pagination';
import EmptyState from '@/frontend/components/ui/EmptyState';

interface Props {
  data: any[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
  platforms: { slug: string; name: string }[];
  initialParams: Record<string, string | undefined>;
}

export default function HackathonListClient({ data, pagination, platforms, initialParams }: Props) {
  const router = useRouter();
  const pathname = usePathname();

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

  return (
    <div className="space-y-6">
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
          onClear={() => router.push(pathname)}
        />
      </div>

      <p className="text-sm text-gray-500">
        {pagination.total} hackathon{pagination.total !== 1 ? 's' : ''} found
      </p>

      {data.length === 0 ? (
        <EmptyState />
      ) : (
        <HackathonGrid hackathons={data} />
      )}

      <div className="mt-8">
        <Pagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={(page) => pushParams({ page: String(page) })}
        />
      </div>
    </div>
  );
}
