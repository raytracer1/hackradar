import type { Metadata } from 'next';
import Script from 'next/script';
import JsonLd from '@/frontend/components/seo/JsonLd';
import './globals.css';

const GA_ID = process.env.NEXT_PUBLIC_GA_ID || '';
const ADS_ID = process.env.NEXT_PUBLIC_ADS_ID || '';
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: 'Discover Cash Prize Hackathons — HackRadar',
    template: '%s | HackRadar',
  },
  description: 'Find hackathons with cash prizes and money rewards. Browse upcoming coding competitions from Devpost, MLH, HackerEarth, Devfolio that pay real money. Discover cash prize hackathons now.',
  keywords: [
    'cash prize hackathons', 'hackathons with money', 'coding competitions with cash',
    'hackathon prizes', 'money rewards', 'cash rewards', 'tech events',
    'Devpost', 'MLH', 'Major League Hacking', 'HackerEarth', 'Devfolio',
    'programming contests', 'software competitions', 'online hackathons',
    'hackathons that pay', 'hackathon aggregator',
  ],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'HackRadar',
    title: 'Discover Cash Prize Hackathons — HackRadar',
    description: 'Find hackathons with cash prizes and money rewards. Browse coding competitions that pay real money from Devpost, MLH, HackerEarth, and more.',
    url: baseUrl,
    images: [
      {
        url: '/og-default.png',
        width: 1200,
        height: 630,
        alt: 'Discover cash prize hackathons with HackRadar',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Discover Cash Prize Hackathons — HackRadar',
    description: 'Find hackathons with cash prizes and money rewards. Browse coding competitions that pay real money.',
    images: ['/og-default.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: baseUrl,
    types: {
      'application/rss+xml': `${baseUrl}/rss.xml`,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {ADS_ID && (
          <>
            <meta name="google-adsense-account" content={ADS_ID} />
            <script
              async
              src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADS_ID}`}
              crossOrigin="anonymous"
            />
          </>
        )}
        {GA_ID && (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
            <Script id="ga-init" strategy="afterInteractive">
              {`window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_ID}');`}
            </Script>
          </>
        )}
        <JsonLd
          data={{
            '@context': 'https://schema.org',
            '@graph': [
              {
                '@type': 'WebSite',
                '@id': `${baseUrl}/#website`,
                url: baseUrl,
                name: 'HackRadar',
                description: 'Discover cash prize hackathons with real money rewards. Browse upcoming coding competitions from Devpost, MLH, HackerEarth, Devfolio, and more.',
                inLanguage: 'en-US',
                potentialAction: {
                  '@type': 'SearchAction',
                  target: {
                    '@type': 'EntryPoint',
                    urlTemplate: `${baseUrl}/?search={search_term_string}`,
                  },
                  'query-input': 'required name=search_term_string',
                },
              },
              {
                '@type': 'Organization',
                '@id': `${baseUrl}/#organization`,
                name: 'HackRadar',
                url: baseUrl,
                logo: `${baseUrl}/og-default.png`,
                description: 'Discover cash prize hackathons with real money rewards. Browse upcoming coding competitions from Devpost, MLH, HackerEarth, Devfolio, and more.',
              },
            ],
          }}
        />
      </head>
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">
        <main className="mx-auto max-w-7xl px-4 pt-4 pb-4 sm:px-6 lg:px-8">
          {children}
        </main>
        <footer className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-6">
          <div className="border-t border-gray-200 py-8">
            <div className="grid gap-8 lg:grid-cols-2">
              {/* Brand */}
              <div>
                <a href="/" className="text-lg font-bold text-gray-900">
                  HackRadar
                </a>
                <p className="mt-2 text-sm text-gray-500 leading-relaxed">
                  Discover cash prize hackathons from 14 platforms — all in one place.
                </p>
                <a
                  href="https://x.com/BJ_Zheng"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Follow HackRadar on X"
                  className="mt-3 inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:border-indigo-600 hover:text-indigo-600 transition-colors"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
              </div>

              <div className="grid gap-8 sm:grid-cols-3">
                {/* Links */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400">Links</h4>
                <ul className="mt-3 space-y-2">
                  <li>
                    <a href="/blog" className="text-sm text-gray-500 hover:text-indigo-600 transition-colors">
                      Blog
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://github.com/raytracer1/hackradar"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-gray-500 hover:text-indigo-600 transition-colors"
                    >
                      GitHub
                    </a>
                  </li>
                </ul>
              </div>

              {/* Contact */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400">Contact</h4>
                <ul className="mt-3 space-y-2">
                  <li>
                    <a
                      href="mailto:hello@hackradar.win"
                      className="text-sm text-gray-500 hover:text-indigo-600 transition-colors"
                    >
                      hello@hackradar.win
                    </a>
                  </li>
                </ul>
              </div>

              {/* Friendly Links */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400">Friendly Links</h4>
                <ul className="mt-3 space-y-2">
                  <li>
                    <a
                      href="https://www.hackdemo.win"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors"
                    >
                      HackDemo
                    </a>
                    <p className="mt-0.5 text-xs text-gray-400">
                      Ship a pitch-ready demo before the hackathon deadline
                    </p>
                  </li>
                </ul>
                </div>
              </div>
            </div>

            <div className="mt-8 border-t border-gray-100 pt-6 text-center text-xs text-gray-400">
              &copy; {new Date().getFullYear()} HackRadar. All rights reserved.
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
