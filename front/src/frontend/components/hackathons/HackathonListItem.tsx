interface HackathonListItemProps {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  platform: { name: string; slug: string };
  prizePool: string | null;
  selected: boolean;
  onClick: () => void;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function timeLeft(dateStr: string): string {
  const diff = new Date(dateStr).getTime() - Date.now();
  if (diff < 0) return 'Ended';
  const hours = diff / 3600000;
  if (hours < 24) {
    const h = Math.floor(hours);
    const m = Math.floor((hours - h) * 60);
    if (h === 0 && m === 0) return 'Ends now';
    if (h === 0) return `${m}m left`;
    return `${h}h ${m}m left`;
  }
  return `${Math.floor(hours / 24)}d left`;
}

export default function HackathonListItem({
  title, startDate, endDate, platform, prizePool, selected, onClick,
}: HackathonListItemProps) {
  const left = timeLeft(endDate);
  const urgent = left.includes('h') || left.includes('m') || left === 'Ends now';

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group w-full px-4 py-4 text-left transition-all duration-150 border-b border-slate-400 last:border-b-0 hover:bg-slate-50 ${
        selected ? 'border-l-[3px] border-l-indigo-600 bg-indigo-50/60 pl-[13px]' : 'border-l-[3px] border-l-transparent'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <span className={`text-lg font-medium line-clamp-2 ${selected ? 'text-indigo-700' : 'text-slate-900 group-hover:text-slate-950'}`}>
          {title}
        </span>
      </div>
      <div className="mt-2 flex items-center gap-2 flex-wrap">
        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-sm font-medium text-slate-700">
          {platform.name}
        </span>
        <span className="text-sm text-slate-500">{formatDate(startDate)} – {formatDate(endDate)}</span>
        {prizePool && (
          <span className="text-sm font-semibold text-emerald-600">{prizePool}</span>
        )}
        <span className={`text-sm font-medium ml-auto ${urgent ? 'text-red-600' : 'text-slate-500'}`}>
          {left}
        </span>
      </div>
    </button>
  );
}
