import { getHackathonList } from '@/backend/lib/data';
import HomeClient from '@/frontend/components/hackathons/HomeClient';
import JsonLd from '@/frontend/components/seo/JsonLd';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

// FAQ rich results for the skill-matching feature — the feature itself is
// client-side interactive, so this schema is what search engines can read.
const homeStructuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'FAQPage',
      '@id': `${baseUrl}/#faq`,
      mainEntity: [
        {
          '@type': 'Question',
          name: 'How do I find hackathons that match my skills?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'On the HackRadar homepage, open the Skills dropdown and select your skills — from Machine Learning and Web/Full-Stack to Blockchain, Mobile, and more. The hackathon feed then re-ranks by expected return per day: prize pool times skill match times competition, divided by days until the deadline. Matched hackathons show a Match badge with the skills they matched on.',
          },
        },
        {
          '@type': 'Question',
          name: 'Which hackathon should I join to maximize my prize return?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'HackRadar ranks upcoming cash prize hackathons by expected return per day. The score combines the prize pool (normalized to USD), how well the hackathon themes and description match your selected skills, the number of participants (competition), and the days left until the deadline — so a huge prize far in the future is honestly discounted against a smaller prize you could win sooner.',
          },
        },
        {
          '@type': 'Question',
          name: 'Does HackRadar require an account to use skill matching?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'No. Skill matching is free and requires no signup. Your selected skills are saved locally in your browser, and hackathons you marked as Known are excluded from the recommendations automatically.',
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
    <>
      <JsonLd data={homeStructuredData} />
      <HomeClient
        initialData={initialData}
        initialTotal={upcoming.length}
        initialPlatforms={initialPlatforms}
        initialNow={now}
      />
    </>
  );
}
