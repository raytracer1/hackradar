import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getHackathon } from '@/backend/services/hackathon-service';
import HackathonDetail from '@/frontend/components/hackathons/HackathonDetail';

interface DetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: DetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const h = await getHackathon(id);
  if (!h) return { title: 'Not Found' };

  return {
    title: `${h.title} — HackRadar`,
    description: h.description?.slice(0, 160) || `Apply to ${h.title} on ${h.platform.name}.`,
    openGraph: {
      title: h.title,
      description: h.description?.slice(0, 160) || '',
      images: h.imageUrl ? [h.imageUrl] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: h.title,
      description: h.description?.slice(0, 160) || '',
    },
  };
}

export default async function HackathonDetailPage({ params }: DetailPageProps) {
  const { id } = await params;
  const hackathon = await getHackathon(id);
  if (!hackathon) notFound();

  return (
    <HackathonDetail
      title={hackathon.title}
      description={hackathon.description}
      url={hackathon.url}
      imageUrl={hackathon.imageUrl}
      mode={hackathon.mode}
      location={hackathon.location}
      startDate={hackathon.startDate.toISOString()}
      endDate={hackathon.endDate.toISOString()}
      timezone={hackathon.timezone}
      prizePool={hackathon.prizePool}
      themes={hackathon.themes}
      platform={hackathon.platform}
    />
  );
}
