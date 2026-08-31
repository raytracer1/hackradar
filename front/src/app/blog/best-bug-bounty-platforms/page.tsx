import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/frontend/components/seo/JsonLd';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
const postUrl = `${baseUrl}/blog/best-bug-bounty-platforms`;
const ogImage = `${baseUrl}/og-default.png`;

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: 'The Best Bug Bounty Platforms for Programmers — Where Security Skills Pay',
  description:
    'Between jobs and know how to break software? Bug bounties and audit contests pay per finding, not per seat. A practical guide to the platforms — HackerOne, Bugcrowd, Immunefi, Cantina and more — and how to pick the one that fits your skills.',
  keywords: [
    'bug bounty platforms',
    'bug bounty for programmers',
    'make money bug bounties',
    'security audit contests',
    'HackerOne vs Bugcrowd',
    'Immunefi',
    'Cantina',
    'unemployed programmer income',
    'security researcher income',
    'paid security work',
    'web3 bug bounty',
    'Synack missions',
    'vulnerability disclosure programs',
  ],
  openGraph: {
    type: 'article',
    locale: 'en_US',
    siteName: 'HackRadar',
    title: 'The Best Bug Bounty Platforms for Programmers — Where Security Skills Pay',
    description:
      'Between jobs and know how to break software? Bug bounties and audit contests pay per finding, not per seat. How to pick the platform that fits your skills — and honest numbers on what to expect.',
    url: postUrl,
    publishedTime: '2026-08-31T00:00:00.000Z',
    modifiedTime: '2026-08-31T00:00:00.000Z',
    authors: ['HackRadar'],
    images: [
      {
        url: ogImage,
        width: 1200,
        height: 630,
        alt: 'The Best Bug Bounty Platforms for Programmers — where security skills pay',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The Best Bug Bounty Platforms for Programmers — Where Security Skills Pay',
    description:
      'Between jobs and know how to break software? Bug bounties and audit contests pay per finding, not per seat. How to pick the platform that fits your skills.',
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
          name: 'The Best Bug Bounty Platforms for Programmers',
          item: postUrl,
        },
      ],
    },
    // Article
    {
      '@type': 'BlogPosting',
      '@id': `${postUrl}/#article`,
      url: postUrl,
      headline: 'The Best Bug Bounty Platforms for Programmers — Where Security Skills Pay',
      description:
        'Between jobs and know how to break software? Bug bounties and audit contests pay per finding, not per seat. A practical guide to the platforms — HackerOne, Bugcrowd, Immunefi, Cantina and more — and how to pick the one that fits your skills.',
      datePublished: '2026-08-31T00:00:00.000Z',
      dateModified: '2026-08-31T00:00:00.000Z',
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
      wordCount: 2100,
      inLanguage: 'en-US',
      about: [
        { '@type': 'Thing', name: 'Bug Bounties' },
        { '@type': 'Thing', name: 'Security Audits' },
        { '@type': 'Thing', name: 'Cybersecurity' },
        { '@type': 'Thing', name: 'Programming Careers' },
      ],
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'Can an unemployed programmer really make money from bug bounties?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes — platforms pay per valid finding, with no interviews or hiring process. But expect a ramp: most first payouts arrive after 1–3 months of consistent effort, and the distribution is extremely skewed, with a small number of researchers earning most of the money. Treat the first 90 days as paid training with lottery upside, not a salary replacement.',
          },
        },
        {
          '@type': 'Question',
          name: 'Which bug bounty platform should a beginner start with?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Start with HackerOne: it has the most public programs and the largest community. Practice on vulnerability disclosure programs (VDPs) that pay nothing but build reputation, and use free training grounds like YesWeHack Dojo and PortSwigger Web Security Academy. Skip web3 platforms like Immunefi until you actually know Solidity.',
          },
        },
        {
          '@type': 'Question',
          name: 'Are audit contests better than bug bounties for steady income?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'For proven auditors, yes. Audit contests on Sherlock, Cantina, and Immunefi\'s audit competitions pay a share of a fixed pool to every top-finishing auditor in a time-boxed contest, so skilled auditors earn more predictably than bounty hunters, whose income comes in sporadic windfalls. The catch: contests are brutally competitive and reward deep specialization. (Code4rena, the pioneer of the model, shut down in May 2026 — its programs and wardens moved to Immunefi.)',
          },
        },
        {
          '@type': 'Question',
          name: 'Do I need certifications to do bug bounties or audits?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'No. Nobody asks for a certificate before paying out a bounty — a clean report with a working proof of concept is the only credential that matters. Certifications can help you get hired into a salaried security role, but on bounty and audit platforms your finding history is your resume.',
          },
        },
        {
          '@type': 'Question',
          name: 'How do bug bounties compare to cash prize hackathons?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Bug bounties have a fatter tail — a single critical finding can pay six figures — but a much thinner base: most hunters earn nothing for months. Cash prize hackathons pay faster and more predictably, with prizes within weeks of a weekend of work. Many unemployed programmers run both: hackathons for near-term cash, bounties for reputation and upside.',
          },
        },
      ],
    },
  ],
};

const PLATFORM_TABLE = [
  {
    platform: 'HackerOne',
    focus: 'Web & enterprise',
    payouts: '$100–$10k+ per report',
    bestFor: 'First platform; largest program selection',
  },
  {
    platform: 'Bugcrowd',
    focus: 'Enterprise web & mobile',
    payouts: '$100–$10k+ per report',
    bestFor: 'Enterprise scopes, managed programs',
  },
  {
    platform: 'Intigriti',
    focus: 'Web (EU-based)',
    payouts: '$50–$5k+',
    bestFor: 'European researchers, community events',
  },
  {
    platform: 'YesWeHack',
    focus: 'Web (EU-based)',
    payouts: '$50–$5k+',
    bestFor: 'Beginners — free Dojo training ground',
  },
  {
    platform: 'Synack',
    focus: 'Invite-only missions',
    payouts: 'Retainer + per find',
    bestFor: 'Consistent income for vetted researchers',
  },
  {
    platform: 'Immunefi',
    focus: 'Web3 / smart contracts',
    payouts: '$1k–$10M+ (record payout)',
    bestFor: 'Crypto natives who know Solidity',
  },
  {
    platform: 'Cantina',
    focus: 'Audit contests (web3)',
    payouts: '$200k–$2M+ pools; $46M+ paid out',
    bestFor: 'Senior auditors; the biggest contests',
  },
  {
    platform: 'CodeHawks (Cyfrin)',
    focus: 'Audit contests (web3)',
    payouts: 'Shares of contest pools',
    bestFor: 'Beginners learning smart-contract auditing',
  },
  {
    platform: 'Sherlock',
    focus: 'DeFi audit contests',
    payouts: 'Escalated pools + per find',
    bestFor: 'DeFi specialists',
  },
  {
    platform: 'Google / Microsoft / Meta VRPs',
    focus: 'Vendor direct',
    payouts: '$500–$250k+; millions paid yearly',
    bestFor: 'No middleman, top-of-resume signal',
  },
];

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
              <span className="text-gray-600">Best Bug Bounty Platforms</span>
            </li>
          </ol>
        </nav>

        {/* Header */}
        <header>
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
            The Best Bug Bounty{' '}
            <span className="bg-gradient-to-r from-indigo-600 to-indigo-500 bg-clip-text text-transparent">
              Platforms
            </span>{' '}
            for Programmers
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-gray-500">
            Between jobs and know how to break software? Security work pays per finding, not per
            seat — here&apos;s how to pick the platform that fits your skills, with honest numbers
            on what to expect.
          </p>

          {/* Meta */}
          <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-gray-400">
            <time dateTime="2026-08-31">August 31, 2026</time>
            <span aria-hidden="true">·</span>
            <span>9 min read</span>
            <span aria-hidden="true">·</span>
            <span>HackRadar Team</span>
          </div>
        </header>

        {/* Divider */}
        <hr className="mt-8 border-gray-200" />

        {/* Body */}
        <article className="mt-8 space-y-8 text-base leading-relaxed text-gray-700">
          {/* Section 1: Intro */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900">Paid to Break Things</h2>
            <p className="mt-3">
              Security is one of the few fields where a solo developer still competes directly
              with billion-dollar companies — and gets paid market rate for winning. No resume
              screen, no eight-round interview loop, no &quot;we went with an internal
              candidate.&quot; You find a real vulnerability in a published scope, you write it up,
              you get paid per finding.
            </p>
            <p className="mt-3">
              If you&apos;ve read our{' '}
              <Link
                href="/blog/unemployed-programmer-survival-guide"
                className="font-semibold text-indigo-600 underline underline-offset-2 hover:text-indigo-800"
              >
                survival guide for unemployed programmers
              </Link>
              , bug bounties were on the income map with a note: <em>fatter tail, thinner base.</em>{' '}
              This post is the deep dive — every major platform, who each one fits, and how to
              avoid wasting three months on the wrong one.
            </p>
            <p className="mt-3">
              One framing first, because it decides which platform you pick: paid security work
              comes in two very different shapes.
            </p>
          </section>

          {/* Section 2: Bounties vs audits */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900">Bug Bounties vs. Audit Contests — Pick Your Game</h2>
            <p className="mt-3">
              <strong>Bug bounties</strong> are open hunting. A company publishes a scope (their
              app, a subdomain list, an API), you find a valid vulnerability whenever you find it,
              and the platform pays you per severity. Income is lumpy and unpredictable — you might
              earn nothing for six weeks, then $5,000 in an afternoon.
            </p>
            <p className="mt-3">
              <strong>Audit contests</strong> are time-boxed competitions. A protocol (usually
              DeFi) puts up a prize pool — say $100,000 — and for a fixed window of days, auditors
              race to find issues in one codebase. The pool is split by placement, so every
              top-finishing auditor gets paid on every contest. Less windfall, more paycheck.
            </p>
            <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50/50 p-4 text-sm">
              <p className="font-semibold text-gray-900">Rule of thumb</p>
              <p className="mt-1">
                Start with <strong>bounty hunting</strong> to build a finding history and learn
                triage. Graduate to <strong>audit contests</strong> when your hit rate is
                consistent — that&apos;s where $/hour stabilizes. Both reward exactly the same
                skill, so nothing you learn is wasted.
              </p>
            </div>
          </section>

          {/* Section 3: Table */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900">The Platforms at a Glance</h2>
            <p className="mt-3">
              Nine serious options, ordered roughly from &quot;default starting point&quot; to
              &quot;specialist territory.&quot; Details below the table.
            </p>
            <div className="mt-4 overflow-x-auto rounded-xl border border-gray-200">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="px-4 py-3">Platform</th>
                    <th className="px-4 py-3">Focus</th>
                    <th className="px-4 py-3">Typical payouts</th>
                    <th className="px-4 py-3">Best if you…</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {PLATFORM_TABLE.map((r) => (
                    <tr key={r.platform}>
                      <td className="px-4 py-3 font-medium text-gray-900">{r.platform}</td>
                      <td className="px-4 py-3">{r.focus}</td>
                      <td className="px-4 py-3">{r.payouts}</td>
                      <td className="px-4 py-3">{r.bestFor}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Section 4: Web platforms */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900">The Web Platforms</h2>
            <p className="mt-3">
              <strong>HackerOne</strong> is the default first platform: over a million registered
              hackers, the largest catalog of public programs, and hundreds of millions in lifetime
              payouts. Its transparency is the point — scopes, triage decisions, and payout history
              are public, which matters when you&apos;re building a reputation from zero. The
              honest caveat: flagship targets are heavily hunted. Fresh and niche programs pay far
              better per hour than &quot;find a bug in Google on HackerOne.&quot;
            </p>
            <p className="mt-3">
              <strong>Bugcrowd</strong> runs parallel to HackerOne with a more enterprise flavor:
              many Fortune 500 programs, priority-based payouts, and historically strong triage.
              Plenty of researchers run both platforms and double-dip on scopes.
            </p>
            <p className="mt-3">
              <strong>Intigriti</strong> and <strong>YesWeHack</strong> are the European ecosystem.
              Both have friendly communities and responsive teams; YesWeHack&apos;s{' '}
              <em>Dojo</em> is a free training ground with real-world-style challenges, making it
              one of the best on-ramps for total beginners.
            </p>
            <p className="mt-3">
              <strong>Synack</strong> is the outlier worth understanding: invite-only, vetted
              researchers, and work arrives as <em>missions</em> — scoped, recurring engagements
              that pay a monthly retainer plus per-find bonuses. Invited researchers describe it as
              the closest thing to a security salary in the bounty world. You get in with a proven
              finding history elsewhere.
            </p>
            <p className="mt-3">
              <strong>Vendor programs</strong> — Google&apos;s VRP, Microsoft&apos;s MSRC, Meta
              Whitehat — cut out the middleman entirely. No platform fees, direct relationships
              with security teams, and payouts that collectively run into the tens of millions per
              year across the three. They also sit at the top of any security resume. The trade-off
              is process: strict scopes, stricter disclosure rules, and slower first responses on
              some programs.
            </p>
            <p className="mt-3">
              <strong>Skip Open Bug Bounty.</strong> It lists uncoordinated disclosure
              &quot;programs&quot; from sites that never agreed to participate — publishing bugs
              against unwilling targets burns your reputation before you have one.
            </p>
          </section>

          {/* Section 5: Web3 and audit contests */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900">The Web3 & Audit Contest Platforms</h2>
            <p className="mt-3">
              <strong>Immunefi</strong> is where the biggest single payouts in bug bounty history
              live — including the record $10 million paid for one critical smart-contract finding.
              It&apos;s the default platform for web3: hundreds of protocols publish scopes there,
              and payouts run from $1,000 for a medium to seven figures for a protocol-breaking
              critical. Two conditions apply. You need real Solidity and DeFi knowledge — web
              techniques won&apos;t get you paid. And stick to programs listed on the platform
              itself; the crypto space is full of scammers impersonating bounty programs.
            </p>
            <p className="mt-3">
              The audit contest model has one recent plot twist worth knowing:{' '}
              <strong>Code4rena — the platform that invented the format — shut down in May 2026.</strong>{' '}
              Its programs and wardens were absorbed by Immunefi, which now runs audit competitions
              of its own. The model survives, just under new roofs:
            </p>
            <p className="mt-3">
              <strong>Sherlock</strong> runs insurance-backed contests: a protocol that passes a
              Sherlock audit can buy on-chain coverage, and typical pools run $50,000–$300,000.
              <strong>Cantina</strong> (Spearbit&apos;s marketplace) hosts the largest contests
              anywhere — $200,000 to $2M+ pools, over $46 million paid out — and a private-contest
              invitation there is the senior signal of web3 security. <strong>CodeHawks</strong>{' '}
              (Cyfrin) runs beginner-friendly contests where newer auditors build a first finding
              history.
            </p>
            <p className="mt-3">
              Each contest is a fixed window (days to a few weeks), a fixed pool, and a public
              leaderboard that splits the pool by placement. The economics matter for an unemployed
              programmer: a top-10 finish usually pays four figures even when you don&apos;t win, so
              a skilled auditor earns on <em>every</em> contest rather than hoping for one windfall.
            </p>
            <p className="mt-3">
              The contest meta-skill is different from bounty hunting: everyone is reading the same
              fresh codebase, so the money goes to unique, defensible findings with clean write-ups
              — not to racing the obvious issues first.
            </p>
          </section>

          {/* Section 6: How to choose */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900">How to Choose — Three Paths</h2>
            <ul className="mt-3 list-disc space-y-2 pl-6">
              <li>
                <strong>You have web security skills.</strong> Start with HackerOne public programs
                plus one vendor program (Google or Microsoft), hunting scopes built on the stack you
                know best. After 10+ valid reports, apply to Synack and private program invitations.
              </li>
              <li>
                <strong>You know smart contracts (or are committed to learning).</strong> Immunefi
                for open-ended hunting and its audit competitions, Sherlock and Cantina for contests
                — start on CodeHawks if you&apos;re new to Solidity. This path has the highest
                payout ceiling per finding anywhere.
              </li>
              <li>
                <strong>You&apos;re starting from zero.</strong> Don&apos;t register anywhere yet.
                Spend 4–6 weeks on free training — PortSwigger Web Security Academy and YesWeHack
                Dojo — then hunt no-pay vulnerability disclosure programs (VDPs) for your first
                reputation, then paid scopes. Registering early and flailing costs you nothing but
                three months; training first costs you nothing at all.
              </li>
            </ul>
          </section>

          {/* Section 7: Honest numbers */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900">The Honest Numbers</h2>
            <p className="mt-3">
              The &quot;made $100k in a weekend&quot; stories are real. They are also the top of an
              extremely skewed distribution. Most first payouts arrive after <strong>1–3 months</strong>{' '}
              of consistent effort, and most reports pay in the hundreds of dollars. A handful of
              researchers earn the majority of all payouts, year after year.
            </p>
            <p className="mt-3">
              So budget accordingly. Treat your first 90 days as paid training with lottery upside
              — the real compounding asset is the finding history you&apos;re building, which opens
              private programs, Synack, audit contests, and eventually salaried security roles.
            </p>
            <p className="mt-3">
              Compared to the other fast stream on our{' '}
              <Link
                href="/blog/unemployed-programmer-survival-guide"
                className="font-semibold text-indigo-600 underline underline-offset-2 hover:text-indigo-800"
              >
                income map
              </Link>
              : cash prize hackathons pay faster and more predictably — a weekend of work, prizes
              within weeks — while bounties pay slower at the base and far more at the tail. Many
              people run both, using hackathon money to bridge the ramp-up. If that sounds like
              you, start with{' '}
              <Link
                href="/"
                className="font-semibold text-indigo-600 underline underline-offset-2 hover:text-indigo-800"
              >
                the ranked feed on hackradar.win
              </Link>{' '}
              and hunt scopes in the evenings.
            </p>
          </section>

          {/* Section 8: First 30 days */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900">Your First 30 Days — A Checklist</h2>
            <ol className="mt-3 list-decimal space-y-2 pl-6">
              <li>Pick <strong>one</strong> platform and <strong>one</strong> vendor program. Depth beats breadth.</li>
              <li>Choose 2–3 programs built on the stack you know best. Node backends? Mobile APIs? Go there.</li>
              <li>Read each program&apos;s scope and policy carefully — out-of-scope findings don&apos;t pay and can get you kicked.</li>
              <li>Reproduce every finding before reporting, and write the report like you&apos;re teaching: impact, steps, PoC.</li>
              <li>Keep a public page of your valid reports and hall-of-fame entries — it is your resume.</li>
              <li>After 10 valid reports: apply for private programs, Synack, or your first audit contest.</li>
            </ol>
          </section>

          {/* CTA */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900">Pair It with the Fast Stream</h2>
            <p className="mt-3">
              Security work compounds — every valid report makes the next one easier to land. But
              the ramp is real, and rent isn&apos;t. The fastest way to put money in your account
              while your finding history builds is a weekend hackathon in your stack: open{' '}
              <Link
                href="/"
                className="font-semibold text-indigo-600 underline underline-offset-2 hover:text-indigo-800"
              >
                hackradar.win
              </Link>
              , pick your skills, and the feed ranks 400+ upcoming cash prize hackathons by
              expected return per day. Hunt bugs in the evenings, ship demos on the weekends —
              both pay in the same currency: shipped skill.
            </p>
          </section>
        </article>

        {/* Footer CTA */}
        <div className="mt-12 rounded-2xl border border-indigo-200 bg-indigo-50/50 px-6 py-8 text-center">
          <p className="text-xl font-bold text-gray-900">What are your skills worth this weekend?</p>
          <p className="mt-2 text-gray-600">
            Pick your skills and see every cash prize hackathon ranked by expected return — the
            fast income stream that bridges the bug bounty ramp-up.
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
