// Scoring engine for /api/recommend. Pure functions, no server imports.
//
// The ranking metric is "expected return per unit time":
//
//   score = prize(USD) × matchScore × competitionFactor / max(daysLeft, 7)
//
// — prize × match × competition ≈ expected prize value (EV);
// — dividing by days until the deadline converts EV into $/day, so a
//   $50k hackathon 300 days out does not bury a $5k one ending in 20 days
//   ("相同时间下的最大收益" — max return under equal time);
// — max(daysLeft, 7) floors the denominator so imminent deadlines don't
//   explode the per-day figure.
//
// Ended hackathons, ones ending within 24h, and ones without a parseable
// prize pool are not recommended at all.

import type { HackathonData } from '@/backend/lib/data';
import type { Skill } from '@/backend/lib/skills';
import { ALIAS_RE } from '@/backend/lib/skills';

const WEIGHT: Record<string, number> = { themes: 3, title: 2, body: 1, prizes: 1 };

const MIN_DAYS = 7; // denominator floor for daysLeft

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

// Static FX table: prizePool strings carry mixed currencies ("₹ ...", "€ ...",
// "A$ ..."). Approximate conversion to USD for ranking purposes.
const FX_USD: Record<string, number> = {
  '₹': 0.012,
  '€': 1.08,
  '£': 1.27,
  'A$': 0.66,
  'C$': 0.73,
  'S$': 0.74,
  '¥': 0.0069,
  '₩': 0.00072,
};

function parsePrizeUSD(text: string | null): number | null {
  if (!text) return null;
  let rate = 1;
  const t = text.trim();
  // Text currency codes first (e.g. "INR 100,000")
  const codeMatch = t.match(/^(INR|EUR|GBP|AUD|CAD|SGD|JPY|KRW)\b/i);
  if (codeMatch) {
    const upper = codeMatch[1].toUpperCase();
    rate = { INR: 0.012, EUR: 1.08, GBP: 1.27, AUD: 0.66, CAD: 0.73, SGD: 0.74, JPY: 0.0069, KRW: 0.00072 }[upper] ?? 1;
  } else {
    // Symbol prefixes; check multi-char symbols (A$/C$/S$) before bare $
    for (const sym of ['A$', 'C$', 'S$', '₹', '€', '£', '¥', '₩']) {
      if (t.startsWith(sym)) {
        rate = FX_USD[sym] ?? 1;
        break;
      }
    }
  }
  const m = t.replace(/[$,]/g, '').match(/[\d.]+/);
  if (!m) return null;
  const amount = parseFloat(m[0]);
  if (!isFinite(amount) || amount <= 0) return null;
  return amount * rate;
}

export interface RecommendItem {
  sourceId: string;
  score: number; // expected $/day
  expectedValue: number; // prize × match × competition (USD)
  matchScore: number;
  matchedSkills: string[];
  participants: number | null;
  daysLeft: number;
}

interface Scored {
  h: HackathonData;
  score: number;
  expectedValue: number;
  matchScore: number;
  matched: Skill[];
  participants: number | null;
  daysLeft: number;
}

function scoreHackathon(h: HackathonData, skills: Skill[], now: number): Scored | null {
  const endMs = Date.parse(h.endDate || '');
  if (!endMs) return null;
  const daysLeft = (endMs - now) / 86_400_000;
  // Ended, or ending too soon to act on
  if (daysLeft < 1) return null;

  const prizeUSD = parsePrizeUSD(h.prizePool);
  // No parseable prize pool → expected return unknown → not recommended
  if (prizeUSD === null || prizeUSD === 0) return null;

  const text = {
    themes: (h.themes || []).join(' ').toLowerCase(),
    title: (h.title || '').toLowerCase(),
    body: [h.description, h.about, h.whatToBuild, h.whatToSubmit]
      .filter(Boolean)
      .join(' ')
      .toLowerCase(),
    prizes: (h.prizesDetail || '').toLowerCase(),
  };

  const contributions = skills.map((s) => {
    const re = ALIAS_RE[s.id];
    if (re.test(text.themes)) return WEIGHT.themes;
    if (re.test(text.title)) return WEIGHT.title;
    if (re.test(text.body)) return WEIGHT.body;
    if (re.test(text.prizes)) return WEIGHT.prizes;
    return 0;
  });

  const sum = contributions.reduce((a, b) => a + b, 0);
  const matchScore = sum / (3 * skills.length); // 0..1
  if (matchScore === 0) return null; // no skill matched at all

  const matched = skills.filter((_, i) => contributions[i] > 0);

  // Competition: fewer participants → higher win chance. Missing data → 1.
  const p = h.participantCount ?? null;
  const comp =
    p == null || p <= 0 ? 1 : clamp(Math.pow(250 / Math.max(p, 100), 0.35), 0.65, 1.25);
  //   p=100 → 1.25 | p=250 → 1.0 | p=500 → 0.79 | p=1000 → 0.65

  const expectedValue = prizeUSD * matchScore * comp; // USD
  const score = expectedValue / Math.max(daysLeft, MIN_DAYS); // $/day

  return {
    h,
    score,
    expectedValue,
    matchScore,
    matched,
    participants: p,
    daysLeft: Math.floor(daysLeft),
  };
}

export function rankHackathons(
  list: HackathonData[],
  skills: Skill[],
  now: number,
  limit = 20
): RecommendItem[] {
  return list
    .map((h) => scoreHackathon(h, skills, now))
    .filter((s): s is Scored => s !== null)
    .sort((a, b) => b.score - a.score || String(a.h.endDate).localeCompare(String(b.h.endDate)))
    .slice(0, limit)
    .map((s) => ({
      sourceId: s.h.sourceId,
      score: Math.round(s.score * 100) / 100,
      expectedValue: Math.round(s.expectedValue),
      matchScore: Math.round(s.matchScore * 100) / 100,
      matchedSkills: s.matched.map((sk) => sk.label),
      participants: s.participants,
      daysLeft: s.daysLeft,
    }));
}
