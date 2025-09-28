const fs = require('fs').promises;
const path = require('path');

// Fuentes reales con más probabilidad de tener eventos
const realSources = [
  {
    name: 'GDG Santiago',
    url: 'https://www.meetup.com/gdg-santiago/events/ical/',
    type: 'ICS'
  },
  {
    name: 'GDG México City',
    url: 'https://www.meetup.com/gdg-mexico-city/events/ical/',
    type: 'ICS'
  },
  {
    name: 'GDG Bogotá',
    url: 'https://www.meetup.com/gdg-bogota/events/ical/',
    type: 'ICS'
  },
  {
    name: 'Python Chile',
    url: 'https://www.meetup.com/python-chile/events/ical/',
    type: 'ICS'
  },
  {
    name: 'React México',
    url: 'https://www.meetup.com/react-mexico/events/ical/',
    type: 'ICS'
  },
  {
    name: 'AWS User Group México',
    url: 'https://www.meetup.com/aws-ug-mexico/events/ical/',
    type: 'ICS'
  },
  {
    name: 'OWASP Santiago',
    url: 'https://www.meetup.com/owasp-santiago/events/ical/',
    type: 'ICS'
  },
  {
    name: 'Nerdearla Calendar',
    url: 'https://nerdear.la/calendar.ics',
    type: 'ICS'
  }
];

async function findWorkingSources() {
  console.log('🔍 Finding working event sources...\n');
  
  const workingSources = [];
  
  for (const source of realSources) {
    console.log(`📡 Testing: ${source.name}`);
    
    try {
      const response = await fetch(source.url);
      
      if (response.ok) {
        const data = await response.text();
        console.log(`   ✅ Success: ${data.length} characters`);
        
        // Verificar si tiene eventos (buscar VEVENT)
        const hasEvents = data.includes('BEGIN:VEVENT');
        console.log(`   📅 Has events: ${hasEvents ? 'YES' : 'NO'}`);
        
        if (hasEvents) {
          // Contar eventos
          const eventCount = (data.match(/BEGIN:VEVENT/g) || []).length;
          console.log(`   🎯 Event count: ${eventCount}`);
          
          workingSources.push({
            ...source,
            eventCount,
            dataLength: data.length
          });
          
          // Guardar datos si tiene eventos
          const rawDir = path.join(process.cwd(), 'data', 'raw');
          await fs.mkdir(rawDir, { recursive: true });
          
          const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
          const rawFile = path.join(rawDir, `${source.name.toLowerCase().replace(/\s+/g, '-')}.${timestamp}.ics`);
          await fs.writeFile(rawFile, data);
          console.log(`   💾 Saved to: ${rawFile}`);
        }
      } else {
        console.log(`   ❌ Failed: ${response.status}`);
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
    
    console.log(''); // Línea en blanco
  }
  
  // Resumen
  console.log('📊 Results:');
  console.log(`✅ Sources with events: ${workingSources.length}`);
  
  if (workingSources.length > 0) {
    console.log('\n🎉 Working sources with events:');
    workingSources.forEach(source => {
      console.log(`   - ${source.name}: ${source.eventCount} events (${source.dataLength} chars)`);
    });
    
    // Crear archivo de fuentes que funcionan
    const sourcesFile = path.join(process.cwd(), 'data', 'working-sources.json');
    await fs.writeFile(sourcesFile, JSON.stringify(workingSources, null, 2));
    console.log(`\n💾 Saved working sources to: ${sourcesFile}`);
  } else {
    console.log('\n⚠️  No sources with events found. This might be normal if:');
    console.log('   - Groups don\'t have upcoming events');
    console.log('   - URLs have changed');
    console.log('   - Groups are inactive');
  }
}

// Ejecutar
findWorkingSources().catch(console.error);
