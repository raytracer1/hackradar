import HackathonStatusBadge from './HackathonStatusBadge';

interface HackathonListItemProps {
  id: string;
  title: string;
  mode: string;
  startDate: string;
  endDate: string;
  platform: { name: string; slug: string };
  prizePool: string | null;
  selected: boolean;
  onClick: () => void;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

export default function HackathonListItem({
  title,
  mode,
  startDate,
  endDate,
  platform,
  prizePool,
  selected,
  onClick,
}: HackathonListItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full cursor-pointer border-b border-gray-100 px-4 py-3 text-left transition hover:bg-gray-50 ${
        selected ? 'border-l-2 border-l-primary-600 bg-blue-50 font-semibold' : ''
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium text-gray-900 line-clamp-1">{title}</span>
        <HackathonStatusBadge mode={mode} />
      </div>
      <div className="mt-1 flex items-center gap-3 text-xs text-gray-500">
        <span>{platform.name}</span>
        <span>{formatDate(startDate)} — {formatDate(endDate)}</span>
        {prizePool && <span className="font-medium text-amber-600">{prizePool}</span>}
      </div>
    </button>
  );
}
