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

export async function getMeta(): Promise<{ version: string; count: number; fileCount?: number } | null> {
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
