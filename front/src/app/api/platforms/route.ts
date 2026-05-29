import { NextResponse } from 'next/server';
import { listPlatforms } from '@/backend/services/platform-service';

export async function GET() {
  try {
    const platforms = await listPlatforms();
    return NextResponse.json({ data: platforms });
  } catch (error) {
    console.error('GET /api/platforms error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
