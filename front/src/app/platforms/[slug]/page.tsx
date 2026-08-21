import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCurrentHackathons } from '@/backend/lib/data';
import { getPlatformBySlug, PLATFORMS } from '@/backend/lib/platforms';
import JsonLd from '@/frontend/components/seo/JsonLd';

// ISR with the same 24h safety net as the homepage: the crawler's revalidate
// notification deletes this page's cache entry right after each upload.
export const revalidate = 86400;

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

function fmtDate(s: string): string {
  const d = new Date(s);
  if (isNaN(d.getTime())) return s;
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const platform = getPlatformBySlug(slug);
  if (!platform) return {};

  const url = `${baseUrl}/platforms/${slug}`;
  const title = `${platform.name} Hackathons with Cash Prizes`;
  const description = `Browse upcoming ${platform.name} hackathons with cash prizes. ${platform.tagline}. Filter by prize amount and deadline — updated regularly by HackRadar.`;

  return {
    metadataBase: new URL(baseUrl),
    title,
    description,
    openGraph: {
      type: 'website',
      locale: 'en_US',
      siteName: 'HackRadar',
      title,
      description,
      url,
      images: [
        {
          url: '/og-default.png',
          width: 1200,
          height: 630,
          alt: `${platform.name} hackathons with cash prizes`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/og-default.png'],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    alternates: {
      canonical: url,
    },
  };
}

export default async function PlatformPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const platform = getPlatformBySlug(slug);
  if (!platform) notFound();

  const now = Date.now();
  // Full chunks (not the lightweight list) — the list payload has no `url`
  // field, and each entry here links out to the hackathon's own page.
  const hackathons = (await getCurrentHackathons())
    .filter((h) => h.source === slug)
    .filter((h) => new Date(h.endDate).getTime() >= now)
    .sort((a, b) => String(a.endDate || '').localeCompare(String(b.endDate || '')));

  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'HackRadar', item: baseUrl },
          { '@type': 'ListItem', position: 2, name: 'Platforms', item: `${baseUrl}/platforms` },
          { '@type': 'ListItem', position: 3, name: platform.name, item: `${baseUrl}/platforms/${slug}` },
        ],
      },
      {
        '@type': 'ItemList',
        name: `${platform.name} Hackathons with Cash Prizes`,
        itemListElement: hackathons.slice(0, 20).map((h, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: h.title,
          url: h.url,
        })),
      },
    ],
  };

  return (
    <>
      <JsonLd data={structuredData} />
      <div className="mx-auto max-w-3xl py-8">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-8">
          <ol className="flex items-center gap-2 text-sm text-gray-400">
            <li>
              <Link href="/" className="hover:text-indigo-600 transition-colors">
                Home
              </Link>
            </li>
            <span aria-hidden="true">/</span>
            <li>
              <Link href="/platforms" className="hover:text-indigo-600 transition-colors">
                Platforms
              </Link>
            </li>
            <span aria-hidden="true">/</span>
            <li>
              <span className="text-gray-600">{platform.name}</span>
            </li>
          </ol>
        </nav>

        {/* Header */}
        <header>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            {platform.name} Hackathons with{' '}
            <span className="bg-gradient-to-r from-indigo-600 to-indigo-500 bg-clip-text text-transparent">
              Cash Prizes
            </span>
          </h1>
          <p className="mt-3 text-lg text-gray-500">
            {platform.tagline}. Every {platform.name} hackathon below offers real money rewards.
          </p>
          <p className="mt-2 text-sm text-gray-400">
            {hackathons.length} upcoming hackathon{hackathons.length !== 1 ? 's' : ''} · updated
            regularly by the HackRadar crawler
          </p>
        </header>

        <hr className="mt-8 border-gray-200" />

        {/* List */}
        {hackathons.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-gray-200 bg-white p-10 text-center">
            <div className="mb-3 text-4xl">🔭</div>
            <p className="font-semibold text-gray-900">
              No upcoming {platform.name} hackathons right now
            </p>
            <p className="mt-1 text-sm text-gray-500">
              The list refreshes throughout the day — check back soon, or browse other platforms.
            </p>
          </div>
        ) : (
          <ul className="mt-8 space-y-4">
            {hackathons.map((h) => (
              <li
                key={h.sourceId}
                className="rounded-2xl border border-gray-200 bg-white p-5 transition hover:border-indigo-300"
              >
                <a
                  href={h.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-lg font-semibold text-gray-900 hover:text-indigo-600 transition-colors"
                >
                  {h.title}
                </a>
                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
                  <span>
                    {fmtDate(h.startDate)} – {fmtDate(h.endDate)}
                  </span>
                  {h.prizePool && (
                    <span className="font-medium text-emerald-600">{h.prizePool}</span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}

        {/* Cross links */}
        <div className="mt-12 flex flex-wrap items-center gap-3 text-sm">
          <Link
            href="/platforms"
            className="rounded-xl border border-gray-200 bg-white px-4 py-2 font-medium text-gray-700 transition hover:border-indigo-300 hover:text-indigo-600"
          >
            View all {PLATFORMS.length} platforms
          </Link>
          <Link
            href="/"
            className="rounded-xl border border-gray-200 bg-white px-4 py-2 font-medium text-gray-700 transition hover:border-indigo-300 hover:text-indigo-600"
          >
            Browse all cash prize hackathons
          </Link>
        </div>
      </div>
    </>
  );
}
