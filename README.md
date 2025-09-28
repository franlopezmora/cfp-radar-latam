# CFP Radar LATAM

Radar de Call for Papers y eventos tech en Latinoamérica. Encuentra oportunidades para presentar en conferencias, meetups y eventos de tecnología en la región.

## 🚀 Características

- **Recolección automática**: GitHub Actions recolecta eventos diariamente de múltiples fuentes
- **Filtros avanzados**: Por país, ciudad, formato, tracks, fechas y CFP abiertos
- **Exportación ICS**: Agrega eventos a tu calendario favorito
- **Sin backend**: Sitio estático desplegado en Vercel
- **Costo $0**: Usa servicios gratuitos de GitHub y Vercel

## 🛠️ Tecnologías

- **Frontend**: Next.js 14 con App Router
- **Estilos**: Tailwind CSS
- **Validación**: Zod
- **Recolección**: Node.js scripts
- **Deploy**: Vercel
- **CI/CD**: GitHub Actions

## 📁 Estructura del Proyecto

```
cfp-radar-latam/
├── apps/web/                 # Aplicación Next.js
│   ├── app/                  # App Router
│   │   ├── page.tsx         # Página principal
│   │   ├── event/[id]/      # Detalle de evento
│   │   └── api/ics/         # API para exportar ICS
│   ├── lib/                  # Utilidades
│   │   ├── types.ts         # Tipos y esquemas Zod
│   │   ├── filters.ts       # Lógica de filtros
│   │   └── ics.ts          # Generación de calendarios
│   └── data/                # Datos estáticos
│       └── events.json     # Eventos procesados
├── scripts/                 # Scripts de recolección
│   ├── sources.ts          # Catálogo de fuentes
│   ├── collect.ts         # Recolección de datos
│   ├── normalize.ts       # Normalización
│   ├── dedupe.ts          # Deduplicación
│   └── validate.ts        # Validación
├── data/                   # Datos crudos y procesados
│   ├── raw/               # Snapshots por fuente
│   └── events.json         # Resultado final
└── .github/workflows/     # GitHub Actions
    └── collect.yml        # Recolección automática
```

## 🔧 Desarrollo Local

### Prerrequisitos

- Node.js 20+
- npm

### Instalación

```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/cfp-radar-latam.git
cd cfp-radar-latam

# Instalar dependencias
npm install

# Ejecutar recolección de datos
npm run pipeline

# Iniciar servidor de desarrollo
npm run dev
```

### Scripts Disponibles

```bash
# Desarrollo
npm run dev              # Servidor de desarrollo
npm run build           # Build de producción
npm run start           # Servidor de producción

# Recolección de datos
npm run collect         # Recolectar datos crudos
npm run normalize       # Normalizar eventos
npm run dedupe          # Eliminar duplicados
npm run validate        # Validar esquemas
npm run pipeline        # Ejecutar todo el pipeline

# Utilidades
npm run lint            # Linter
npm run type-check      # Verificación de tipos
```

## 📊 Fuentes de Datos

El sistema recolecta eventos de múltiples fuentes:

### Meetup Groups (ICS)
- GDG Buenos Aires, Santiago, México City, Bogotá
- OWASP Chapters
- AWS User Groups
- Python Communities
- React Communities

### Conferencias (ICS/RSS)
- Nerdearla
- The Developer's Conference
- PyCon LatAm
- JSConf eventos

### Blogs y RSS
- Comunidades tech locales
- Portales de eventos

## 🔄 Pipeline de Datos

1. **Recolección**: Descarga datos de todas las fuentes habilitadas
2. **Normalización**: Convierte a esquema unificado `EventItem`
3. **Deduplicación**: Elimina eventos duplicados usando heurísticas
4. **Validación**: Verifica con esquemas Zod
5. **Deploy**: Copia datos a la aplicación web

## 🚀 Deploy

### Vercel (Recomendado)

1. Conecta tu repositorio a Vercel
2. Configura build settings:
   - Build Command: `npm run build`
   - Output Directory: `apps/web/out`
3. Deploy automático en cada push a `main`

### GitHub Pages

```bash
npm run build
# Subir contenido de apps/web/out a GitHub Pages
```

## 🤝 Contribuir

### Agregar Nueva Fuente

1. Edita `scripts/sources.ts`
2. Agrega la nueva fuente al array `SOURCES`
3. Ejecuta `npm run pipeline` para probar
4. Crea un Pull Request

### Reportar Problemas

Usa GitHub Issues para reportar bugs o sugerir mejoras.

### Sugerir Eventos

Usa el botón "Sugerir Evento" en el sitio web que abre un Issue pre-rellenado.

## 📝 Esquema de Evento

```typescript
interface EventItem {
  id: string;                    // Hash único
  title: string;                 // Título del evento
  description?: string;          // Descripción
  url: string;                   // URL oficial
  cfpUrl?: string;               // URL del CFP
  startsAt?: string;            // Fecha de inicio (ISO)
  endsAt?: string;              // Fecha de fin (ISO)
  cfpOpensAt?: string;           // Apertura CFP (ISO)
  cfpClosesAt?: string;         // Cierre CFP (ISO)
  timezone?: string;             // Zona horaria
  country?: string;              // País (ISO-2)
  city?: string;                 // Ciudad
  venue?: string;                // Lugar específico
  format: 'in-person' | 'online' | 'hybrid';
  tracks: string[];             // Tracks tech
  languages?: string[];         // Idiomas
  price?: 'free' | 'paid' | 'donation';
  source: {
    id: string;                  // ID de la fuente
    fetchedAt: string;          // Cuándo se recolectó
    rawId?: string;             // ID original
  };
  tags?: string[];              // Tags adicionales
  lastSeenAt: string;           // Última vez visto
}
```

## 📄 Licencia

MIT License - ver [LICENSE](LICENSE) para detalles.

## 🙏 Agradecimientos

- Comunidades tech de LATAM por organizar eventos increíbles
- GitHub por Actions gratuitas
- Vercel por hosting gratuito
- Todas las fuentes de datos que hacen posible este proyecto
