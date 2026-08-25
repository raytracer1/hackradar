import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/frontend/components/seo/JsonLd';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
const postUrl = `${baseUrl}/blog/find-hackathons-by-skills`;
const ogImage = `${baseUrl}/og-default.png`;

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: 'Find Hackathons Matched to Your Skills — Ranked by Expected Return',
  description:
    'New on HackRadar: pick your skills and every hackathon is ranked by expected return per day — prize pool, skill match, competition, and deadline combined into one score.',
  keywords: [
    'hackathon skill matching',
    'find hackathons by skills',
    'hackathon expected value',
    'which hackathon should I join',
    'hackathon recommendations',
    'best hackathons to win',
    'hackathon prize return',
    'hackathon competition',
    'cash prize hackathons',
    'hackathon ranking',
  ],
  openGraph: {
    type: 'article',
    locale: 'en_US',
    siteName: 'HackRadar',
    title: 'Find Hackathons Matched to Your Skills — Ranked by Expected Return',
    description:
      'Pick your skills on HackRadar and every hackathon is ranked by expected return per day — prize pool, skill match, competition, and deadline in one score.',
    url: postUrl,
    publishedTime: '2026-08-25T00:00:00.000Z',
    modifiedTime: '2026-08-25T00:00:00.000Z',
    authors: ['HackRadar'],
    images: [
      {
        url: ogImage,
        width: 1200,
        height: 630,
        alt: 'HackRadar skill matching — hackathons ranked by expected return',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Find Hackathons Matched to Your Skills — Ranked by Expected Return',
    description:
      'Pick your skills on HackRadar and every hackathon is ranked by expected return per day — prize pool, skill match, competition, and deadline in one score.',
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

const SKILL_GROUPS = [
  'AI / Machine Learning',
  'Web Development',
  'Blockchain / Web3',
  'Mobile',
  'Game Development',
  'Cybersecurity',
  'IoT / Hardware',
  'AR / VR',
  'Design / UX',
  'Databases',
  'Cloud / DevOps',
  'Fintech',
  'Beginner / No-Code',
  'Productivity & Social',
  'Media & Content',
];

const postStructuredData = {
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
          item: `${baseUrl}/blog`,
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: 'Find Hackathons by Skills',
          item: postUrl,
        },
      ],
    },
    // Article
    {
      '@type': 'BlogPosting',
      '@id': `${postUrl}/#article`,
      url: postUrl,
      headline: 'Find Hackathons Matched to Your Skills — Ranked by Expected Return',
      description:
        'Pick your skills on HackRadar and every hackathon is ranked by expected return per day — prize pool, skill match, competition, and deadline combined into one score.',
      datePublished: '2026-08-25T00:00:00.000Z',
      dateModified: '2026-08-25T00:00:00.000Z',
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
        '@id': postUrl,
      },
      isPartOf: {
        '@type': 'Blog',
        '@id': `${baseUrl}/blog/#blog`,
        name: 'HackRadar Blog',
        url: `${baseUrl}/blog`,
      },
      wordCount: 1100,
      inLanguage: 'en-US',
      about: [
        { '@type': 'Thing', name: 'Hackathons' },
        { '@type': 'Thing', name: 'Hackathon Recommendations' },
        { '@type': 'Thing', name: 'Expected Value' },
        { '@type': 'Thing', name: 'Cash Prizes' },
      ],
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'How does HackRadar rank hackathons by skills?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Each hackathon is scored as expected return per day: prize pool × skill match × competition factor, divided by days until the deadline. Your selected skills are matched against the hackathon title, themes, description, and prize details; participant counts measure competition; the deadline converts the result into return per unit of time, so a huge prize far in the future is discounted honestly against a smaller prize you could win soon.',
          },
        },
        {
          '@type': 'Question',
          name: 'What skills can I choose?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'The homepage Skills dropdown covers 45+ skills in 15 groups — from Machine Learning, LLM/AI Agents, and Computer Vision to Web/Full-Stack, React, Blockchain, Solidity, DeFi, Mobile, Game Dev, Cybersecurity, IoT, Design, and more. Your selection is saved in your browser; no account is needed.',
          },
        },
        {
          '@type': 'Question',
          name: 'Does the ranking exclude hackathons I already marked known?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. Hackathons you have marked with the Known button are excluded from the recommendations server-side, so all recommendation slots go to hackathons you have not reviewed yet. Marking an item known immediately removes it from your ranked list.',
          },
        },
        {
          '@type': 'Question',
          name: 'Is the skill matching free to use?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes, completely free. No signup, no email — just open HackRadar, pick your skills, and the feed re-ranks instantly. Your skill selection is stored locally in your browser.',
          },
        },
      ],
    },
  ],
};

export default function BlogPost() {
  return (
    <>
      <JsonLd data={postStructuredData} />
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
              <span className="text-gray-600">Find Hackathons by Skills</span>
            </li>
          </ol>
        </nav>

        {/* Header */}
        <header>
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
            Hackathons Ranked by{' '}
            <span className="bg-gradient-to-r from-indigo-600 to-indigo-500 bg-clip-text text-transparent">
              Expected Return
            </span>{' '}
            for Your Skills
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-gray-500">
            New on HackRadar: pick your skills once, and every upcoming hackathon is ranked by how
            much prize money it's worth to <em>you</em> — skill match, competition, and deadline all
            folded into one score.
          </p>

          {/* Meta */}
          <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-gray-400">
            <time dateTime="2026-08-25">August 25, 2026</time>
            <span aria-hidden="true">·</span>
            <span>5 min read</span>
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
            <h2 className="text-2xl font-bold text-gray-900">Choosing a Hackathon Is a Guess</h2>
            <p className="mt-3">
              Most people pick hackathons the same way: sort by the biggest prize pool, check the
              deadline, and register. Maybe glance at the theme.
            </p>
            <p className="mt-3">
              That's a guess, and it's usually a bad one. The $100,000 hackathon with 8,000
              participants and a theme you've never touched isn't a great opportunity — it's a
              lottery ticket with extra steps. Meanwhile, a $5,000 hackathon that's squarely in your
              wheelhouse, ending in two weeks, with a few hundred competitors, is where you actually
              get paid.
            </p>
            <p className="mt-3">
              The problem isn't a lack of information. HackRadar already knows the prize pool, the
              deadline, the themes, and — since this week — the <strong>participant counts</strong>{' '}
              for most events. The problem is that no human can weigh all of it against their own
              skills for 400+ live hackathons.
            </p>
            <p className="mt-3">
              So we built that calculation for you: <strong>skill-based recommendations.</strong>
            </p>
          </section>

          {/* Section 2: How to use */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900">How It Works: Pick Skills, Get a Ranking</h2>
            <p className="mt-3">
              On the HackRadar homepage you'll find a <strong>Skills</strong> dropdown above the
              search bar. Select the skills that describe what you build with — 45+ skills across 15
              groups:
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {SKILL_GROUPS.map((g) => (
                <span
                  key={g}
                  className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700"
                >
                  {g}
                </span>
              ))}
            </div>
            <p className="mt-4">
              The moment you select a skill, the list re-ranks: a new{' '}
              <strong>Recommended</strong> sort order pins your best matches to the top, each item
              shows a <strong>Match</strong> badge with the skills it matched on and an estimated
              expected return, and the feed still respects your search, prize filters, and platform
              toggles.
            </p>
            <p className="mt-3">
              Your selection is saved in your browser — no account, no signup. Come back tomorrow
              and the ranking is still there, recomputed against fresh data (the crawler refreshes
              every ~6 hours).
            </p>
          </section>

          {/* Section 3: The formula */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900">The Formula: Expected Return per Day</h2>
            <p className="mt-3">
              No black box. Every recommendation is one transparent calculation:
            </p>
            <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50/50 p-4 text-center">
              <p className="font-mono text-sm text-gray-800">
                expected return per day = prize × skill match × competition ÷ days to deadline
              </p>
            </div>
            <p className="mt-3">Here's what each factor means:</p>

            <h3 className="mt-4 text-lg font-semibold text-gray-900">Skill match</h3>
            <p className="mt-1">
              Your selected skills are matched against the hackathon's themes, title, description,
              and prize details. Themes count most (an event explicitly themed around your stack is
              your event), followed by the title, then the body text. Hackathons that don't touch
              any of your skills are left out of the ranking entirely.
            </p>

            <h3 className="mt-4 text-lg font-semibold text-gray-900">Competition</h3>
            <p className="mt-1">
              We now track participant counts for most platforms (Devpost, Devfolio, DoraHacks,
              Taikai, HackQuest, Luma). Fewer competitors means a higher win chance, so an event
              with 100 participants scores higher than an identical one with 1,000. Where counts
              aren't published, the factor stays neutral.
            </p>

            <h3 className="mt-4 text-lg font-semibold text-gray-900">Time, honestly discounted</h3>
            <p className="mt-1">
              This is the part we care most about: the expected return is divided by the days left
              until the deadline. A $50,000 prize 300 days away is worth{' '}
              <strong>$83/day</strong> of expected value; a $5,000 prize ending in 20 days is worth{' '}
              <strong>$125/day</strong>. Same weekend of your time — very different return. The
              formula doesn't bury far-future events, it just prices them honestly per unit of your
              time.
            </p>

            <h3 className="mt-4 text-lg font-semibold text-gray-900">Prize, normalized</h3>
            <p className="mt-1">
              Prize pools in rupees, euros, or pounds are converted to USD with a static exchange
              table before ranking, so a ₹10,000,000 pool isn't mistaken for ten million dollars.
            </p>
          </section>

          {/* Section 4: Why expected value */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900">Why Expected Return — and Not "Most Likely to Win"?</h2>
            <p className="mt-3">
              Nobody can predict winners — hackathons are judged by humans with taste. What we{' '}
              <em>can</em> compute honestly is expected value: how much prize money a weekend of
              your time is statistically worth.
            </p>
            <p className="mt-3">
              Ranking purely by "biggest prize" overweights lottery-ticket megathons. Ranking purely
              by "highest win chance" overweights tiny events with meaningless pools. Expected
              return per day sits in the middle: it's the metric a rational participant optimizes
              when their time is the scarce resource — which, for most of us, it is.
            </p>
            <p className="mt-3">
              It also composes with everything else on the site. Pair skill matching with the Known
              system and the loop is: open HackRadar, your best opportunities are already on top,
              mark the ones you've reviewed, and the recommendations quietly re-rank to surface what
              you haven't seen.
            </p>
          </section>

          {/* Section 5: Under the hood */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900">Under the Hood</h2>
            <p className="mt-3">
              The matching engine runs server-side against the full hackathon dataset — titles,
              themes, descriptions, and prize details — with a curated skill taxonomy whose aliases
              are drawn from the real vocabulary platforms use ("Machine Learning/AI", "capture the
              flag", "Bittensor", "time series"). Skill selection lives entirely in your browser,
              and recommendations exclude anything you've marked Known, so the top slots always go
              to fresh opportunities.
            </p>
            <p className="mt-3">
              The whole thing runs on the same serverless stack as the rest of HackRadar — Next.js
              on Cloudflare Workers, data from R2 — with zero tracking of your skill choices. Your
              profile never leaves your device.
            </p>
          </section>

          {/* Section 6: FAQ */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900">FAQ</h2>

            <h3 className="mt-4 text-lg font-semibold text-gray-900">
              How do I use skill matching?
            </h3>
            <p className="mt-1">
              Open the HackRadar homepage and use the <strong>Skills</strong> dropdown above the
              search bar. Pick one or more skills — the list re-ranks immediately under the new
              Recommended sort order, and matched items show a Match badge with the matched skills
              and estimated expected return.
            </p>

            <h3 className="mt-4 text-lg font-semibold text-gray-900">
              Is my skill selection stored anywhere?
            </h3>
            <p className="mt-1">
              Only in your browser's local storage. Nothing is sent to any server for tracking, and
              there's no account. Clearing your site data clears your selection.
            </p>

            <h3 className="mt-4 text-lg font-semibold text-gray-900">
              Why don't some hackathons appear in my recommendations?
            </h3>
            <p className="mt-1">
              Three things keep an event out: no skill match at all, no parseable cash prize (for
              example MLH events, which don't publish prize amounts), or it's already over / closing
              within a day. Hackathons you marked Known are excluded too.
            </p>

            <h3 className="mt-4 text-lg font-semibold text-gray-900">
              Does the ranking guarantee I'll win?
            </h3>
            <p className="mt-1">
              No — and we'd distrust any tool that claimed otherwise. Skill matching ranks by
              expected value: the prize money statistically worth pursuing for your time. It
              surfaces events where your skills fit and competition is low, which is the honest,
              measurable part of picking a winning opportunity. The building is still on you.
            </p>
          </section>

          {/* CTA */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900">Try It Now</h2>
            <p className="mt-3">
              Head to{' '}
              <Link
                href="/"
                className="font-semibold text-indigo-600 underline underline-offset-2 hover:text-indigo-800"
              >
                hackradar.win
              </Link>
              , pick your skills from the dropdown, and watch 400+ upcoming hackathons re-rank
              around you. No signup, no email — just your best opportunities on top.
            </p>
          </section>
        </article>

        {/* Footer CTA */}
        <div className="mt-12 rounded-2xl border border-indigo-200 bg-indigo-50/50 px-6 py-8 text-center">
          <p className="text-xl font-bold text-gray-900">What are your skills worth this weekend?</p>
          <p className="mt-2 text-gray-600">
            Pick your skills and let the feed show you — ranked by expected return, refreshed every
            crawl.
          </p>
          <Link
            href="/"
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 active:scale-[0.98]"
          >
            Find My Best Matches
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>

      </div>
    </>
  );
}
