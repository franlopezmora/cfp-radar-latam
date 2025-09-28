import { loadSources } from './sources';
import fs from 'fs/promises';
import path from 'path';
import fetch from 'node-fetch';

interface RawEvent {
  sourceId: string;
  rawData: any;
  fetchedAt: string;
  url: string;
}

// Crear directorio para datos crudos
async function ensureRawDataDir(): Promise<string> {
  const rawDir = path.join(process.cwd(), 'data', 'raw');
  await fs.mkdir(rawDir, { recursive: true });
  return rawDir;
}

// Descargar datos de una fuente ICS
async function fetchICS(url: string): Promise<string> {
  console.log(`Fetching ICS from: ${url}`);
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch ICS: ${response.status} ${response.statusText}`);
  }
  
  return await response.text();
}

// Descargar datos de una fuente RSS/Atom
async function fetchRSS(url: string): Promise<string> {
  console.log(`Fetching RSS from: ${url}`);
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch RSS: ${response.status} ${response.statusText}`);
  }
  
  return await response.text();
}

// Descargar datos de una fuente JSON
async function fetchJSON(url: string): Promise<any> {
  console.log(`Fetching JSON from: ${url}`);
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch JSON: ${response.status} ${response.statusText}`);
  }
  
  return await response.json();
}

// Descargar datos de una fuente HTML
async function fetchHTML(url: string): Promise<string> {
  console.log(`Fetching HTML from: ${url}`);
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch HTML: ${response.status} ${response.statusText}`);
  }
  
  return await response.text();
}

// Procesar una fuente individual
async function processSource(source: any): Promise<RawEvent[]> {
  const rawDir = await ensureRawDataDir();
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const rawEvents: RawEvent[] = [];
  
  try {
    let rawData: any;
    let extension: string;
    
    switch (source.type) {
      case 'ics':
      case 'meetup':
        rawData = await fetchICS(source.url);
        extension = 'ics';
        break;
      case 'rss':
      case 'atom':
        rawData = await fetchRSS(source.url);
        extension = 'xml';
        break;
      case 'json':
        rawData = await fetchJSON(source.url);
        extension = 'json';
        break;
      case 'html':
        rawData = await fetchHTML(source.url);
        extension = 'html';
        break;
      default:
        throw new Error(`Unsupported source type: ${source.type}`);
    }
    
    // Guardar datos crudos
    const rawFile = path.join(rawDir, `${source.id}.${timestamp}.${extension}`);
    await fs.writeFile(rawFile, typeof rawData === 'string' ? rawData : JSON.stringify(rawData, null, 2));
    
    // Crear evento crudo
    const rawEvent: RawEvent = {
      sourceId: source.id,
      rawData,
      fetchedAt: new Date().toISOString(),
      url: source.url,
    };
    
    rawEvents.push(rawEvent);
    
    console.log(`✅ Successfully processed ${source.id} (${source.type})`);
    
  } catch (error) {
    console.error(`❌ Error processing ${source.id}:`, error);
    
    // Guardar error para debugging
    const errorFile = path.join(rawDir, `${source.id}.${timestamp}.error.json`);
    await fs.writeFile(errorFile, JSON.stringify({
      sourceId: source.id,
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString(),
    }, null, 2));
  }
  
  return rawEvents;
}

// Función principal de recolección
export async function collectEvents(): Promise<void> {
  console.log('🚀 Starting event collection...');
  
  const sources = await loadSources();
  const enabledSources = sources.filter(source => source.enabled);
  
  console.log(`📊 Found ${enabledSources.length} enabled sources`);
  
  const allRawEvents: RawEvent[] = [];
  
  // Procesar cada fuente
  for (const source of enabledSources) {
    try {
      const rawEvents = await processSource(source);
      allRawEvents.push(...rawEvents);
    } catch (error) {
      console.error(`Failed to process source ${source.id}:`, error);
    }
  }
  
  // Guardar todos los eventos crudos
  const rawEventsFile = path.join(process.cwd(), 'data', 'raw-events.json');
  await fs.writeFile(rawEventsFile, JSON.stringify(allRawEvents, null, 2));
  
  console.log(`✅ Collection completed. Processed ${allRawEvents.length} raw events`);
}

// Ejecutar si se llama directamente
if (require.main === module) {
  collectEvents().catch(console.error);
}
