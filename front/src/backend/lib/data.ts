import { slugify } from './utils';
import { computeClusterKey } from './dedup';

// ---- Types ----

export interface Hackathon {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  url: string;
  imageUrl: string | null;
  mode: string;
  location: string | null;
  startDate: string;
  endDate: string;
  timezone: string | null;
  prizePool: string | null;
  themes: string;
  platformId: string;
  sourceId: string;
  source: string;
  clusterKey: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  platform: { name: string; slug: string; logoUrl: string | null };
}

export interface Platform {
  id: string;
  name: string;
  slug: string;
  websiteUrl: string | null;
  logoUrl: string | null;
  createdAt: string;
}

export interface HackathonInput {
  title: string;
  description?: string | null;
  url: string;
  imageUrl?: string | null;
  mode?: string;
  location?: string | null;
  startDate: string;
  endDate: string;
  timezone?: string | null;
  prizePool?: string | null;
  themes?: string[];
  sourceId: string;
  source: string;
  status?: string;
}

const DEFAULT_PLATFORMS: Platform[] = [
  { id: 'devpost', name: 'Devpost', slug: 'devpost', websiteUrl: 'https://devpost.com', logoUrl: null, createdAt: new Date().toISOString() },
  { id: 'mlh', name: 'MLH', slug: 'mlh', websiteUrl: 'https://mlh.io', logoUrl: null, createdAt: new Date().toISOString() },
  { id: 'hackerearth', name: 'HackerEarth', slug: 'hackerearth', websiteUrl: 'https://www.hackerearth.com', logoUrl: null, createdAt: new Date().toISOString() },
  { id: 'devfolio', name: 'Devfolio', slug: 'devfolio', websiteUrl: 'https://devfolio.co', logoUrl: null, createdAt: new Date().toISOString() },
  { id: 'unstop', name: 'Unstop', slug: 'unstop', websiteUrl: 'https://unstop.com', logoUrl: null, createdAt: new Date().toISOString() },
];

const PLATFORM_MAP = new Map(DEFAULT_PLATFORMS.map((p) => [p.slug, p]));

// ---- R2 / Local JSON Storage ----

function hackathonsKey() {
  return 'hackathons.json';
}

function platformsKey() {
  return 'platforms.json';
}

async function getR2Bucket(): Promise<any> {
  try {
    // In Cloudflare Workers, R2 bindings are on env
    const env = (globalThis as any).__env__ || process.env;
    return env.DATA_BUCKET || null;
  } catch {
    return null;
  }
}

async function readJSON<T>(key: string, fallback: T): Promise<T> {
  const bucket = await getR2Bucket();
  if (bucket) {
    try {
      const obj = await bucket.get(key);
      if (obj) return (await obj.json()) as T;
    } catch { /* fall through */ }
    return fallback;
  }

  // Local dev: read from file system via Node.js
  try {
    const fs = await import('fs/promises');
    const path = await import('path');
    const filePath = path.join(process.cwd(), 'data', key);
    const raw = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function writeJSON<T>(key: string, data: T): Promise<void> {
  const bucket = await getR2Bucket();
  if (bucket) {
    await bucket.put(key, JSON.stringify(data, null, 2));
    return;
  }

  // Local dev: write to file system
  try {
    const fs = await import('fs/promises');
    const path = await import('path');
    const dir = path.join(process.cwd(), 'data');
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(path.join(dir, key), JSON.stringify(data, null, 2));
  } catch { /* ignore */ }
}

// ---- Public API ----

export async function getAllHackathons(): Promise<Hackathon[]> {
  return readJSON<Hackathon[]>(hackathonsKey(), []);
}

export async function getHackathon(id: string): Promise<Hackathon | null> {
  const all = await getAllHackathons();
  return all.find((h) => h.id === id) || null;
}

export async function upsertHackathon(input: HackathonInput): Promise<Hackathon> {
  const all = await getAllHackathons();
  const now = new Date().toISOString();
  const platform = PLATFORM_MAP.get(input.source);

  const existing = all.findIndex((h) => h.sourceId === input.sourceId);
  const slug = slugify(input.title);
  const clusterKey = await computeClusterKey(input.title, input.startDate);

  const hackathon: Hackathon = {
    id: existing >= 0 ? all[existing].id : crypto.randomUUID(),
    title: input.title,
    slug,
    description: input.description || null,
    url: input.url,
    imageUrl: input.imageUrl || null,
    mode: input.mode || 'online',
    location: input.location || null,
    startDate: input.startDate,
    endDate: input.endDate,
    timezone: input.timezone || null,
    prizePool: input.prizePool || null,
    themes: JSON.stringify(input.themes || []),
    platformId: platform?.id || input.source,
    sourceId: input.sourceId,
    source: input.source,
    clusterKey,
    status: input.status || 'active',
    createdAt: existing >= 0 ? all[existing].createdAt : now,
    updatedAt: now,
    platform: platform || { name: input.source, slug: input.source, logoUrl: null },
  };

  if (existing >= 0) {
    all[existing] = hackathon;
  } else {
    all.push(hackathon);
  }

  await writeJSON(hackathonsKey(), all);
  return hackathon;
}

export async function markEnded(id: string): Promise<void> {
  const all = await getAllHackathons();
  const idx = all.findIndex((h) => h.id === id);
  if (idx >= 0) {
    all[idx].status = 'past';
    all[idx].updatedAt = new Date().toISOString();
    await writeJSON(hackathonsKey(), all);
  }
}

export async function getPlatformsData(): Promise<Platform[]> {
  return readJSON<Platform[]>(platformsKey(), DEFAULT_PLATFORMS);
}

// Initialize platforms on first run
export async function ensurePlatforms(): Promise<void> {
  const existing = await readJSON<Platform[]>(platformsKey(), []);
  if (existing.length === 0) {
    await writeJSON(platformsKey(), DEFAULT_PLATFORMS);
  }
}
