import { NextRequest } from 'next/server';
import { toICS } from '@/lib/ics';
import { applyFilters } from '@/lib/filters';
import { EventItem } from '@/lib/types';

// Importar eventos desde el archivo JSON
import events from '../../../public/events.json';

export const dynamic = 'force-static';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    
    // Obtener parámetros de filtro
    const id = searchParams.get('id');
    const country = searchParams.get('country');
    const city = searchParams.get('city');
    const format = searchParams.get('format') as 'online' | 'in-person' | 'hybrid' | null;
    const track = searchParams.get('track');
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const onlyOpenCFP = searchParams.get('onlyOpenCFP') === 'true';

    let filteredEvents: EventItem[] = (events as any[]).map(event => ({
      ...event,
      format: event.format as 'online' | 'in-person' | 'hybrid'
    }));

    // Si se especifica un ID específico, filtrar solo ese evento
    if (id) {
      filteredEvents = filteredEvents.filter((event: EventItem) => event.id === id);
    } else {
      // Aplicar filtros si no es un evento específico
      const query = {
        country: country || undefined,
        city: city || undefined,
        format: format || undefined,
        track: track ? track.split(',') : undefined,
        from: from || undefined,
        to: to || undefined,
        onlyOpenCFP: onlyOpenCFP || undefined,
      };

      filteredEvents = applyFilters(events as EventItem[], query);
    }

    // Generar ICS
    const icsContent = toICS(filteredEvents);

    // Determinar nombre del archivo
    let filename = 'cfp-radar-latam.ics';
    if (id) {
      filename = `evento-${id}.ics`;
    } else if (country) {
      filename = `eventos-${country}.ics`;
    } else if (city) {
      filename = `eventos-${city}.ics`;
    }

    return new Response(icsContent, {
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'public, max-age=3600', // Cache por 1 hora
      },
    });

  } catch (error) {
    console.error('Error generating ICS:', error);
    
    return new Response('Error generando calendario', {
      status: 500,
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  }
}
