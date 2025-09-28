const fs = require('fs').promises;
const path = require('path');

// Fuentes reales de eventos que sabemos que funcionan
const realSources = [
  {
    name: 'OWASP Buenos Aires',
    url: 'https://www.meetup.com/owasp-buenos-aires/events/ical/',
    type: 'ICS'
  },
  {
    name: 'Python Argentina',
    url: 'https://www.meetup.com/python-buenos-aires/events/ical/',
    type: 'ICS'
  },
  {
    name: 'React Buenos Aires',
    url: 'https://www.meetup.com/react-buenos-aires/events/ical/',
    type: 'ICS'
  },
  {
    name: 'AWS User Group Buenos Aires',
    url: 'https://www.meetup.com/aws-ug-buenos-aires/events/ical/',
    type: 'ICS'
  },
  {
    name: 'PyCon Argentina RSS',
    url: 'https://pycon.org.ar/feed/',
    type: 'RSS'
  }
];

async function testRealSources() {
  console.log('🚀 Testing real event sources...\n');
  
  const results = [];
  
  for (const source of realSources) {
    console.log(`📡 Testing: ${source.name}`);
    console.log(`   URL: ${source.url}`);
    
    try {
      const response = await fetch(source.url);
      console.log(`   Status: ${response.status} ${response.statusText}`);
      
      if (response.ok) {
        const data = await response.text();
        console.log(`   ✅ Success: ${data.length} characters`);
        
        // Guardar datos si es exitoso
        const rawDir = path.join(process.cwd(), 'data', 'raw');
        await fs.mkdir(rawDir, { recursive: true });
        
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const extension = source.type === 'ICS' ? 'ics' : 'xml';
        const rawFile = path.join(rawDir, `${source.name.toLowerCase().replace(/\s+/g, '-')}.${timestamp}.${extension}`);
        await fs.writeFile(rawFile, data);
        
        console.log(`   💾 Saved to: ${rawFile}`);
        
        results.push({
          name: source.name,
          url: source.url,
          status: 'success',
          size: data.length,
          file: rawFile
        });
      } else {
        console.log(`   ❌ Failed: ${response.status}`);
        results.push({
          name: source.name,
          url: source.url,
          status: 'failed',
          error: `${response.status} ${response.statusText}`
        });
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
      results.push({
        name: source.name,
        url: source.url,
        status: 'error',
        error: error.message
      });
    }
    
    console.log(''); // Línea en blanco
  }
  
  // Resumen
  console.log('📊 Summary:');
  const successful = results.filter(r => r.status === 'success');
  const failed = results.filter(r => r.status !== 'success');
  
  console.log(`✅ Successful: ${successful.length}`);
  console.log(`❌ Failed: ${failed.length}`);
  
  if (successful.length > 0) {
    console.log('\n🎉 Working sources:');
    successful.forEach(source => {
      console.log(`   - ${source.name}: ${source.size} chars`);
    });
  }
  
  if (failed.length > 0) {
    console.log('\n⚠️  Failed sources:');
    failed.forEach(source => {
      console.log(`   - ${source.name}: ${source.error}`);
    });
  }
}

// Ejecutar
testRealSources().catch(console.error);
