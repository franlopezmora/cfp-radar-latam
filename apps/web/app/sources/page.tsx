'use client';

import { useState, useEffect } from 'react';
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

interface SourceStatus {
  id: string;
  name: string;
  url: string;
  type: string;
  status: 'OK' | 'ERROR' | 'UNKNOWN';
  lastChecked?: Date;
  errorMessage?: string;
  eventCount?: number;
}

export default function SourcesPage() {
  const [sources, setSources] = useState<SourceStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    async function checkSources() {
      try {
        const sourceList = await loadSources();
        const sourceStatuses: SourceStatus[] = [];

        for (const source of sourceList) {
          try {
            const response = await fetch(`/api/source-status?id=${source.id}`);
            const status = await response.json();
            
            sourceStatuses.push({
              id: source.id,
              name: source.name,
              url: source.url,
              type: source.type,
              status: status.status || 'UNKNOWN',
              lastChecked: status.lastChecked ? new Date(status.lastChecked) : undefined,
              errorMessage: status.errorMessage,
              eventCount: status.eventCount
            });
          } catch (error) {
            sourceStatuses.push({
              id: source.id,
              name: source.name,
              url: source.url,
              type: source.type,
              status: 'ERROR',
              errorMessage: error instanceof Error ? error.message : 'Unknown error'
            });
          }
        }

        setSources(sourceStatuses);
        setLastUpdate(new Date());
      } catch (error) {
        console.error('Error checking sources:', error);
      } finally {
        setLoading(false);
      }
    }

    checkSources();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OK': return 'text-green-600 bg-green-100 border-green-200';
      case 'ERROR': return 'text-red-600 bg-red-100 border-red-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'OK': return '✅';
      case 'ERROR': return '❌';
      default: return '❓';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando fuentes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Estado de Fuentes</h1>
              <p className="mt-2 text-gray-600">
                Monitoreo de fuentes de datos de eventos tech en LATAM
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">
                Última verificación: {lastUpdate?.toLocaleString('es-ES')}
              </p>
              <button
                onClick={() => window.location.reload()}
                className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                🔄 Actualizar
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <span className="text-2xl">✅</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Fuentes Activas</p>
                <p className="text-2xl font-bold text-green-600">
                  {sources.filter(s => s.status === 'OK').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <span className="text-2xl">❌</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Con Errores</p>
                <p className="text-2xl font-bold text-red-600">
                  {sources.filter(s => s.status === 'ERROR').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <span className="text-2xl">📊</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Eventos</p>
                <p className="text-2xl font-bold text-blue-600">
                  {sources.reduce((sum, s) => sum + (s.eventCount || 0), 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Sources List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Fuentes de Datos</h2>
          </div>
          
          <div className="divide-y divide-gray-200">
            {sources.map((source) => (
              <div key={source.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-lg font-medium text-gray-900">
                        {source.name}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(source.status)}`}>
                        {getStatusIcon(source.status)} {source.status}
                      </span>
                    </div>
                    
                    <div className="mt-2 space-y-1">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">URL:</span>{' '}
                        <a 
                          href={source.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 underline"
                        >
                          {source.url}
                        </a>
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Tipo:</span> {source.type}
                      </p>
                      {source.eventCount !== undefined && (
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Eventos:</span> {source.eventCount}
                        </p>
                      )}
                      {source.lastChecked && (
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Última verificación:</span>{' '}
                          {source.lastChecked.toLocaleString('es-ES')}
                        </p>
                      )}
                      {source.errorMessage && (
                        <p className="text-sm text-red-600 mt-2">
                          <span className="font-medium">Error:</span> {source.errorMessage}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="ml-4 flex space-x-2">
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                    >
                      🔗 Ver fuente
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Back to Home */}
        <div className="mt-8 text-center">
          <a
            href="/"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            ← Volver a eventos
          </a>
        </div>
      </main>
    </div>
  );
}
