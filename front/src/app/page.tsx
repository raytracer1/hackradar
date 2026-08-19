import { getCurrentHackathons } from '@/backend/lib/data';
import HomeClient from '@/frontend/components/hackathons/HomeClient';

// ISR with a long safety-net window: the crawler notifies us via
// /api/internal/revalidate to refresh immediately after each upload.
// This 24h fallback only fires if that notification ever fails.
export const revalidate = 86400;

export default async function Home() {
  const hackathons = await getCurrentHackathons();

  const initialData = hackathons.map((h) => ({
    ...h,
    id: h.sourceId,
    platform: {
      name: h.source.charAt(0).toUpperCase() + h.source.slice(1),
      slug: h.source,
    },
  }));

  const seen = new Set<string>();
  const initialPlatforms = initialData
    .filter((h) => {
      if (seen.has(h.platform.slug)) return false;
      seen.add(h.platform.slug);
      return true;
    })
    .map((h) => h.platform);

  return <HomeClient initialData={initialData} initialPlatforms={initialPlatforms} />;
}
