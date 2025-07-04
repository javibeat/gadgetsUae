// Deals Scraper - Extrae ofertas diarias automáticamente de Amazon UAE
class DealsScraper {
    constructor() {
        this.dealsUrl = 'https://amzn.to/3IunEn2';
        this.maxDeals = 12;
        this.init();
    }

    async init() {
        console.log('🔄 Iniciando scraper de ofertas diarias...');
        await this.scrapeDeals();
        
        // Actualizar cada 6 horas
        setInterval(() => {
            this.scrapeDeals();
        }, 6 * 60 * 60 * 1000);
    }

    async scrapeDeals() {
        try {
            console.log('📊 Extrayendo ofertas diarias de Amazon UAE...');
            
            // Usar proxy para evitar CORS
            const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(this.dealsUrl)}`;
            
            const response = await fetch(proxyUrl);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            const html = data.contents;
            
            const deals = this.parseDeals(html);
            
            if (deals.length > 0) {
                this.updateDailyDeals(deals);
                console.log(`✅ ${deals.length} ofertas extraídas exitosamente`);
            } else {
                console.log('⚠️ No se encontraron ofertas');
            }
            
        } catch (error) {
            console.error('❌ Error scraping deals:', error);
            // Usar ofertas de respaldo si falla el scraping
            this.useFallbackDeals();
        }
    }

    parseDeals(html) {
        const deals = [];
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        // Buscar productos en la página de ofertas
        const productElements = doc.querySelectorAll('[data-component-type="s-search-result"]');
        
        productElements.forEach((element, index) => {
            if (index >= this.maxDeals) return;
            
            try {
                const deal = this.extractDealInfo(element);
                if (deal) {
                    deals.push(deal);
                }
            } catch (error) {
                console.error('Error parsing deal:', error);
            }
        });
        
        return deals;
    }

    extractDealInfo(element) {
        try {
            // Extraer título
            const titleElement = element.querySelector('h2 a span');
            const title = titleElement ? titleElement.textContent.trim() : '';
            
            if (!title) return null;
            
            // Extraer precio actual
            const priceElement = element.querySelector('.a-price-whole, .a-price .a-offscreen');
            const priceText = priceElement ? priceElement.textContent.trim() : '';
            const currentPrice = this.extractPrice(priceText);
            
            // Extraer precio original
            const originalElement = element.querySelector('.a-text-strike, .a-price.a-text-price .a-offscreen');
            const originalText = originalElement ? originalElement.textContent.trim() : '';
            const originalPrice = this.extractPrice(originalText);
            
            // Calcular descuento
            const discount = this.calculateDiscount(currentPrice, originalPrice);
            
            // Extraer imagen
            const imgElement = element.querySelector('img');
            const image = imgElement ? imgElement.src : this.generatePlaceholderImage(title);
            
            // Extraer categoría (aproximada)
            const category = this.guessCategory(title);
            
            // Extraer URL del producto
            const linkElement = element.querySelector('h2 a');
            const productUrl = linkElement ? linkElement.href : this.dealsUrl;
            
            return {
                id: `deal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                title: title.substring(0, 100) + (title.length > 100 ? '...' : ''),
                category: category,
                image: image,
                price: currentPrice ? `AED ${currentPrice}` : 'AED 0.00',
                original: originalPrice ? `AED ${originalPrice}` : null,
                discount: discount ? `-${discount}%` : null,
                url: productUrl,
                badge: 'Limited time deal'
            };
            
        } catch (error) {
            console.error('Error extracting deal info:', error);
            return null;
        }
    }

    extractPrice(priceText) {
        if (!priceText) return null;
        
        // Extraer solo números y decimales
        const match = priceText.match(/[\d,]+\.?\d*/);
        if (match) {
            return parseFloat(match[0].replace(/,/g, '')).toFixed(2);
        }
        return null;
    }

    calculateDiscount(current, original) {
        if (!current || !original) return null;
        
        const currentNum = parseFloat(current);
        const originalNum = parseFloat(original);
        
        if (originalNum > currentNum) {
            return Math.round(((originalNum - currentNum) / originalNum) * 100);
        }
        return null;
    }

    guessCategory(title) {
        const titleLower = title.toLowerCase();
        
        if (titleLower.includes('phone') || titleLower.includes('samsung') || titleLower.includes('iphone')) {
            return 'Electronics';
        } else if (titleLower.includes('detergent') || titleLower.includes('cleaner') || titleLower.includes('hanger')) {
            return 'Home & Garden';
        } else if (titleLower.includes('oil') || titleLower.includes('beauty') || titleLower.includes('personal')) {
            return 'Beauty & Personal Care';
        } else if (titleLower.includes('toothbrush') || titleLower.includes('health')) {
            return 'Health & Personal Care';
        } else if (titleLower.includes('earphone') || titleLower.includes('bluetooth') || titleLower.includes('case')) {
            return 'Electronics';
        } else {
            return 'Home & Garden';
        }
    }

    generatePlaceholderImage(title) {
        const colors = ['2563eb', '10b981', '7c3aed', 'f59e0b', 'ef4444', '06b6d4', '84cc16', '8b5cf6'];
        const color = colors[Math.floor(Math.random() * colors.length)];
        const text = encodeURIComponent(title.substring(0, 20));
        return `https://via.placeholder.com/400x400/${color}/ffffff?text=${text}`;
    }

    updateDailyDeals(deals) {
        if (window.dailyDealsSlider) {
            window.dailyDealsSlider.deals = deals;
            window.dailyDealsSlider.currentIndex = 0;
            window.dailyDealsSlider.renderDeals();
            console.log('🔄 Slider de ofertas actualizado');
        }
    }

    useFallbackDeals() {
        console.log('📦 Usando ofertas de respaldo...');
        const fallbackDeals = [
            {
                id: 'fallback-1',
                title: 'OMO Liquid Laundry Detergent, Active, up to 100% stain removal',
                category: 'Home & Garden',
                image: 'https://via.placeholder.com/400x400/2563eb/ffffff?text=OMO+Detergent',
                price: 'AED 37.59',
                original: 'AED 57.79',
                discount: '-35%',
                url: this.dealsUrl,
                badge: 'Limited time deal'
            },
            {
                id: 'fallback-2',
                title: 'Soundcore Anker P20i Bluetooth Earphones, 10mm Drivers with Big Bass',
                category: 'Electronics',
                image: 'https://via.placeholder.com/400x400/7c3aed/ffffff?text=Soundcore+P20i',
                price: 'AED 59.00',
                original: 'AED 90.00',
                discount: '-34%',
                url: this.dealsUrl,
                badge: 'Limited time deal'
            },
            {
                id: 'fallback-3',
                title: 'Amazon Basics Slim Velvet, Non-Slip Suit Clothes Hangers, Pack of 30',
                category: 'Home & Garden',
                image: 'https://via.placeholder.com/400x400/10b981/ffffff?text=Hangers',
                price: 'AED 38.00',
                original: 'AED 53.00',
                discount: '-28%',
                url: this.dealsUrl,
                badge: 'Limited time deal'
            },
            {
                id: 'fallback-4',
                title: 'Majestic Pure USDA Organic Sweet Almond Body Oil, 236ml',
                category: 'Beauty & Personal Care',
                image: 'https://via.placeholder.com/400x400/f59e0b/ffffff?text=Almond+Oil',
                price: 'AED 42.68',
                original: 'AED 49.00',
                discount: '-13%',
                url: this.dealsUrl,
                badge: 'Limited time deal'
            }
        ];
        
        this.updateDailyDeals(fallbackDeals);
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.dealsScraper = new DealsScraper();
});

// Función para actualización manual
function refreshDailyDeals() {
    if (window.dealsScraper) {
        window.dealsScraper.scrapeDeals();
    }
} 