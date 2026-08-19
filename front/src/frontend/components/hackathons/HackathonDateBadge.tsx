function formatDate(dateStr: string): string {
  // Fixed UTC so the detail panel matches the list dates (see
  // HackathonListItem — timezone-dependent rendering breaks hydration).
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

export default function HackathonDateBadge({ startDate, endDate }: { startDate: string; endDate: string }) {
  return (
    <span className="text-sm text-gray-500">
      {formatDate(startDate)} — {formatDate(endDate)}
    </span>
  );
}
