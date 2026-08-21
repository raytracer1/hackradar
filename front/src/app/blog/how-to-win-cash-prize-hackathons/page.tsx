import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/frontend/components/seo/JsonLd';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
const postUrl = `${baseUrl}/blog/how-to-win-cash-prize-hackathons`;
const ogImage = `${baseUrl}/og-default.png`;

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: 'How to Win Cash Prize Hackathons — A Practical Guide',
  description:
    'A practical guide to winning cash prize hackathons: picking winnable events, scoping a demoable core, building around sponsors, and nailing the pitch video.',
  keywords: [
    'how to win hackathons',
    'hackathon tips',
    'hackathon strategy',
    'win cash prize hackathons',
    'hackathon guide',
    'hackathon demo tips',
    'hackathon pitch',
    'hackathon judging criteria',
    'hackathon submission checklist',
    'hackathon with cash prizes',
  ],
  openGraph: {
    type: 'article',
    locale: 'en_US',
    siteName: 'HackRadar',
    title: 'How to Win Cash Prize Hackathons — A Practical Guide',
    description:
      'Picking winnable events, scoping a demoable core, building around sponsors, and nailing the pitch — everything that actually moves the needle.',
    url: postUrl,
    publishedTime: '2026-08-20T00:00:00.000Z',
    modifiedTime: '2026-08-20T00:00:00.000Z',
    authors: ['HackRadar'],
    images: [
      {
        url: ogImage,
        width: 1200,
        height: 630,
        alt: 'How to win cash prize hackathons — a practical guide',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'How to Win Cash Prize Hackathons — A Practical Guide',
    description:
      'Picking winnable events, scoping a demoable core, building around sponsors, and nailing the pitch — everything that actually moves the needle.',
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
          name: 'How to Win Cash Prize Hackathons',
          item: postUrl,
        },
      ],
    },
    // Article
    {
      '@type': 'BlogPosting',
      '@id': `${postUrl}/#article`,
      url: postUrl,
      headline: 'How to Win Cash Prize Hackathons — A Practical Guide',
      description:
        'A practical guide to winning cash prize hackathons: picking winnable events, scoping a demoable core, building around sponsors, and nailing the pitch video.',
      datePublished: '2026-08-20T00:00:00.000Z',
      dateModified: '2026-08-20T00:00:00.000Z',
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
      wordCount: 1400,
      inLanguage: 'en-US',
      about: [
        { '@type': 'Thing', name: 'Hackathons' },
        { '@type': 'Thing', name: 'Cash Prizes' },
        { '@type': 'Thing', name: 'Hackathon Strategy' },
      ],
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'Do I need a team to win a hackathon?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'No, but a team of 2–4 with complementary skills wins more often. Solo developers do best in smaller prize pools (under $10,000), where the submission quality bar is lower. If you do join a team, make sure at least one person can present and one can polish the demo — most submissions lose points on packaging, not code.',
          },
        },
        {
          '@type': 'Question',
          name: 'What do judges look for in cash prize hackathons?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Judges usually score on three to five criteria printed in the rules — typically innovation, technical execution, use of sponsor technology, and presentation quality. Read the criteria before you start building and design your demo to hit every bullet. Most teams never open this section, which is why polished-but-average products keep beating complex-but-messy ones.',
          },
        },
        {
          '@type': 'Question',
          name: 'How long should the demo video be?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Aim for 2–3 minutes, and put the product demo in the first 10 seconds. Judges watch dozens of videos back-to-back; a hook that shows the working product immediately keeps them engaged. Record at 1080p, check the audio, and upload the video at least a few hours before the deadline — encoding and timezone issues are the most common way to miss a submission.',
          },
        },
        {
          '@type': 'Question',
          name: 'Which hackathon should I choose to maximize my chances?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Choose one where the domain matches your strengths, the prize pool is mid-sized ($2,000–$15,000), and the sponsor’s technology is something you’ve used before. Bigger pools attract more experienced teams; sponsor tracks inside larger events often have far fewer competitors than the grand prize. A tool like HackRadar helps you filter by prize range and deadline to find events that fit.',
          },
        },
      ],
    },
  ],
};

export default function HowToWinPost() {
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
              <span className="text-gray-600">How to Win Cash Prize Hackathons</span>
            </li>
          </ol>
        </nav>

        {/* Header */}
        <header>
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
            How to Win{' '}
            <span className="bg-gradient-to-r from-indigo-600 to-indigo-500 bg-clip-text text-transparent">
              Cash Prize
            </span>{' '}
            Hackathons
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-gray-500">
            Cash prize hackathons attract sharper competition than swag-only events. But most
            winners aren't the best coders — they're the best at picking winnable events, scoping
            to a demoable core, and packaging the pitch. Here's the full playbook.
          </p>

          {/* Meta */}
          <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-gray-400">
            <time dateTime="2026-08-20">August 20, 2026</time>
            <span aria-hidden="true">·</span>
            <span>6 min read</span>
            <span aria-hidden="true">·</span>
            <span>HackRadar Team</span>
          </div>
        </header>

        {/* Divider */}
        <hr className="mt-8 border-gray-200" />

        {/* Body */}
        <article className="mt-8 space-y-8 text-base leading-relaxed text-gray-700">
          {/* Section 1: Pick the right event */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900">1. Pick a Hackathon You Can Actually Win</h2>
            <p className="mt-3">
              The single biggest lever isn't your code — it's which event you enter. A $50,000 pool
              attracts experienced teams and 200+ submissions; a $5,000 pool might get 30, half of
              them half-finished. Until you have a track record, mid-sized pools are the sweet spot.
            </p>
            <p className="mt-3">
              Three filters to apply when choosing:
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-6">
              <li>
                <strong className="text-gray-900">Domain match.</strong> An AI hackathon where you've
                already used the sponsor's API beats a general one where you're learning everything
                from scratch.
              </li>
              <li>
                <strong className="text-gray-900">Deadline timing.</strong> Two weeks minimum. Check
                the submission requirements before committing — some events require essays,
                repository access, or a video alongside the demo.
              </li>
              <li>
                <strong className="text-gray-900">Competition density.</strong> Sponsor tracks inside
                a big event often have a fraction of the grand prize's competitors.
              </li>
            </ul>
            <p className="mt-3">
              <Link
                href="/"
                className="font-semibold text-indigo-600 underline underline-offset-2 hover:text-indigo-800"
              >
                Browse cash prize hackathons on HackRadar
              </Link>{' '}
              and filter by prize range and deadline to find events that fit your profile.
            </p>
          </section>

          {/* Section 2: Team */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900">2. Assemble the Right Team (or Go Solo)</h2>
            <p className="mt-3">
              The winning team shape is 2–4 people with complementary skills: one or two builders, one
              person who can present well, and ideally someone with design sense. Avoid all-backend
              teams (your demo will look like a terminal), teams of five or more (coordination
              overhead eats the weekend), and strangers with zero shared working time.
            </p>
            <p className="mt-3">
              Solo is completely viable in smaller prize pools — the submission bar is lower, and
              there's no merge-conflict tax. If you go solo, budget extra time for the video and
              deck; those hours have to come out of your own build time.
            </p>
          </section>

          {/* Section 3: Rules */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900">3. Read the Rules Like a Contract</h2>
            <p className="mt-3">
              Most disqualifications come from missed submission requirements, not bad products:
              wrong file formats, missing repository access, ignored eligibility rules, or skipping
              a required deliverable. Copy the requirements into a checklist on day one and check
              them off at the end.
            </p>
            <p className="mt-3">
              Then find the <strong className="text-gray-900">judging criteria</strong> — usually
              three to five bullets like "innovation", "technical execution", "use of sponsor
              technology", and "presentation quality". Most teams never read them. Design your demo
              to hit every single bullet, in order. This alone explains why polished-but-average
              products keep beating complex-but-messy ones.
            </p>
          </section>

          {/* Section 4: Sponsors */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900">4. Build Around the Sponsors</h2>
            <p className="mt-3">
              Sponsors fund hackathons to see their own technology used. Using their API, SDK, or
              platform checks the "use of sponsor technology" criterion by default and gives judges
              a concrete reason to score you up. Solve a problem the sponsor cares about — payments
              for a fintech sponsor, developer experience for an infrastructure sponsor — and your
              demo resonates with the people who wrote the prize checks.
            </p>
            <p className="mt-3">
              Bonus: track-specific prizes ("Best use of X") usually have far fewer competitors
              than the grand prize, and nothing stops you from winning both.
            </p>
          </section>

          {/* Section 5: Scope */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900">5. Cut Scope to a Demoable Core</h2>
            <p className="mt-3">
              Judges spend minutes per project. One polished feature beats five half-built ones
              every time. Ruthlessly cut auth flows, admin panels, edge cases, and "nice to have"
              integrations. Keep the single wow moment.
            </p>
            <p className="mt-3">
              If a feature isn't visible in the demo, it doesn't exist for the judges. Hardcode demo
              data instead of building real integrations. Ship the minimum path that shows the
              product working end-to-end, then — only then — add depth.
            </p>
          </section>

          {/* Section 6: Demo video */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900">6. The Demo Video: Show, Don't Tell</h2>
            <p className="mt-3">
              Aim for 2–3 minutes. The first 10 seconds must show the product working — no logo
              intros, no "our journey" slides. Structure that works: <em>problem</em> (10 seconds) →{' '}
              <em>live demo</em> (60–90 seconds) → <em>how you built it</em> (30 seconds) →{' '}
              <em>what's next</em> (10 seconds).
            </p>
            <p className="mt-3">
              Record at 1080p, check the audio on phone speakers (most judges watch on laptops in a
              noisy room), and rehearse once with the product on screen so there's no dead air.
              Upload the video hours before the deadline — encoding queues and timezone surprises
              are the most common way to miss a submission you actually finished.
            </p>
          </section>

          {/* Section 7: Checklist */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900">7. The Submission Checklist</h2>
            <p className="mt-3">
              Before you hit submit, run through this:
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-6">
              <li>Every link works from an incognito window (demo, repo, live URL, video).</li>
              <li>The repository is public with a README that includes how to run it.</li>
              <li>Screenshots and a 1–2 sentence summary are attached.</li>
              <li>A stranger — a friend, a roommate — clicked through once without your help.</li>
              <li>Every required field in the submission form is filled, including prize tracks.</li>
            </ul>
            <p className="mt-3">
              Submit hours early. "It works on my machine" has lost more hackathons than any bug.
            </p>
          </section>

          {/* Section 8: What winners do differently */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900">8. What Winners Do Differently</h2>
            <p className="mt-3">
              Watch enough winning demos and patterns emerge. Winners test with real users — even
              two or three — and bring numbers: "cut onboarding time by 40%", "saved users five
              hours a week". Winners quantify outcomes instead of describing features. Winners
              invest in visual polish: consistent UI, edited video, a deck with one idea per slide.
              And winners never demo live anything that could break — they record the risky parts.
            </p>
            <p className="mt-3">
              None of this requires being the strongest engineer in the room. It requires treating
              the hackathon as a product to ship, not a coding exercise.
            </p>
          </section>

          {/* Section 9: FAQ */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900">FAQ</h2>

            <h3 className="mt-4 text-lg font-semibold text-gray-900">
              Do I need a team to win a hackathon?
            </h3>
            <p className="mt-1">
              No, but a team of 2–4 with complementary skills wins more often. Solo developers do
              best in smaller prize pools (under $10,000), where the submission quality bar is
              lower. If you do join a team, make sure at least one person can present and one can
              polish the demo — most submissions lose points on packaging, not code.
            </p>

            <h3 className="mt-4 text-lg font-semibold text-gray-900">
              What do judges look for in cash prize hackathons?
            </h3>
            <p className="mt-1">
              Judges usually score on three to five criteria printed in the rules — typically
              innovation, technical execution, use of sponsor technology, and presentation quality.
              Read the criteria before you start building and design your demo to hit every bullet.
              Most teams never open this section, which is why polished-but-average products keep
              beating complex-but-messy ones.
            </p>

            <h3 className="mt-4 text-lg font-semibold text-gray-900">
              How long should the demo video be?
            </h3>
            <p className="mt-1">
              Aim for 2–3 minutes, and put the product demo in the first 10 seconds. Judges watch
              dozens of videos back-to-back; a hook that shows the working product immediately
              keeps them engaged. Record at 1080p, check the audio, and upload the video at least a
              few hours before the deadline — encoding and timezone issues are the most common way
              to miss a submission.
            </p>

            <h3 className="mt-4 text-lg font-semibold text-gray-900">
              Which hackathon should I choose to maximize my chances?
            </h3>
            <p className="mt-1">
              Choose one where the domain matches your strengths, the prize pool is mid-sized
              ($2,000–$15,000), and the sponsor's technology is something you've used before.
              Bigger pools attract more experienced teams; sponsor tracks inside larger events
              often have far fewer competitors than the grand prize. A tool like HackRadar helps
              you filter by prize range and deadline to find events that fit.
            </p>
          </section>

          {/* CTA */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900">Ready to Put This to Work?</h2>
            <p className="mt-3">
              The strategy only helps if you have an event to apply it to.{' '}
              <Link
                href="/"
                className="font-semibold text-indigo-600 underline underline-offset-2 hover:text-indigo-800"
              >
                Browse upcoming cash prize hackathons
              </Link>{' '}
              — filter by prize range, sort by deadline, and pick one you can actually win.
            </p>
          </section>
        </article>

      </div>
    </>
  );
}
