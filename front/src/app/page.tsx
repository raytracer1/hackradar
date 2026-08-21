import { getHackathonList } from '@/backend/lib/data';
import HomeClient from '@/frontend/components/hackathons/HomeClient';
import JsonLd from '@/frontend/components/seo/JsonLd';

// Homepage FAQ — answers must match the visible FAQ section below exactly
// (Google's requirement for FAQPage rich results).
const homeFaqStructuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'Are all hackathons on HackRadar cash prize hackathons?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. HackRadar only lists hackathons that offer real cash prizes. Events with swag-only rewards, "exposure" prizes, or no money at all are excluded — and you can narrow the feed further with the minimum and maximum prize filters.',
          },
        },
        {
          '@type': 'Question',
          name: 'How often is the hackathon list updated?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'The crawler refreshes every source on a regular schedule throughout the day, and ended hackathons are hidden automatically. New hackathons appear in the feed as soon as their source platform publishes them.',
          },
        },
        {
          '@type': 'Question',
          name: 'Can I filter hackathons by prize amount?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. Set a minimum prize (say $5,000) to hide smaller events, a maximum to find less competitive ones, and sort by prize amount or deadline. You can also search across titles and descriptions and toggle individual platforms on and off.',
          },
        },
        {
          '@type': 'Question',
          name: 'Do I need an account to use HackRadar?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'No. HackRadar is completely free with no signup and no email required — just open the site and browse upcoming cash prize hackathons from 14 platforms.',
          },
        },
      ],
    },
  ],
};

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

      {/* FAQ — visible text mirrors the FAQPage JSON-LD above */}
      <section className="mx-auto mt-12 max-w-3xl">
        <h2 className="text-2xl font-bold text-gray-900">Frequently Asked Questions</h2>
        <div className="mt-4 space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Are all hackathons on HackRadar cash prize hackathons?
            </h3>
            <p className="mt-1 text-gray-600">
              Yes. HackRadar only lists hackathons that offer real cash prizes. Events with
              swag-only rewards, "exposure" prizes, or no money at all are excluded — and you can
              narrow the feed further with the minimum and maximum prize filters.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              How often is the hackathon list updated?
            </h3>
            <p className="mt-1 text-gray-600">
              The crawler refreshes every source on a regular schedule throughout the day, and
              ended hackathons are hidden automatically. New hackathons appear in the feed as soon
              as their source platform publishes them.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Can I filter hackathons by prize amount?
            </h3>
            <p className="mt-1 text-gray-600">
              Yes. Set a minimum prize (say $5,000) to hide smaller events, a maximum to find less
              competitive ones, and sort by prize amount or deadline. You can also search across
              titles and descriptions and toggle individual platforms on and off.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Do I need an account to use HackRadar?
            </h3>
            <p className="mt-1 text-gray-600">
              No. HackRadar is completely free with no signup and no email required — just open the
              site and browse upcoming cash prize hackathons from 14 platforms.
            </p>
          </div>
        </div>
      </section>

      <JsonLd data={homeFaqStructuredData} />
    </>
  );
}
