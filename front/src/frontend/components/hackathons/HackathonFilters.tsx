'use client';

interface FiltersProps {
  prizeMin: string;
  prizeMax: string;
  sortBy: string;
  platforms: { slug: string; name: string }[];
  selectedSources: Set<string>;
  onPrizeMinChange: (v: string) => void;
  onPrizeMaxChange: (v: string) => void;
  onSortByChange: (v: string) => void;
  onSourceToggle: (slug: string) => void;
}

const sortOptions = [
  { label: 'End Date', value: 'endDate' },
  { label: 'Prize (High → Low)', value: 'prize-desc' },
  { label: 'Prize (Low → High)', value: 'prize-asc' },
  { label: 'Start Date', value: 'startDate' },
];

export default function HackathonFilters({
  prizeMin, prizeMax, sortBy, platforms, selectedSources,
  onPrizeMinChange, onPrizeMaxChange, onSortByChange, onSourceToggle,
}: FiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Source filter */}
      {platforms.length > 0 && (
        <div className="flex items-center gap-1">
          {platforms.map((p) => {
            const active = !selectedSources.has(p.slug);
            return (
              <button
                key={p.slug}
                onClick={() => onSourceToggle(p.slug)}
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

      {/* Prize range */}
      <div className="flex h-10 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">$</span>
        <input
          type="text" placeholder="Min"
          value={prizeMin} onChange={(e) => onPrizeMinChange(e.target.value)}
          className="w-16 text-xs text-slate-700 placeholder-slate-300 outline-none bg-transparent"
        />
        <span className="text-slate-300">–</span>
        <input
          type="text" placeholder="Max"
          value={prizeMax} onChange={(e) => onPrizeMaxChange(e.target.value)}
          className="w-16 text-xs text-slate-700 placeholder-slate-300 outline-none bg-transparent"
        />
      </div>

      {/* Sort */}
      <select
        value={sortBy}
        onChange={(e) => onSortByChange(e.target.value)}
        className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
      >
        {sortOptions.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>

    </div>
  );
}
