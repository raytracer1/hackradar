import { NextResponse } from 'next/server';

// Blog RSS feed — re-rendered hourly, cheap and static in practice.
export const revalidate = 3600;

const POSTS = [
  {
    slug: 'best-bug-bounty-platforms',
    title: 'The Best Bug Bounty Platforms for Programmers — Where Security Skills Pay',
    description:
      'Between jobs and know how to break software? Bug bounties and audit contests pay per finding, not per seat — a practical guide to HackerOne, Bugcrowd, Immunefi, Cantina and more, plus honest numbers on the ramp-up.',
    date: '2026-08-31T00:00:00.000Z',
  },
  {
    slug: 'unemployed-programmer-survival-guide',
    title: "The Unemployed Programmer's Survival Guide — How to Make Money in the AI Era",
    description:
      'Laid off and worried AI is coming for your job? Real income streams that still pay: cash prize hackathons, freelancing with AI leverage, bug bounties, micro-products, and honest advice on what to skip.',
    date: '2026-08-27T00:00:00.000Z',
  },
  {
    slug: 'find-hackathons-by-skills',
    title: 'Find Hackathons Matched to Your Skills — Ranked by Expected Return',
    description:
      'New on HackRadar: pick your skills and every hackathon is ranked by expected return per day — prize pool, skill match, competition, and deadline in one score.',
    date: '2026-08-25T00:00:00.000Z',
  },
  {
    slug: 'biggest-cash-prize-hackathons',
    title: 'The Biggest Cash Prize Hackathons Right Now',
    description:
      'A live ranking of the 10 largest prize pools currently open across every platform HackRadar tracks — refreshed automatically with each crawl.',
    date: '2026-08-21T00:00:00.000Z',
  },
  {
    slug: 'how-to-win-cash-prize-hackathons',
    title: 'How to Win Cash Prize Hackathons — A Practical Guide',
    description:
      'Picking winnable events, scoping a demoable core, building around sponsors, and nailing the pitch — the full playbook for turning a weekend into prize money.',
    date: '2026-08-20T00:00:00.000Z',
  },
  {
    slug: 'introducing-hackradar',
    title: 'Introducing HackRadar — One Place to Discover All Cash Prize Hackathons',
    description:
      'Stop checking 12 websites every week. The story behind HackRadar: why it exists, which platforms it covers, and how the filters, sorting, and Known system work.',
    date: '2025-07-02T00:00:00.000Z',
  },
];

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  const items = POSTS.map(
    (p) => `
    <item>
      <title>${escapeXml(p.title)}</title>
      <link>${baseUrl}/blog/${p.slug}</link>
      <guid isPermaLink="true">${baseUrl}/blog/${p.slug}</guid>
      <description>${escapeXml(p.description)}</description>
      <pubDate>${new Date(p.date).toUTCString()}</pubDate>
    </item>`
  ).join('');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
<title>HackRadar Blog</title>
<link>${baseUrl}/blog</link>
<description>Guides and strategy for hackathon builders — how to find cash prize hackathons and how to win them.</description>
<language>en-us</language>
<lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
<atom:link href="${baseUrl}/rss.xml" rel="self" type="application/rss+xml"/>
${items}
</channel>
</rss>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600',
    },
  });
}
