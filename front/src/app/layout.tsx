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
      </body>
    </html>
  );
}
