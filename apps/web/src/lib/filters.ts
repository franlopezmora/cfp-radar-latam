import { EventItem, Query, LATAM_COUNTRIES, COMMON_TRACKS } from './types';

export function applyFilters(items: EventItem[], query: Query): EventItem[] {
  const txt = (query.q ?? "").toLowerCase();
  const inRange = (d?: string) => {
    if (!query.from && !query.to) return true;
    if (!d) return false;
    return (!query.from || d >= query.from) && (!query.to || d <= query.to);
  };

  return items.filter(event => {
    // Filtro de texto
    if (txt && !(event.title + " " + (event.description ?? "")).toLowerCase().includes(txt)) {
      return false;
    }

    // Filtro de país
    if (query.country && event.country !== query.country) {
      return false;
    }

    // Filtro de ciudad
    if (query.city && event.city !== query.city) {
      return false;
    }

    // Filtro de formato
    if (query.format && event.format !== query.format) {
      return false;
    }

    // Filtro de tracks
    if (query.track && query.track.length > 0) {
      const hasMatchingTrack = query.track.some(t => event.tracks?.includes(t));
      if (!hasMatchingTrack) return false;
    }

    // Filtro de rango de fechas
    if (!inRange(event.startsAt)) {
      return false;
    }

    // Filtro de CFP abierto
    if (query.onlyOpenCFP) {
      if (!event.cfpClosesAt) return false;
      const today = new Date().toISOString().slice(0, 10);
      if (event.cfpClosesAt < today) return false;
    }

    return true;
  });
}

export function getUniqueCities(events: EventItem[], country?: string): string[] {
  const cities = events
    .filter(event => !country || event.country === country)
    .map(event => event.city)
    .filter((city): city is string => !!city);
  
  return Array.from(new Set(cities)).sort();
}

export function getUniqueTracks(events: EventItem[]): string[] {
  const tracks = events.flatMap(event => event.tracks || []);
  return Array.from(new Set(tracks)).sort();
}

export function getCFPDeadlineDays(cfpClosesAt: string): number {
  const today = new Date();
  const deadline = new Date(cfpClosesAt);
  const diffTime = deadline.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function formatEventDate(dateString?: string): string {
  if (!dateString) return 'Fecha por confirmar';
  
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  });
}

export function formatEventTime(dateString?: string): string {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  return date.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit'
  });
}
