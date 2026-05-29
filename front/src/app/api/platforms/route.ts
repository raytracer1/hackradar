import { NextResponse } from 'next/server';
import { getPlatformsData, getAllHackathons } from '@/backend/lib/data';

export async function GET() {
  try {
    const platforms = await getPlatformsData();
    const hackathons = await getAllHackathons();

    const data = platforms.map((p) => ({
      ...p,
      hackathonCount: hackathons.filter((h) => h.source === p.slug).length,
    }));

    return NextResponse.json({ data });
  } catch (error) {
    console.error('GET /api/platforms error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
