import { getCloudflareContext } from '@opennextjs/cloudflare';

export interface HackathonData {
  title: string;
  prizesDetail: string | null;
  // Optional: records crawled before this field existed lack the key.
  participantCount?: number | null;
  // Present in R2 records (the crawler still stores them) but not shown in
  // the detail pane — used only by the /api/recommend matching engine.
  description?: string | null;
  about?: string | null;
  whatToBuild?: string | null;
  whatToSubmit?: string | null;
  eligibility: string | null;
  url: string;
  imageUrl: string | null;
  startDate: string;
  endDate: string;
  timezone: string | null;
  prizePool: string | null;
  themes: string[];
  sourceId: string;
  source: string;
  status: string;
}

export interface HackathonListItem {
  sourceId: string;
  title: string;
  startDate: string;
  endDate: string;
  prizePool: string | null;
  source: string;
}

const META_KEY = 'meta.json';

// R2 credentials for local dev (loaded from .env)
const R2_ENDPOINT = process.env.R2_ENDPOINT || '';
const R2_ACCESS_KEY = process.env.R2_ACCESS_KEY || '';
const R2_SECRET_KEY = process.env.R2_SECRET_KEY || '';
const R2_BUCKET_NAME = process.env.R2_BUCKET || 'hackradar-data';

async function readR2Binding(key: string): Promise<any | null> {
  try {
    const { env } = await getCloudflareContext({ async: true });
    const bucket = (env as any).DATA_BUCKET;
    if (bucket) {
      const obj = await bucket.get(key);
      if (obj) return await obj.json();
    }
  } catch { /* not in Workers */ }
  return null;
}

async function readR2S3(key: string): Promise<any | null> {
  if (!R2_ENDPOINT || !R2_ACCESS_KEY || !R2_SECRET_KEY) return null;

  try {
    const { GetObjectCommand, S3Client } = await import('@aws-sdk/client-s3');

    const s3 = new S3Client({
      region: 'auto',
      endpoint: R2_ENDPOINT,
      credentials: {
        accessKeyId: R2_ACCESS_KEY,
        secretAccessKey: R2_SECRET_KEY,
      },
      forcePathStyle: true,
    });

    const cmd = new GetObjectCommand({ Bucket: R2_BUCKET_NAME, Key: key });
    const resp = await s3.send(cmd);
    const body = await resp.Body?.transformToString();
    return body ? JSON.parse(body) : null;
  } catch {
    return null;
  }
}

async function readJSON(key: string): Promise<any> {
  // Try Cloudflare binding first (production)
  const fromR2 = await readR2Binding(key);
  if (fromR2 !== null) return fromR2;

  // Fallback to S3 API (local dev)
  return readR2S3(key);
}

export async function getMeta(): Promise<{ version: string; count: number; fileCount?: number; listKey?: string } | null> {
  return readJSON(META_KEY);
}

export async function getCurrentHackathons(): Promise<HackathonData[]> {
  const meta = await getMeta();
  if (!meta) return [];

  const fileCount = meta.fileCount || 1;
  const all: HackathonData[] = [];

  for (let i = 1; i <= fileCount; i++) {
    const key = `hackathons-${meta.version}-${i}.json`;
    const chunk = await readJSON(key);
    if (chunk && Array.isArray(chunk)) {
      all.push(...chunk);
    }
  }

  return all;
}

// Lightweight list for the homepage: reads only the small list file the
// crawler uploads, so the server render doesn't download full details.
export async function getHackathonList(): Promise<HackathonListItem[]> {
  const meta = await getMeta();
  if (!meta) return [];

  const listKey = meta.listKey || `list-${meta.version}.json`;
  const list = await readJSON(listKey);
  if (Array.isArray(list)) return list as HackathonListItem[];

  // Fallback: old data without a list file — build the list from full chunks
  const all = await getCurrentHackathons();
  return all.map((h) => ({
    sourceId: h.sourceId,
    title: h.title,
    startDate: h.startDate,
    endDate: h.endDate,
    prizePool: h.prizePool,
    source: h.source,
  }));
}

// Full detail for one hackathon (fetched on demand by the client).
export async function getHackathonById(id: string): Promise<HackathonData | null> {
  const meta = await getMeta();
  if (!meta) return null;

  const fileCount = meta.fileCount || 1;
  for (let i = 1; i <= fileCount; i++) {
    const chunk = await readJSON(`hackathons-${meta.version}-${i}.json`);
    if (Array.isArray(chunk)) {
      const found = chunk.find((h) => h.sourceId === id);
      if (found) return found as HackathonData;
    }
  }
  return null;
}

export async function getCurrentPlatforms(): Promise<any[]> {
  const list = await getHackathonList();
  const seen = new Set<string>();
  const platforms: any[] = [];
  for (const h of list) {
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
