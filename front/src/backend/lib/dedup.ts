import crypto from 'crypto';

function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function computeClusterKey(title: string, startDate: Date): string {
  const normalized = normalizeTitle(title);
  const monthKey = startDate.toISOString().slice(0, 7);
  const raw = `${normalized}|${monthKey}`;
  return crypto.createHash('sha256').update(raw).digest('hex');
}
