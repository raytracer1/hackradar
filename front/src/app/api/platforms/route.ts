import { NextResponse } from 'next/server';
import { getCurrentPlatforms } from '@/backend/lib/data';

export async function GET() {
  try {
    const data = await getCurrentPlatforms();
    return NextResponse.json({ data });
  } catch (error) {
    console.error('GET /api/platforms error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
