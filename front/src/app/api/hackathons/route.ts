import { NextRequest, NextResponse } from 'next/server';
import { getAllHackathons, upsertHackathon, ensurePlatforms } from '@/backend/lib/data';
import type { HackathonInput } from '@/backend/lib/data';

export async function GET(request: NextRequest) {
  try {
    await ensurePlatforms();
    let data = await getAllHackathons();
    const sp = request.nextUrl.searchParams;

    const status = sp.get('status') || 'active';
    data = data.filter((h) => h.status === status);

    const mode = sp.get('mode');
    if (mode) data = data.filter((h) => h.mode === mode);

    const platform = sp.get('platform');
    if (platform) data = data.filter((h) => h.platform?.slug === platform);

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

export async function POST(request: NextRequest) {
  try {
    const apiKey = request.headers.get('x-api-key');
    if (apiKey !== process.env.CRAWLER_API_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await ensurePlatforms();
    const body = await request.json();

    if (!body.title || !body.url || !body.sourceId || !body.source) {
      return NextResponse.json({ error: 'Missing required fields: title, url, sourceId, source' }, { status: 400 });
    }

    const input: HackathonInput = {
      title: body.title,
      description: body.description || null,
      url: body.url,
      imageUrl: body.imageUrl || null,
      mode: body.mode || 'online',
      location: body.location || null,
      startDate: body.startDate || new Date().toISOString(),
      endDate: body.endDate || new Date().toISOString(),
      timezone: body.timezone || null,
      prizePool: body.prizePool || null,
      themes: body.themes || [],
      sourceId: body.sourceId,
      source: body.source,
      status: body.status || 'active',
    };

    const hackathon = await upsertHackathon(input);
    return NextResponse.json({ data: hackathon }, { status: 200 });
  } catch (error) {
    console.error('POST /api/hackathons error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
