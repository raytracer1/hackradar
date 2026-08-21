import Link from 'next/link';
import { getHackathonList } from '@/backend/lib/data';
import HomeClient from '@/frontend/components/hackathons/HomeClient';

// ISR with a long safety-net window: the crawler notifies us via
// /api/internal/revalidate to refresh immediately after each upload.
// This 24h fallback only fires if that notification ever fails.
export const revalidate = 86400;

export default async function Home() {
  const list = await getHackathonList();

  const initialData = list.map((h) => ({
    ...h,
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

  // The render time: passed to the client so its first render (ended filter,
  // countdowns) matches the server HTML exactly — no hydration mismatch.
  return (
    <>
      <HomeClient initialData={initialData} initialPlatforms={initialPlatforms} initialNow={Date.now()} />

      {/* From the blog — server-rendered links that pass link equity from the
          homepage to the blog posts */}
      <section className="mx-auto mt-10 max-w-3xl text-center">
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
          From the HackRadar Blog
        </p>
        <div className="mt-3 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm">
          <Link
            href="/blog/biggest-cash-prize-hackathons"
            className="font-medium text-gray-700 transition-colors hover:text-indigo-600"
          >
            The Biggest Cash Prize Hackathons Right Now
          </Link>
          <Link
            href="/blog/how-to-win-cash-prize-hackathons"
            className="font-medium text-gray-700 transition-colors hover:text-indigo-600"
          >
            How to Win Cash Prize Hackathons
          </Link>
          <Link
            href="/blog/introducing-hackradar"
            className="font-medium text-gray-700 transition-colors hover:text-indigo-600"
          >
            Introducing HackRadar
          </Link>
        </div>
      </section>
    </>
  );
}
