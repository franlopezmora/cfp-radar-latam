'use client';

import { useState, useEffect } from 'react';
import { EventItem, LATAM_COUNTRIES } from '@/lib/types';
import { formatEventDate, formatEventTime, getCFPDeadlineDays } from '@/lib/filters';

interface EventDetailPageProps {
  params: {
    id: string;
  };
}

export default function EventDetailPage({ params }: EventDetailPageProps) {
  const [event, setEvent] = useState<EventItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadEvent() {
      try {
        const response = await fetch('/events.json');
        const events: EventItem[] = await response.json();
        const foundEvent = events.find(e => e.id === params.id);
        
        if (foundEvent) {
          setEvent(foundEvent);
        } else {
          setError('Evento no encontrado');
        }
        setLoading(false);
      } catch (err) {
        setError('Error cargando el evento');
        setLoading(false);
      }
    }

    loadEvent();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando evento...</p>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Evento no encontrado</h1>
          <p className="text-gray-600 mb-6">{error || 'El evento que buscas no existe.'}</p>
          <a
            href="/"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Volver al inicio
          </a>
        </div>
      </div>
    );
  }

  const cfpDeadlineDays = event.cfpClosesAt ? getCFPDeadlineDays(event.cfpClosesAt) : null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <a
              href="/"
              className="text-blue-600 hover:text-blue-700 flex items-center"
            >
              ← Volver al listado
            </a>
            <div className="flex space-x-3">
              <a
                href={`/api/ics?id=${event.id}`}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                📅 Agregar a Calendario
              </a>
              <button
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: event.title,
                      text: event.description,
                      url: window.location.href,
                    });
                  } else {
                    navigator.clipboard.writeText(window.location.href);
                    alert('URL copiada al portapapeles');
                  }
                }}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                📤 Compartir
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {/* Header del evento */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8">
            <h1 className="text-3xl font-bold mb-4">{event.title}</h1>
            
            <div className="flex flex-wrap gap-4 text-blue-100">
              {event.startsAt && (
                <span className="flex items-center">
                  📅 {formatEventDate(event.startsAt)}
                  {event.startsAt && (
                    <span className="ml-2">a las {formatEventTime(event.startsAt)}</span>
                  )}
                </span>
              )}
              {event.city && (
                <span className="flex items-center">
                  📍 {event.city}
                  {event.country && (
                    <span>, {LATAM_COUNTRIES[event.country as keyof typeof LATAM_COUNTRIES]}</span>
                  )}
                </span>
              )}
              <span className={`px-3 py-1 rounded-full text-sm ${
                event.format === 'online' ? 'bg-blue-500' :
                event.format === 'in-person' ? 'bg-green-500' :
                'bg-purple-500'
              }`}>
                {event.format === 'online' ? '🌐 Online' :
                 event.format === 'in-person' ? '🏢 Presencial' : '🔄 Híbrido'}
              </span>
            </div>
          </div>

          {/* Contenido principal */}
          <div className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Información principal */}
              <div className="lg:col-span-2">
                {event.description && (
                  <div className="mb-8">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Descripción</h2>
                    <div className="prose max-w-none text-gray-700">
                      <p>{event.description}</p>
                    </div>
                  </div>
                )}

                {/* Detalles del evento */}
                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Detalles del Evento</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {event.startsAt && (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-medium text-gray-900 mb-1">Fecha de inicio</h3>
                        <p className="text-gray-600">{formatEventDate(event.startsAt)}</p>
                        {event.startsAt && (
                          <p className="text-sm text-gray-500">{formatEventTime(event.startsAt)}</p>
                        )}
                      </div>
                    )}
                    
                    {event.endsAt && (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-medium text-gray-900 mb-1">Fecha de fin</h3>
                        <p className="text-gray-600">{formatEventDate(event.endsAt)}</p>
                        {event.endsAt && (
                          <p className="text-sm text-gray-500">{formatEventTime(event.endsAt)}</p>
                        )}
                      </div>
                    )}

                    {event.venue && (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-medium text-gray-900 mb-1">Lugar</h3>
                        <p className="text-gray-600">{event.venue}</p>
                      </div>
                    )}

                    {event.timezone && (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-medium text-gray-900 mb-1">Zona horaria</h3>
                        <p className="text-gray-600">{event.timezone}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Tracks */}
                {event.tracks && event.tracks.length > 0 && (
                  <div className="mb-8">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Tracks</h2>
                    <div className="flex flex-wrap gap-2">
                      {event.tracks.map(track => (
                        <span
                          key={track}
                          className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                        >
                          {track}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Lenguajes */}
                {event.languages && event.languages.length > 0 && (
                  <div className="mb-8">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Idiomas</h2>
                    <div className="flex flex-wrap gap-2">
                      {event.languages.map(lang => (
                        <span
                          key={lang}
                          className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full"
                        >
                          {lang.toUpperCase()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1">
                <div className="sticky top-8 space-y-6">
                  {/* CFP Status */}
                  {event.cfpUrl && (
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Call for Papers</h3>
                      
                      {cfpDeadlineDays !== null && (
                        <div className={`mb-4 p-3 rounded-lg text-sm ${
                          cfpDeadlineDays <= 7 ? 'bg-red-100 text-red-800' :
                          cfpDeadlineDays <= 30 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {cfpDeadlineDays > 0 
                            ? `CFP cierra en ${cfpDeadlineDays} días`
                            : cfpDeadlineDays === 0
                            ? 'CFP cierra hoy'
                            : 'CFP cerrado'
                          }
                        </div>
                      )}

                      {event.cfpOpensAt && (
                        <p className="text-sm text-gray-600 mb-2">
                          <strong>Apertura:</strong> {formatEventDate(event.cfpOpensAt)}
                        </p>
                      )}
                      
                      {event.cfpClosesAt && (
                        <p className="text-sm text-gray-600 mb-4">
                          <strong>Cierre:</strong> {formatEventDate(event.cfpClosesAt)}
                        </p>
                      )}

                      <a
                        href={event.cfpUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition-colors text-center block"
                      >
                        Aplicar al CFP
                      </a>
                    </div>
                  )}

                  {/* Acciones */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Acciones</h3>
                    <div className="space-y-3">
                      <a
                        href={event.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors text-center block"
                      >
                        Ver Sitio Oficial
                      </a>
                      
                      <a
                        href={`/api/ics?id=${event.id}`}
                        className="w-full bg-gray-600 text-white px-4 py-3 rounded-lg hover:bg-gray-700 transition-colors text-center block"
                      >
                        📅 Agregar a Calendario
                      </a>
                    </div>
                  </div>

                  {/* Información de la fuente */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Fuente</h3>
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>ID:</strong> {event.source.id}
                    </p>
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>Última actualización:</strong> {formatEventDate(event.source.fetchedAt)}
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Visto por última vez:</strong> {formatEventDate(event.lastSeenAt)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
