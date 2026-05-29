import { NextRequest, NextResponse } from 'next/server';
import { getCurrentHackathons } from '@/backend/lib/data';
import type { HackathonData } from '@/backend/lib/data';

function enrich(h: HackathonData) {
  const platformName = h.source.charAt(0).toUpperCase() + h.source.slice(1);
  return {
    ...h,
    id: h.sourceId,
    platform: { name: platformName, slug: h.source },
    clusterKey: '',
    slug: h.title.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_]+/g, '-').slice(0, 100),
  };
}

export async function GET(request: NextRequest) {
  try {
    let data = (await getCurrentHackathons()).map(enrich);
    const sp = request.nextUrl.searchParams;

    const status = sp.get('status') || 'active';
    data = data.filter((h) => h.status === status);

    const mode = sp.get('mode');
    if (mode) data = data.filter((h) => h.mode === mode);

    const platform = sp.get('platform');
    if (platform) data = data.filter((h) => h.source === platform);

    const search = sp.get('search');
    if (search) {
      const q = search.toLowerCase();
      data = data.filter(
        (h) =>
          h.title.toLowerCase().includes(q) ||
          (h.description || '').toLowerCase().includes(q)
      );
    }

    const fromDate = sp.get('fromDate');
    if (fromDate) data = data.filter((h) => h.startDate >= fromDate);

    const toDate = sp.get('toDate');
    if (toDate) data = data.filter((h) => h.startDate <= toDate);

    const sortBy = sp.get('sortBy') || 'startDate';
    const sortOrder = sp.get('sortOrder') || 'asc';
    data.sort((a: any, b: any) => {
      const va = a[sortBy] || '';
      const vb = b[sortBy] || '';
      return sortOrder === 'desc' ? String(vb).localeCompare(String(va)) : String(va).localeCompare(String(vb));
    });

    const page = Math.max(1, parseInt(sp.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(sp.get('limit') || '20')));
    const total = data.length;
    const totalPages = Math.ceil(total / limit);
    const skip = (page - 1) * limit;
    const paged = data.slice(skip, skip + limit);

    return NextResponse.json({
      data: paged,
      pagination: { page, limit, total, totalPages },
    });
  } catch (error) {
    console.error('GET /api/hackathons error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
