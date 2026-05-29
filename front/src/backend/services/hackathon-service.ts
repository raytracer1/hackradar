import { prisma } from '@/backend/lib/prisma';
import { slugify, paginationMeta, parsePagination } from '@/backend/lib/utils';
import { computeClusterKey } from '@/backend/lib/dedup';
import type { HackathonInput, HackathonListParams } from '@/types';
import type { Prisma } from '@prisma/client';

function buildWhere(params: HackathonListParams): Prisma.HackathonWhereInput {
  const where: Prisma.HackathonWhereInput = {};

  if (params.status) where.status = params.status;
  else where.status = 'active';

  if (params.mode) where.mode = params.mode;
  if (params.platform) where.platform = { slug: params.platform };

  if (params.search) {
    where.OR = [
      { title: { contains: params.search } },
      { description: { contains: params.search } },
    ];
  }

  if (params.fromDate || params.toDate) {
    where.startDate = {};
    if (params.fromDate) where.startDate.gte = new Date(params.fromDate);
    if (params.toDate) where.startDate.lte = new Date(params.toDate);
  }

  return where;
}

export async function listHackathons(searchParams: URLSearchParams) {
  const params: HackathonListParams = {
    page: parseInt(searchParams.get('page') || '1'),
    limit: parseInt(searchParams.get('limit') || '20'),
    mode: searchParams.get('mode') || undefined,
    platform: searchParams.get('platform') || undefined,
    status: searchParams.get('status') || undefined,
    search: searchParams.get('search') || undefined,
    fromDate: searchParams.get('fromDate') || undefined,
    toDate: searchParams.get('toDate') || undefined,
    sortBy: searchParams.get('sortBy') || 'startDate',
    sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'asc',
  };

  const { page, limit, skip } = parsePagination(searchParams);
  const where = buildWhere(params);
  const orderBy = { [params.sortBy || 'startDate']: params.sortOrder || 'asc' };

  const [data, total] = await Promise.all([
    prisma.hackathon.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: { platform: { select: { name: true, slug: true, logoUrl: true } } },
    }),
    prisma.hackathon.count({ where }),
  ]);

  return {
    data,
    pagination: paginationMeta(page, limit, total),
  };
}

export async function getHackathon(id: string) {
  return prisma.hackathon.findUnique({
    where: { id },
    include: { platform: { select: { name: true, slug: true, logoUrl: true } } },
  });
}

export async function upsertHackathon(input: HackathonInput) {
  const platform = await prisma.platform.findUnique({ where: { slug: input.source } });
  if (!platform) throw new Error(`Unknown source platform: ${input.source}`);

  const slug = slugify(input.title);
  const clusterKey = computeClusterKey(input.title, new Date(input.startDate));

  const data = {
    title: input.title,
    slug,
    description: input.description || null,
    url: input.url,
    imageUrl: input.imageUrl || null,
    mode: input.mode,
    location: input.location || null,
    startDate: new Date(input.startDate),
    endDate: new Date(input.endDate),
    timezone: input.timezone || null,
    prizePool: input.prizePool || null,
    themes: JSON.stringify(input.themes),
    platformId: platform.id,
    sourceId: input.sourceId,
    source: input.source,
    clusterKey,
    status: input.status,
  };

  return prisma.hackathon.upsert({
    where: { sourceId: input.sourceId },
    create: data,
    update: data,
  });
}

export async function markEnded(id: string) {
  return prisma.hackathon.update({
    where: { id },
    data: { status: 'past' },
  });
}
