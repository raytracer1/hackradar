import Link from 'next/link';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  href?: string;
  className?: string;
  onClick?: () => void;
  type?: 'button' | 'submit';
}

const baseVariants: Record<string, string> = {
  primary: 'bg-primary-600 text-white hover:bg-primary-700 shadow-sm',
  secondary: 'bg-gray-800 text-white hover:bg-gray-900',
  outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50',
};

const sizes: Record<string, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};

export default function Button({ children, variant = 'primary', size = 'md', href, className = '', onClick, type = 'button' }: ButtonProps) {
  const classes = `inline-flex items-center justify-center rounded-lg font-medium transition-colors ${baseVariants[variant]} ${sizes[size]} ${className}`;

  if (href) {
    return <Link href={href} className={classes}>{children}</Link>;
  }

  return <button type={type} onClick={onClick} className={classes}>{children}</button>;
}
