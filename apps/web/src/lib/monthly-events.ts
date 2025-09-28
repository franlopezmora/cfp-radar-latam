import { EventItem } from './types';

export interface MonthlyEvents {
  [key: string]: EventItem[];
}

export async function loadEventsByMonth(): Promise<MonthlyEvents> {
  try {
    // Intentar cargar eventos divididos por mes
    const monthlyEvents: MonthlyEvents = {};
    
    // Cargar eventos del año actual y siguiente
    const currentYear = new Date().getFullYear();
    const nextYear = currentYear + 1;
    
    for (let year = currentYear; year <= nextYear; year++) {
      for (let month = 1; month <= 12; month++) {
        const monthKey = `${year}-${month.toString().padStart(2, '0')}`;
        try {
          // En el cliente, usar fetch en lugar de import dinámico
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
    
    // Si no hay eventos mensuales, cargar el archivo completo como fallback
    if (Object.keys(monthlyEvents).length === 0) {
        try {
          const response = await fetch('/events.json');
          const fallbackEvents = await response.json();
        
        // Dividir eventos por mes
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
      } catch {
        console.error('No se pudieron cargar eventos');
        return {};
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
