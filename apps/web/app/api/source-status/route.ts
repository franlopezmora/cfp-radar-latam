import { NextRequest } from 'next/server';
// Simulamos la carga de fuentes por ahora
const loadSources = async () => [
  { id: 'gdg-buenos-aires', name: 'GDG Buenos Aires', url: 'https://gdg.community.dev/gdg-buenos-aires/', type: 'ics' },
  { id: 'awsug-argentina', name: 'AWS User Group Argentina', url: 'https://awsug.community.dev/awsug-argentina/', type: 'ics' },
  { id: 'owasp-buenos-aires', name: 'OWASP Buenos Aires', url: 'https://owasp.org/www-chapter-buenos-aires/', type: 'ics' },
  { id: 'react-latam', name: 'React LATAM', url: 'https://reactlatam.com/', type: 'html' },
  { id: 'jsconf-argentina', name: 'JSConf Argentina', url: 'https://jsconfar.com/', type: 'html' },
  { id: 'devfest-buenos-aires', name: 'DevFest Buenos Aires', url: 'https://devfest.community.dev/gdg-buenos-aires/', type: 'ics' },
  { id: 'awsug-chile', name: 'AWS User Group Chile', url: 'https://awsug.community.dev/awsug-chile/', type: 'ics' },
  { id: 'gdg-santiago', name: 'GDG Santiago', url: 'https://gdg.community.dev/gdg-santiago/', type: 'ics' },
  { id: 'owasp-chile', name: 'OWASP Chile', url: 'https://owasp.org/www-chapter-chile/', type: 'ics' },
  { id: 'devfest-santiago', name: 'DevFest Santiago', url: 'https://devfest.community.dev/gdg-santiago/', type: 'ics' },
  { id: 'awsug-mexico', name: 'AWS User Group México', url: 'https://awsug.community.dev/awsug-mexico/', type: 'ics' },
  { id: 'gdg-mexico-city', name: 'GDG México City', url: 'https://gdg.community.dev/gdg-mexico-city/', type: 'ics' }
];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sourceId = searchParams.get('id');
  
  if (!sourceId) {
    return Response.json({ error: 'Missing source ID' }, { status: 400 });
  }

  try {
    const sources = await loadSources();
    const source = sources.find(s => s.id === sourceId);
    
    if (!source) {
      return Response.json({ error: 'Source not found' }, { status: 404 });
    }

    // Simular verificación de estado (en producción esto vendría de una base de datos o cache)
    const status = await checkSourceStatus(source);
    
    return Response.json({
      id: source.id,
      name: source.name,
      url: source.url,
      type: source.type,
      status: status.status,
      lastChecked: status.lastChecked,
      errorMessage: status.errorMessage,
      eventCount: status.eventCount
    });

  } catch (error) {
    console.error('Error checking source status:', error);
    return Response.json({ 
      error: 'Internal server error',
      status: 'ERROR',
      errorMessage: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

async function checkSourceStatus(source: any) {
  try {
    // Intentar hacer una petición HEAD para verificar si la fuente está disponible
    const response = await fetch(source.url, { 
      method: 'HEAD',
      headers: {
        'User-Agent': 'CFP-Radar-LATAM/1.0'
      }
    });
    
    if (response.ok) {
      return {
        status: 'OK',
        lastChecked: new Date().toISOString(),
        eventCount: Math.floor(Math.random() * 50) // Simulado por ahora
      };
    } else {
      return {
        status: 'ERROR',
        lastChecked: new Date().toISOString(),
        errorMessage: `HTTP ${response.status}: ${response.statusText}`
      };
    }
  } catch (error) {
    return {
      status: 'ERROR',
      lastChecked: new Date().toISOString(),
      errorMessage: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
