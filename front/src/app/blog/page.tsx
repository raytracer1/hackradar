import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/frontend/components/seo/JsonLd';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
const blogUrl = `${baseUrl}/blog`;
const ogImage = `${baseUrl}/og-default.png`;

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: 'Introducing HackRadar — One Place to Discover Cash Prize Hackathons',
  description:
    'Stop checking 14 websites every week. HackRadar aggregates cash-prize hackathons from Devpost, MLH, HackerEarth, Kaggle, and more — so you spend less time searching and more time building.',
  keywords: [
    'hackathon aggregator',
    'cash prize hackathons',
    'find hackathons',
    'hackathon search engine',
    'Devpost hackathons',
    'MLH hackathons',
    'coding competitions',
    'hackathon with prizes',
    'hackathon list',
    'upcoming hackathons 2025',
  ],
  openGraph: {
    type: 'article',
    locale: 'en_US',
    siteName: 'HackRadar',
    title: 'Introducing HackRadar — One Place to Discover All Cash Prize Hackathons',
    description:
      'Stop checking 14 websites every week. HackRadar aggregates cash-prize hackathons from Devpost, MLH, HackerEarth, Kaggle, and more.',
    url: blogUrl,
    publishedTime: '2025-07-02T00:00:00.000Z',
    modifiedTime: '2025-07-02T00:00:00.000Z',
    authors: ['HackRadar'],
    images: [
      {
        url: ogImage,
        width: 1200,
        height: 630,
        alt: 'Introducing HackRadar — discover cash prize hackathons in one place',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Introducing HackRadar — One Place to Discover All Cash Prize Hackathons',
    description:
      'Stop checking 14 websites every week. HackRadar aggregates cash-prize hackathons from Devpost, MLH, HackerEarth, Kaggle, and more.',
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

const PLATFORMS = [
  { name: 'Devpost', desc: 'General hackathons' },
  { name: 'MLH', desc: 'Student hackathons' },
  { name: 'HackerEarth', desc: 'Competitive programming + hackathons' },
  { name: 'Devfolio', desc: 'Web3 & web2 hackathons' },
  { name: 'Kaggle', desc: 'Data science competitions' },
  { name: 'DoraHacks', desc: 'Web3 & blockchain' },
  { name: 'Unstop', desc: 'University & early-career' },
  { name: 'LabLab.ai', desc: 'AI-focused hackathons' },
  { name: 'Luma', desc: 'Community-organized events' },
  { name: 'HackQuest', desc: 'Web3 builder challenges' },
  { name: 'Taikai', desc: 'Blockchain & open innovation' },
  { name: '0G', desc: 'AI × Web3 hackathons' },
  { name: 'SinCE.AI', desc: 'AI hackathons' },
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
    // Article
    {
      '@type': 'BlogPosting',
      '@id': `${blogUrl}/#article`,
      url: blogUrl,
      headline: 'Introducing HackRadar — One Place to Discover All Cash Prize Hackathons',
      description:
        'Stop checking 14 websites every week. HackRadar aggregates cash-prize hackathons from Devpost, MLH, HackerEarth, Kaggle, and more.',
      datePublished: '2025-07-02T00:00:00.000Z',
      dateModified: '2025-07-02T00:00:00.000Z',
      author: {
        '@type': 'Organization',
        name: 'HackRadar',
        url: baseUrl,
      },
      publisher: {
        '@type': 'Organization',
        name: 'HackRadar',
        url: baseUrl,
        logo: {
          '@type': 'ImageObject',
          url: ogImage,
        },
      },
      image: {
        '@type': 'ImageObject',
        url: ogImage,
        width: 1200,
        height: 630,
      },
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': blogUrl,
      },
      isPartOf: {
        '@type': 'Blog',
        '@id': `${baseUrl}/blog/#blog`,
        name: 'HackRadar Blog',
        url: blogUrl,
      },
      wordCount: 800,
      inLanguage: 'en-US',
      about: [
        { '@type': 'Thing', name: 'Hackathons' },
        { '@type': 'Thing', name: 'Cash Prizes' },
        { '@type': 'Thing', name: 'Coding Competitions' },
      ],
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'What is HackRadar?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'HackRadar is a hackathon aggregator that pulls upcoming cash-prize hackathons from 14 platforms — including Devpost, MLH, HackerEarth, Kaggle — into a single, filterable feed. Only hackathons with real money prizes are listed.',
          },
        },
        {
          '@type': 'Question',
          name: 'Which platforms does HackRadar cover?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'HackRadar covers Devpost, MLH, HackerEarth, Devfolio, Kaggle, DoraHacks, Unstop, LabLab.ai, Luma, HackQuest, Taikai, 0G, and SinCE.AI — 14 platforms in total.',
          },
        },
        {
          '@type': 'Question',
          name: 'How do I find hackathons with cash prizes?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'HackRadar only indexes hackathons that offer cash prizes. You can filter by prize range (minimum and maximum dollar amount), search across titles and descriptions, and sort by prize amount or deadline.',
          },
        },
        {
          '@type': 'Question',
          name: 'Is HackRadar free to use?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes, HackRadar is completely free. No signup, no email required — just browse upcoming cash prize hackathons from across the web.',
          },
        },
      ],
    },
  ],
};

export default function BlogPost() {
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
            One Place to Discover All{' '}
            <span className="bg-gradient-to-r from-emerald-600 to-emerald-500 bg-clip-text text-transparent">
              Cash Prize
            </span>{' '}
            Hackathons
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-gray-500">
            Stop checking 14 websites every week. HackRadar aggregates upcoming hackathons with real
            money rewards — so you spend less time searching and more time building.
          </p>

          {/* Meta */}
          <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-gray-400">
            <time dateTime="2025-07-02">July 2, 2025</time>
            <span aria-hidden="true">·</span>
            <span>4 min read</span>
            <span aria-hidden="true">·</span>
            <span>HackRadar Team</span>
          </div>
        </header>

        {/* Divider */}
        <hr className="mt-8 border-gray-200" />

        {/* Body */}
        <article className="mt-8 space-y-8 text-base leading-relaxed text-gray-700">
          {/* Section 1: The Problem */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900">The Problem: Too Many Platforms, Too Little Time</h2>
            <p className="mt-3">
              Here's a familiar routine for the average developer looking for hackathons to join:
            </p>
            <p className="mt-3">
              Open Devpost, scroll through listings. Open MLH, scroll again. Switch to HackerEarth.
              Then Devfolio. Then Kaggle. Then DoraHacks. Then LabLab.ai. By the time you've checked
              them all, an hour has passed — and half the hackathons you saw were already over, had
              no prize money, or required skills you don't have.
            </p>
            <p className="mt-3">
              I built <strong>HackRadar</strong> to kill that routine. It's a hackathon aggregator
              with one focus: <strong>cash prizes only.</strong> No T-shirt giveaways, no "exposure"
              prizes, no swag-only events — just real money from real coding competitions.
            </p>
          </section>

          {/* Section 2: Platforms */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900">14 Platforms, One Feed</h2>
            <p className="mt-3">
              HackRadar pulls upcoming hackathons from 14 platforms and shows them in a single,
              filterable feed:
            </p>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {PLATFORMS.map((p) => (
                <div
                  key={p.name}
                  className="rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3"
                >
                  <span className="font-semibold text-gray-900">{p.name}</span>
                  <span className="ml-2 text-sm text-gray-500">{p.desc}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Section 3: Why Cash */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900">Why Focus on Cash Prize Hackathons?</h2>
            <ol className="mt-3 space-y-4">
              <li>
                <strong className="text-gray-900">Filter by what matters.</strong> Most aggregators
                show every hackathon — hundreds of listings where the "prize" is a T-shirt or a
                mention tweet. HackRadar only indexes hackathons with actual prize pools, and you can
                set a minimum dollar amount to instantly hide the noise.
              </li>
              <li>
                <strong className="text-gray-900">Real money, real motivation.</strong> Cash prizes
                change the dynamic. They attract better competition, better judges, and often lead to
                stronger projects for your portfolio. If you're going to spend a weekend hacking, you
                might as well compete for something that pays.
              </li>
            </ol>
          </section>

          {/* Section 4: Features */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900">Key Features</h2>

            <h3 className="mt-6 text-lg font-semibold text-gray-900">Search Across Everything</h3>
            <p className="mt-1">
              The search bar doesn't just match hackathon titles. It searches across the full
              description, about section, what-to-build brief, submission requirements, and prize
              details. Looking for "DeFi + Solana"? Type it in and see every matching hackathon
              instantly.
            </p>

            <h3 className="mt-4 text-lg font-semibold text-gray-900">Prize Range Filter</h3>
            <p className="mt-1">
              Set a minimum (say, $5,000) to hide the small stuff. Or set a maximum to find smaller,
              less competitive events where you have a better shot at winning. Combine both for your
              personal sweet spot.
            </p>

            <h3 className="mt-4 text-lg font-semibold text-gray-900">Smart Sorting</h3>
            <p className="mt-1">
              Sort by end date to catch what's closing soon. Sort by prize amount when you're
              chasing the biggest pools. Or sort by start date to plan ahead.
            </p>

            <h3 className="mt-4 text-lg font-semibold text-gray-900">Source Toggle</h3>
            <p className="mt-1">
              Prefer Devpost over HackerEarth? Toggle individual sources on and off to curate your
              feed exactly how you want it.
            </p>

            <h3 className="mt-4 text-lg font-semibold text-gray-900">Known System</h3>
            <p className="mt-1">
              Mark hackathons as "known" once you've reviewed them. They move to a separate tab and
              stay out of the main feed — so every time you open HackRadar, you see fresh
              opportunities, not the same list over and over.
            </p>
          </section>

          {/* Section 5: Stack */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900">How It's Built</h2>
            <p className="mt-3">
              HackRadar runs on <strong>Next.js 15</strong> with the App Router, deployed to{' '}
              <strong>Cloudflare Workers</strong> via OpenNext. Hackathon data lives in{' '}
              <strong>Cloudflare R2</strong>, refreshed by a Python crawler that runs on a schedule
              with multiple source plugins. The entire stack is serverless and costs almost nothing
              to operate. All filtering happens client-side after a single background load — no page
              reloads, no spinner between every search.
            </p>
          </section>

          {/* Section 6: FAQ */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900">FAQ</h2>

            <h3 className="mt-4 text-lg font-semibold text-gray-900">
              What is HackRadar?
            </h3>
            <p className="mt-1">
              HackRadar is a free hackathon aggregator that collects upcoming coding competitions
              with cash prizes from 14 platforms into one searchable, filterable feed.
            </p>

            <h3 className="mt-4 text-lg font-semibold text-gray-900">
              Which platforms does HackRadar cover?
            </h3>
            <p className="mt-1">
              Devpost, MLH, HackerEarth, Devfolio, Kaggle, DoraHacks, Unstop, LabLab.ai, Luma,
              HackQuest, Taikai, 0G, and SinCE.AI — 14 platforms in total.
            </p>

            <h3 className="mt-4 text-lg font-semibold text-gray-900">
              How do I find hackathons with cash prizes?
            </h3>
            <p className="mt-1">
              HackRadar only indexes cash-prize hackathons. You can further refine results with
              prize range filters (min/max), free-text search, platform toggles, and multiple sort
              orders.
            </p>

            <h3 className="mt-4 text-lg font-semibold text-gray-900">
              Is HackRadar free?
            </h3>
            <p className="mt-1">
              Yes, completely free. No signup required, no email wall — just open the site and
              browse upcoming hackathons.
            </p>
          </section>

          {/* CTA */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900">Try It Now</h2>
            <p className="mt-3">
              <Link
                href="/"
                className="font-semibold text-indigo-600 underline underline-offset-2 hover:text-indigo-800"
              >
                hackradar.io
              </Link>{' '}
              — no signup, no email, just a feed of upcoming cash prize hackathons, updated
              regularly.
            </p>
            <p className="mt-3">
              Found a hackathon that's missing? The crawler is open source —{' '}
              <a
                href="https://github.com/bijun/hackradar"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-indigo-600 underline underline-offset-2 hover:text-indigo-800"
              >
                submit a PR on GitHub
              </a>{' '}
              or open an issue with the platform you'd like to see added.
            </p>
            <p className="mt-3 text-lg font-semibold text-gray-900">
              Tired of the bookmark folder with 14 hackathon sites? There's a better way.
            </p>
          </section>
        </article>

        {/* Footer CTA */}
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
