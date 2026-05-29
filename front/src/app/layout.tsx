import type { Metadata } from 'next';
import Header from '@/frontend/components/layout/Header';
import Footer from '@/frontend/components/layout/Footer';
import './globals.css';

export const metadata: Metadata = {
  title: 'HackRadar - Discover Hackathons',
  description: 'Aggregate and discover hackathons from Devpost, MLH, HackerEarth, Devfolio, and more.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">
        <Header />
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
