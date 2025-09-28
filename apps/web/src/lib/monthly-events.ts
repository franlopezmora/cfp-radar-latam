import { EventItem } from './types';

export interface MonthlyEvents {
  [key: string]: EventItem[];
}

export async function loadEventsByMonth(): Promise<MonthlyEvents> {
  try {
    // Primero intentar cargar el archivo principal como fallback
    try {
      const response = await fetch('/events.json');
      if (response.ok) {
        const fallbackEvents = await response.json();
        
        // Dividir eventos por mes
        const monthlyEvents: MonthlyEvents = {};
        fallbackEvents.forEach((event: EventItem) => {
          if (event.startsAt) {
            const eventDate = new Date(event.startsAt);
            const monthKey = `${eventDate.getFullYear()}-${(eventDate.getMonth() + 1).toString().padStart(2, '0')}`;
            
            if (!monthlyEvents[monthKey]) {
              monthlyEvents[monthKey] = [];
            }
            monthlyEvents[monthKey].push(event);
          }
        });
        
        return monthlyEvents;
      }
    } catch {
      console.error('No se pudo cargar el archivo principal de eventos');
    }
    
    // Si el archivo principal falla, intentar cargar archivos mensuales específicos
    const monthlyEvents: MonthlyEvents = {};
    const currentYear = new Date().getFullYear();
    const nextYear = currentYear + 1;
    
    // Solo intentar cargar meses que sabemos que existen
    const availableMonths = ['05', '06', '07', '08', '10']; // Basado en los archivos que existen
    
    for (let year = currentYear; year <= nextYear; year++) {
      for (const month of availableMonths) {
        const monthKey = `${year}-${month}`;
        try {
          const response = await fetch(`/events-${monthKey}.json`);
          if (response.ok) {
            const monthEvents = await response.json();
            monthlyEvents[monthKey] = monthEvents;
          }
        } catch {
          // Archivo mensual no existe, continuar
        }
      }
    }
    
    return monthlyEvents;
  } catch (error) {
    console.error('Error loading events by month:', error);
    return {};
  }
}

export function getAllEventsFromMonthly(monthlyEvents: MonthlyEvents): EventItem[] {
  const allEvents: EventItem[] = [];
  
  Object.values(monthlyEvents).forEach(monthEvents => {
    allEvents.push(...monthEvents);
  });
  
  return allEvents;
}

export function getEventsForMonth(monthlyEvents: MonthlyEvents, year: number, month: number): EventItem[] {
  const monthKey = `${year}-${month.toString().padStart(2, '0')}`;
  return monthlyEvents[monthKey] || [];
}

export function getEventsForDateRange(monthlyEvents: MonthlyEvents, startDate: Date, endDate: Date): EventItem[] {
  const events: EventItem[] = [];
  
  Object.values(monthlyEvents).forEach(monthEvents => {
    monthEvents.forEach((event: EventItem) => {
      if (event.startsAt) {
        const eventDate = new Date(event.startsAt);
        if (eventDate >= startDate && eventDate <= endDate) {
          events.push(event);
        }
      }
    });
  });
  
  return events;
}
