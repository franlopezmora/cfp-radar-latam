'use client';

import { useState, useEffect } from 'react';
import { EventItem, Query, LATAM_COUNTRIES, COMMON_TRACKS } from '../src/lib/types';
import { applyFilters, getUniqueCities, getUniqueTracks, getCFPDeadlineDays, formatEventDate, formatEventTime } from '../src/lib/filters';
import { loadEventsByMonth, getAllEventsFromMonthly } from '../src/lib/monthly-events';

export default function HomePage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<EventItem[]>([]);
  const [query, setQuery] = useState<Query>({});
  const [loading, setLoading] = useState(true);

  // Cargar eventos usando sistema mensual con fallback
  useEffect(() => {
    async function loadEvents() {
      try {
        // Cargar eventos usando el sistema mensual con fallback
        const monthlyEvents = await loadEventsByMonth();
        const allEvents = getAllEventsFromMonthly(monthlyEvents);
        
        setEvents(allEvents);
        setLoading(false);
      } catch (error) {
        console.error('Error loading events:', error);
        // Fallback: intentar cargar el archivo completo
        try {
          const response = await fetch('/events.json');
          const data = await response.json();
          setEvents(data);
          setLoading(false);
        } catch (fallbackError) {
          console.error('Fallback error loading events:', fallbackError);
          setLoading(false);
        }
      }
    }

    loadEvents();
  }, []);

  // Aplicar filtros cuando cambien los eventos o la query
  useEffect(() => {
    const filtered = applyFilters(events, query);
    setFilteredEvents(filtered);
  }, [events, query]);

  const handleQueryChange = (newQuery: Partial<Query>) => {
    setQuery(prev => ({ ...prev, ...newQuery }));
  };

  const clearFilters = () => {
    setQuery({});
  };

  const getICSUrl = () => {
    const params = new URLSearchParams();
    if (query.country) params.set('country', query.country);
    if (query.city) params.set('city', query.city);
    if (query.format) params.set('format', query.format);
    if (query.track) params.set('track', query.track.join(','));
    if (query.from) params.set('from', query.from);
    if (query.to) params.set('to', query.to);
    if (query.onlyOpenCFP) params.set('onlyOpenCFP', 'true');
    
    return `/api/ics?${params.toString()}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando eventos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">CFP Radar LATAM</h1>
              <p className="mt-1 text-gray-600">Encuentra Call for Papers y eventos tech en Latinoamérica</p>
            </div>
            <div className="flex space-x-3">
              <a
                href={getICSUrl()}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                📅 Exportar Calendario
              </a>
              <a
                href="/sources"
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                📊 Estado Fuentes
              </a>
              <a
                href="https://github.com/franlopezmora/cfp-radar-latam/issues/new?template=suggest-event.yml"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                ➕ Sugerir Evento
              </a>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filtros */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Filtros</h2>
                <button
                  onClick={clearFilters}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Limpiar
                </button>
              </div>

              <div className="space-y-6">
                {/* Búsqueda de texto */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Buscar
                  </label>
                  <input
                    type="text"
                    value={query.q || ''}
                    onChange={(e) => handleQueryChange({ q: e.target.value })}
                    placeholder="Título, descripción..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* País */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    País
                  </label>
                  <select
                    value={query.country || ''}
                    onChange={(e) => handleQueryChange({ country: e.target.value || undefined })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Todos los países</option>
                    {Object.entries(LATAM_COUNTRIES).map(([code, name]) => (
                      <option key={code} value={code}>{name}</option>
                    ))}
                  </select>
                </div>

                {/* Ciudad */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ciudad
                  </label>
                  <select
                    value={query.city || ''}
                    onChange={(e) => handleQueryChange({ city: e.target.value || undefined })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Todas las ciudades</option>
                    {getUniqueCities(events, query.country).map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>

                {/* Formato */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Formato
                  </label>
                  <select
                    value={query.format || ''}
                    onChange={(e) => handleQueryChange({ format: e.target.value as any || undefined })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Todos los formatos</option>
                    <option value="online">Online</option>
                    <option value="in-person">Presencial</option>
                    <option value="hybrid">Híbrido</option>
                  </select>
                </div>

                {/* Tracks */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tracks
                  </label>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {COMMON_TRACKS.map(track => (
                      <label key={track} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={query.track?.includes(track) || false}
                          onChange={(e) => {
                            const currentTracks = query.track || [];
                            const newTracks = e.target.checked
                              ? [...currentTracks, track]
                              : currentTracks.filter(t => t !== track);
                            handleQueryChange({ track: newTracks.length > 0 ? newTracks : undefined });
                          }}
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-700 capitalize">{track}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Solo CFP abiertos */}
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={query.onlyOpenCFP || false}
                      onChange={(e) => handleQueryChange({ onlyOpenCFP: e.target.checked || undefined })}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Solo CFP abiertos</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Lista de eventos */}
          <div className="lg:col-span-3">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Eventos ({filteredEvents.length})
              </h2>
              <p className="text-gray-600">
                {filteredEvents.length === events.length 
                  ? 'Mostrando todos los eventos'
                  : `Filtrados de ${events.length} eventos totales`
                }
              </p>
            </div>

            <div className="space-y-6">
              {filteredEvents.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                  <p className="text-gray-500">No se encontraron eventos con los filtros aplicados.</p>
                </div>
              ) : (
                filteredEvents.map(event => (
                  <EventCard key={event.id} event={event} />
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function EventCard({ event }: { event: EventItem }) {
  const cfpDeadlineDays = event.cfpClosesAt ? getCFPDeadlineDays(event.cfpClosesAt) : null;
  
  return (
    <div className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {event.title}
            </h3>
            
            {event.description && (
              <p className="text-gray-600 mb-4 line-clamp-2">
                {event.description}
              </p>
            )}

            <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-4">
              {event.startsAt && (
                <span>📅 {formatEventDate(event.startsAt)}</span>
              )}
              {event.city && (
                <span>📍 {event.city}{event.country && `, ${LATAM_COUNTRIES[event.country as keyof typeof LATAM_COUNTRIES]}`}</span>
              )}
              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                event.format === 'online' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                event.format === 'in-person' ? 'bg-green-100 text-green-800 border-green-200' :
                'bg-purple-100 text-purple-800 border-purple-200'
              }`}>
                {event.format === 'online' ? '🌐 Online' :
                 event.format === 'in-person' ? '🏢 Presencial' : '🔄 Híbrido'}
              </span>
            </div>

            {event.tracks && event.tracks.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {event.tracks.map(track => (
                  <span
                    key={track}
                    className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                  >
                    {track}
                  </span>
                ))}
              </div>
            )}

            {cfpDeadlineDays !== null && (
              <div className={`mb-4 px-3 py-2 rounded-lg text-sm font-medium ${
                cfpDeadlineDays <= 7 ? 'bg-red-100 text-red-800 border border-red-200' :
                cfpDeadlineDays <= 30 ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                'bg-green-100 text-green-800 border border-green-200'
              }`}>
                {cfpDeadlineDays > 0 
                  ? `🚨 CFP cierra en ${cfpDeadlineDays} días`
                  : cfpDeadlineDays === 0
                  ? '🚨 CFP cierra HOY'
                  : '❌ CFP cerrado'
                }
              </div>
            )}
          </div>

          <div className="flex flex-col space-y-2 ml-4">
            <a
              href={event.url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              Ver Evento
            </a>
            {event.cfpUrl && (
              <a
                href={event.cfpUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
              >
                Aplicar CFP
              </a>
            )}
            <a
              href={`/api/ics?id=${event.id}`}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors text-sm"
            >
              📅 Agregar
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
