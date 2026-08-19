import { NextRequest, NextResponse } from 'next/server';
import { getHackathonById } from '@/backend/lib/data';

// Details are fetched on demand by the client — never cache this response.
export const dynamic = 'force-dynamic';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const hackathon = await getHackathonById(id);
  if (!hackathon) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  return NextResponse.json(hackathon);
}
