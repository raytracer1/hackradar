'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/', label: 'Home' },
  { href: '/hackathons', label: 'Hackathons' },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="hidden items-center gap-6 sm:flex">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={`text-sm font-medium transition-colors ${
            pathname === link.href
              ? 'text-primary-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
