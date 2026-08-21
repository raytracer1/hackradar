import { NextResponse } from 'next/server';
import { getHackathonList } from '@/backend/lib/data';

// Lightweight list for the homepage client. The server HTML only carries the
// first 20 items (LCP), and the browser fetches the full list here right
// after mount for instant filtering. Short edge cache: pages are revalidated
// by the crawler notification, and a ≤5min stale window on this list is
// acceptable (it only delays *newly added* items by minutes).
export const dynamic = 'force-dynamic';

export async function GET() {
  const list = await getHackathonList();
  return NextResponse.json(list, {
    headers: {
      'Cache-Control': 'public, max-age=300, s-maxage=300',
    },
  });
}
