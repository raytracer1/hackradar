import { prisma } from '@/backend/lib/prisma';
import type { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const hackathons = await prisma.hackathon.findMany({
    select: { id: true, updatedAt: true },
    where: { status: 'active' },
  });

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  const hackathonEntries = hackathons.map((h) => ({
    url: `${baseUrl}/hackathons/${h.id}`,
    lastModified: h.updatedAt,
    changeFrequency: 'daily' as const,
    priority: 0.6,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 1,
    },
    {
      url: `${baseUrl}/hackathons`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    ...hackathonEntries,
  ];
}
