function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

async function sha256hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function computeClusterKey(title: string, startDate: string): Promise<string> {
  const normalized = normalizeTitle(title);
  const monthKey = startDate.slice(0, 7);
  const raw = `${normalized}|${monthKey}`;
  return sha256hex(raw);
}
