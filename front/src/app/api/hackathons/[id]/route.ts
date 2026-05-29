import { NextRequest, NextResponse } from 'next/server';
import { getHackathon, markEnded } from '@/backend/services/hackathon-service';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const hackathon = await getHackathon(id);
    if (!hackathon) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json({ data: hackathon });
  } catch (error) {
    console.error('GET /api/hackathons/[id] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const apiKey = request.headers.get('x-api-key');
    if (apiKey !== process.env.CRAWLER_API_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    await markEnded(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/hackathons/[id] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
