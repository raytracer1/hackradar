import HackathonDateBadge from './HackathonDateBadge';
import Badge from '@/frontend/components/ui/Badge';

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
}

export default function HackathonDetail({
  title,
  description,
  url,
  imageUrl,
  mode,
  location,
  startDate,
  endDate,
  timezone,
  prizePool,
  themes,
  platform,
}: HackathonDetailProps) {
  const themeList: string[] = Array.isArray(themes) ? themes : (() => {
    if (!themes || themes === '[]') return [];
    try { return JSON.parse(themes as string); } catch { return []; }
  })();

  return (
    <article className="mx-auto max-w-3xl">
      {imageUrl && (
        <img
          src={imageUrl}
          alt={title}
          className="mb-8 w-full rounded-xl object-cover shadow-md"
          style={{ maxHeight: 400 }}
        />
      )}

      <div className="mb-6 flex items-center gap-3">
        <span className="text-sm text-gray-500">via {platform.name}</span>
      </div>

      <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">{title}</h1>

      <div className="mt-6 grid gap-4 rounded-xl border border-gray-200 bg-gray-50 p-5 sm:grid-cols-2">
        <div>
          <span className="text-xs font-medium uppercase text-gray-500">Dates</span>
          <p className="mt-0.5">
            <HackathonDateBadge startDate={startDate} endDate={endDate} />
          </p>
          {timezone && <p className="text-xs text-gray-400">{timezone}</p>}
        </div>
        <div>
          <span className="text-xs font-medium uppercase text-gray-500">Location</span>
          <p className="mt-0.5 text-sm text-gray-700">{location || 'Online'}</p>
        </div>
        {prizePool && (
          <div>
            <span className="text-xs font-medium uppercase text-gray-500">Prize Pool</span>
            <p className="mt-0.5 text-lg font-semibold text-amber-600">{prizePool}</p>
          </div>
        )}
        <div>
          <span className="text-xs font-medium uppercase text-gray-500">Platform</span>
          <p className="mt-0.5 text-sm text-gray-700 capitalize">{platform.name}</p>
        </div>
      </div>

      {themeList.length > 0 && (
        <div className="mt-5 flex flex-wrap gap-1.5">
          {themeList.map((t) => (
            <Badge key={t}>{t}</Badge>
          ))}
        </div>
      )}

      {description && (
        <div className="mt-8">
          <h2 className="mb-3 text-xl font-semibold text-gray-900">About this hackathon</h2>
          <div className="prose prose-gray max-w-none text-gray-600 whitespace-pre-wrap">{description}</div>
        </div>
      )}

      <div className="mt-10">
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center rounded-lg bg-primary-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-primary-700 transition-colors"
        >
          Apply on {platform.name}
          <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>
    </article>
  );
}
