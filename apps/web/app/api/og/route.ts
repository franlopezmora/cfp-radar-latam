import { NextRequest } from 'next/server';
import { EventItem } from '@/lib/types';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const eventId = searchParams.get('id');
  
  if (!eventId) {
    return new Response('Missing event ID', { status: 400 });
  }

  try {
    // Cargar eventos
    const events = await import('../../../public/events.json');
    const event = events.default.find((e: any) => e.id === eventId) as EventItem;
    
    if (!event) {
      return new Response('Event not found', { status: 404 });
    }

    // Generar imagen OG dinámica usando Canvas API
    const canvas = new OffscreenCanvas(1200, 630);
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      return new Response('Canvas error', { status: 500 });
    }

    // Fondo degradado
    const gradient = ctx.createLinearGradient(0, 0, 1200, 630);
    gradient.addColorStop(0, '#1e40af');
    gradient.addColorStop(1, '#7c3aed');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1200, 630);

    // Título del evento
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 48px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    
    // Dividir título en líneas si es muy largo
    const words = event.title.split(' ');
    const lines = [];
    let currentLine = '';
    
    for (const word of words) {
      const testLine = currentLine + (currentLine ? ' ' : '') + word;
      const metrics = ctx.measureText(testLine);
      
      if (metrics.width > 1000) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    lines.push(currentLine);
    
    // Dibujar líneas del título
    const startY = 150;
    lines.forEach((line, index) => {
      ctx.fillText(line, 600, startY + (index * 60));
    });

    // Información del evento
    ctx.font = '24px Inter, sans-serif';
    ctx.fillStyle = '#e5e7eb';
    
    const eventInfo = [];
    if (event.startsAt) {
      eventInfo.push(`📅 ${formatEventDate(event.startsAt)}`);
    }
    if (event.city) {
      eventInfo.push(`📍 ${event.city}`);
    }
    if (event.format) {
      const formatText = event.format === 'online' ? '🌐 Online' : 
                        event.format === 'in-person' ? '🏢 Presencial' : '🔄 Híbrido';
      eventInfo.push(formatText);
    }
    
    eventInfo.forEach((info, index) => {
      ctx.fillText(info, 600, 350 + (index * 40));
    });

    // Footer
    ctx.font = '20px Inter, sans-serif';
    ctx.fillStyle = '#9ca3af';
    ctx.fillText('CFP Radar LATAM', 600, 550);

    // Convertir canvas a imagen
    const imageData = await canvas.convertToBlob({ type: 'image/png' });
    const arrayBuffer = await imageData.arrayBuffer();
    
    return new Response(arrayBuffer, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=3600',
      },
    });

  } catch (error) {
    console.error('Error generating OG image:', error);
    return new Response('Error generating image', { status: 500 });
  }
}

function formatEventDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}
