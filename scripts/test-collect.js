const fs = require('fs').promises;
const path = require('path');

// Función simple para probar recolección de datos reales
async function testRealDataCollection() {
  console.log('🚀 Testing real data collection...');
  
  try {
    // Probar con una fuente ICS real de Meetup
    const meetupUrl = 'https://www.meetup.com/gdg-buenos-aires/events/ical/';
    console.log(`📡 Fetching from: ${meetupUrl}`);
    
    const response = await fetch(meetupUrl);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const icsData = await response.text();
    console.log(`✅ Successfully fetched ${icsData.length} characters of ICS data`);
    
    // Guardar datos crudos para inspección
    const rawDir = path.join(process.cwd(), 'data', 'raw');
    await fs.mkdir(rawDir, { recursive: true });
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const rawFile = path.join(rawDir, `gdg-buenos-aires.${timestamp}.ics`);
    await fs.writeFile(rawFile, icsData);
    
    console.log(`💾 Saved raw data to: ${rawFile}`);
    
    // Mostrar algunas líneas del ICS para verificar
    const lines = icsData.split('\n').slice(0, 20);
    console.log('\n📋 First 20 lines of ICS data:');
    lines.forEach((line, i) => {
      if (line.trim()) {
        console.log(`${i + 1}: ${line}`);
      }
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Ejecutar
testRealDataCollection().catch(console.error);
