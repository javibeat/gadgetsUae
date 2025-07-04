// Price Updater - Actualización automática de precios de Amazon
// Usando web scraping a través de proxy backend
class PriceUpdater {
    constructor() {
        this.updateInterval = 12 * 60 * 60 * 1000; // 12 horas
        this.products = [];
        this.isUpdating = false;
        this.init();
    }

    async init() {
        if (window.products) {
            this.products = window.products;
            await this.loadCachedPrices();
            this.startAutoUpdate();
        }
    }

    async loadCachedPrices() {
        const cached = this.loadPricesFromStorage();
        if (Object.keys(cached).length > 0) {
            console.log('📦 Cargando precios en caché...');
            for (const [productId, data] of Object.entries(cached)) {
                this.updateProductDisplay(productId, data);
            }
        }
    }

    async updateAllPrices() {
        if (this.isUpdating) {
            console.log('⏳ Actualización ya en progreso...');
            return;
        }

        this.isUpdating = true;
        console.log('🔄 Actualizando precios...');
        
        for (const product of this.products) {
            try {
                const amazonUrl = product.url;
                const priceData = await this.scrapeAmazonPrice(amazonUrl);
                
                if (priceData) {
                    await this.updateProductPrice(product.id, priceData);
                    // Pausa entre requests para evitar bloqueos
                    await this.delay(2000);
                }
            } catch (error) {
                console.error(`Error actualizando precio para ${product.id}:`, error);
            }
        }
        
        this.isUpdating = false;
        console.log('✅ Actualización completada');
    }

    async scrapeAmazonPrice(url) {
        const proxyServices = [
            {
                name: 'AllOrigins',
                url: `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,
                parser: (data) => data.contents
            },
            {
                name: 'CORS Anywhere',
                url: `https://cors-anywhere.herokuapp.com/${url}`,
                parser: (data) => data
            },
            {
                name: 'JSONP',
                url: `https://jsonp.afeld.me/?url=${encodeURIComponent(url)}`,
                parser: (data) => data
            }
        ];

        for (const service of proxyServices) {
            try {
                console.log(`🔄 Intentando con ${service.name}...`);
                
                const response = await fetch(service.url, {
                    method: 'GET',
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                    }
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                const html = service.parser(data);
                
                if (html) {
                    const priceData = this.parseAmazonPrice(html);
                    if (priceData) {
                        console.log(`✅ Precio obtenido con ${service.name}`);
                        return priceData;
                    }
                }
                
            } catch (error) {
                console.error(`❌ Error con ${service.name}:`, error.message);
                continue;
            }
        }
        
        console.error('❌ Todos los servicios de proxy fallaron');
        return null;
    }

    parseAmazonPrice(html) {
        try {
            // Crear un DOM parser temporal
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            
            // Buscar precio en diferentes selectores de Amazon
            const priceSelectors = [
                '.a-price-whole',
                '.a-price .a-offscreen',
                '#priceblock_ourprice',
                '#priceblock_dealprice',
                '.a-price-range .a-offscreen',
                '[data-a-color="price"] .a-offscreen'
            ];
            
            let priceText = null;
            for (const selector of priceSelectors) {
                const element = doc.querySelector(selector);
                if (element) {
                    priceText = element.textContent.trim();
                    break;
                }
            }
            
            if (priceText) {
                // Extraer solo números y decimales
                const priceMatch = priceText.match(/[\d,]+\.?\d*/);
                if (priceMatch) {
                    const price = parseFloat(priceMatch[0].replace(/,/g, ''));
                    return {
                        current: price.toFixed(2),
                        original: null,
                        discount: null
                    };
                }
            }
            
            return null;
        } catch (error) {
            console.error('Error parsing price:', error);
            return null;
        }
    }

    async updateProductPrice(productId, priceData) {
        this.updateProductDisplay(productId, priceData);
        this.savePriceToStorage(productId, priceData);
        console.log(`✅ Precio actualizado para ${productId}: AED ${priceData.current}`);
    }

    updateProductDisplay(productId, priceData) {
        // Buscar elementos por ID del producto o por contenido
        const productCard = this.findProductCard(productId);
        if (!productCard) return;

        const priceElements = productCard.querySelectorAll('.current-price');
        const originalElements = productCard.querySelectorAll('.original-price');
        const discountElements = productCard.querySelectorAll('.discount');
        
        priceElements.forEach(el => {
            el.textContent = `AED ${priceData.current}`;
            el.style.animation = 'priceUpdate 0.5s ease-in-out';
        });
        
        if (priceData.original && originalElements.length > 0) {
            originalElements.forEach(el => {
                el.textContent = `AED ${priceData.original}`;
            });
        }
        
        if (priceData.discount && discountElements.length > 0) {
            discountElements.forEach(el => {
                el.textContent = priceData.discount;
            });
        }
    }

    findProductCard(productId) {
        // Buscar por data-product-id primero
        let card = document.querySelector(`[data-product-id="${productId}"]`);
        if (card) return card;
        
        // Buscar por contenido del título
        const titles = document.querySelectorAll('h3');
        for (const title of titles) {
            const product = this.products.find(p => p.id === productId);
            if (product && title.textContent.includes(product.title.substring(0, 20))) {
                return title.closest('.product-card');
            }
        }
        
        return null;
    }

    savePriceToStorage(productId, priceData) {
        const stored = JSON.parse(localStorage.getItem('productPrices') || '{}');
        stored[productId] = {
            ...priceData,
            lastUpdate: new Date().toISOString()
        };
        localStorage.setItem('productPrices', JSON.stringify(stored));
    }

    loadPricesFromStorage() {
        const stored = JSON.parse(localStorage.getItem('productPrices') || '{}');
        return stored;
    }

    startAutoUpdate() {
        setInterval(() => {
            this.updateAllPrices();
        }, this.updateInterval);
    }

    async manualUpdate() {
        await this.updateAllPrices();
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.priceUpdater = new PriceUpdater();
});

// Añadir estilos CSS para la animación de actualización
const style = document.createElement('style');
style.textContent = `
    @keyframes priceUpdate {
        0% { transform: scale(1); }
        50% { transform: scale(1.1); background-color: #fef3c7; }
        100% { transform: scale(1); }
    }
    
    .price-update-indicator {
        position: absolute;
        top: -5px;
        right: -5px;
        background: #10b981;
        color: white;
        border-radius: 50%;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        animation: pulse 2s infinite;
    }
    
    @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.2); }
        100% { transform: scale(1); }
    }
    
    .update-status {
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: #1f2937;
        color: white;
        padding: 10px 15px;
        border-radius: 8px;
        font-size: 14px;
        z-index: 1000;
        opacity: 0;
        transform: translateY(20px);
        transition: all 0.3s ease;
    }
    
    .update-status.show {
        opacity: 1;
        transform: translateY(0);
    }
`;
document.head.appendChild(style);

// Función para mostrar estado de actualización
function showUpdateStatus(message, duration = 3000) {
    let statusEl = document.getElementById('update-status');
    if (!statusEl) {
        statusEl = document.createElement('div');
        statusEl.id = 'update-status';
        statusEl.className = 'update-status';
        document.body.appendChild(statusEl);
    }
    
    statusEl.textContent = message;
    statusEl.classList.add('show');
    
    setTimeout(() => {
        statusEl.classList.remove('show');
    }, duration);
} 