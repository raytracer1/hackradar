'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import HackathonListItem from '@/frontend/components/hackathons/HackathonListItem';
import HackathonDetail from '@/frontend/components/hackathons/HackathonDetail';
import HackathonFilters from '@/frontend/components/hackathons/HackathonFilters';
import HackathonSearchBar from '@/frontend/components/hackathons/HackathonSearchBar';
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
  themes: string | string[];
  platform: { name: string; slug: string };
}

const PAGE_SIZE = 20;

export default function Home() {
  const [data, setData] = useState<HackathonData[]>([]);
  const [platforms, setPlatforms] = useState<{ slug: string; name: string }[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentParams, setCurrentParams] = useState<Record<string, string>>({});
  const listRef = useRef<HTMLDivElement>(null);
  const queryRef = useRef<string>('');

  const buildQuery = (overrides: Record<string, string | undefined> = {}) => {
    const params = new URLSearchParams(window.location.search);
    Object.entries(overrides).forEach(([k, v]) => {
      if (v) params.set(k, v);
      else params.delete(k);
    });
    if (!params.get('status')) params.set('status', 'active');
    return params.toString();
  };

  const fetchPage = async (pageNum: number, append: boolean) => {
    const params = new URLSearchParams(queryRef.current);
    params.set('page', String(pageNum));
    params.set('limit', String(PAGE_SIZE));

    const paramObj: Record<string, string> = {};
    params.forEach((v, k) => { paramObj[k] = v; });
    setCurrentParams(paramObj);

    try {
      const [hRes, pRes] = await Promise.all([
        fetch(`/api/hackathons?${params.toString()}`),
        fetch('/api/platforms'),
      ]);
      const hJson = await hRes.json();
      const pJson = await pRes.json();

      setPlatforms((pJson.data || []).map((p: any) => ({ slug: p.slug, name: p.name })));

      if (append) {
        setData((prev) => [...prev, ...(hJson.data || [])]);
      } else {
        setData(hJson.data || []);
      }

      const pag = hJson.pagination || { total: 0, totalPages: 0 };
      setTotal(pag.total);
      setHasMore(pageNum < pag.totalPages);
      setPage(pageNum);
    } catch (e) {
      console.error('Failed to fetch data:', e);
    }
  };

  const loadFirst = useCallback(async () => {
    setLoading(true);
    setSelectedId(null);
    await fetchPage(1, false);
    setLoading(false);
  }, []);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    await fetchPage(page + 1, true);
    setLoadingMore(false);
  }, [page, hasMore, loadingMore]);

  // Scroll detection for infinite loading
  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    const handleScroll = () => {
      if (el.scrollHeight - el.scrollTop - el.clientHeight < 100) {
        loadMore();
      }
    };
    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => el.removeEventListener('scroll', handleScroll);
  }, [loadMore]);

  // Initial load
  useEffect(() => {
    queryRef.current = buildQuery();
    loadFirst();
  }, []);

  const pushParams = (updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams(window.location.search);
    Object.entries(updates).forEach(([k, v]) => {
      if (v) params.set(k, v);
      else params.delete(k);
    });
    // Remove page when changing filters
    params.delete('page');
    const qs = params.toString();
    window.history.pushState(null, '', qs ? `?${qs}` : window.location.pathname);
    queryRef.current = buildQuery();
    loadFirst();
  };

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
            value={currentParams.search || ''}
            onChange={(v) => pushParams({ search: v || undefined })}
          />
        </div>
        <HackathonFilters
          mode={currentParams.mode || ''}
          platform={currentParams.platform || ''}
          sortBy={currentParams.sortBy || 'startDate'}
          platforms={platforms}
          onModeChange={(v) => pushParams({ mode: v || undefined })}
          onPlatformChange={(v) => pushParams({ platform: v || undefined })}
          onSortByChange={(v) => pushParams({ sortBy: v || undefined })}
          onClear={() => {
            window.history.pushState(null, '', '/');
            queryRef.current = buildQuery();
            loadFirst();
          }}
        />
      </div>

      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-4 w-32" />
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
      ) : (
        <>
          <p className="text-sm text-gray-500">{total} hackathon{total !== 1 ? 's' : ''} found</p>

          {data.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="flex flex-col sm:flex-row gap-0 rounded-xl border border-gray-200 bg-white overflow-hidden" style={{ minHeight: 500 }}>
              <div
                ref={listRef}
                className="w-full sm:w-96 flex-shrink-0 border-b sm:border-b-0 sm:border-r border-gray-200 overflow-y-auto"
                style={{ maxHeight: 'calc(100vh - 280px)' }}
              >
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
                {loadingMore && (
                  <div className="p-4 text-center text-sm text-gray-400">Loading more...</div>
                )}
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
        </>
      )}
    </div>
  );
}
