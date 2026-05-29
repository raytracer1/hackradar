import { getCloudflareContext } from '@opennextjs/cloudflare';

export interface HackathonData {
  title: string;
  description: string | null;
  url: string;
  imageUrl: string | null;
  mode: string;
  location: string | null;
  startDate: string;
  endDate: string;
  timezone: string | null;
  prizePool: string | null;
  themes: string[];
  sourceId: string;
  source: string;
  status: string;
}

const META_KEY = 'meta.json';

async function getR2(): Promise<any> {
  try {
    const { env } = await getCloudflareContext({ async: true });
    return (env as any).DATA_BUCKET || null;
  } catch {
    return null;
  }
}

async function readJSON(key: string): Promise<any> {
  const bucket = await getR2();
  if (!bucket) return null;

  try {
    const obj = await bucket.get(key);
    if (obj) return await obj.json();
  } catch { /* ignore */ }
  return null;
}

export async function getMeta(): Promise<{ version: string; count: number } | null> {
  return readJSON(META_KEY);
}

export async function getCurrentHackathons(): Promise<HackathonData[]> {
  const meta = await getMeta();
  if (!meta) return [];

  const fileCount = (meta as any).fileCount || 1;
  const all: HackathonData[] = [];

  for (let i = 1; i <= fileCount; i++) {
    const key = `hackathons-${meta.version}-${i}.json`;
    const chunk = await readJSON(key);
    if (chunk && Array.isArray(chunk)) {
      all.push(...chunk);
    }
  }

  // Fallback: old single-file format
  if (all.length === 0) {
    const single = await readJSON(`hackathons-${meta.version}.json`);
    if (single && Array.isArray(single)) {
      all.push(...single);
    }
  }

  return all;
}

export async function getCurrentPlatforms(): Promise<any[]> {
  const hackathons = await getCurrentHackathons();
  const seen = new Set<string>();
  const platforms: any[] = [];
  for (const h of hackathons) {
    const slug = h.source;
    if (!seen.has(slug)) {
      seen.add(slug);
      platforms.push({
        id: slug,
        name: slug.charAt(0).toUpperCase() + slug.slice(1),
        slug,
        websiteUrl: null,
        logoUrl: null,
      });
    }
  }
  return platforms;
}
