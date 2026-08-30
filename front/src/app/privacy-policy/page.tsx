import type { Metadata } from 'next';
import Link from 'next/link';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: 'Privacy Policy',
  description:
    'How HackRadar handles your data: what we collect, how Google Analytics uses cookies, and your privacy rights.',
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: `${baseUrl}/privacy-policy`,
  },
};

export default function PrivacyPolicy() {
  return (
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
            <span className="text-gray-600">Privacy Policy</span>
          </li>
        </ol>
      </nav>

      <header>
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">Privacy Policy</h1>
        <p className="mt-3 text-sm text-gray-400">Effective date: August 21, 2026</p>
      </header>

      <hr className="mt-8 border-gray-200" />

      <article className="mt-8 space-y-8 text-base leading-relaxed text-gray-700">
        <section>
          <h2 className="text-2xl font-bold text-gray-900">Overview</h2>
          <p className="mt-3">
            HackRadar (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;) operates the website{' '}
            <a href={baseUrl} className="text-indigo-600 hover:underline">
              hackradar.win
            </a>{' '}
            (&quot;the Service&quot;). This page explains what information we collect, how it is
            used, and the choices you have. HackRadar does not require an account — you can browse
            the entire site without providing any personal information.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900">Information We Collect</h2>
          <ul className="mt-3 list-disc space-y-2 pl-6">
            <li>
              <strong className="text-gray-900">Usage analytics.</strong> We use Google Analytics
              to understand aggregate usage: pages visited, approximate location (country/city
              level), device type, and referral source. Google Analytics may collect your IP
              address; we use it only in aggregate form.
            </li>
            <li>
              <strong className="text-gray-900">Local storage.</strong> The &quot;Known&quot;
              feature stores the list of hackathons you have marked as known in your browser&apos;s
              local storage. This data never leaves your device and is never sent to our servers.
            </li>
            <li>
              <strong className="text-gray-900">Server logs.</strong> Like most websites, our
              hosting provider (Cloudflare) processes standard request logs (IP address, user
              agent, timestamps) for security and performance purposes.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900">Your Rights</h2>
          <p className="mt-3">
            Depending on your jurisdiction (including the EU/EEA under GDPR and California under
            CCPA), you may have the right to access, correct, or delete personal data, and to
            object to or restrict certain processing. Since HackRadar does not operate accounts
            and stores no personal data itself, most requests concern data held by Google
            Analytics; you can exercise those rights through Google&apos;s tools.
          </p>
          <p className="mt-3">
            To exercise any right with respect to HackRadar, or to ask about this policy, contact
            us at{' '}
            <a href="mailto:hello@hackradar.win" className="text-indigo-600 hover:underline">
              hello@hackradar.win
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900">Data Retention</h2>
          <p className="mt-3">
            Analytics data is retained in aggregate per Google Analytics&apos; retention settings.
            We do not operate a database of user data, and we do not sell personal information.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900">Children&apos;s Privacy</h2>
          <p className="mt-3">
            The Service is not directed to children under 13, and we do not knowingly collect
            personal information from children. If you believe a child has provided personal
            information, contact us and we will take steps to remove it.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900">Changes to This Policy</h2>
          <p className="mt-3">
            We may update this policy from time to time. Changes take effect when posted on this
            page, and the effective date above will be updated accordingly.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900">Contact</h2>
          <p className="mt-3">
            Questions about this Privacy Policy:{' '}
            <a href="mailto:hello@hackradar.win" className="text-indigo-600 hover:underline">
              hello@hackradar.win
            </a>
          </p>
        </section>
      </article>
    </div>
  );
}
