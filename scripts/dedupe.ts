import { EventItem } from '../apps/web/src/lib/types';
import fs from 'fs/promises';
import path from 'path';
import * as stringSimilarity from 'string-similarity';

// Función para calcular similitud entre strings
function calculateSimilarity(str1: string, str2: string): number {
  return stringSimilarity.compareTwoStrings(str1.toLowerCase(), str2.toLowerCase());
}

// Función para detectar eventos duplicados
function findDuplicates(events: EventItem[]): EventItem[][] {
  const duplicates: EventItem[][] = [];
  const processed = new Set<string>();
  
  for (let i = 0; i < events.length; i++) {
    if (processed.has(events[i].id)) continue;
    
    const group = [events[i]];
    processed.add(events[i].id);
    
    for (let j = i + 1; j < events.length; j++) {
      if (processed.has(events[j].id)) continue;
      
      const event1 = events[i];
      const event2 = events[j];
      
      // Criterios para considerar duplicados:
      // 1. Misma URL
      if (event1.url === event2.url && event1.url) {
        group.push(event2);
        processed.add(event2.id);
        continue;
      }
      
      // 2. Título muy similar (>80%) y mismas fechas
      const titleSimilarity = calculateSimilarity(event1.title, event2.title);
      if (titleSimilarity > 0.8) {
        const date1 = event1.startsAt ? new Date(event1.startsAt).toDateString() : '';
        const date2 = event2.startsAt ? new Date(event2.startsAt).toDateString() : '';
        
        if (date1 === date2 && date1) {
          group.push(event2);
          processed.add(event2.id);
          continue;
        }
      }
      
      // 3. Misma ciudad y fechas cercanas (±1 día)
      if (event1.city === event2.city && event1.city && event1.startsAt && event2.startsAt) {
        const date1 = new Date(event1.startsAt);
        const date2 = new Date(event2.startsAt);
        const diffDays = Math.abs(date1.getTime() - date2.getTime()) / (1000 * 60 * 60 * 24);
        
        if (diffDays <= 1) {
          group.push(event2);
          processed.add(event2.id);
          continue;
        }
      }
    }
    
    if (group.length > 1) {
      duplicates.push(group);
    }
  }
  
  return duplicates;
}

// Función para resolver duplicados (mantener el mejor)
function resolveDuplicates(duplicateGroups: EventItem[][]): EventItem[] {
  const resolvedEvents: EventItem[] = [];
  
  for (const group of duplicateGroups) {
    // Criterios para elegir el mejor evento:
    // 1. El que tiene más información (descripción, URL, etc.)
    // 2. El más reciente (lastSeenAt más nuevo)
    // 3. El que viene de una fuente más confiable
    
    const bestEvent = group.reduce((best, current) => {
      let score = 0;
      
      // Puntuación por información disponible
      if (current.description) score += 1;
      if (current.url) score += 1;
      if (current.cfpUrl) score += 2;
      if (current.venue) score += 1;
      if (current.tracks && current.tracks.length > 0) score += 1;
      
      // Puntuación por fuente confiable
      if (current.source.id.includes('gdg')) score += 2;
      if (current.source.id.includes('owasp')) score += 2;
      if (current.source.id.includes('aws')) score += 2;
      
      // Puntuación por fecha de última actualización
      const currentDate = new Date(current.lastSeenAt);
      const bestDate = new Date(best.lastSeenAt);
      if (currentDate > bestDate) score += 1;
      
      return score > 0 ? current : best;
    });
    
    resolvedEvents.push(bestEvent);
  }
  
  return resolvedEvents;
}

// Función principal de deduplicación
export async function dedupeEvents(): Promise<void> {
  console.log('🔍 Starting event deduplication...');
  
  const normalizedFile = path.join(process.cwd(), 'data', 'normalized-events.json');
  const events: EventItem[] = JSON.parse(await fs.readFile(normalizedFile, 'utf-8'));
  
  console.log(`📊 Processing ${events.length} events for duplicates...`);
  
  // Encontrar duplicados
  const duplicateGroups = findDuplicates(events);
  console.log(`🔍 Found ${duplicateGroups.length} duplicate groups`);
  
  // Resolver duplicados
  const resolvedDuplicates = resolveDuplicates(duplicateGroups);
  
  // Obtener eventos únicos (no duplicados)
  const uniqueEvents = events.filter(event => 
    !duplicateGroups.some(group => group.some(dup => dup.id === event.id))
  );
  
  // Combinar eventos únicos con resueltos
  const finalEvents = [...uniqueEvents, ...resolvedDuplicates];
  
  // Ordenar por fecha de inicio
  finalEvents.sort((a, b) => {
    if (!a.startsAt && !b.startsAt) return 0;
    if (!a.startsAt) return 1;
    if (!b.startsAt) return -1;
    return new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime();
  });
  
  // Guardar eventos finales
  const finalFile = path.join(process.cwd(), 'data', 'events.json');
  await fs.writeFile(finalFile, JSON.stringify(finalEvents, null, 2));
  
  // Copiar a la app web
  const webDataDir = path.join(process.cwd(), 'apps', 'web', 'data');
  await fs.mkdir(webDataDir, { recursive: true });
  await fs.writeFile(path.join(webDataDir, 'events.json'), JSON.stringify(finalEvents, null, 2));
  
  console.log(`✅ Deduplication completed. Final count: ${finalEvents.length} events`);
  console.log(`📈 Removed ${events.length - finalEvents.length} duplicate events`);
}

// Ejecutar si se llama directamente
if (require.main === module) {
  dedupeEvents().catch(console.error);
}
