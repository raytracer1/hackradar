import Badge from '@/frontend/components/ui/Badge';

const modeLabel: Record<string, string> = {
  online: 'Online',
  offline: 'Offline',
  hybrid: 'Hybrid',
};

export default function HackathonStatusBadge({ mode }: { mode: string }) {
  return <Badge variant={mode as 'online' | 'offline' | 'hybrid'}>{modeLabel[mode] || mode}</Badge>;
}
