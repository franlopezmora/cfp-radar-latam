const fs = require('fs').promises;
const path = require('path');

// Fuentes alternativas con APIs públicas
const alternativeSources = [
  {
    name: 'Eventbrite Argentina Tech',
    url: 'https://www.eventbrite.com/rss/events/?q=technology&location=argentina',
    type: 'RSS'
  },
  {
    name: 'Eventbrite México Tech',
    url: 'https://www.eventbrite.com/rss/events/?q=technology&location=mexico',
    type: 'RSS'
  },
  {
    name: 'Eventbrite Chile Tech',
    url: 'https://www.eventbrite.com/rss/events/?q=technology&location=chile',
    type: 'RSS'
  },
  {
    name: 'Eventbrite Colombia Tech',
    url: 'https://www.eventbrite.com/rss/events/?q=technology&location=colombia',
    type: 'RSS'
  },
  {
    name: 'Eventbrite Brasil Tech',
    url: 'https://www.eventbrite.com/rss/events/?q=technology&location=brazil',
    type: 'RSS'
  },
  {
    name: 'Meetup Buenos Aires Tech',
    url: 'https://www.meetup.com/find/?location=buenos-aires--argentina&source=EVENTS&categoryId=34',
    type: 'HTML'
  }
];

async function testAlternativeSources() {
  console.log('🔍 Testing alternative event sources...\n');
  
  const workingSources = [];
  
  for (const source of alternativeSources) {
    console.log(`📡 Testing: ${source.name}`);
    console.log(`   URL: ${source.url}`);
    
    try {
      const response = await fetch(source.url);
      console.log(`   Status: ${response.status} ${response.statusText}`);
      
      if (response.ok) {
        const data = await response.text();
        console.log(`   ✅ Success: ${data.length} characters`);
        
        // Verificar contenido
        let hasEvents = false;
        let eventCount = 0;
        
        if (source.type === 'RSS') {
          hasEvents = data.includes('<item>');
          eventCount = (data.match(/<item>/g) || []).length;
        } else if (source.type === 'HTML') {
          hasEvents = data.includes('event') || data.includes('meetup');
          // Contar elementos que parecen eventos
          eventCount = (data.match(/class="[^"]*event[^"]*"/gi) || []).length;
        }
        
        console.log(`   📅 Has events: ${hasEvents ? 'YES' : 'NO'}`);
        if (hasEvents) {
          console.log(`   🎯 Event count: ${eventCount}`);
        }
        
        if (hasEvents && eventCount > 0) {
          workingSources.push({
            ...source,
            eventCount,
            dataLength: data.length
          });
          
          // Guardar datos
          const rawDir = path.join(process.cwd(), 'data', 'raw');
          await fs.mkdir(rawDir, { recursive: true });
          
          const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
          const extension = source.type === 'RSS' ? 'xml' : 'html';
          const rawFile = path.join(rawDir, `${source.name.toLowerCase().replace(/\s+/g, '-')}.${timestamp}.${extension}`);
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
  } else {
    console.log('\n⚠️  No sources with events found.');
    console.log('\n💡 Alternative approach: Let\'s create a hybrid system:');
    console.log('   1. Use the working ICS sources (even if empty)');
    console.log('   2. Add manual curation of real events');
    console.log('   3. Set up monitoring for when events are added');
  }
}

// Ejecutar
testAlternativeSources().catch(console.error);
