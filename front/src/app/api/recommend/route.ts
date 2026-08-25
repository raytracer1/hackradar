import { NextRequest, NextResponse } from 'next/server';
import { getCurrentHackathons } from '@/backend/lib/data';
import { getSkill, type Skill } from '@/backend/lib/skills';
import { rankHackathons } from '@/backend/lib/recommend';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const rawSkills = params.get('skills') || '';
  const rawExclude = params.get('exclude') || '';

  const ids = [...new Set(rawSkills.split(',').map((s) => s.trim()).filter(Boolean))];
  const skills: Skill[] = ids.map(getSkill).filter((s): s is Skill => Boolean(s));
  if (skills.length === 0) {
    return NextResponse.json(
      { error: 'Missing or invalid skills parameter' },
      { status: 400 }
    );
  }

  // Hackathons the user already marked "known" are excluded server-side so
  // the top-N slots all go to unexplored ones.
  const exclude = new Set(
    rawExclude.split(',').map((s) => s.trim()).filter(Boolean)
  );

  const now = Date.now();
  const all = await getCurrentHackathons();
  const candidates = exclude.size ? all.filter((h) => !exclude.has(h.sourceId)) : all;

  const results = rankHackathons(candidates, skills, now);

  return NextResponse.json(
    { now, skills: skills.map((s) => ({ id: s.id, label: s.label })), results },
    { headers: { 'Cache-Control': 'no-store' } }
  );
}
