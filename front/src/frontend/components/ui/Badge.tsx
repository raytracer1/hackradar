interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'online' | 'offline' | 'hybrid' | 'active' | 'past';
}

const variants: Record<string, string> = {
  default: 'bg-gray-100 text-gray-700',
  online: 'bg-green-100 text-green-700',
  offline: 'bg-blue-100 text-blue-700',
  hybrid: 'bg-purple-100 text-purple-700',
  active: 'bg-green-100 text-green-700',
  past: 'bg-gray-100 text-gray-500',
};

export default function Badge({ children, variant = 'default' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${variants[variant]}`}>
      {children}
    </span>
  );
}
