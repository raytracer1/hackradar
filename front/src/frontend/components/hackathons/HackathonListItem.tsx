interface HackathonListItemProps {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  platform: { name: string; slug: string };
  prizePool: string | null;
  selected: boolean;
  onClick: () => void;
  // Reference clock: the server render time, passed down so the first client
  // render computes the same countdown text as the server (hydration-safe).
  // The client updates it after mount.
  now: number;
}

function formatDate(dateStr: string): string {
  // Fixed UTC so the server (UTC) and any client timezone render the same
  // text — otherwise the same timestamp can land on different days per
  // timezone and break hydration (#418). Data timestamps are UTC anyway.
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
}

function timeLeft(dateStr: string, now: number): string {
  const diff = new Date(dateStr).getTime() - now;
  if (diff < 0) return 'Ended';
  const totalHours = diff / 3600000;
  const days = Math.floor(totalHours / 24);
  const remainingHours = Math.floor(totalHours % 24);
  const minutes = Math.floor((totalHours % 1) * 60);

  if (totalHours < 1) {
    if (minutes === 0) return 'Ends now';
    return `${minutes}m left`;
  }
  if (totalHours < 24) {
    if (remainingHours === 0) return `${minutes}m left`;
    return `${Math.floor(totalHours)}h ${minutes}m left`;
  }
  if (days < 10) {
    return `${days}d ${remainingHours}h left`;
  }
  return `${days}d left`;
}

export default function HackathonListItem({
  title, startDate, endDate, platform, prizePool, selected, onClick, now,
}: HackathonListItemProps) {
  const left = timeLeft(endDate, now);
  const urgent = left.includes('h') || left.includes('m') || left.includes('Ends now');

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
