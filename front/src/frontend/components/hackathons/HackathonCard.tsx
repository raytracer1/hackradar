import Card from '@/frontend/components/ui/Card';
import Badge from '@/frontend/components/ui/Badge';
import HackathonStatusBadge from './HackathonStatusBadge';
import HackathonDateBadge from './HackathonDateBadge';

interface HackathonCardProps {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  mode: string;
  startDate: string;
  endDate: string;
  prizePool: string | null;
  themes: string;
  platform: { name: string; slug: string };
}

export default function HackathonCard({ id, title, description, mode, startDate, endDate, prizePool, themes, platform }: HackathonCardProps) {
  const themeList: string[] = JSON.parse(themes || '[]');

  return (
    <Card href={`/hackathons/${id}`} className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <HackathonStatusBadge mode={mode} />
        <span className="text-xs text-gray-400">{platform.name}</span>
      </div>

      <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{title}</h3>

      {description && (
        <p className="text-sm text-gray-500 line-clamp-2">{description}</p>
      )}

      <HackathonDateBadge startDate={startDate} endDate={endDate} />

      <div className="flex flex-wrap items-center gap-2">
        {prizePool && (
          <span className="text-sm font-medium text-amber-600">{prizePool}</span>
        )}
        {themeList.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {themeList.slice(0, 3).map((t) => (
              <Badge key={t}>{t}</Badge>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
