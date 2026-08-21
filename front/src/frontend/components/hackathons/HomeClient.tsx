'use client';

import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import AdSlot from '@/frontend/components/ads/AdSlot';
import HackathonListItem from '@/frontend/components/hackathons/HackathonListItem';
import HackathonFilters from '@/frontend/components/hackathons/HackathonFilters';
import HackathonSearchBar from '@/frontend/components/hackathons/HackathonSearchBar';
import EmptyState from '@/frontend/components/ui/EmptyState';

// Split out of the main bundle: the detail pane is only rendered after a
// user selects an item, so its code loads on demand instead of weighing
// down first paint / hydration. The local loading fallback keeps the
// suspense from bubbling up to the root boundary — without it, clicking an
// item suspends the whole page and it flashes/re-renders.
const HackathonDetail = dynamic(() => import('@/frontend/components/hackathons/HackathonDetail'), {
  loading: () => (
    <div className="flex h-full flex-col items-center justify-center p-4 text-center text-gray-400">
      <div className="mb-3 text-5xl">⟳</div>
      <p className="text-sm">Loading…</p>
    </div>
  ),
});

// Lightweight list item — the only data the server sends down. Full details
// are fetched on demand from /api/hackathons/[id] when an item is selected.
interface HackathonListData {
  sourceId: string;
  title: string;
  startDate: string;
  endDate: string;
  prizePool: string | null;
  source: string;
  platform: { name: string; slug: string };
}

interface HackathonDetailData {
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
  sourceId: string;
  source: string;
  status: string;
}

const DISPLAY = 20;

// Server-rendered default filters. Client-only state (known set, URL params)
// is loaded in a mount effect AFTER hydration — reading it during the first
// client render would mismatch the server HTML (React hydration error #418).
const DEFAULT_FILTERS = { prizeMin: '', prizeMax: '', sortBy: 'endDate', search: '' };

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
  initialTotal,
  initialPlatforms,
  initialNow,
}: {
  initialData: HackathonListData[];
  initialTotal: number;
  initialPlatforms: { slug: string; name: string }[];
  initialNow: number;
}) {
  const [allData, setAllData] = useState<HackathonListData[]>(initialData);
  const [displayCount, setDisplayCount] = useState(DISPLAY);
  // False on first render (both server and client) so the count line shows
  // initialTotal; flips to true once the full list has been fetched.
  const [listLoaded, setListLoaded] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [platforms, setPlatforms] = useState<{ slug: string; name: string }[]>(initialPlatforms);
  // Reference clock: equals the server render time until hydration, so the
  // first client render computes the same ended-filter and countdown text as
  // the server HTML (hydration-safe). Refreshed after mount.
  const [now, setNow] = useState(initialNow);
  // Full details, fetched lazily per selected item
  const [detailCache, setDetailCache] = useState<Record<string, HackathonDetailData>>({});
  const [loadingDetail, setLoadingDetail] = useState(false);
  // Start empty so the first client render matches the server HTML; the real
  // known set is loaded after hydration in the mount effect below.
  const [knownSet, setKnownSet] = useState<Set<string>>(new Set());
  const [hydrated, setHydrated] = useState(false);
  const [showKnown, setShowKnown] = useState(false);
  const [selectedSources, setSelectedSources] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const listRef = useRef<HTMLDivElement>(null);

  // Hydration-safe mount: read client-only state only after the server HTML
  // has been adopted, so the first client render always matches it.
  useEffect(() => {
    try { setKnownSet(new Set(JSON.parse(localStorage.getItem('known') || '[]'))); } catch {}
    setNow(Date.now());
    // Keep countdowns roughly fresh (per minute is enough for the list)
    const timer = setInterval(() => setNow(Date.now()), 60_000);
    setHydrated(true);
    const sp = new URLSearchParams(window.location.search);
    setFilters({
      prizeMin: sp.get('prizeMin') || '',
      prizeMax: sp.get('prizeMax') || '',
      sortBy: sp.get('sortBy') || 'endDate',
      search: sp.get('search') || '',
    });
    // Back/forward navigation updates the filters from the URL again
    const onPop = () => {
      const q = new URLSearchParams(window.location.search);
      setFilters({
        prizeMin: q.get('prizeMin') || '',
        prizeMax: q.get('prizeMax') || '',
        sortBy: q.get('sortBy') || 'endDate',
        search: q.get('search') || '',
      });
      setDisplayCount(DISPLAY);
    };
    window.addEventListener('popstate', onPop);
    return () => {
      window.removeEventListener('popstate', onPop);
      clearInterval(timer);
    };
  }, []);

  // Fetch the full lightweight list after hydration — the server HTML only
  // carries the first page so the payload stays small for LCP.
  useEffect(() => {
    fetch('/api/hackathons/list')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (Array.isArray(d) && d.length) {
          setAllData(
            d.map((h: any) => ({
              ...h,
              platform: {
                name: h.source.charAt(0).toUpperCase() + h.source.slice(1),
                slug: h.source,
              },
            }))
          );
        }
      })
      .catch(() => {})
      .finally(() => setListLoaded(true));
  }, []);

  // Fetch the selected item's full details on demand
  useEffect(() => {
    if (!selectedId) return;
    if (detailCache[selectedId]) return;
    setLoadingDetail(true);
    fetch(`/api/hackathons/${encodeURIComponent(selectedId)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d && d.sourceId) setDetailCache((c) => ({ ...c, [selectedId]: d }));
      })
      .catch(() => {})
      .finally(() => setLoadingDetail(false));
  }, [selectedId, detailCache]);

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

  const knownCount = allData.filter((h) => knownSet.has(h.sourceId)).length;

  const filtered = allData.filter((h) => {
    // Hide ended hackathons — using `now` (server render time until
    // hydration) so the first client render matches the server HTML
    if (new Date(h.endDate).getTime() < now) return false;
    // Known/unknown filter — applied only after hydration so the first
    // client render matches the server HTML exactly
    if (hydrated) {
      if (showKnown && !knownSet.has(h.sourceId)) return false;
      if (!showKnown && knownSet.has(h.sourceId)) return false;
    }
    if (filters.search) {
      // The list payload only carries title/platform — search those
      const q = filters.search.toLowerCase();
      if (!h.title.toLowerCase().includes(q) && !h.platform.name.toLowerCase().includes(q)) return false;
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

  const selected = (selectedId ? detailCache[selectedId] : null) || null;

  return (
    <div className="space-y-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Discover <ShinyText className="font-bold">Cash Prize</ShinyText> Hackathons</h1>
        <p className="mt-2 text-gray-500">Browse and find upcoming hackathons which <ShinyText className="font-semibold">reward cash</ShinyText> from across the web.</p>
      </div>

      {/* Ad right below the intro — 100px reserved (horizontal format
          request). If the responsive unit renders taller, the container
          grows on ad arrival; watch CLS after deploy. */}
      <AdSlot slot="5128567506" format="horizontal" minHeight={100} />

      {/* Filter controls — data-nosnippet keeps this UI chrome out of Google's
          search snippet (it used to pick "End Date, Prize (High → Low)…") */}
      <div data-nosnippet className="space-y-4">
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
      </div>

      <>
        <p className="text-sm text-gray-500">{listLoaded ? filtered.length : initialTotal} hackathon{listLoaded ? (filtered.length !== 1 ? 's' : '') : (initialTotal !== 1 ? 's' : '')} found</p>

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
                    key={h.sourceId}
                    id={h.sourceId}
                    title={h.title}
                    startDate={h.startDate}
                    endDate={h.endDate}
                    platform={h.platform}
                    prizePool={h.prizePool}
                    selected={selectedId === h.sourceId}
                    onClick={() => setSelectedId(h.sourceId)}
                    now={now}
                  />
                ))}
                {displayCount < filtered.length && (
                  <div className="p-4 text-center text-sm text-gray-400">Loading more...</div>
                )}
              </div>

            <div className="flex w-full sm:w-2/3 flex-col overflow-y-auto">
              {loadingDetail ? (
                <div className="flex h-full flex-col items-center justify-center p-4 text-center text-gray-400">
                  <div className="mb-3 text-5xl">⟳</div>
                  <p className="text-sm">Loading details…</p>
                </div>
              ) : selected ? (
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
                    platform={{ name: selected.source.charAt(0).toUpperCase() + selected.source.slice(1), slug: selected.source }}
                    known={knownSet.has(selected.sourceId)}
                    onMarkKnown={() => toggleKnown(selected.sourceId)}
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
