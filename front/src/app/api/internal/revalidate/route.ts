import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { PLATFORMS } from '@/backend/lib/platforms';

// Crawler calls this endpoint after a successful R2 upload.
// We validate the shared key, then revalidate the ISR pages that render from
// R2 data via Vercel's native on-demand ISR — the next request to each path
// re-renders with fresh data. Pages keep `revalidate = 86400` as a safety net
// in case the notify never arrives.

// IndexNow key — also hosted at /<key>.txt (public/<key>.txt) to prove
// ownership. Not a secret: it is public by design. Overridable via env.
const INDEXNOW_KEY = process.env.INDEXNOW_KEY || 'ee72776affff8eb22fb03ad5ccfebaa5';

export async function POST(request: NextRequest) {
  const key = request.headers.get('x-crawler-key');
  const expected = process.env.CRAWLER_API_KEY || '';

  if (!expected || key !== expected) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Platform pages and the data-driven blog post share the same data —
  // revalidate them too. Tolerated separately so a single failure can't
  // take down the homepage revalidation above.
  const paths = [
    '/',
    '/platforms',
    ...PLATFORMS.map((p) => `/platforms/${p.slug}`),
    '/blog/biggest-cash-prize-hackathons',
  ];

  const results: { path: string; ok: boolean }[] = [];
  for (const path of paths) {
    try {
      revalidatePath(path);
      results.push({ path, ok: true });
    } catch (error) {
      console.error(`Revalidation failed for ${path}:`, error);
      results.push({ path, ok: false });
    }
  }

  // Notify search engines (IndexNow) that the pages changed, so
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

  return NextResponse.json({ revalidated: true, results, now: Date.now() });
}
