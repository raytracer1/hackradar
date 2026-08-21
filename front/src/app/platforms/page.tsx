import type { Metadata } from 'next';
import Link from 'next/link';
import { PLATFORMS } from '@/backend/lib/platforms';
import JsonLd from '@/frontend/components/seo/JsonLd';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
const platformsUrl = `${baseUrl}/platforms`;

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: 'Hackathon Platforms with Cash Prizes',
  description:
    'Browse cash prize hackathons by platform. HackRadar tracks Devpost, MLH, HackerEarth, Kaggle, DoraHacks, LabLab.ai, and more — every platform with real money prizes in one place.',
  keywords: [
    'hackathon platforms',
    'cash prize hackathon platforms',
    'Devpost hackathons',
    'MLH hackathons',
    'HackerEarth hackathons',
    'Kaggle competitions',
    'DoraHacks',
    'LabLab.ai hackathons',
    'hackathon sites',
  ],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'HackRadar',
    title: 'Hackathon Platforms with Cash Prizes — HackRadar',
    description:
      'Browse cash prize hackathons by platform. Devpost, MLH, HackerEarth, Kaggle, DoraHacks, LabLab.ai, and more — every platform with real money prizes in one place.',
    url: platformsUrl,
    images: [
      {
        url: '/og-default.png',
        width: 1200,
        height: 630,
        alt: 'Hackathon platforms with cash prizes on HackRadar',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Hackathon Platforms with Cash Prizes — HackRadar',
    description:
      'Browse cash prize hackathons by platform. Devpost, MLH, HackerEarth, Kaggle, DoraHacks, LabLab.ai, and more — every platform with real money prizes in one place.',
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
    canonical: platformsUrl,
  },
};

const platformsStructuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'HackRadar', item: baseUrl },
        { '@type': 'ListItem', position: 2, name: 'Platforms', item: platformsUrl },
      ],
    },
    {
      '@type': 'ItemList',
      name: 'Hackathon Platforms with Cash Prizes',
      itemListElement: PLATFORMS.map((p, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: `${p.name} Hackathons`,
        url: `${platformsUrl}/${p.slug}`,
      })),
    },
  ],
};

export default function PlatformsIndex() {
  return (
    <>
      <JsonLd data={platformsStructuredData} />
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
              <span className="text-gray-600">Platforms</span>
            </li>
          </ol>
        </nav>

        {/* Header */}
        <header>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Hackathon Platforms with{' '}
            <span className="bg-gradient-to-r from-indigo-600 to-indigo-500 bg-clip-text text-transparent">
              Cash Prizes
            </span>
          </h1>
          <p className="mt-3 text-lg text-gray-500">
            Pick a platform to see its upcoming hackathons with real money rewards — all {PLATFORMS.length}{' '}
            tracked by the HackRadar crawler.
          </p>
        </header>

        {/* Platform grid */}
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {PLATFORMS.map((p) => (
            <Link
              key={p.slug}
              href={`/platforms/${p.slug}`}
              className="group rounded-2xl border border-gray-200 bg-white p-5 transition hover:border-indigo-300"
            >
              <span className="block text-lg font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                {p.name}
              </span>
              <span className="mt-1 block text-sm text-gray-500">{p.tagline}</span>
              <span className="mt-3 block text-xs font-semibold text-indigo-600">
                {p.name} hackathons →
              </span>
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 rounded-2xl border border-indigo-200 bg-indigo-50/50 px-6 py-8 text-center">
          <p className="text-xl font-bold text-gray-900">Prefer one feed for everything?</p>
          <p className="mt-2 text-gray-600">
            Browse all upcoming cash prize hackathons from every platform, filterable and sorted.
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
