# Contributing to CFP Radar LATAM

¡Gracias por tu interés en contribuir a CFP Radar LATAM! Este documento te guiará a través del proceso de contribución.

## 🚀 Formas de Contribuir

### 1. Sugerir Eventos
- Usa el botón "Sugerir Evento" en el sitio web
- Completa el formulario con la información del evento
- Incluye URLs de fuentes automáticas cuando sea posible

### 2. Agregar Nuevas Fuentes de Datos
- Edita `scripts/sources.ts`
- Agrega la nueva fuente al array `SOURCES`
- Ejecuta `npm run pipeline` para probar
- Crea un Pull Request

### 3. Mejorar el Código
- Reporta bugs en GitHub Issues
- Propón mejoras en la UI/UX
- Optimiza el rendimiento
- Mejora la documentación

### 4. Traducir Contenido
- Ayuda con traducciones al portugués
- Mejora textos en español
- Sugiere mejoras en la UX

## 🛠️ Configuración del Entorno de Desarrollo

### Prerrequisitos
- Node.js 20+
- npm
- Git

### Pasos de Instalación

```bash
# 1. Fork y clonar el repositorio
git clone https://github.com/tu-usuario/cfp-radar-latam.git
cd cfp-radar-latam

# 2. Instalar dependencias
npm install

# 3. Ejecutar recolección de datos
npm run pipeline

# 4. Iniciar servidor de desarrollo
npm run dev
```

### Scripts Disponibles

```bash
# Desarrollo
npm run dev              # Servidor de desarrollo (puerto 3000)
npm run build           # Build de producción
npm run start           # Servidor de producción

# Recolección de datos
npm run collect         # Recolectar datos crudos
npm run normalize       # Normalizar eventos
npm run dedupe          # Eliminar duplicados
npm run validate        # Validar esquemas
npm run pipeline        # Ejecutar todo el pipeline

# Calidad de código
npm run lint            # Linter ESLint
npm run type-check      # Verificación de tipos TypeScript
```

## 📊 Agregar Nueva Fuente de Datos

### 1. Identificar el Tipo de Fuente

**ICS (iCalendar)**
- Google Calendar público
- Meetup groups (ej: `https://meetup.com/grupo/events/ical/`)
- Sitios de conferencias con calendario público

**RSS/Atom**
- Blogs de comunidades
- Sitios de eventos con feeds RSS

**JSON**
- APIs públicas de eventos
- Portales con endpoints JSON

**HTML**
- Sitios web con información estructurada
- Solo para casos donde no hay alternativa

### 2. Agregar a sources.ts

```typescript
{
  id: 'identificador-unico',
  name: 'Nombre Legible',
  type: 'ics' | 'rss' | 'atom' | 'json' | 'html' | 'meetup',
  url: 'https://url-de-la-fuente',
  country: 'AR', // ISO-2 code opcional
  city: 'Buenos Aires', // opcional
  enabled: true,
}
```

### 3. Probar la Fuente

```bash
# Ejecutar solo la recolección
npm run collect

# Verificar datos crudos en data/raw/
# Ejecutar normalización
npm run normalize

# Verificar eventos normalizados en data/normalized-events.json
```

### 4. Crear Pull Request

- Incluye descripción de la nueva fuente
- Muestra ejemplos de eventos recolectados
- Confirma que los datos se normalizan correctamente

## 🐛 Reportar Problemas

### Antes de Reportar

1. Verifica que el problema no esté ya reportado
2. Prueba con la última versión
3. Revisa la documentación

### Información a Incluir

**Para Bugs:**
- Descripción clara del problema
- Pasos para reproducir
- Comportamiento esperado vs actual
- Screenshots si aplica
- Información del entorno (navegador, OS)

**Para Mejoras:**
- Descripción de la funcionalidad deseada
- Casos de uso específicos
- Beneficios para la comunidad

## 🔄 Proceso de Pull Request

### 1. Preparar el PR

```bash
# Crear rama para la feature
git checkout -b feature/nueva-fuente-ejemplo

# Hacer cambios
# ... editar archivos ...

# Commit con mensaje descriptivo
git commit -m "feat: agregar fuente GDG Lima"

# Push de la rama
git push origin feature/nueva-fuente-ejemplo
```

### 2. Crear Pull Request

- Título descriptivo
- Descripción detallada de los cambios
- Referencia a issues relacionados
- Screenshots si aplica

### 3. Revisión

- Los maintainers revisarán el código
- Se pueden solicitar cambios
- Una vez aprobado, se mergeará

## 📝 Convenciones de Código

### TypeScript
- Usar tipos estrictos
- Preferir interfaces sobre types cuando sea apropiado
- Documentar funciones complejas

### React/Next.js
- Usar componentes funcionales
- Preferir hooks sobre class components
- Usar TypeScript para props

### Estilos
- Usar Tailwind CSS
- Mantener consistencia con el diseño existente
- Responsive design

### Commits
- Usar conventional commits
- `feat:` para nuevas funcionalidades
- `fix:` para corrección de bugs
- `docs:` para documentación
- `refactor:` para refactoring
- `test:` para tests

## 🧪 Testing

### Testing Manual
- Probar recolección de datos
- Verificar filtros en la UI
- Probar exportación ICS
- Verificar responsive design

### Testing Automático
- Validación con Zod schemas
- Type checking con TypeScript
- Linting con ESLint

## 📚 Recursos Adicionales

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Zod Documentation](https://zod.dev/)
- [GitHub Actions](https://docs.github.com/en/actions)

## ❓ Preguntas Frecuentes

**Q: ¿Puedo agregar fuentes que requieren autenticación?**
A: No, por ahora solo soportamos fuentes públicas para mantener el costo en $0.

**Q: ¿Cómo sé si mi fuente funcionará?**
A: Ejecuta `npm run collect` y revisa los logs. Si hay errores, verifica la URL y el formato.

**Q: ¿Puedo contribuir con traducciones?**
A: ¡Sí! Ayuda con portugués brasileño y mejoras en español.

**Q: ¿Cómo reporto un evento que ya no existe?**
A: Usa GitHub Issues con la etiqueta "stale-event".

## 📞 Contacto

- GitHub Issues para bugs y sugerencias
- GitHub Discussions para preguntas generales
- Twitter: [@cfpradarlatam](https://twitter.com/cfpradarlatam)

¡Gracias por contribuir a hacer CFP Radar LATAM mejor para toda la comunidad tech! 🚀
