import { prisma } from '@/backend/lib/prisma';

export async function listPlatforms() {
  const platforms = await prisma.platform.findMany({
    include: { _count: { select: { hackathons: true } } },
  });

  return platforms.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    websiteUrl: p.websiteUrl,
    logoUrl: p.logoUrl,
    hackathonCount: p._count.hackathons,
  }));
}
