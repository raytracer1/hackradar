import type { Metadata } from 'next';
import Link from 'next/link';
import { getCurrentHackathons } from '@/backend/lib/data';
import JsonLd from '@/frontend/components/seo/JsonLd';

// ISR with the same 24h safety net as the homepage. The crawler's revalidate
// notification deletes this page's cache entry too, so the ranking refreshes
// with every data upload.
export const revalidate = 86400;

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
const postUrl = `${baseUrl}/blog/biggest-cash-prize-hackathons`;
const ogImage = `${baseUrl}/og-default.png`;

const TOP_N = 10;

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: 'The Biggest Cash Prize Hackathons Right Now',
  description:
    'A live ranking of the biggest cash prize hackathons open right now, updated automatically by the HackRadar crawler. Sort by prize pool, deadline, and platform.',
  keywords: [
    'biggest cash prize hackathons',
    'largest hackathon prize pools',
    'highest paying hackathons',
    'cash prize hackathons',
    'hackathon prize money',
    'top hackathons',
  ],
  openGraph: {
    type: 'article',
    locale: 'en_US',
    siteName: 'HackRadar',
    title: 'The Biggest Cash Prize Hackathons Right Now',
    description:
      'A live ranking of the biggest cash prize hackathons open right now, updated automatically by the HackRadar crawler.',
    url: postUrl,
    publishedTime: '2026-08-21T00:00:00.000Z',
    modifiedTime: '2026-08-21T00:00:00.000Z',
    authors: ['HackRadar'],
    images: [
      {
        url: ogImage,
        width: 1200,
        height: 630,
        alt: 'The biggest cash prize hackathons right now',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The Biggest Cash Prize Hackathons Right Now',
    description:
      'A live ranking of the biggest cash prize hackathons open right now, updated automatically by the HackRadar crawler.',
    images: [ogImage],
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
    canonical: postUrl,
  },
};

function parsePrize(text: string | null): number {
  if (!text) return 0;
  const m = text.replace(/[$,]/g, '').match(/[\d.]+/);
  return m ? parseFloat(m[0]) : 0;
}

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

export default async function BiggestPrizePoolsPost() {
  const now = Date.now();
  const top = (await getCurrentHackathons())
    .filter((h) => new Date(h.endDate).getTime() >= now)
    .filter((h) => parsePrize(h.prizePool) > 0)
    .sort((a, b) => parsePrize(b.prizePool) - parsePrize(a.prizePool))
    .slice(0, TOP_N);

  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'HackRadar', item: baseUrl },
          { '@type': 'ListItem', position: 2, name: 'Blog', item: `${baseUrl}/blog` },
          {
            '@type': 'ListItem',
            position: 3,
            name: 'Biggest Cash Prize Hackathons',
            item: postUrl,
          },
        ],
      },
      {
        '@type': 'BlogPosting',
        '@id': `${postUrl}/#article`,
        url: postUrl,
        headline: 'The Biggest Cash Prize Hackathons Right Now',
        description:
          'A live ranking of the biggest cash prize hackathons open right now, updated automatically by the HackRadar crawler.',
        datePublished: '2026-08-21T00:00:00.000Z',
        dateModified: '2026-08-21T00:00:00.000Z',
        author: { '@type': 'Organization', name: 'HackRadar', url: baseUrl },
        publisher: {
          '@type': 'Organization',
          name: 'HackRadar',
          url: baseUrl,
          logo: { '@type': 'ImageObject', url: ogImage },
        },
        image: { '@type': 'ImageObject', url: ogImage, width: 1200, height: 630 },
        mainEntityOfPage: { '@type': 'WebPage', '@id': postUrl },
        isPartOf: {
          '@type': 'Blog',
          '@id': `${baseUrl}/blog/#blog`,
          name: 'HackRadar Blog',
          url: `${baseUrl}/blog`,
        },
        inLanguage: 'en-US',
        about: [
          { '@type': 'Thing', name: 'Hackathons' },
          { '@type': 'Thing', name: 'Cash Prizes' },
        ],
      },
      {
        '@type': 'ItemList',
        name: 'Biggest Cash Prize Hackathons',
        itemListElement: top.map((h, i) => ({
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
      <div className="mx-auto max-w-3xl py-12">
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
              <Link href="/blog" className="hover:text-indigo-600 transition-colors">
                Blog
              </Link>
            </li>
            <span aria-hidden="true">/</span>
            <li>
              <span className="text-gray-600">Biggest Cash Prize Hackathons</span>
            </li>
          </ol>
        </nav>

        {/* Header */}
        <header>
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
            The Biggest{' '}
            <span className="bg-gradient-to-r from-emerald-600 to-emerald-500 bg-clip-text text-transparent">
              Cash Prize
            </span>{' '}
            Hackathons Right Now
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-gray-500">
            The {TOP_N} largest prize pools currently open across all platforms tracked by
            HackRadar. This ranking is generated live from the crawler's data and refreshes
            automatically every time a new hackathon is indexed.
          </p>

          {/* Meta */}
          <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-gray-400">
            <time dateTime="2026-08-21">August 21, 2026</time>
            <span aria-hidden="true">·</span>
            <span>Auto-updating ranking</span>
            <span aria-hidden="true">·</span>
            <span>HackRadar Team</span>
          </div>
        </header>

        <hr className="mt-8 border-gray-200" />

        {/* Ranking */}
        <ol className="mt-8 space-y-4">
          {top.map((h, i) => (
            <li
              key={h.sourceId}
              className="flex items-start gap-4 rounded-2xl border border-gray-200 bg-white p-5 transition hover:border-indigo-300"
            >
              <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-indigo-50 text-sm font-bold text-indigo-600">
                {i + 1}
              </span>
              <div className="min-w-0">
                <a
                  href={h.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-lg font-semibold text-gray-900 hover:text-indigo-600 transition-colors"
                >
                  {h.title}
                </a>
                <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
                  {h.prizePool && (
                    <span className="font-medium text-emerald-600">{h.prizePool}</span>
                  )}
                  <span>Deadline: {fmtDate(h.endDate)}</span>
                  <span className="text-gray-400 capitalize">{h.source}</span>
                </div>
              </div>
            </li>
          ))}
        </ol>

        {top.length === 0 && (
          <p className="mt-8 rounded-2xl border border-gray-200 bg-white p-8 text-center text-gray-500">
            No cash prize hackathons right now — check back soon, the ranking refreshes
            automatically.
          </p>
        )}

        {/* CTA */}
        <div className="mt-12 rounded-2xl border border-indigo-200 bg-indigo-50/50 px-6 py-8 text-center">
          <p className="text-xl font-bold text-gray-900">
            Want the full list, filterable by prize range?
          </p>
          <p className="mt-2 text-gray-600">
            Browse every upcoming cash prize hackathon, with min/max prize filters, search, and
            deadline sorting.
          </p>
          <Link
            href="/"
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 active:scale-[0.98]"
          >
            Browse All Hackathons
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </div>
    </>
  );
}
