#!/usr/bin/env node
const fs = require('fs').promises;
const path = require('path');

// Script para monitorear fuentes ICS y detectar nuevos eventos
async function monitorSources() {
  console.log('🔍 Monitoring ICS sources for new events...');
  
  const sourcesFile = path.join(process.cwd(), 'data', 'working-sources.json');
  const sources = JSON.parse(await fs.readFile(sourcesFile, 'utf-8'));
  
  for (const source of sources) {
    try {
      console.log(`📡 Checking: ${source.name}`);
      const response = await fetch(source.url);
      
      if (response.ok) {
        const data = await response.text();
        const hasEvents = data.includes('BEGIN:VEVENT');
        
        if (hasEvents) {
          const eventCount = (data.match(/BEGIN:VEVENT/g) || []).length;
          console.log(`   🎉 Found ${eventCount} events!`);
          
          // Aquí podrías procesar los eventos y agregarlos a la base de datos
          // Por ahora solo reportamos
        } else {
          console.log(`   📭 No events found`);
        }
      } else {
        console.log(`   ❌ Failed: ${response.status}`);
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
  }
}

monitorSources().catch(console.error);
