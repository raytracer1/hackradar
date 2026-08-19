import { NextRequest, NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';

// Crawler calls this endpoint after a successful R2 upload.
// We validate the shared key, then delete the cached homepage entry from the
// incremental-cache bucket, so the next request to / misses the cache and
// re-renders with fresh data. No tag cache / KV / Durable Object needed.
//
// The Next incremental-cache key for the homepage is "/" normalized to
// "/index" (normalizePagePath), and OpenNext stores it as
// `{prefix}/{buildId}/{sha256(key)}.cache` in the NEXT_INC_CACHE_R2_BUCKET.
const PAGE_CACHE_KEY = '/index';

async function sha256Hex(input: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input));
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function POST(request: NextRequest) {
  const key = request.headers.get('x-crawler-key');
  const expected = process.env.CRAWLER_API_KEY || '';

  if (!expected || key !== expected) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { env } = await getCloudflareContext({ async: true });
    const bucket = (env as any).NEXT_INC_CACHE_R2_BUCKET;
    const buildId = process.env.OPEN_NEXT_BUILD_ID;

    if (!bucket || !buildId) {
      return NextResponse.json({ error: 'Cache not configured' }, { status: 500 });
    }

    const hash = await sha256Hex(PAGE_CACHE_KEY);
    const objectKey = `incremental-cache/${buildId}/${hash}.cache`;
    await bucket.delete(objectKey);
    return NextResponse.json({ revalidated: true, buildId, objectKey, now: Date.now() });
  } catch (error) {
    console.error('Revalidation failed:', error);
    return NextResponse.json({ error: 'Revalidation failed' }, { status: 500 });
  }
}
