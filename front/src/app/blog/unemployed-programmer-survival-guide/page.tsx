import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/frontend/components/seo/JsonLd';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
const postUrl = `${baseUrl}/blog/unemployed-programmer-survival-guide`;
const ogImage = `${baseUrl}/og-default.png`;

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: 'The Unemployed Programmer\'s Survival Guide — How to Make Money in the AI Era',
  description:
    'Laid off and worried about AI taking programming jobs? A practical guide to real income streams for unemployed developers: cash prize hackathons, freelancing with AI leverage, bug bounties, micro-products, and more.',
  keywords: [
    'unemployed programmer',
    'make money as a programmer',
    'laid off developer',
    'programmer income streams',
    'AI era jobs',
    'developer side income',
    'cash prize hackathons',
    'freelance developer AI',
    'bug bounty programs',
    'micro saas developer',
    'programming job market AI',
    'survive layoff developer',
  ],
  openGraph: {
    type: 'article',
    locale: 'en_US',
    siteName: 'HackRadar',
    title: 'The Unemployed Programmer\'s Survival Guide — How to Make Money in the AI Era',
    description:
      'Laid off and worried about AI taking programming jobs? Real income streams for unemployed developers — hackathons, freelancing, bug bounties, micro-products, and honest advice on what to skip.',
    url: postUrl,
    publishedTime: '2026-08-27T00:00:00.000Z',
    modifiedTime: '2026-08-27T00:00:00.000Z',
    authors: ['HackRadar'],
    images: [
      {
        url: ogImage,
        width: 1200,
        height: 630,
        alt: 'The Unemployed Programmer\'s Survival Guide — ways to make money in the AI era',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The Unemployed Programmer\'s Survival Guide — How to Make Money in the AI Era',
    description:
      'Laid off and worried about AI taking programming jobs? Real income streams for unemployed developers — hackathons, freelancing, bug bounties, micro-products, and honest advice on what to skip.',
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
          name: 'The Unemployed Programmer\'s Survival Guide',
          item: postUrl,
        },
      ],
    },
    // Article
    {
      '@type': 'BlogPosting',
      '@id': `${postUrl}/#article`,
      url: postUrl,
      headline: 'The Unemployed Programmer\'s Survival Guide — How to Make Money in the AI Era',
      description:
        'Laid off and worried about AI taking programming jobs? A practical guide to real income streams for unemployed developers: cash prize hackathons, freelancing with AI leverage, bug bounties, micro-products, and more.',
      datePublished: '2026-08-27T00:00:00.000Z',
      dateModified: '2026-08-27T00:00:00.000Z',
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
      wordCount: 1800,
      inLanguage: 'en-US',
      about: [
        { '@type': 'Thing', name: 'Unemployment' },
        { '@type': 'Thing', name: 'Programming Careers' },
        { '@type': 'Thing', name: 'AI' },
        { '@type': 'Thing', name: 'Hackathons' },
        { '@type': 'Thing', name: 'Freelancing' },
        { '@type': 'Thing', name: 'Bug Bounties' },
      ],
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'Can an unemployed programmer still make money in the AI era?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. Full-time openings are scarcer, but money is still paid for shipped work: hackathon prizes, freelance contracts, bug bounties, security audits, and small products all reward the same skills you already have. The catch is that income becomes lumpier and more self-directed — you earn from projects and prizes instead of a salary.',
          },
        },
        {
          '@type': 'Question',
          name: 'What is the fastest way to make money after a layoff?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Cash prize hackathons have the shortest cycle: a weekend of work with prize payouts within weeks. A $5,000 hackathon ending in 20 days is worth $125 per day of expected value — comparable to a salary — without interviews or onboarding. Freelancing pays slower at first (finding and landing clients takes time), and products are the slowest but most scalable.',
          },
        },
        {
          '@type': 'Question',
          name: 'Do cash prize hackathons actually pay out?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. Major platforms like Devpost, Devfolio, DoraHacks, and Taikai run sponsored events where winners receive prizes by bank transfer, PayPal, or crypto within weeks of judging. To maximize your expected return, pick events with a strong prize pool, low participant counts, themes matching your skills, and near deadlines — exactly the ranking HackRadar computes for you.',
          },
        },
        {
          '@type': 'Question',
          name: 'Should I retrain into AI or keep my existing skills?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Keep your existing skills and add AI on top. Depth in one domain — backend, security, frontend, data — is still scarce and pays, because AI assistants accelerate juniors but still need a senior to direct them. Learn to ship with AI tools rather than pivoting into a new field from zero, which resets your earning power for years.',
          },
        },
        {
          '@type': 'Question',
          name: 'What should I avoid when looking for income after a layoff?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Avoid anything that charges you up front: paid courses guaranteeing an AI job, get-rich-crypto schemes, multi-level marketing, and fake remote jobs asking for equipment fees. Real income streams — hackathons, bounties, freelance work — pay you; scams ask you to pay first.',
          },
        },
      ],
    },
  ],
};

const INCOME_STREAMS = [
  {
    name: 'Cash prize hackathons',
    speed: 'Days to weeks',
    ceiling: 'Median prize $4.3k',
    effort: 'Weekends',
  },
  {
    name: 'Freelancing with AI leverage',
    speed: 'Weeks to months',
    ceiling: '$25–$60/hr marketplace, +34% with AI',
    effort: 'Ongoing',
  },
  {
    name: 'Bug bounties & audits',
    speed: 'Days to months',
    ceiling: 'Avg $13k per find; criticals $500k+',
    effort: 'Sporadic',
  },
  {
    name: 'Micro-products & templates',
    speed: 'Months',
    ceiling: 'Median $4.2k MRR if profitable',
    effort: 'Front-loaded',
  },
  {
    name: 'Teaching & content',
    speed: 'Months',
    ceiling: 'Skewed — 1% of Udemy instructors pass $50k/yr',
    effort: 'Consistent',
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
              <span className="text-gray-600">The Unemployed Programmer&apos;s Survival Guide</span>
            </li>
          </ol>
        </nav>

        {/* Header */}
        <header>
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
            The Unemployed Programmer&apos;s{' '}
            <span className="bg-gradient-to-r from-indigo-600 to-indigo-500 bg-clip-text text-transparent">
              Survival Guide
            </span>
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-gray-500">
            Laid off? Worried AI is coming for your job? Your skills still make money — here are the
            income streams that actually pay, ranked by how fast they put cash in your account.
          </p>

          {/* Meta */}
          <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-gray-400">
            <time dateTime="2026-08-27">August 27, 2026</time>
            <span aria-hidden="true">·</span>
            <span>8 min read</span>
            <span aria-hidden="true">·</span>
            <span>HackRadar Team</span>
          </div>
        </header>

        {/* Divider */}
        <hr className="mt-8 border-gray-200" />

        {/* Body */}
        <article className="mt-8 space-y-8 text-base leading-relaxed text-gray-700">
          {/* Section 1: The layoff reality */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900">The Layoff Email Arrived. Now What?</h2>
            <p className="mt-3">
              If you&apos;re reading this, you&apos;re probably between jobs — or watching the industry
              and wondering how long your current one lasts. The headlines don&apos;t help: AI writes
              code now, junior openings are vanishing, and every earnings call mentions &quot;efficiency.&quot;
            </p>
            <p className="mt-3">
              Here&apos;s what the headlines don&apos;t say: <strong>money is still paid for shipped
              work.</strong> Hackathon prizes, freelance contracts, bug bounties, audits, and small
              products all reward exactly the skills you already have. What changed is the shape of
              the income — lumpier, more self-directed, no salary comfort. This guide covers the
              income streams that work in that world, in rough order of time-to-first-dollar.
            </p>
            <p className="mt-3">
              First, one boring but critical step: cut monthly burn now, before you touch any
              opportunity below. Every method here compounds better with six months of runway than
              with six weeks of panic.
            </p>
          </section>

          {/* Section 2: The map */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900">The Income Map at a Glance</h2>
            <p className="mt-3">
              Five streams, roughly ordered by how fast they pay. Mix at least two: a fast one to
              cover bills, a slow one to build something that outlasts you.
            </p>
            <div className="mt-4 overflow-x-auto rounded-xl border border-gray-200">
              <table className="w-full min-w-[560px] text-left text-sm">
                <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="px-4 py-3">Stream</th>
                    <th className="px-4 py-3">First payout</th>
                    <th className="px-4 py-3">Typical range</th>
                    <th className="px-4 py-3">Time cost</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {INCOME_STREAMS.map((s) => (
                    <tr key={s.name}>
                      <td className="px-4 py-3 font-medium text-gray-900">{s.name}</td>
                      <td className="px-4 py-3">{s.speed}</td>
                      <td className="px-4 py-3">{s.ceiling}</td>
                      <td className="px-4 py-3">{s.effort}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Section 3: Hackathons */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900">1. Cash Prize Hackathons — Salary-Like Returns, No Interviews</h2>
            <p className="mt-3">
              The fastest real money for an unemployed programmer. A weekend of focused building, a
              demo, and prize payouts within weeks — no resume screen, no take-home test, no
              eight-round interview loop.
            </p>
            <p className="mt-3">
              The math is better than most people assume. Think in{' '}
              <strong>expected return per day</strong>:
            </p>
            <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50/50 p-4 text-center">
              <p className="font-mono text-sm text-gray-800">
                expected return per day = prize × skill match × competition ÷ days to deadline
              </p>
            </div>
            <p className="mt-3">
              A $5,000 hackathon in your stack, closing in 20 days, with 300 competitors, is worth
              around <strong>$125/day</strong> of expected value — comparable to a decent salary.
              A $100,000 megathon with 8,000 participants and a theme you&apos;ve never touched is a
              lottery ticket. Pick the first one.
            </p>
            <p className="mt-3">
              Those aren&apos;t made-up numbers, by the way. An analysis of 12,155 Devpost
              hackathons (2008–2025) found a <strong>median prize of $4,300</strong> — a third of
              all events offer under $5,000, while the tail stretches past $100,000. The
              &quot;$5,000 in your stack&quot; example above is the median event, not the exception.
              You don&apos;t need to win a megathon; you need to win median events consistently.
            </p>
            <p className="mt-3">
              On{' '}
              <Link
                href="/"
                className="font-semibold text-indigo-600 underline underline-offset-2 hover:text-indigo-800"
              >
                hackradar.win
              </Link>{' '}
              you can select your skills and get 400+ upcoming hackathons ranked by exactly this
              formula — prize pool, skill match, participant counts, and deadline combined. A few
              wins a quarter replaces a junior salary; one strong year can match a senior one.
            </p>
          </section>

          {/* Section 4: Freelancing */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900">2. Freelancing with an AI Copilot — You vs. $50/hr, Not vs. the Model</h2>
            <p className="mt-3">
              Upwork, Fiverr, and Toptal still route real money to developers. What AI changed isn&apos;t
              the demand — businesses still need working software — it&apos;s the{' '}
              <strong>floor on junior work</strong>. Template websites and CRUD apps that used to
              pay a beginner $30/hr are now done by non-developers with a chatbot.
            </p>
            <p className="mt-3">
              So freelance <em>above</em> the floor, and use AI as leverage below it:
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-6">
              <li>
                <strong>Niche into integrations and fixes.</strong> &quot;Connect our CRM to our
                booking system&quot; and &quot;fix our abandoned Next.js app&quot; pay better than
                &quot;build me a landing page&quot; — and AI can&apos;t scope or ship them end-to-end.
              </li>
              <li>
                <strong>Let the copilot draft, you direct.</strong> A senior who generates the
                boilerplate with AI and spends their hours on architecture and edge cases delivers
                in a third of the time — and bills for outcomes, not hours.
              </li>
              <li>
                <strong>Productize one niche.</strong> The third time you sell the same integration,
                package it: fixed price, fixed scope, one-week delivery. Repeat clients beat
                marketplace bidding every time.
              </li>
            </ul>
            <p className="mt-3">
              The data backs the direction. Across 2.2M+ analyzed Upwork projects, IT and
              development work pays roughly <strong>$25–$60/hr</strong> on the marketplace — but
              Upwork&apos;s Future Workforce Index 2026 found freelancers doing AI-related work earn
              a <strong>34% hourly premium</strong> (Upwork&apos;s CEO puts it at 40%), and
              freelancers combining AI with complex, judgment-heavy work saw earnings rise{' '}
              <strong>45% year over year</strong>. Meanwhile, routine AI execution work declined
              13–28% — the premium goes to people who direct AI, not people who just run it. The
              BCG/Harvard field study of 758 consultants found the same mechanism: AI users
              completed 12.2% more tasks, 25.1% faster, at 40% higher quality.
            </p>
            <p className="mt-3">
              Realistic ramp: first paid gig in 2–6 weeks at marketplace rates, higher for
              enterprise and repeat clients. Slow to start, but it&apos;s the stream most resilient
              to AI headlines — clients buy results, and someone still has to be accountable for
              them.
            </p>
          </section>

          {/* Section 5: Bug bounties */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900">3. Bug Bounties and Audits — Paid to Be Paranoid</h2>
            <p className="mt-3">
              If security is your thing, companies literally post price lists for finding flaws:
              HackerOne and Bugcrowd for web targets,{' '}
              <strong>Code4rena and Immunefi</strong> for smart contracts, where critical finds
              routinely pay five and six figures. No employer needed — just skill and patience.
            </p>
            <p className="mt-3">
              The totals are real: HackerOne paid out <strong>$81 million</strong> in bounties in
              2024–2025 (up 13% year over year), passing $300 million all-time, and 30 hackers have
              cleared $1 million in lifetime earnings. In Web3, Immunefi paid researchers over{' '}
              <strong>$100 million in 2025 alone</strong> — average payout around $13,000, critical
              smart-contract finds routinely above $500,000, and one $10 million payout for a
              Wormhole bridge vulnerability.
            </p>
            <p className="mt-3">
              Two honest caveats: bounties are <strong>lumpy</strong> (you can hunt for a month and
              find nothing, then land a five-figure payout in an afternoon), and they&apos;re the
              most competitive stream for beginners. The steadier variant is <strong>audit
              work</strong> — Web3 protocols book audit contests and private engagements
              continuously. If you&apos;re mid-career with a security background, this is one of the
              fastest paths from layoff to income in the AI era — AI writes buggy code faster than
              ever, which is good for bug hunters.
            </p>
          </section>

          {/* Section 6: Micro-products */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900">4. Micro-Products — Slow to Start, Uncapped Upside</h2>
            <p className="mt-3">
              The slowest stream on this list and the only one that can outgrow a salary. You
              already know the playbook: find a narrow pain, ship a small product, charge a
              subscription. What the AI era adds is <strong>distribution</strong>:
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-6">
              <li>
                <strong>Sell the tools other developers are suddenly buying.</strong> Boilerplates,
                starter kits, and templates — the picks-and-shovels of the AI gold rush. Indie
                developers sell $99–$299 kits at real volume, no marketing team required.
              </li>
              <li>
                <strong>Wrap AI around a boring workflow.</strong> Invoice parsing, meeting-note
                extraction, support-ticket triage. Small businesses pay $29–$99/mo for narrow
                automations you can now build in a week.
              </li>
              <li>
                <strong>Charge for outcome, not code.</strong> &quot;$500/mo, I handle your
                reporting&quot; beats &quot;$50/hr&quot; — it&apos;s the same work framed as a product,
                and AI cuts your per-customer maintenance to near zero.
              </li>
            </ul>
            <p className="mt-3">
              Set expectations with the real distribution: an analysis of Stripe-verified indie
              products found <strong>54% make exactly $0</strong>, and roughly 70% of micro-SaaS
              businesses stay under $1,000 MRR. For those that do break through, the median is about{' '}
              <strong>$4,200 MRR</strong> (~$50k/year) — real money, but below a mid-career salary —
              and the path to $1k MRR typically takes 6–18 months. Pair this with a fast stream
              (hackathons, freelancing) so the runway doesn&apos;t run out before the product finds
              its first customer.
            </p>
          </section>

          {/* Section 7: Teaching */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900">5. Teach What You Know — The Market Just Got Hungrier</h2>
            <p className="mt-3">
              Millions of people are frantically trying to learn AI, and thousands of companies are
              frantically trying to adopt it. Both are starved for people who can explain the real
              thing. If you can write or talk clearly, you&apos;re ahead of most of the internet:
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-6">
              <li>
                <strong>Newsletters and blogs</strong> — a focused niche (&quot;AI for backend
                engineers&quot;) beats a general one, and sponsorship income scales with the niche&apos;s
                buyer intent more than raw subscriber count.
              </li>
              <li>
                <strong>Courses and workshops</strong> — but read the numbers first: 75% of Udemy
                instructors earn under $1,000 <em>per year</em>, and only 1% clear $50,000/yr on a
                marketplace of 250,000+ competing courses. The money is in your own audience and in
                company workshops, which pay multiples of what individuals pay for a course — not in
                hoping marketplace search finds you.
              </li>
              <li>
                <strong>Consulting-adjacent content</strong> — write in public about the problems you
                solve; it&apos;s the cheapest marketing for the freelancing and product streams above.
              </li>
            </ul>
            <p className="mt-3">
              The honest part: content compounds slowly, and most people quit before it pays. Treat
              it as a side channel to your main stream for the first six months.
            </p>
          </section>

          {/* Section 8: AI-era gigs */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900">The AI-Specific Gigs — Real, But Read the Fine Print</h2>
            <p className="mt-3">
              A few income streams only exist <em>because</em> of the AI boom:
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-6">
              <li>
                <strong>AI agent and automation services for small businesses.</strong> Local
                clinics, agencies, and law firms all &quot;need AI&quot; and have no idea how. A
                developer who can audit a workflow and ship an automation charges $2k–$10k per
                engagement. This is the strongest of the bunch because it&apos;s new and deeply
                under-served.
              </li>
              <li>
                <strong>Data annotation and RLHF work.</strong> Real, pays hourly, requires no
                interview — and it&apos;s also being automated away. Treat it as a stopgap, not a plan.
              </li>
              <li>
                <strong>Evals and fine-tuning help.</strong> Startups racing to ship LLM features
                need people who can build evaluation suites and prompt pipelines. It&apos;s freelancing
                with a new label — but the label is hot, so rates are currently inflated. Enjoy it
                while it lasts.
              </li>
            </ul>
            <p className="mt-3">
              There&apos;s real demand behind this: AI apps and integration is the fastest-growing
              category in Upwork&apos;s history, and AI-augmented professional services grew 72% in
              volume year over year.
            </p>
          </section>

          {/* Section 9: What to skip */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900">What to Skip — Scams Prey on the Recently Laid Off</h2>
            <p className="mt-3">
              Unemployed people with severance packages are a target demographic. The tells are
              consistent:
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-6">
              <li>
                <strong>Anything that charges you up front.</strong> &quot;Guaranteed AI job&quot;
                bootcamps, paid mentorship programs, resume &quot;optimizers.&quot; Real work pays
                <em> you</em> — the streams above all do.
              </li>
              <li>
                <strong>Fake remote jobs.</strong> Offers that arrive without an interview, or ask
                you to buy equipment with a check they send. No legitimate employer does this.
              </li>
              <li>
                <strong>Get-rich-crypto and MLM recruiting.</strong> If the pitch is about
                recruiting others rather than shipping something, it&apos;s a pyramid wearing a tech
                costume.
              </li>
            </ul>
            <p className="mt-3">
              One rule of thumb covers all of it: <strong>income flows toward the people doing the
              work.</strong> If an opportunity makes money without work, someone else is making it
              <em> from</em> you.
            </p>
          </section>

          {/* Section 10: How to pick */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900">How to Pick: Expected Return per Day, Applied to Everything</h2>
            <p className="mt-3">
              You can&apos;t do all five streams at once — especially not while applying to jobs.
              The same formula we use to rank hackathons works for choosing between streams:
            </p>
            <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50/50 p-4 text-center">
              <p className="font-mono text-sm text-gray-800">
                worth doing = payout × your fit × win chance ÷ time until it pays
              </p>
            </div>
            <p className="mt-3">
              Three concrete starting points:
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-6">
              <li>
                <strong>Runway under 2 months:</strong> hackathons + RLHF annotation to stop the
                bleed, job applications in parallel.
              </li>
              <li>
                <strong>Runway 2–6 months:</strong> hackathons + freelancing, one micro-product idea
                on the side.
              </li>
              <li>
                <strong>Runway 6+ months:</strong> micro-product as the main bet, freelance one day
                a week for cash flow, hackathons for the occasional spike.
              </li>
            </ul>
            <p className="mt-3">
              The uncomfortable truth of the AI era is that the salary-shaped career is shrinking,
              but the <em>income</em> isn&apos;t — it&apos;s just distributed differently, to people
              who go find it. Every stream on this list is findable, and every one of them pays
              you in proportion to shipped work, not tenure. That&apos;s bad news for coasters and
              great news for people reading survival guides.
            </p>
          </section>

          {/* Section 11: Sources */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900">Where the Numbers Come From</h2>
            <p className="mt-3">
              The figures above are from public reports and platform data (a few practical estimates
              are marked as such in the text):
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-6">
              <li>
                <strong>Hackathons:</strong> analysis of 12,155 Devpost hackathons (2008–2025) —{' '}
                <a
                  href="https://github.com/analisto/devpost_com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 underline underline-offset-2 hover:text-indigo-800"
                >
                  github.com/analisto/devpost_com
                </a>
              </li>
              <li>
                <strong>Freelancing &amp; AI:</strong> Upwork Future Workforce Index 2026 —{' '}
                <a
                  href="https://www.upwork.com/research/research-future-workforce-index-2026"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 underline underline-offset-2 hover:text-indigo-800"
                >
                  upwork.com/research
                </a>{' '}
                — and Vollna&apos;s analysis of 2.2M+ Upwork projects —{' '}
                <a
                  href="https://www.vollna.com/reports/upwork-projects-following-the-money-2025"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 underline underline-offset-2 hover:text-indigo-800"
                >
                  vollna.com
                </a>
              </li>
              <li>
                <strong>AI productivity:</strong> the BCG/Harvard field study of 758 consultants,
                &quot;Navigating the Jagged Technological Frontier&quot; (Dell&apos;Acqua et al., 2023) —{' '}
                <a
                  href="https://www.forbes.com/sites/danpontefract/2023/09/29/harvard-and-bcg-unveil-the-double-edged-sword-of-ai-in-the-workplace/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 underline underline-offset-2 hover:text-indigo-800"
                >
                  coverage at Forbes
                </a>
              </li>
              <li>
                <strong>Bug bounties:</strong> HackerOne 9th Hacker-Powered Security Report —{' '}
                <a
                  href="https://www.hackerone.com/report/hacker-powered-security"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 underline underline-offset-2 hover:text-indigo-800"
                >
                  hackerone.com/report
                </a>{' '}
                — and Immunefi payout data —{' '}
                <a
                  href="https://immunefi.com/bug-bounty/immunefi/information/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 underline underline-offset-2 hover:text-indigo-800"
                >
                  immunefi.com
                </a>
              </li>
              <li>
                <strong>Micro-SaaS:</strong> ScrapingFish analysis of Stripe-verified Indie Hackers
                products and 2025 indie-founder survey data —{' '}
                <a
                  href="https://www.twocents.software/blog/solopreneur-saas-realistic-expectations-for-one-person-ops/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 underline underline-offset-2 hover:text-indigo-800"
                >
                  twocents.software
                </a>
              </li>
              <li>
                <strong>Course income:</strong> Class Central&apos;s 2025 Udemy instructor analysis and
                Udemy&apos;s SEC filings —{' '}
                <a
                  href="https://spondula.com/insights/why-course-creators-on-udemy-and-skillshare-earn-so-little-and-what-to-do-about-it"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 underline underline-offset-2 hover:text-indigo-800"
                >
                  spondula.com
                </a>{' '}
                and{' '}
                <a
                  href="https://supatutor.in/how-much-do-udemy-instructors-make/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 underline underline-offset-2 hover:text-indigo-800"
                >
                  supatutor.in
                </a>
              </li>
            </ul>
          </section>

          {/* Section 12: FAQ */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900">FAQ</h2>

            <h3 className="mt-4 text-lg font-semibold text-gray-900">
              How much can I realistically make in my first month?
            </h3>
            <p className="mt-1">
              Depends on the stream. A strong hackathon run can pay $1k–$5k within the first month.
              Freelancing usually pays $0 the first month (finding clients), then $2k–$8k/month.
              Bounties and products are effectively zero until they aren&apos;t. Plan for a fast
              stream and a slow stream simultaneously.
            </p>

            <h3 className="mt-4 text-lg font-semibold text-gray-900">
              Is it worth learning AI skills, or should I double down on what I know?
            </h3>
            <p className="mt-1">
              Both, in that order: keep your depth, and learn to ship with AI tools on top of it.
              Depth without AI still gets hired; AI without depth competes with everyone who owns a
              chatbot subscription. The combination — a senior who moves at AI speed — is the most
              valuable profile on the market right now.
            </p>

            <h3 className="mt-4 text-lg font-semibold text-gray-900">
              Do these income streams hurt my chances of getting a job later?
            </h3>
            <p className="mt-1">
              The opposite. A resume showing hackathon wins, paid freelance work, or a product with
              revenue beats a resume showing a gap. Interviewers don&apos;t ask &quot;why were you
              unemployed&quot; when the answer is &quot;I won three hackathons and built a product
              doing $2k/mo.&quot;
            </p>

            <h3 className="mt-4 text-lg font-semibold text-gray-900">
              Where do I start with cash prize hackathons?
            </h3>
            <p className="mt-1">
              Pick your skills on{' '}
              <Link
                href="/"
                className="font-semibold text-indigo-600 underline underline-offset-2 hover:text-indigo-800"
              >
                hackradar.win
              </Link>{' '}
              and sort by recommended — every event is ranked by expected return per day, so the
              best opportunities for your skills are already on top. Filter by prize size and
              deadline, register, and build something small but demoable.
            </p>
          </section>

          {/* CTA */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900">Start with the Fastest Stream</h2>
            <p className="mt-3">
              You already have the skills. The fastest way to prove it — to yourself and to your
              bank account — is a weekend project with a prize attached. Open{' '}
              <Link
                href="/"
                className="font-semibold text-indigo-600 underline underline-offset-2 hover:text-indigo-800"
              >
                hackradar.win
              </Link>
              , pick your skills, and the feed ranks 400+ upcoming cash prize hackathons by expected
              return per day. No signup, no resume — just pick one and build.
            </p>
          </section>
        </article>

        {/* Footer CTA */}
        <div className="mt-12 rounded-2xl border border-indigo-200 bg-indigo-50/50 px-6 py-8 text-center">
          <p className="text-xl font-bold text-gray-900">What are your skills worth this weekend?</p>
          <p className="mt-2 text-gray-600">
            Pick your skills and see every cash prize hackathon ranked by expected return — the
            fastest income stream for unemployed programmers.
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
