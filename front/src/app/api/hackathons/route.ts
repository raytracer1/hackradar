import { NextRequest, NextResponse } from 'next/server';

const META_KEY = 'meta.json';
const PAGE_SIZE = 20;
const CHUNK = 200;

async function readR2JSON(key: string): Promise<any> {
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
    const totalCount = meta.count || 0;
    const fileCount = meta.fileCount || 1;

    const key = `hackathons-${version}-${page}.json`;
    const chunk = await readR2JSON(key);
    const items = (chunk && Array.isArray(chunk)) ? chunk : [];

    const enriched = items.map((h: any) => ({
      ...h,
      id: h.sourceId,
      platform: { name: h.source.charAt(0).toUpperCase() + h.source.slice(1), slug: h.source },
    }));

    const loaded = page * CHUNK;
    const remaining = Math.max(0, totalCount - loaded);
    const hasMore = page < fileCount;

    return NextResponse.json({
      data: enriched,
      hasMore,
      total: totalCount,
      remaining,
    });
  } catch (error) {
    console.error('GET /api/hackathons error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
