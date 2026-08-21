import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/frontend/components/seo/JsonLd';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
const blogUrl = `${baseUrl}/blog`;
const ogImage = `${baseUrl}/og-default.png`;

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: 'Hackathon Guides & Strategy',
  description:
    'Guides and strategy for hackathon builders: how to find cash prize hackathons, how to win them, and how HackRadar covers 14 platforms in one feed.',
  keywords: [
    'hackathon blog',
    'hackathon guides',
    'hackathon tips',
    'hackathon strategy',
    'how to win hackathons',
    'cash prize hackathons',
    'hackathon aggregator',
    'hackathon advice',
  ],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'HackRadar',
    title: 'Hackathon Guides & Strategy — HackRadar Blog',
    description:
      'Guides and strategy for hackathon builders: how to find cash prize hackathons, how to win them, and how HackRadar covers 14 platforms in one feed.',
    url: blogUrl,
    images: [
      {
        url: ogImage,
        width: 1200,
        height: 630,
        alt: 'HackRadar Blog — hackathon guides and strategy',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Hackathon Guides & Strategy — HackRadar Blog',
    description:
      'Guides and strategy for hackathon builders: how to find cash prize hackathons, how to win them, and how HackRadar covers 14 platforms in one feed.',
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
    canonical: blogUrl,
  },
};

const POSTS = [
  {
    slug: 'how-to-win-cash-prize-hackathons',
    title: 'How to Win Cash Prize Hackathons — A Practical Guide',
    excerpt:
      'Picking winnable events, scoping a demoable core, building around sponsors, and nailing the pitch — the full playbook for turning a weekend into prize money.',
    dateLabel: 'August 20, 2026',
    dateTime: '2026-08-20',
    readTime: '6 min read',
  },
  {
    slug: 'introducing-hackradar',
    title: 'Introducing HackRadar — One Place to Discover All Cash Prize Hackathons',
    excerpt:
      'Stop checking 14 websites every week. The story behind HackRadar: why it exists, which platforms it covers, and how the filters, sorting, and Known system work.',
    dateLabel: 'July 2, 2025',
    dateTime: '2025-07-02',
    readTime: '4 min read',
  },
];

const blogStructuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    // Breadcrumb
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'HackRadar',
          item: baseUrl,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Blog',
          item: blogUrl,
        },
      ],
    },
    // Blog with posts
    {
      '@type': 'Blog',
      '@id': `${blogUrl}/#blog`,
      name: 'HackRadar Blog',
      description:
        'Guides and strategy for hackathon builders: how to find cash prize hackathons, how to win them, and how HackRadar covers 14 platforms in one feed.',
      url: blogUrl,
      inLanguage: 'en-US',
      blogPost: POSTS.map((p) => ({
        '@type': 'BlogPosting',
        '@id': `${blogUrl}/${p.slug}/#article`,
        headline: p.title,
        url: `${blogUrl}/${p.slug}`,
        datePublished: `${p.dateTime}T00:00:00.000Z`,
      })),
    },
  ],
};

export default function BlogIndex() {
  return (
    <>
      <JsonLd data={blogStructuredData} />
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
              <span className="text-gray-600">Blog</span>
            </li>
          </ol>
        </nav>

        {/* Header */}
        <header>
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
            HackRadar{' '}
            <span className="bg-gradient-to-r from-indigo-600 to-indigo-500 bg-clip-text text-transparent">
              Blog
            </span>
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-gray-500">
            Guides and strategy for hackathon builders — how to find the right events, how to win
            them, and everything in between.
          </p>
        </header>

        {/* Divider */}
        <hr className="mt-8 border-gray-200" />

        {/* Post list */}
        <div className="mt-8 space-y-6">
          {POSTS.map((p) => (
            <article
              key={p.slug}
              className="group rounded-2xl border border-gray-200 bg-white p-6 transition hover:border-indigo-300"
            >
              <time dateTime={p.dateTime} className="text-xs text-gray-400">
                {p.dateLabel}
              </time>
              <h2 className="mt-2 text-xl font-bold text-gray-900">
                <Link
                  href={`/blog/${p.slug}`}
                  className="transition-colors hover:text-indigo-600"
                >
                  {p.title}
                </Link>
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-gray-500">{p.excerpt}</p>
              <div className="mt-3 flex items-center gap-3 text-xs text-gray-400">
                <span>{p.readTime}</span>
                <span aria-hidden="true">·</span>
                <Link
                  href={`/blog/${p.slug}`}
                  className="font-semibold text-indigo-600 transition-colors hover:text-indigo-800"
                >
                  Read →
                </Link>
              </div>
            </article>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 rounded-2xl border border-indigo-200 bg-indigo-50/50 px-6 py-8 text-center">
          <p className="text-xl font-bold text-gray-900">Ready to find your next hackathon?</p>
          <p className="mt-2 text-gray-600">
            Browse cash prize hackathons from 14 platforms, all in one place.
          </p>
          <Link
            href="/"
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 active:scale-[0.98]"
          >
            Start Browsing Now
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </div>
    </>
  );
}
