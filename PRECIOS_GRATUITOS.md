# 🆓 Actualización Gratuita de Precios de Amazon

## 🎯 Solución Implementada

He creado un sistema que usa **web scraping gratuito** para obtener precios de Amazon sin necesidad de APIs pagas.

## ✅ Características

- **🆓 Completamente gratuito**
- **🔄 Actualización automática cada 12 horas**
- **📱 Funciona en móviles y desktop**
- **💾 Cache local** para evitar requests innecesarios
- **🎨 Animaciones visuales** cuando se actualizan precios
- **📊 Logs detallados** en consola

## 🚀 Cómo Funciona

### 1. **Web Scraping Inteligente**
- Usa servicios de proxy gratuitos para evitar CORS
- Parse automático de precios de Amazon
- Múltiples selectores para mayor compatibilidad

### 2. **Servicios de Proxy Gratuitos**
- **AllOrigins.win** (implementado)
- **CORS Anywhere** (alternativa)
- **ProxyCrawl** (plan gratuito limitado)

### 3. **Cache Inteligente**
- Guarda precios en localStorage
- Evita requests innecesarios
- Persiste entre sesiones

## 🔧 Configuración

### Paso 1: Verificar que funciona
1. Abre las herramientas de desarrollador (F12)
2. Ve a la pestaña Console
3. Deberías ver: "📦 Cargando precios en caché..."

### Paso 2: Actualización manual
En la consola del navegador:
```javascript
window.priceUpdater.manualUpdate();
```

### Paso 3: Ver logs
Los logs mostrarán:
- ✅ Precios actualizados exitosamente
- ❌ Errores de actualización
- 🔄 Proceso de actualización

## 🛠️ Alternativas Gratuitas

### 1. **CamelCamelCamel (Recomendado)**
```javascript
// URL: https://camelcamelcamel.com/product/[ASIN]
const camelUrl = `https://camelcamelcamel.com/product/${asin}`;
```

### 2. **Amazon Price Tracker APIs**
- **PriceAPI.com** - 100 requests/mes gratis
- **ScrapingBee** - 100 requests/mes gratis
- **ProxyCrawl** - 1000 requests/mes gratis

### 3. **Servicios de Proxy**
- **AllOrigins.win** (actual)
- **CORS Anywhere**
- **JSONP.afeld.me**

## 📊 Monitoreo

### Ver precios guardados
```javascript
console.log(JSON.parse(localStorage.getItem('productPrices')));
```

### Verificar estado
```javascript
console.log('Actualizador activo:', !!window.priceUpdater);
```

## 🎨 Personalización

### Cambiar intervalo de actualización
En `assets/js/price-updater.js`:
```javascript
this.updateInterval = 6 * 60 * 60 * 1000; // 6 horas
```

### Añadir más productos
En `assets/js/products.js`:
```javascript
{
    id: 'nuevo-producto',
    title: 'Nombre del Producto',
    url: 'https://amzn.to/TU_LINK',
    // ... otros campos
}
```

## 🚨 Limitaciones

### Servicios de Proxy
- **AllOrigins.win**: 1000 requests/día
- **CORS Anywhere**: Limitado
- **Rate limiting**: Pausa de 2 segundos entre requests

### Web Scraping
- Amazon puede cambiar su estructura HTML
- Algunos productos pueden no tener precio visible
- Bloqueos temporales posibles

## 🔄 Actualización Manual

### Botón en la página
Añade este HTML donde quieras:
```html
<button onclick="window.priceUpdater.manualUpdate()" class="update-btn">
    🔄 Actualizar Precios
</button>
```

### Estilos CSS
```css
.update-btn {
    background: #2563eb;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 8px;
    cursor: pointer;
    font-weight: bold;
}

.update-btn:hover {
    background: #1d4ed8;
}
```

## 📈 Optimización

### Reducir requests
- Aumentar intervalo de actualización
- Actualizar solo productos populares
- Usar cache más agresivo

### Mejorar precisión
- Múltiples selectores de precio
- Validación de datos
- Retry automático en fallos

## 🛡️ Seguridad

### Protección contra bloqueos
- User-Agent rotativo
- Pausas entre requests
- Manejo de errores robusto

### Datos sensibles
- No se envían datos personales
- Solo URLs públicas de Amazon
- Cache local seguro

## 📞 Soporte

### Problemas comunes
1. **No se actualizan precios**
   - Verifica conexión a internet
   - Revisa logs en consola
   - Intenta actualización manual

2. **Errores de CORS**
   - El proxy puede estar caído
   - Cambia a otro servicio de proxy
   - Espera unos minutos

3. **Precios incorrectos**
   - Amazon cambió su estructura
   - Producto no disponible
   - Selector necesita actualización

### Debug
```javascript
// Ver estado completo
console.log(window.priceUpdater);

// Ver productos cargados
console.log(window.products);

// Ver cache
console.log(localStorage.getItem('productPrices'));
```

---

**¡Esta solución es completamente gratuita y no requiere registro en ningún servicio!** 