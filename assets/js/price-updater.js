// Price Updater - Sistema manual de actualización de precios
// Lee precios desde un archivo JSON local para mayor confiabilidad
class PriceUpdater {
    constructor() {
        this.updateInterval = 60 * 60 * 1000; // 1 hora
        this.products = [];
        this.isUpdating = false;
        this.init();
    }

    async init() {
        if (window.products) {
            this.products = window.products;
            await this.loadCachedPrices();
            await this.loadPricesFromFile();
            this.startAutoUpdate();
        }
    }

    async loadPricesFromFile() {
        try {
            console.log('📦 Loading prices from file...');
            const response = await fetch('assets/data/prices.json');
            if (response.ok) {
                const priceData = await response.json();
                for (const [productId, data] of Object.entries(priceData)) {
                    this.updateProductDisplay(productId, data);
                    this.savePriceToStorage(productId, data);
                }
                console.log('✅ Prices loaded from file');
            } else {
                console.log('⚠️ Prices file not found, using local cache');
            }
        } catch (error) {
            console.log('⚠️ Error loading prices from file:', error.message);
        }
    }

    async loadCachedPrices() {
        const cached = this.loadPricesFromStorage();
        if (Object.keys(cached).length > 0) {
            console.log('📦 Loading cached prices...');
            for (const [productId, data] of Object.entries(cached)) {
                this.updateProductDisplay(productId, data);
            }
        }
    }

    async updateAllPrices() {
        if (this.isUpdating) {
            console.log('⏳ Update already in progress...');
            return;
        }

        this.isUpdating = true;
        console.log('🔄 Updating prices...');

        try {
            await this.loadPricesFromFile();
        } catch (error) {
            console.error('Error actualizando precios:', error);
        }

        this.isUpdating = false;
        console.log('✅ Update completed');
    }

    updateProductDisplay(productId, priceData) {
        // Find elements by product ID or content
        const productCard = this.findProductCard(productId);
        if (!productCard) {
            console.log(`⚠️ Card not found for product: ${productId}`);
            return;
        }

        const priceElements = productCard.querySelectorAll('.current-price');
        const originalElements = productCard.querySelectorAll('.original-price');
        const discountElements = productCard.querySelectorAll('.discount');

        if (priceElements.length > 0) {
            priceElements.forEach(el => {
                el.textContent = `AED ${priceData.current}`;
                el.style.animation = 'priceUpdate 0.5s ease-in-out';
            });
            console.log(`✅ Price updated for ${productId}: AED ${priceData.current}`);
        }

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
        // Search by data-id (used by ProductRenderer)
        let card = document.querySelector(`[data-id="${productId}"]`);
        if (card) return card;

        // Search by data-product-id (legacy)
        card = document.querySelector(`[data-product-id="${productId}"]`);
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
            this.loadPricesFromFile();
        }, this.updateInterval);
    }

    async manualUpdate() {
        await this.updateAllPrices();
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