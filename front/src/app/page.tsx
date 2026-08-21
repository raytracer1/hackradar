import { getHackathonList } from '@/backend/lib/data';
import HomeClient from '@/frontend/components/hackathons/HomeClient';

// ISR with a long safety-net window: the crawler notifies us via
// /api/internal/revalidate to refresh immediately after each upload.
// This 24h fallback only fires if that notification ever fails.
export const revalidate = 86400;

export default async function Home() {
  const list = await getHackathonList();

  // The render time: passed to the client so its first render (ended filter,
  // countdowns) matches the server HTML exactly — no hydration mismatch.
  const now = Date.now();

  // Server HTML carries only the first page of items (the full list is
  // fetched client-side after mount) — keeps the homepage payload small for
  // LCP. Must mirror HomeClient's initial computation exactly: ended filter,
  // then endDate ascending. Keep 20 in sync with DISPLAY in HomeClient.tsx.
  const upcoming = list
    .filter((h) => new Date(h.endDate).getTime() >= now)
    .sort((a, b) => String(a.endDate || '').localeCompare(String(b.endDate || '')));

  const initialData = upcoming.slice(0, 20).map((h) => ({
    ...h,
    platform: {
      name: h.source.charAt(0).toUpperCase() + h.source.slice(1),
      slug: h.source,
    },
  }));

  const seen = new Set<string>();
  const initialPlatforms = list
    .filter((h) => {
      if (seen.has(h.source)) return false;
      seen.add(h.source);
      return true;
    })
    .map((h) => ({
      name: h.source.charAt(0).toUpperCase() + h.source.slice(1),
      slug: h.source,
    }));

  return (
    <HomeClient
      initialData={initialData}
      initialTotal={upcoming.length}
      initialPlatforms={initialPlatforms}
      initialNow={now}
    />
  );
}
