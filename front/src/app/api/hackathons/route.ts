import { NextRequest, NextResponse } from 'next/server';
import { listHackathons, upsertHackathon } from '@/backend/services/hackathon-service';
import { HackathonSchema } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const result = await listHackathons(request.nextUrl.searchParams);
    return NextResponse.json(result);
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

    const body = await request.json();
    const parsed = HackathonSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const hackathon = await upsertHackathon(parsed.data);
    return NextResponse.json({ data: hackathon }, { status: 200 });
  } catch (error) {
    console.error('POST /api/hackathons error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
