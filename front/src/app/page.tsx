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

const DISPLAY = 20;

export default function Home() {
  const [allData, setAllData] = useState<HackathonData[]>([]);
  const [displayCount, setDisplayCount] = useState(DISPLAY);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [platforms, setPlatforms] = useState<{ slug: string; name: string }[]>([]);
  const [knownSet, setKnownSet] = useState<Set<string>>(() => {
    try { return new Set(JSON.parse(localStorage.getItem('known') || '[]')); } catch { return new Set(); }
  });
  const [showKnown, setShowKnown] = useState(false);
  function readURLParams() {
    if (typeof window === 'undefined') return { prizeMin: '', prizeMax: '', sortBy: 'endDate', search: '' };
    const sp = new URLSearchParams(window.location.search);
    return {
      prizeMin: sp.get('prizeMin') || '',
      prizeMax: sp.get('prizeMax') || '',
      sortBy: sp.get('sortBy') || 'endDate',
      search: sp.get('search') || '',
    };
  }

  const [filters, setFilters] = useState(readURLParams);
  const listRef = useRef<HTMLDivElement>(null);

  function parsePrize(text: string | null): number {
    if (!text) return 0;
    // Extract number from "$60,000" or "$10,000 in prizes" etc.
    const m = text.replace(/[$,]/g, '').match(/[\d.]+/);
    return m ? parseFloat(m[0]) : 0;
  }

  // Preload all chunks in background until remaining=0
  const preloadAll = useCallback(async () => {
    setLoading(true);
    let page = 1;
    const collected: HackathonData[] = [];
    try {
      while (true) {
        const res = await fetch(`/api/hackathons?page=${page}`);
        const json = await res.json();
        collected.push(...(json.data || []));
        setAllData([...collected]);
        if (json.remaining === 0) break;
        page++;
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }, []);

  // Client-side filtering & sorting
  const toggleKnown = (id: string) => {
    const next = new Set(knownSet);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setKnownSet(next);
    localStorage.setItem('known', JSON.stringify([...next]));
  };

  const knownCount = allData.filter((h) => knownSet.has(h.id)).length;

  const filtered = allData.filter((h) => {
    // Hide ended hackathons
    if (new Date(h.endDate).getTime() < Date.now()) return false;
    // Known/unknown filter
    if (showKnown && !knownSet.has(h.id)) return false;
    if (!showKnown && knownSet.has(h.id)) return false;
    if (filters.search) {
      const q = filters.search.toLowerCase();
      if (!h.title.toLowerCase().includes(q) && !(h.description || '').toLowerCase().includes(q)) return false;
    }
    if (filters.prizeMin) {
      if (parsePrize(h.prizePool) < parseFloat(filters.prizeMin)) return false;
    }
    if (filters.prizeMax) {
      if (parsePrize(h.prizePool) > parseFloat(filters.prizeMax)) return false;
    }
    return true;
  });

  switch (filters.sortBy) {
    case 'prize-desc':
      filtered.sort((a, b) => parsePrize(b.prizePool) - parsePrize(a.prizePool));
      break;
    case 'prize-asc':
      filtered.sort((a, b) => parsePrize(a.prizePool) - parsePrize(b.prizePool));
      break;
    case 'startDate':
      filtered.sort((a: any, b: any) => String(a.startDate || '').localeCompare(String(b.startDate || '')));
      break;
    default: // endDate
      filtered.sort((a: any, b: any) => String(a.endDate || '').localeCompare(String(b.endDate || '')));
  }

  const visible = filtered.slice(0, displayCount);

  // Scroll: increase displayCount from preloaded data
  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    const handleScroll = () => {
      if (el.scrollHeight - el.scrollTop - el.clientHeight < 200) {
        setDisplayCount((prev) => Math.min(prev + DISPLAY, filtered.length));
      }
    };
    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => el.removeEventListener('scroll', handleScroll);
  }, [allData.length, filtered.length]);

  // Initial load: preload all chunks
  useEffect(() => {
    preloadAll();
    fetch('/api/platforms').then(async (r) => {
      const json = await r.json();
      setPlatforms((json.data || []).map((p: any) => ({ slug: p.slug, name: p.name })));
    }).catch(() => {});
  }, []);

  // Filter change → reset display
  const updateFilter = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    setDisplayCount(DISPLAY);
    setSelectedId(null);
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([k, v]) => { if (v) params.set(k, v); });
    window.history.pushState(null, '', params.toString() ? `?${params.toString()}` : '/');
  };

  const selected = allData.find((h) => h.id === selectedId) || null;

  return (
    <div className="space-y-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Discover Hackathons</h1>
        <p className="mt-1 text-gray-500">Browse and find upcoming hackathons from across the web.</p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="w-full sm:w-72">
          <HackathonSearchBar
            value={filters.search}
            onChange={(v) => updateFilter('search', v)}
          />
        </div>
        <div className="flex items-center gap-2">
          <HackathonFilters
            prizeMin={filters.prizeMin}
            prizeMax={filters.prizeMax}
            sortBy={filters.sortBy}
            onPrizeMinChange={(v) => updateFilter('prizeMin', v)}
            onPrizeMaxChange={(v) => updateFilter('prizeMax', v)}
            onSortByChange={(v) => updateFilter('sortBy', v)}
            onClear={() => {
              window.history.pushState(null, '', '/');
              setFilters({ prizeMin: '', prizeMax: '', sortBy: 'endDate', search: '' });
              setDisplayCount(DISPLAY);
              setSelectedId(null);
            }}
          />
          <button
            onClick={() => { setShowKnown(!showKnown); setDisplayCount(DISPLAY); setSelectedId(null); }}
            className={`rounded-xl border px-3 py-2 text-xs font-medium transition ${
              showKnown ? 'border-indigo-300 bg-indigo-50 text-indigo-700' : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
            }`}
          >
            Known ({knownCount})
          </button>
        </div>
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
          <p className="text-sm text-gray-500">{filtered.length} hackathon{filtered.length !== 1 ? 's' : ''} found</p>

          {filtered.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="flex flex-col sm:flex-row gap-0 rounded-xl border border-gray-200 bg-white overflow-hidden">
              <div
                ref={listRef}
                className="w-full sm:w-96 flex-shrink-0 self-stretch border-b sm:border-b-0 sm:border-r border-gray-200 overflow-y-auto"
                style={{ maxHeight: 'calc(100vh - 280px)' }}
              >
                  {visible.map((h) => (
                    <HackathonListItem
                      key={h.id}
                      id={h.id}
                      title={h.title}
                      startDate={h.startDate}
                      endDate={h.endDate}
                      platform={h.platform}
                      prizePool={h.prizePool}
                      selected={selectedId === h.id}
                      onClick={() => setSelectedId(h.id)}
                    />
                  ))}
                  {displayCount < filtered.length && (
                    <div className="p-4 text-center text-sm text-gray-400">Loading more...</div>
                  )}
                </div>

              <div className="flex flex-1 flex-col">
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
                      known={knownSet.has(selected.id)}
                      onMarkKnown={() => toggleKnown(selected.id)}
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
