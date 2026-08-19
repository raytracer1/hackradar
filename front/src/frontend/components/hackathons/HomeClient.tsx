'use client';

import { useState, useEffect, useRef } from 'react';
import HackathonListItem from '@/frontend/components/hackathons/HackathonListItem';
import HackathonDetail from '@/frontend/components/hackathons/HackathonDetail';
import HackathonFilters from '@/frontend/components/hackathons/HackathonFilters';
import HackathonSearchBar from '@/frontend/components/hackathons/HackathonSearchBar';
import EmptyState from '@/frontend/components/ui/EmptyState';

interface HackathonData {
  id: string;
  title: string;
  description: string | null;
  about: string | null;
  whatToBuild: string | null;
  whatToSubmit: string | null;
  prizesDetail: string | null;
  eligibility: string | null;
  url: string;
  imageUrl: string | null;
  startDate: string;
  endDate: string;
  timezone: string | null;
  prizePool: string | null;
  themes: string | string[];
  platform: { name: string; slug: string };
}

const DISPLAY = 20;

function ShinyText({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const mounted = useRef(false);
  useEffect(() => { mounted.current = true; }, []);
  const handleMouseMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty('--mx', `${e.clientX - rect.left}px`);
    el.style.setProperty('--my', `${e.clientY - rect.top}px`);
  };
  return (
    <span ref={ref} className={`shiny-text ${className}`} onMouseMove={handleMouseMove}>
      {children}
    </span>
  );
}

export default function HomeClient({
  initialData,
  initialPlatforms,
}: {
  initialData: HackathonData[];
  initialPlatforms: { slug: string; name: string }[];
}) {
  const [allData, setAllData] = useState<HackathonData[]>(initialData);
  const [displayCount, setDisplayCount] = useState(DISPLAY);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [platforms, setPlatforms] = useState<{ slug: string; name: string }[]>(initialPlatforms);
  const [knownSet, setKnownSet] = useState<Set<string>>(() => {
    try { return new Set(JSON.parse(localStorage.getItem('known') || '[]')); } catch { return new Set(); }
  });
  const [showKnown, setShowKnown] = useState(false);
  const [selectedSources, setSelectedSources] = useState<Set<string>>(new Set());
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
      if (!h.title.toLowerCase().includes(q) && !(h.description || '').toLowerCase().includes(q) && !(h.about || '').toLowerCase().includes(q) && !(h.whatToBuild || '').toLowerCase().includes(q) && !(h.whatToSubmit || '').toLowerCase().includes(q) && !(h.prizesDetail || '').toLowerCase().includes(q) && !(h.eligibility || '').toLowerCase().includes(q)) return false;
    }
    if (filters.prizeMin) {
      if (parsePrize(h.prizePool) < parseFloat(filters.prizeMin)) return false;
    }
    if (filters.prizeMax) {
      if (parsePrize(h.prizePool) > parseFloat(filters.prizeMax)) return false;
    }
    // Source filter: selectedSources = sources to HIDE
    if (selectedSources.has(h.platform.slug)) return false;
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
  }, [filtered.length]);

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

  const handleSourceToggle = (slug: string) => {
    const next = new Set(selectedSources);
    if (next.has(slug)) {
      next.delete(slug); // Show this source again
    } else {
      next.add(slug); // Hide this source
    }
    setSelectedSources(next);
    setDisplayCount(DISPLAY);
    setSelectedId(null);
  };

  const selected = allData.find((h) => h.id === selectedId) || null;

  return (
    <div className="space-y-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Discover <ShinyText className="font-bold">Money</ShinyText> from Hackathons</h1>
        <p className="mt-2 text-gray-500">Browse and find upcoming hackathons which <ShinyText className="font-semibold">reward cash</ShinyText> from across the web.</p>
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
          />
          <button
            onClick={() => { setShowKnown(!showKnown); setDisplayCount(DISPLAY); setSelectedId(null); }}
            className={`inline-flex items-center rounded-xl border px-3 h-10 text-xs font-medium transition ${
              showKnown ? 'border-indigo-300 bg-indigo-50 text-indigo-700' : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
            }`}
          >
            Known ({knownCount})
          </button>
        </div>
      </div>

      {/* Platforms row — separate line */}
      {platforms.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {platforms.map((p) => {
            const active = !selectedSources.has(p.slug);
            return (
              <button
                key={p.slug}
                onClick={() => handleSourceToggle(p.slug)}
                className={`h-10 rounded-xl border px-3 text-xs font-medium transition ${
                  active
                    ? 'border-indigo-300 bg-indigo-50 text-indigo-700'
                    : 'border-slate-200 bg-white text-slate-400 hover:border-slate-300 hover:text-slate-500'
                }`}
              >
                {p.name}
              </button>
            );
          })}
        </div>
      )}

      <>
        <p className="text-sm text-gray-500">{filtered.length} hackathon{filtered.length !== 1 ? 's' : ''} found</p>

        {filtered.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="flex flex-col sm:flex-row gap-0 rounded-xl border border-gray-200 bg-white overflow-hidden" style={{ maxHeight: 'calc(100vh - 260px)' }}>
            <div
              ref={listRef}
              className="w-full sm:w-1/3 flex-shrink-0 border-b sm:border-b-0 sm:border-r border-gray-200 overflow-y-auto"
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

            <div className="flex w-full sm:w-2/3 flex-col overflow-y-auto">
              {selected ? (
                <div className="w-full px-4 sm:px-[2.5rem] py-4">
                  <HackathonDetail
                    title={selected.title}
                    description={selected.description}
                    about={selected.about}
                    whatToBuild={selected.whatToBuild}
                    whatToSubmit={selected.whatToSubmit}
                    prizesDetail={selected.prizesDetail}
                    eligibility={selected.eligibility}
                    url={selected.url}
                    imageUrl={selected.imageUrl}
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
                <div className="flex h-full flex-col items-center justify-center p-4 text-center text-gray-400">
                  <div className="mb-3 text-5xl">←</div>
                  <p className="text-sm">Select a hackathon from the list</p>
                  <p className="mt-1 text-xs">to view details here</p>
                </div>
              )}
            </div>
          </div>
        )}
      </>
    </div>
  );
}
