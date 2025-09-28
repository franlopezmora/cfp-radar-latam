import { EventItemSchema } from '../apps/web/src/lib/types';
import fs from 'fs/promises';
import path from 'path';

// Función para validar eventos
export async function validateEvents(): Promise<void> {
  console.log('✅ Starting event validation...');
  
  const eventsFile = path.join(process.cwd(), 'data', 'events.json');
  const events: any[] = JSON.parse(await fs.readFile(eventsFile, 'utf-8'));
  
  const validEvents: any[] = [];
  const invalidEvents: any[] = [];
  
  for (const event of events) {
    try {
      const validatedEvent = EventItemSchema.parse(event);
      validEvents.push(validatedEvent);
    } catch (error) {
      console.error(`❌ Invalid event: ${event.title || 'Unknown'}`, error);
      invalidEvents.push({ event, error });
    }
  }
  
  // Guardar eventos válidos
  await fs.writeFile(eventsFile, JSON.stringify(validEvents, null, 2));
  
  // Guardar reporte de eventos inválidos
  if (invalidEvents.length > 0) {
    const invalidFile = path.join(process.cwd(), 'data', 'invalid-events.json');
    await fs.writeFile(invalidFile, JSON.stringify(invalidEvents, null, 2));
    console.log(`⚠️  Found ${invalidEvents.length} invalid events. Check invalid-events.json`);
  }
  
  // Copiar eventos válidos a la app web
  const webDataDir = path.join(process.cwd(), 'apps', 'web', 'data');
  await fs.mkdir(webDataDir, { recursive: true });
  await fs.writeFile(path.join(webDataDir, 'events.json'), JSON.stringify(validEvents, null, 2));
  
  console.log(`✅ Validation completed. ${validEvents.length} valid events`);
}

// Ejecutar si se llama directamente
if (require.main === module) {
  validateEvents().catch(console.error);
}
