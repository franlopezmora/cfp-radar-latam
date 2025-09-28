import { EventItem, EventItemSchema, generateEventId, LATAM_COUNTRIES } from '../apps/web/src/lib/types';
import fs from 'fs/promises';
import path from 'path';
import { parse } from 'ical.js';

interface RawEvent {
  sourceId: string;
  rawData: any;
  fetchedAt: string;
  url: string;
}

// Parsear evento desde ICS
function parseICSEvent(icsData: string, sourceId: string): EventItem[] {
  const events: EventItem[] = [];
  
  try {
    const jcalData = parse(icsData);
    const comp = new ICAL.Component(jcalData);
    const vevents = comp.getAllSubcomponents('vevent');
    
    for (const vevent of vevents) {
      try {
        const event = new ICAL.Event(vevent);
        const start = event.startDate;
        const end = event.endDate;
        
        if (!start) continue;
        
        const title = event.summary || 'Evento sin título';
        const description = event.description || '';
        const location = event.location || '';
        const url = event.url || '';
        
        // Determinar formato basado en ubicación
        let format: 'in-person' | 'online' | 'hybrid' = 'online';
        if (location && !location.toLowerCase().includes('online') && !location.toLowerCase().includes('zoom')) {
          format = 'in-person';
        }
        
        // Extraer país y ciudad de la ubicación
        let country: string | undefined;
        let city: string | undefined;
        
        if (location) {
          // Buscar patrones como "Ciudad, País" o "Ciudad, Country"
          const locationParts = location.split(',').map(part => part.trim());
          if (locationParts.length >= 2) {
            city = locationParts[0];
            const countryPart = locationParts[locationParts.length - 1];
            
            // Buscar en el mapeo de países LATAM
            const foundCountry = Object.entries(LATAM_COUNTRIES).find(
              ([code, name]) => 
                countryPart.toLowerCase().includes(name.toLowerCase()) ||
                countryPart.toLowerCase().includes(code.toLowerCase())
            );
            
            if (foundCountry) {
              country = foundCountry[0];
            }
          }
        }
        
        // Detectar tracks desde el título y descripción
        const tracks: string[] = [];
        const content = `${title} ${description}`.toLowerCase();
        
        const trackKeywords = {
          'web': ['web', 'frontend', 'html', 'css', 'javascript'],
          'mobile': ['mobile', 'android', 'ios', 'react native', 'flutter'],
          'ai': ['ai', 'artificial intelligence', 'machine learning', 'ml'],
          'cloud': ['cloud', 'aws', 'azure', 'gcp', 'google cloud'],
          'security': ['security', 'cybersecurity', 'owasp', 'secure'],
          'python': ['python', 'django', 'flask', 'fastapi'],
          'javascript': ['javascript', 'js', 'node', 'nodejs'],
          'react': ['react', 'reactjs'],
          'devops': ['devops', 'ci/cd', 'deployment', 'infrastructure'],
        };
        
        for (const [track, keywords] of Object.entries(trackKeywords)) {
          if (keywords.some(keyword => content.includes(keyword))) {
            tracks.push(track);
          }
        }
        
        // Detectar si es un CFP
        const isCFP = content.includes('cfp') || content.includes('call for papers') || 
                     content.includes('call for proposals') || content.includes('convocatoria');
        
        const eventItem: EventItem = {
          id: generateEventId(sourceId, event.uid || '', title, start.toISOString()),
          title,
          description: description || undefined,
          url: url || '',
          cfpUrl: isCFP ? url : undefined,
          startsAt: start.toISOString(),
          endsAt: end ? end.toISOString() : undefined,
          cfpClosesAt: isCFP ? end?.toISOString() : undefined,
          timezone: start.timezone || undefined,
          country,
          city,
          venue: location || undefined,
          format,
          tracks,
          languages: ['es'], // Asumimos español por defecto para LATAM
          price: 'free', // Asumimos gratis por defecto
          source: {
            id: sourceId,
            fetchedAt: new Date().toISOString(),
            rawId: event.uid || '',
          },
          tags: [],
          lastSeenAt: new Date().toISOString(),
        };
        
        events.push(eventItem);
        
      } catch (error) {
        console.error(`Error parsing ICS event:`, error);
      }
    }
    
  } catch (error) {
    console.error(`Error parsing ICS data:`, error);
  }
  
  return events;
}

// Parsear evento desde RSS/Atom
function parseRSSEvent(rssData: string, sourceId: string): EventItem[] {
  // Implementación básica para RSS - se puede expandir
  const events: EventItem[] = [];
  
  try {
    // Parsear XML básico
    const items = rssData.match(/<item>[\s\S]*?<\/item>/g) || [];
    
    for (const item of items) {
      const titleMatch = item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>|<title>(.*?)<\/title>/);
      const descriptionMatch = item.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>|<description>(.*?)<\/description>/);
      const linkMatch = item.match(/<link>(.*?)<\/link>/);
      const pubDateMatch = item.match(/<pubDate>(.*?)<\/pubDate>/);
      
      if (!titleMatch || !linkMatch) continue;
      
      const title = titleMatch[1] || titleMatch[2] || '';
      const description = descriptionMatch ? (descriptionMatch[1] || descriptionMatch[2] || '') : '';
      const url = linkMatch[1] || '';
      const pubDate = pubDateMatch ? new Date(pubDateMatch[1]) : new Date();
      
      // Detectar si es un CFP
      const isCFP = (title + ' ' + description).toLowerCase().includes('cfp') ||
                   (title + ' ' + description).toLowerCase().includes('call for papers');
      
      const eventItem: EventItem = {
        id: generateEventId(sourceId, url, title, pubDate.toISOString()),
        title,
        description: description || undefined,
        url,
        cfpUrl: isCFP ? url : undefined,
        startsAt: pubDate.toISOString(),
        format: 'online',
        tracks: [],
        languages: ['es'],
        price: 'free',
        source: {
          id: sourceId,
          fetchedAt: new Date().toISOString(),
          rawId: url,
        },
        tags: [],
        lastSeenAt: new Date().toISOString(),
      };
      
      events.push(eventItem);
    }
    
  } catch (error) {
    console.error(`Error parsing RSS data:`, error);
  }
  
  return events;
}

// Normalizar eventos crudos
export async function normalizeEvents(): Promise<void> {
  console.log('🔄 Starting event normalization...');
  
  const rawEventsFile = path.join(process.cwd(), 'data', 'raw-events.json');
  const rawEvents: RawEvent[] = JSON.parse(await fs.readFile(rawEventsFile, 'utf-8'));
  
  const normalizedEvents: EventItem[] = [];
  
  for (const rawEvent of rawEvents) {
    try {
      let events: EventItem[] = [];
      
      // Determinar tipo de fuente y parsear accordingly
      if (rawEvent.sourceId.includes('meetup') || rawEvent.sourceId.includes('ics')) {
        events = parseICSEvent(rawEvent.rawData, rawEvent.sourceId);
      } else if (rawEvent.sourceId.includes('rss')) {
        events = parseRSSEvent(rawEvent.rawData, rawEvent.sourceId);
      }
      
      // Validar cada evento con Zod
      for (const event of events) {
        try {
          const validatedEvent = EventItemSchema.parse(event);
          normalizedEvents.push(validatedEvent);
        } catch (error) {
          console.error(`Validation error for event ${event.title}:`, error);
        }
      }
      
    } catch (error) {
      console.error(`Error normalizing events from ${rawEvent.sourceId}:`, error);
    }
  }
  
  // Guardar eventos normalizados
  const normalizedFile = path.join(process.cwd(), 'data', 'normalized-events.json');
  await fs.writeFile(normalizedFile, JSON.stringify(normalizedEvents, null, 2));
  
  console.log(`✅ Normalization completed. Generated ${normalizedEvents.length} normalized events`);
}

// Ejecutar si se llama directamente
if (require.main === module) {
  normalizeEvents().catch(console.error);
}
