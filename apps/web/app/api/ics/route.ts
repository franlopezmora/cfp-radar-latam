import { NextRequest } from 'next/server';
import { toICS } from '../../../src/lib/ics';
import { applyFilters } from '../../../src/lib/filters';
import { EventItem } from '../../../src/lib/types';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    // Cargar eventos desde el archivo JSON
    const eventsPath = path.join(process.cwd(), 'public', 'events.json');
    const eventsData = fs.readFileSync(eventsPath, 'utf-8');
    const events: EventItem[] = JSON.parse(eventsData);
    
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
