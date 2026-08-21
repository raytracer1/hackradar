import { NextRequest, NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { PLATFORMS } from '@/backend/lib/platforms';

// Crawler calls this endpoint after a successful R2 upload.
// We validate the shared key, then delete the cached homepage entry from the
// incremental-cache bucket, so the next request to / misses the cache and
// re-renders with fresh data. No tag cache / KV / Durable Object needed.
//
// The Next incremental-cache key for the homepage is "/" normalized to
// "/index" (normalizePagePath), and OpenNext stores it as
// `{prefix}/{buildId}/{sha256(key)}.cache` in the NEXT_INC_CACHE_R2_BUCKET.
const PAGE_CACHE_KEY = '/index';

// IndexNow key — also hosted at /<key>.txt (public/<key>.txt) to prove
// ownership. Not a secret: it is public by design. Overridable via env.
const INDEXNOW_KEY = process.env.INDEXNOW_KEY || 'ee72776affff8eb22fb03ad5ccfebaa5';

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

    // Platform pages and the data-driven blog post share the same data —
    // invalidate their cache entries too. Tolerated separately so a single
    // failure can't take down the homepage revalidation above.
    try {
      const keys = [
        '/platforms',
        ...PLATFORMS.map((p) => `/platforms/${p.slug}`),
        '/blog/biggest-cash-prize-hackathons',
      ];
      for (const key of keys) {
        const keyHash = await sha256Hex(key);
        await bucket.delete(`incremental-cache/${buildId}/${keyHash}.cache`);
      }
    } catch (error) {
      console.error('Platform page revalidation failed:', error);
    }

    // Notify search engines (IndexNow) that the homepage changed, so
    // Bing/Yandex/etc. re-crawl right away instead of waiting for the sitemap.
    // Best effort — a failed ping must never fail the revalidation itself.
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || '';
    if (baseUrl) {
      try {
        await fetch('https://api.indexnow.org/indexnow', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json; charset=utf-8' },
          body: JSON.stringify({
            host: new URL(baseUrl).host,
            key: INDEXNOW_KEY,
            urlList: [baseUrl, `${baseUrl}/sitemap.xml`],
          }),
        });
      } catch {
        // ignore
      }
    }

    return NextResponse.json({ revalidated: true, buildId, objectKey, now: Date.now() });
  } catch (error) {
    console.error('Revalidation failed:', error);
    return NextResponse.json({ error: 'Revalidation failed' }, { status: 500 });
  }
}
