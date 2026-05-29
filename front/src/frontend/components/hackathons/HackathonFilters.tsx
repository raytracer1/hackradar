'use client';

interface FiltersProps {
  prizeMin: string;
  prizeMax: string;
  sortBy: string;
  onPrizeMinChange: (v: string) => void;
  onPrizeMaxChange: (v: string) => void;
  onSortByChange: (v: string) => void;
  onClear: () => void;
}

const sortOptions = [
  { label: 'End Date', value: 'endDate' },
  { label: 'Prize (High → Low)', value: 'prize-desc' },
  { label: 'Prize (Low → High)', value: 'prize-asc' },
  { label: 'Start Date', value: 'startDate' },
];

export default function HackathonFilters({
  prizeMin, prizeMax, sortBy,
  onPrizeMinChange, onPrizeMaxChange, onSortByChange, onClear,
}: FiltersProps) {
  const hasFilters = prizeMin || prizeMax || sortBy !== 'endDate';

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <span>Prize:</span>
        <input
          type="text"
          placeholder="Min"
          value={prizeMin}
          onChange={(e) => onPrizeMinChange(e.target.value)}
          className="w-20 rounded border border-gray-300 px-2 py-1 text-sm"
        />
        <span>—</span>
        <input
          type="text"
          placeholder="Max"
          value={prizeMax}
          onChange={(e) => onPrizeMaxChange(e.target.value)}
          className="w-20 rounded border border-gray-300 px-2 py-1 text-sm"
        />
      </div>

      <select
        value={sortBy}
        onChange={(e) => onSortByChange(e.target.value)}
        className="rounded border border-gray-300 px-3 py-1.5 text-sm"
      >
        {sortOptions.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>

      {hasFilters && (
        <button onClick={onClear} className="text-sm text-gray-500 hover:text-gray-700">
          Clear
        </button>
      )}
    </div>
  );
}
