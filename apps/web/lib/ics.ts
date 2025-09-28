import { EventItem } from './types';

export function toICS(events: EventItem[]): string {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//CFP Radar LATAM//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
  ];

  for (const event of events) {
    if (!event.startsAt) continue;

    const dtStart = toUTC(event.startsAt);
    const dtEnd = toUTC(event.endsAt ?? event.startsAt);
    const dtStamp = nowUTC();

    lines.push(
      "BEGIN:VEVENT",
      `UID:${event.id}@cfp-radar-latam`,
      `DTSTAMP:${dtStamp}`,
      `DTSTART:${dtStart}`,
      `DTEND:${dtEnd}`,
      `SUMMARY:${escape(event.title)}`,
      `DESCRIPTION:${escape((event.description ?? "") + "\\n\\nMás información: " + event.url)}`,
      event.city ? `LOCATION:${escape(`${event.city}${event.country ? ", " + LATAM_COUNTRIES[event.country as keyof typeof LATAM_COUNTRIES] : ""}`)}` : "",
      `URL:${event.url}`,
      event.cfpUrl ? `X-CFP-URL:${event.cfpUrl}` : "",
      "END:VEVENT"
    );
  }

  lines.push("END:VCALENDAR");
  return lines.filter(Boolean).join("\r\n");
}

function toUTC(dateString: string): string {
  const date = new Date(dateString);
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

function nowUTC(): string {
  return new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

function escape(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '');
}

// Mapeo de países LATAM para ICS
const LATAM_COUNTRIES = {
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
