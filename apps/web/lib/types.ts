import { z } from 'zod';

// Esquema base para eventos
export const EventItemSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  url: z.string().url(),
  cfpUrl: z.string().url().optional(),
  startsAt: z.string().datetime().optional(),
  endsAt: z.string().datetime().optional(),
  cfpOpensAt: z.string().datetime().optional(),
  cfpClosesAt: z.string().datetime().optional(),
  timezone: z.string().optional(),
  country: z.string().length(2).optional(), // ISO-2
  city: z.string().optional(),
  venue: z.string().optional(),
  format: z.enum(['in-person', 'online', 'hybrid']),
  tracks: z.array(z.string()).default([]),
  languages: z.array(z.string()).optional(),
  price: z.enum(['free', 'paid', 'donation']).optional(),
  source: z.object({
    id: z.string().min(1),
    fetchedAt: z.string().datetime(),
    rawId: z.string().optional(),
  }),
  tags: z.array(z.string()).optional(),
  lastSeenAt: z.string().datetime(),
});

export type EventItem = z.infer<typeof EventItemSchema>;

// Esquema para fuentes de datos
export const DataSourceSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  type: z.enum(['ics', 'rss', 'atom', 'json', 'html', 'meetup']),
  url: z.string().url(),
  country: z.string().length(2).optional(),
  city: z.string().optional(),
  enabled: z.boolean().default(true),
  lastFetched: z.string().datetime().optional(),
  lastError: z.string().optional(),
});

export type DataSource = z.infer<typeof DataSourceSchema>;

// Esquema para filtros de búsqueda
export const QuerySchema = z.object({
  q: z.string().optional(),
  country: z.string().optional(),
  city: z.string().optional(),
  format: z.enum(['online', 'in-person', 'hybrid']).optional(),
  track: z.array(z.string()).optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  onlyOpenCFP: z.boolean().optional(),
});

export type Query = z.infer<typeof QuerySchema>;

// Utilidades para generar IDs únicos
export function generateEventId(sourceId: string, rawId: string, title: string, startsAt?: string): string {
  const content = `${sourceId}:${rawId}:${title}:${startsAt || ''}`;
  return Buffer.from(content).toString('base64').replace(/[+/=]/g, '').substring(0, 16);
}

// Mapeo de países LATAM
export const LATAM_COUNTRIES = {
  'AR': 'Argentina',
  'BO': 'Bolivia',
  'BR': 'Brasil',
  'CL': 'Chile',
  'CO': 'Colombia',
  'CR': 'Costa Rica',
  'CU': 'Cuba',
  'DO': 'República Dominicana',
  'EC': 'Ecuador',
  'GT': 'Guatemala',
  'HN': 'Honduras',
  'MX': 'México',
  'NI': 'Nicaragua',
  'PA': 'Panamá',
  'PY': 'Paraguay',
  'PE': 'Perú',
  'SV': 'El Salvador',
  'UY': 'Uruguay',
  'VE': 'Venezuela',
} as const;

// Tracks comunes en eventos tech
export const COMMON_TRACKS = [
  'web',
  'mobile',
  'ai',
  'cloud',
  'security',
  'python',
  'javascript',
  'react',
  'angular',
  'vue',
  'nodejs',
  'java',
  'csharp',
  'php',
  'ruby',
  'go',
  'rust',
  'devops',
  'data',
  'blockchain',
  'iot',
  'gaming',
  'design',
  'ux',
  'product',
  'agile',
  'testing',
  'database',
  'microservices',
  'kubernetes',
  'docker',
  'aws',
  'azure',
  'gcp',
] as const;
