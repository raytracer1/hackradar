import HackathonDateBadge from './HackathonDateBadge';

interface HackathonDetailProps {
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
  known: boolean;
  onMarkKnown: () => void;
}

export default function HackathonDetail({
  title, description, about, whatToBuild, whatToSubmit, prizesDetail, eligibility,
  url, imageUrl, startDate, endDate,
  timezone, prizePool, themes, platform, known, onMarkKnown,
}: HackathonDetailProps) {
  const themeList: string[] = Array.isArray(themes) ? themes : (() => {
    if (!themes || themes === '[]') return [];
    try { return JSON.parse(themes as string); } catch { return []; }
  })();

  return (
    <article className="flex flex-col animate-fade-up">
      <div className="flex items-start gap-3">
        {imageUrl && (
          <img src={imageUrl} alt={title} className="h-36 w-36 rounded-xl object-cover ring-2 ring-slate-100 flex-shrink-0" />
        )}
        <button
          onClick={onMarkKnown}
          className={`flex-shrink-0 rounded-lg px-2.5 py-1 text-base font-medium transition ml-auto ${
            known ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600'
          }`}
        >
          {known ? '✕ Unknown' : '+ Know'}
        </button>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <span className="inline-flex items-center gap-1 rounded-lg bg-indigo-50 px-2.5 py-1 text-sm font-medium text-indigo-600">
          {platform.name}
        </span>
      </div>

      <h2 className="mt-3 text-2xl font-bold tracking-tight text-slate-900">{title}</h2>

      <div className="mt-4 grid gap-[12px] rounded-2xl border border-slate-200 bg-slate-50/50 p-[12px] sm:grid-cols-2">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Dates</span>
          <p className="mt-1 text-base text-slate-700">
            <HackathonDateBadge startDate={startDate} endDate={endDate} />
          </p>
        </div>
        {prizePool && (
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Prize Pool</span>
            <p className="mt-1 text-lg font-bold text-emerald-600">{prizePool}</p>
          </div>
        )}
        {eligibility && (
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Who can participate</span>
            <p className="mt-1 text-sm leading-relaxed text-slate-700 whitespace-pre-wrap">{eligibility}</p>
          </div>
        )}
      </div>

      {themeList.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {themeList.map((t) => (
            <span key={t} className="rounded-full bg-indigo-50 px-2.5 py-1 text-sm font-medium text-indigo-600">{t}</span>
          ))}
        </div>
      )}

      {(description || about || whatToBuild || whatToSubmit || prizesDetail) && (
        <div className="mt-4 space-y-4">
          {(description || about) && (
            <div>
              <h3 className="mb-1 text-sm font-semibold text-slate-900">About the Challenge</h3>
              <div className="text-sm leading-relaxed text-slate-600 whitespace-pre-wrap">{description || about}</div>
            </div>
          )}
          {whatToBuild && (
            <div>
              <h3 className="mb-1 text-sm font-semibold text-slate-900">What to Build</h3>
              <div className="text-sm leading-relaxed text-slate-600 whitespace-pre-wrap">{whatToBuild}</div>
            </div>
          )}
          {whatToSubmit && (
            <div>
              <h3 className="mb-1 text-sm font-semibold text-slate-900">What to Submit</h3>
              <div className="text-sm leading-relaxed text-slate-600 whitespace-pre-wrap">{whatToSubmit}</div>
            </div>
          )}
          {prizesDetail && (
            <div>
              <h3 className="mb-1 text-sm font-semibold text-slate-900">Prizes</h3>
              <div className="text-sm leading-relaxed text-slate-600 whitespace-pre-wrap">{prizesDetail}</div>
            </div>
          )}
        </div>
      )}

      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 inline-flex w-full flex-shrink-0 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-indigo-700 hover:shadow-md active:scale-[0.98]"
      >
        Apply on {platform.name}
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      </a>
    </article>
  );
}
