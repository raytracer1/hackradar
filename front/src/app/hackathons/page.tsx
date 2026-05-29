import { listHackathons } from '@/backend/services/hackathon-service';
import { listPlatforms } from '@/backend/services/platform-service';
import HackathonListClient from '@/app/_components/HackathonListClient';

export default async function HackathonsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const params = new URLSearchParams();
  Object.entries(sp).forEach(([k, v]) => {
    if (v) params.set(k, v);
  });

  const [result, platforms] = await Promise.all([
    listHackathons(params),
    listPlatforms(),
  ]);

  return (
    <HackathonListClient
      data={result.data}
      pagination={result.pagination}
      platforms={platforms.map((p) => ({ slug: p.slug, name: p.name }))}
      initialParams={sp}
    />
  );
}
