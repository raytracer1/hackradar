import Link from 'next/link';

export default function Header() {
  return (
    <header className="border-b border-slate-200 bg-white/90 backdrop-blur-lg supports-[backdrop-filter]:bg-white/70">
      <div className="mx-auto flex h-14 max-w-7xl items-center px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-sm font-bold text-white">H</span>
          <span className="text-lg font-bold tracking-tight text-slate-900">HackRadar</span>
        </Link>
      </div>
    </header>
  );
}
