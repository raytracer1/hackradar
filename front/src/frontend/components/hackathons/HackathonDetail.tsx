import HackathonDateBadge from './HackathonDateBadge';

interface HackathonDetailProps {
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
  known: boolean;
  onMarkKnown: () => void;
}

export default function HackathonDetail({
  title, description, url, imageUrl, mode, location, startDate, endDate,
  timezone, prizePool, themes, platform, known, onMarkKnown,
}: HackathonDetailProps) {
  const themeList: string[] = Array.isArray(themes) ? themes : (() => {
    if (!themes || themes === '[]') return [];
    try { return JSON.parse(themes as string); } catch { return []; }
  })();

  return (
    <article className="mx-auto max-w-2xl animate-fade-up">
      <div className="flex items-start gap-3 mb-6">
        {imageUrl && (
          <img src={imageUrl} alt={title} className="h-16 w-16 rounded-xl object-cover ring-2 ring-slate-100 flex-shrink-0" />
        )}
        <button
          onClick={onMarkKnown}
          className={`flex-shrink-0 rounded-lg px-2.5 py-1 text-[11px] font-medium transition ml-auto ${
            known ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600'
          }`}
        >
          {known ? '✕ Unknown' : '+ Know'}
        </button>
      </div>

      <div className="mb-5 flex items-center gap-3">
        <span className="inline-flex items-center gap-1 rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-600">
          {platform.name}
        </span>
      </div>

      <h2 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h2>

      <div className="mt-5 grid gap-3 rounded-2xl border border-slate-200 bg-slate-50/50 p-4 sm:grid-cols-2">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Dates</span>
          <p className="mt-0.5 text-sm text-slate-700">
            <HackathonDateBadge startDate={startDate} endDate={endDate} />
          </p>
        </div>
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Location</span>
          <p className="mt-0.5 text-sm text-slate-700">{location || 'Online'}</p>
        </div>
        {prizePool && (
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Prize Pool</span>
            <p className="mt-0.5 text-lg font-bold text-amber-600">{prizePool}</p>
          </div>
        )}
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Mode</span>
          <p className="mt-0.5 text-sm capitalize text-slate-700">{mode}</p>
        </div>
      </div>

      {themeList.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {themeList.map((t) => (
            <span key={t} className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-[11px] font-medium text-indigo-600">{t}</span>
          ))}
        </div>
      )}

      {description && (
        <div className="mt-6">
          <h2 className="mb-2 text-sm font-semibold text-slate-900">About</h2>
          <div className="text-sm leading-relaxed text-slate-600 whitespace-pre-wrap">{description}</div>
        </div>
      )}

      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-indigo-700 hover:shadow-md active:scale-[0.98]"
      >
        Apply on {platform.name}
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      </a>
    </article>
  );
}
