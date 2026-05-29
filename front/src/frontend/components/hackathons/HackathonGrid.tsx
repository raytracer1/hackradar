import HackathonCard from './HackathonCard';

interface HackathonData {
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

export default function HackathonGrid({ hackathons }: { hackathons: HackathonData[] }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {hackathons.map((h) => (
        <HackathonCard key={h.id} {...h} />
      ))}
    </div>
  );
}
