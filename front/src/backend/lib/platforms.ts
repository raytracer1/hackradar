// Platform registry for the /platforms pages.
// Keep the slugs in sync with the crawler plugins (crawler/plugins/*.py,
// each plugin sets `source="<slug>"`).

export interface PlatformMeta {
  slug: string;
  name: string;
  tagline: string;
}

export const PLATFORMS: PlatformMeta[] = [
  { slug: 'devpost', name: 'Devpost', tagline: 'The largest general hackathon platform' },
  { slug: 'mlh', name: 'MLH', tagline: 'Student hackathons worldwide' },
  { slug: 'hackerearth', name: 'HackerEarth', tagline: 'Competitive programming + hackathons' },
  { slug: 'devfolio', name: 'Devfolio', tagline: 'Web2 & web3 hackathons' },
  { slug: 'kaggle', name: 'Kaggle', tagline: 'Data science competitions' },
  { slug: 'dorahacks', name: 'DoraHacks', tagline: 'Web3 & blockchain hackathons' },
  { slug: 'unstop', name: 'Unstop', tagline: 'University & early-career hackathons' },
  { slug: 'lablab', name: 'LabLab.ai', tagline: 'AI-focused hackathons' },
  { slug: 'luma', name: 'Luma', tagline: 'Community-organized events' },
  { slug: 'hackquest', name: 'HackQuest', tagline: 'Web3 builder challenges' },
  { slug: 'taikai', name: 'Taikai', tagline: 'Blockchain & open innovation' },
  { slug: 'sinceai', name: 'SinCE.AI', tagline: 'AI hackathons' },
  { slug: '0garena', name: '0G Arena', tagline: 'AI × Web3 hackathons' },
];

export function getPlatformBySlug(slug: string): PlatformMeta | undefined {
  return PLATFORMS.find((p) => p.slug === slug);
}
