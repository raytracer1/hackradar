'use client';

import Select from '@/frontend/components/ui/Select';

interface HackathonFiltersProps {
  mode: string;
  platform: string;
  sortBy: string;
  platforms: { slug: string; name: string }[];
  onModeChange: (v: string) => void;
  onPlatformChange: (v: string) => void;
  onSortByChange: (v: string) => void;
  onClear: () => void;
}

const modeOptions = [
  { label: 'All Modes', value: '' },
  { label: 'Online', value: 'online' },
  { label: 'Offline', value: 'offline' },
  { label: 'Hybrid', value: 'hybrid' },
];

const sortOptions = [
  { label: 'Start Date', value: 'startDate' },
  { label: 'End Date', value: 'endDate' },
  { label: 'Newest', value: 'createdAt' },
];

export default function HackathonFilters({ mode, platform, sortBy, platforms, onModeChange, onPlatformChange, onSortByChange, onClear }: HackathonFiltersProps) {
  const platformOptions = [
    { label: 'All Platforms', value: '' },
    ...platforms.map((p) => ({ label: p.name, value: p.slug })),
  ];

  const hasFilters = mode || platform || sortBy !== 'startDate';

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Select value={mode} onChange={onModeChange} options={modeOptions} placeholder="Mode" />
      <Select value={platform} onChange={onPlatformChange} options={platformOptions} placeholder="Platform" />
      <Select value={sortBy} onChange={onSortByChange} options={sortOptions} />

      {hasFilters && (
        <button onClick={onClear} className="text-sm text-gray-500 hover:text-gray-700">
          Clear filters
        </button>
      )}
    </div>
  );
}
