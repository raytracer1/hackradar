import { NextRequest, NextResponse } from 'next/server';
import { getCurrentHackathons } from '@/backend/lib/data';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const all = await getCurrentHackathons();
    const hackathon = all.find((h) => h.sourceId === id);
    if (!hackathon) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const platformName = hackathon.source.charAt(0).toUpperCase() + hackathon.source.slice(1);
    return NextResponse.json({
      data: {
        ...hackathon,
        id,
        platform: { name: platformName, slug: hackathon.source },
      },
    });
  } catch (error) {
    console.error('GET /api/hackathons/[id] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
