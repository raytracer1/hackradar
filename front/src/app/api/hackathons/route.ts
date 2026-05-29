import { NextRequest, NextResponse } from 'next/server';

const META_KEY = 'meta.json';
const PAGE_SIZE = 20;
const CHUNK = 200;

async function readR2JSON(key: string): Promise<any> {
  // Local dev: S3
  const ep = process.env.R2_ENDPOINT;
  const ak = process.env.R2_ACCESS_KEY;
  const sk = process.env.R2_SECRET_KEY;
  const bn = process.env.R2_BUCKET || 'hackradar-data';

  if (ep && ak && sk) {
    try {
      const { GetObjectCommand, S3Client } = await import('@aws-sdk/client-s3');
      const s3 = new S3Client({
        region: 'auto',
        endpoint: ep,
        credentials: { accessKeyId: ak, secretAccessKey: sk },
        forcePathStyle: true,
      });
      const resp = await s3.send(new GetObjectCommand({ Bucket: bn, Key: key }));
      const body = await resp.Body?.transformToString();
      return body ? JSON.parse(body) : null;
    } catch (e: any) {
      console.error(`S3 error ${key}:`, e.message);
      return null;
    }
  }

  // Production: Cloudflare binding
  try {
    const { getCloudflareContext } = await import('@opennextjs/cloudflare');
    const { env } = await getCloudflareContext({ async: true });
    const bucket = (env as any).DATA_BUCKET;
    if (bucket) {
      const obj = await bucket.get(key);
      return obj ? await obj.json() : null;
    }
  } catch { /* not in Workers */ }

  return null;
}

export async function GET(request: NextRequest) {
  try {
    const meta = await readR2JSON(META_KEY);
    if (!meta) {
      return NextResponse.json({ data: [], hasMore: false, total: 0 });
    }

    const version = meta.version;
    const page = Math.max(1, parseInt(request.nextUrl.searchParams.get('page') || '1'));
    const chunkIdx = Math.floor(((page - 1) * PAGE_SIZE) / CHUNK) + 1;
    const offset = ((page - 1) * PAGE_SIZE) % CHUNK;

    const key = `hackathons-${version}-${chunkIdx}.json`;
    const chunk = await readR2JSON(key);
    const items = (chunk && Array.isArray(chunk)) ? chunk.slice(offset, offset + PAGE_SIZE) : [];

    const enriched = items.map((h: any) => ({
      ...h,
      id: h.sourceId,
      platform: { name: h.source.charAt(0).toUpperCase() + h.source.slice(1), slug: h.source },
    }));

    const totalCount = meta.count || 0;
    const totalPages = Math.ceil(totalCount / PAGE_SIZE);
    const hasMore = page < totalPages;

    return NextResponse.json({
      data: enriched,
      hasMore,
      total: totalCount,
    });
  } catch (error) {
    console.error('GET /api/hackathons error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
