import { z } from 'zod';

export const HackathonSchema = z.object({
  title: z.string().min(1),
  description: z.string().nullable().optional(),
  url: z.string().url(),
  imageUrl: z.string().url().optional().nullable(),
  mode: z.enum(['online', 'offline', 'hybrid']).default('online'),
  location: z.string().optional().nullable(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  timezone: z.string().optional().nullable(),
  prizePool: z.string().optional().nullable(),
  themes: z.array(z.string()).default([]),
  sourceId: z.string().min(1),
  source: z.string().min(1),
  status: z.enum(['active', 'past', 'cancelled']).default('active'),
});

export type HackathonInput = z.infer<typeof HackathonSchema>;

export interface HackathonListParams {
  page?: number;
  limit?: number;
  mode?: string;
  platform?: string;
  status?: string;
  search?: string;
  fromDate?: string;
  toDate?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
