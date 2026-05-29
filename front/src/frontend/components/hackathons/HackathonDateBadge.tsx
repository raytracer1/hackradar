function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function HackathonDateBadge({ startDate, endDate }: { startDate: string; endDate: string }) {
  return (
    <span className="text-sm text-gray-500">
      {formatDate(startDate)} — {formatDate(endDate)}
    </span>
  );
}
