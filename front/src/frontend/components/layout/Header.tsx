import Link from 'next/link';
import Navbar from './Navbar';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold text-primary-600">HackRadar</span>
        </Link>
        <Navbar />
      </div>
    </header>
  );
}
