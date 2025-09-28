import { DataSource, DataSourceSchema } from '../apps/web/src/lib/types';
import fs from 'fs/promises';
import path from 'path';

// Catálogo de fuentes de datos iniciales
export const SOURCES: DataSource[] = [
  // GDG (Google Developer Groups) - Meetup ICS feeds
  {
    id: 'gdg-buenos-aires',
    name: 'GDG Buenos Aires',
    type: 'meetup',
    url: 'https://www.meetup.com/gdg-buenos-aires/events/ical/',
    country: 'AR',
    city: 'Buenos Aires',
    enabled: true,
  },
  {
    id: 'gdg-santiago',
    name: 'GDG Santiago',
    type: 'meetup',
    url: 'https://www.meetup.com/gdg-santiago/events/ical/',
    country: 'CL',
    city: 'Santiago',
    enabled: true,
  },
  {
    id: 'gdg-mexico-city',
    name: 'GDG México City',
    type: 'meetup',
    url: 'https://www.meetup.com/gdg-mexico-city/events/ical/',
    country: 'MX',
    city: 'Ciudad de México',
    enabled: true,
  },
  {
    id: 'gdg-bogota',
    name: 'GDG Bogotá',
    type: 'meetup',
    url: 'https://www.meetup.com/gdg-bogota/events/ical/',
    country: 'CO',
    city: 'Bogotá',
    enabled: true,
  },

  // OWASP Chapters - Meetup ICS feeds
  {
    id: 'owasp-buenos-aires',
    name: 'OWASP Buenos Aires',
    type: 'meetup',
    url: 'https://www.meetup.com/owasp-buenos-aires/events/ical/',
    country: 'AR',
    city: 'Buenos Aires',
    enabled: true,
  },
  {
    id: 'owasp-santiago',
    name: 'OWASP Santiago',
    type: 'meetup',
    url: 'https://www.meetup.com/owasp-santiago/events/ical/',
    country: 'CL',
    city: 'Santiago',
    enabled: true,
  },

  // AWS User Groups
  {
    id: 'aws-ug-buenos-aires',
    name: 'AWS User Group Buenos Aires',
    type: 'meetup',
    url: 'https://www.meetup.com/aws-ug-buenos-aires/events/ical/',
    country: 'AR',
    city: 'Buenos Aires',
    enabled: true,
  },
  {
    id: 'aws-ug-mexico',
    name: 'AWS User Group México',
    type: 'meetup',
    url: 'https://www.meetup.com/aws-ug-mexico/events/ical/',
    country: 'MX',
    city: 'Ciudad de México',
    enabled: true,
  },

  // Python Communities
  {
    id: 'python-buenos-aires',
    name: 'Python Buenos Aires',
    type: 'meetup',
    url: 'https://www.meetup.com/python-buenos-aires/events/ical/',
    country: 'AR',
    city: 'Buenos Aires',
    enabled: true,
  },
  {
    id: 'python-chile',
    name: 'Python Chile',
    type: 'meetup',
    url: 'https://www.meetup.com/python-chile/events/ical/',
    country: 'CL',
    city: 'Santiago',
    enabled: true,
  },

  // React Communities
  {
    id: 'react-buenos-aires',
    name: 'React Buenos Aires',
    type: 'meetup',
    url: 'https://www.meetup.com/react-buenos-aires/events/ical/',
    country: 'AR',
    city: 'Buenos Aires',
    enabled: true,
  },
  {
    id: 'react-mexico',
    name: 'React México',
    type: 'meetup',
    url: 'https://www.meetup.com/react-mexico/events/ical/',
    country: 'MX',
    city: 'Ciudad de México',
    enabled: true,
  },

  // Conferencias grandes con ICS público
  {
    id: 'nerdearla',
    name: 'Nerdearla',
    type: 'ics',
    url: 'https://nerdear.la/calendar.ics',
    country: 'AR',
    city: 'Buenos Aires',
    enabled: true,
  },
  {
    id: 'tdc-sao-paulo',
    name: 'The Developer\'s Conference São Paulo',
    type: 'ics',
    url: 'https://thedevconf.com/tdc/2024/saopaulo/calendar.ics',
    country: 'BR',
    city: 'São Paulo',
    enabled: true,
  },
];

// Validar todas las fuentes
export function validateSources(): DataSource[] {
  return SOURCES.map(source => {
    try {
      return DataSourceSchema.parse(source);
    } catch (error) {
      console.error(`Error validating source ${source.id}:`, error);
      throw error;
    }
  });
}

// Guardar fuentes en archivo
export async function saveSources(sources: DataSource[]): Promise<void> {
  const dataDir = path.join(process.cwd(), 'data');
  await fs.mkdir(dataDir, { recursive: true });
  
  const sourcesFile = path.join(dataDir, 'sources.json');
  await fs.writeFile(sourcesFile, JSON.stringify(sources, null, 2));
}

// Cargar fuentes desde archivo
export async function loadSources(): Promise<DataSource[]> {
  const sourcesFile = path.join(process.cwd(), 'data', 'sources.json');
  try {
    const content = await fs.readFile(sourcesFile, 'utf-8');
    const sources = JSON.parse(content);
    return sources.map((source: any) => DataSourceSchema.parse(source));
  } catch (error) {
    console.log('No sources file found, using default sources');
    return validateSources();
  }
}
