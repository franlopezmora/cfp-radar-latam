import { EventItem } from '../apps/web/src/lib/types';
import fs from 'fs';
import path from 'path';

interface MonthlyEvents {
  [key: string]: EventItem[];
}

async function generateMonthlyFiles() {
  try {
    console.log('🔄 Generando archivos JSON mensuales...');
    
    // Cargar eventos completos desde data/events.json
    const eventsPath = path.join(__dirname, '../data/events.json');
    const events: EventItem[] = JSON.parse(fs.readFileSync(eventsPath, 'utf-8'));
    
    // Crear directorio public si no existe
    const publicDir = path.join(__dirname, '../apps/web/public');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }
    
    // Copiar el archivo principal events.json a public/
    const mainEventsPath = path.join(publicDir, 'events.json');
    fs.writeFileSync(mainEventsPath, JSON.stringify(events, null, 2));
    console.log(`✅ Copiado events.json a public/ con ${events.length} eventos`);
    
    // Dividir eventos por mes
    const monthlyEvents: MonthlyEvents = {};
    
    events.forEach(event => {
      if (event.startsAt) {
        const eventDate = new Date(event.startsAt);
        const monthKey = `${eventDate.getFullYear()}-${(eventDate.getMonth() + 1).toString().padStart(2, '0')}`;
        
        if (!monthlyEvents[monthKey]) {
          monthlyEvents[monthKey] = [];
        }
        monthlyEvents[monthKey].push(event);
      }
    });
    
    // Crear archivos mensuales
    let totalFiles = 0;
    
    for (const [monthKey, monthEvents] of Object.entries(monthlyEvents)) {
      const fileName = `events-${monthKey}.json`;
      const filePath = path.join(publicDir, fileName);
      
      // Ordenar eventos por fecha
      monthEvents.sort((a, b) => {
        if (!a.startsAt || !b.startsAt) return 0;
        return new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime();
      });
      
      fs.writeFileSync(filePath, JSON.stringify(monthEvents, null, 2));
      console.log(`✅ Creado ${fileName} con ${monthEvents.length} eventos`);
      totalFiles++;
    }
    
    console.log(`\n🎉 Generados ${totalFiles} archivos mensuales`);
    console.log(`📊 Total eventos procesados: ${events.length}`);
    
    // Mostrar estadísticas por mes
    console.log('\n📈 Estadísticas por mes:');
    Object.entries(monthlyEvents)
      .sort(([a], [b]) => a.localeCompare(b))
      .forEach(([monthKey, monthEvents]) => {
        console.log(`  ${monthKey}: ${monthEvents.length} eventos`);
      });
    
  } catch (error) {
    console.error('❌ Error generando archivos mensuales:', error);
    process.exit(1);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  generateMonthlyFiles();
}

export { generateMonthlyFiles };
