import type { Metadata } from 'next';
import Script from 'next/script';
import Footer from '@/frontend/components/layout/Footer';
import './globals.css';

const GA_ID = process.env.NEXT_PUBLIC_GA_ID || '';
const ADS_ID = process.env.NEXT_PUBLIC_ADS_ID || '';

export const metadata: Metadata = {
  title: 'HackRadar - Discover Hackathons',
  description: 'Aggregate and discover hackathons from Devpost, MLH, HackerEarth, Devfolio, and more.',
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
      </head>
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">
        <main className="mx-auto max-w-7xl px-4 pt-2 pb-8 sm:px-6 lg:px-8">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
