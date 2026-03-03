# 📊 Sistema de Analytics - GadgetsUAE

## 🎯 Descripción

Sistema completo de analytics para rastrear el comportamiento de los usuarios, búsquedas, productos más populares y más. Todo se guarda localmente en el navegador y puedes acceder a un panel privado con contraseña.

## ✨ Características

### 📈 Tracking Automático
- **Page Views**: Cada visita a la página
- **Búsquedas**: Tanto búsquedas internas como términos de búsqueda desde Google/Bing
- **Clics en Productos**: Qué productos son más populares
- **Favoritos**: Qué productos se agregan/quitan de favoritos
- **Referrers**: De dónde viene el tráfico (Google, Bing, etc.)

### 🔒 Panel de Control Privado
- Acceso protegido con contraseña
- Dashboard visual con estadísticas
- Exportación de datos en JSON y CSV
- Actualización en tiempo real

## 🚀 Cómo Usar

### 1. El sistema ya está activo
El script `analytics.js` se carga automáticamente en todas las páginas y empieza a trackear eventos.

### 2. Acceder al Dashboard

1. Abre `analytics-dashboard.html` en tu navegador
2. Ingresa la contraseña: `gadgetsUAE2025`
3. Verás todas las estadísticas

**⚠️ IMPORTANTE**: Cambia la contraseña en `analytics-dashboard.html` (línea 237):
```javascript
const DASHBOARD_PASSWORD = 'tu-contraseña-segura';
```

### 3. Exportar Datos

En el dashboard puedes:
- **Exportar JSON**: Descarga todos los datos en formato JSON
- **Exportar CSV**: Descarga un reporte en CSV para Excel/Google Sheets
- **Refresh**: Actualiza los datos sin recargar la página

## 📊 Qué se Trackea

### Búsquedas
- Términos de búsqueda internos (cuando el usuario busca en tu sitio)
- Términos de búsqueda desde Google/Bing/Yahoo (extraídos del referrer)
- Top 20 búsquedas más populares

### Productos
- Clics en cada producto
- Productos más populares
- Estadísticas por período (24h, 7d, 30d)

### Tráfico
- Páginas más visitadas
- Referrers (de dónde viene el tráfico)
- Timeline de actividad

## 🔧 Personalización

### Cambiar la Contraseña del Dashboard

Edita `analytics-dashboard.html`:
```javascript
const DASHBOARD_PASSWORD = 'tu-nueva-contraseña';
```

### Agregar Más Eventos

En `analytics.js`, puedes agregar más tracking:

```javascript
// Ejemplo: Trackear scroll
window.addEventListener('scroll', () => {
    if (window.scrollY > 1000) {
        window.analytics.addEvent({
            type: 'scroll',
            depth: window.scrollY,
            timestamp: new Date().toISOString()
        });
    }
});
```

### Enviar Datos a un Servidor

En `analytics.js`, descomenta y configura el método `flushEvents()`:

```javascript
flushEvents() {
    // Enviar a tu servidor
    fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(this.events)
    });
}
```

## 📁 Archivos

- `assets/js/analytics.js` - Sistema de tracking principal
- `analytics-dashboard.html` - Panel de control privado
- `ANALYTICS_README.md` - Esta documentación

## 🔍 Ejemplos de Uso

### Ver Analytics desde la Consola

```javascript
// Ver todos los eventos
console.log(window.analytics.events);

// Ver estadísticas
console.log(window.analytics.getAnalytics());

// Ver top búsquedas
const analytics = window.analytics.getAnalytics();
console.log(analytics.searches.topQueries);

// Ver productos más populares
console.log(analytics.productClicks.topProducts);
```

### Limpiar Datos

```javascript
// Limpiar todos los datos de analytics
window.analytics.clearAnalytics();
```

## 🎯 Mejores Prácticas

1. **Privacidad**: Los datos se guardan solo en localStorage del navegador
2. **Límites**: El sistema limita a 1000 eventos para evitar problemas de almacenamiento
3. **Exportación Regular**: Exporta los datos periódicamente para tener backups
4. **Análisis**: Usa los datos para:
   - Identificar productos populares
   - Optimizar contenido basado en búsquedas
   - Mejorar SEO con términos de búsqueda reales

## 🔐 Seguridad

- El dashboard está protegido con contraseña
- Los datos se guardan solo localmente (no se envían a servidores externos)
- Puedes cambiar la contraseña fácilmente

## 📈 Integración con Google Analytics (Opcional)

Si quieres también usar Google Analytics 4, agrega esto al `<head>` de `index.html`:

```html
<!-- Google Analytics 4 -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

Y en `analytics.js`, agrega eventos a GA4:

```javascript
trackProductClick(data) {
    // ... código existente ...
    
    // Enviar a Google Analytics
    if (typeof gtag !== 'undefined') {
        gtag('event', 'product_click', {
            'product_id': data.productId,
            'product_name': data.productTitle
        });
    }
}
```

## 🆘 Troubleshooting

**No veo datos en el dashboard:**
- Asegúrate de haber visitado la página principal primero para que se inicialice el tracking
- Verifica que `analytics.js` se esté cargando (consola del navegador)

**El dashboard no carga:**
- Verifica que la contraseña sea correcta
- Revisa la consola del navegador para errores

**Los datos no se guardan:**
- Verifica que localStorage esté habilitado en tu navegador
- Algunos navegadores en modo incógnito bloquean localStorage

## 📝 Notas

- Los datos se guardan en `localStorage` del navegador
- Cada usuario tiene sus propios datos (no se comparten entre navegadores)
- Para ver datos agregados de todos los usuarios, necesitarías un backend





