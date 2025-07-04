// Daily Deals Slider - Carrusel de 3 productos visibles, avanza de uno en uno, con animación slide y puntos centrados
class DailyDealsSlider {
    constructor() {
        this.deals = window.dailyDealsSlider && window.dailyDealsSlider.deals ? window.dailyDealsSlider.deals : [
            {
                id: 'omo-detergent',
                title: 'OMO Liquid Laundry Detergent, Active, up to 100% stain removal',
                category: 'Home & Garden',
                image: 'https://via.placeholder.com/400x400/2563eb/ffffff?text=OMO+Detergent',
                price: 'AED 37.59',
                original: 'AED 57.79',
                discount: '-35%',
                url: 'https://amzn.to/3IunEn2',
                badge: 'Limited time deal'
            },
            {
                id: 'amazon-hangers',
                title: 'Amazon Basics Slim Velvet, Non-Slip Suit Clothes Hangers, Pack of 30',
                category: 'Home & Garden',
                image: 'https://via.placeholder.com/400x400/10b981/ffffff?text=Hangers',
                price: 'AED 38.00',
                original: 'AED 53.00',
                discount: '-28%',
                url: 'https://amzn.to/3IunEn2',
                badge: 'Limited time deal'
            },
            {
                id: 'soundcore-p20i',
                title: 'Soundcore Anker P20i Bluetooth Earphones, 10mm Drivers with Big Bass',
                category: 'Electronics',
                image: 'https://via.placeholder.com/400x400/7c3aed/ffffff?text=Soundcore+P20i',
                price: 'AED 59.00',
                original: 'AED 90.00',
                discount: '-34%',
                url: 'https://amzn.to/3IunEn2',
                badge: 'Limited time deal'
            },
            {
                id: 'majestic-almond-oil',
                title: 'Majestic Pure USDA Organic Sweet Almond Body Oil, 236ml',
                category: 'Beauty & Personal Care',
                image: 'https://via.placeholder.com/400x400/f59e0b/ffffff?text=Almond+Oil',
                price: 'AED 42.68',
                original: 'AED 49.00',
                discount: '-13%',
                url: 'https://amzn.to/3IunEn2',
                badge: 'Limited time deal'
            },
            {
                id: 'oral-b-vitality',
                title: 'Oral-B Vitality Electric Rechargeable Toothbrush, D12513',
                category: 'Health & Personal Care',
                image: 'https://via.placeholder.com/400x400/ef4444/ffffff?text=Oral-B',
                price: 'AED 79.00',
                original: 'AED 89.00',
                discount: '-11%',
                url: 'https://amzn.to/3IunEn2',
                badge: 'Limited time deal'
            },
            {
                id: 'sky-touch-organizer',
                title: 'SKY-TOUCH Foldable Storage Organizer 4 Tier, Storage Shelves',
                category: 'Home & Garden',
                image: 'https://via.placeholder.com/400x400/06b6d4/ffffff?text=Organizer',
                price: 'AED 86.40',
                original: 'AED 123.20',
                discount: '-30%',
                url: 'https://amzn.to/3IunEn2',
                badge: 'Limited time deal'
            },
            {
                id: 'jif-cleaner',
                title: 'JIF Cream Cleaner, with micro crystals technology, Lemon, 4 x 500ml',
                category: 'Home & Garden',
                image: 'https://via.placeholder.com/400x400/84cc16/ffffff?text=JIF+Cleaner',
                price: 'AED 31.87',
                original: 'AED 48.26',
                discount: '-34%',
                url: 'https://amzn.to/3IunEn2',
                badge: 'Limited time deal'
            },
            {
                id: 'esr-samsung-case',
                title: 'ESR for Samsung S24 Ultra Case, Compatible with MagSafe',
                category: 'Electronics',
                image: 'https://via.placeholder.com/400x400/8b5cf6/ffffff?text=Samsung+Case',
                price: 'AED 42.49',
                original: 'AED 50.99',
                discount: '-17%',
                url: 'https://amzn.to/3IunEn2',
                badge: 'Limited time deal'
            }
        ];
        this.currentIndex = 0;
        this.autoPlayInterval = null;
        this.visibleCount = 3;
        this.isSliding = false;
        this.init();
    }

    init() {
        this.renderDeals();
        this.startAutoPlay();
        this.setupEventListeners();
    }

    renderDeals() {
        const container = document.querySelector('.daily-deals .products-grid');
        if (!container) return;
        container.innerHTML = '';

        // Crear un contenedor interno para animar el slide
        let inner = document.createElement('div');
        inner.className = 'deals-inner';
        inner.style.display = 'flex';
        inner.style.transition = this.isSliding ? 'transform 0.5s cubic-bezier(.4,1.3,.5,1)' : 'none';
        inner.style.willChange = 'transform';

        // Mostrar 3 productos, con loop infinito
        for (let i = 0; i < this.visibleCount + 1; i++) {
            // +1 para el efecto de loop
            const dealIndex = (this.currentIndex + i) % this.deals.length;
            const deal = this.deals[dealIndex];
            const dealCard = this.createDealCard(deal);
            inner.appendChild(dealCard);
        }
        container.appendChild(inner);

        // Deslizar al siguiente
        if (this.isSliding) {
            setTimeout(() => {
                inner.style.transform = 'translateX(-33.3333%)';
            }, 10);
            setTimeout(() => {
                // Resetear al terminar la animación
                this.isSliding = false;
                this.currentIndex = (this.currentIndex + 1) % this.deals.length;
                this.renderDeals();
            }, 510);
        } else {
            inner.style.transform = 'translateX(0)';
        }

        this.updateIndicators();
    }

    createDealCard(deal) {
        const card = document.createElement('div');
        card.className = 'product-card deal-card';
        card.setAttribute('data-deal-id', deal.id);
        card.innerHTML = `
            <div class="product-badges">
                <span class="badge prime">Prime</span>
                <span class="badge shipping">Free Shipping</span>
                <span class="badge deal">${deal.badge}</span>
            </div>
            <div class="product-image-container">
                <img src="${deal.image}" alt="${deal.title}" class="product-image">
            </div>
            <div class="product-info">
                <h3>${deal.title}</h3>
                <p class="product-category">${deal.category}</p>
                <div class="product-footer">
                    <div class="price-history" style="flex-direction: column; align-items: flex-start; gap: 0.2rem;">
                        <span class="discount" style="margin-bottom: 0;">${deal.discount}</span>
                        <span class="original-price" style="font-size: 0.95em;">${deal.original}</span>
                        <span class="current-price" style="margin-top: 0.5rem; font-size: 1.25rem; font-weight: bold; color: #2563eb;">${deal.price}</span>
                    </div>
                    <a href="${deal.url}" class="product-cta" target="_blank" rel="noopener noreferrer">View on Amazon</a>
                </div>
                <button class="favorite-btn" data-id="${deal.id}" aria-label="Añadir a favoritos">&#9825;</button>
            </div>
        `;
        card.style.minWidth = '320px';
        card.style.maxWidth = '340px';
        card.style.flex = '1 1 0';
        return card;
    }

    updateIndicators() {
        let indicatorsContainer = document.querySelector('.deals-indicators');
        if (!indicatorsContainer) {
            indicatorsContainer = document.createElement('div');
            indicatorsContainer.className = 'deals-indicators';
            document.querySelector('.daily-deals .container').appendChild(indicatorsContainer);
        }
        indicatorsContainer.innerHTML = '';
        // Solo 3 puntos
        for (let i = 0; i < this.visibleCount; i++) {
            const indicator = document.createElement('button');
            let activeIndex = this.currentIndex % this.deals.length;
            if (i === 0) activeIndex = this.currentIndex % this.deals.length;
            if (i === 1) activeIndex = (this.currentIndex + 1) % this.deals.length;
            if (i === 2) activeIndex = (this.currentIndex + 2) % this.deals.length;
            indicator.className = `indicator${i === 0 ? ' active' : ''}`;
            indicator.onclick = () => this.goToIndex((this.currentIndex + i) % this.deals.length);
            indicatorsContainer.appendChild(indicator);
        }
        indicatorsContainer.style.display = 'flex';
        indicatorsContainer.style.justifyContent = 'center';
        indicatorsContainer.style.margin = '30px 0 0 0';
    }

    goToIndex(index) {
        this.currentIndex = index;
        this.renderDeals();
        this.resetAutoPlay();
    }

    nextSlide() {
        if (this.isSliding) return;
        this.isSliding = true;
        this.renderDeals();
    }

    prevSlide() {
        this.currentIndex = (this.currentIndex - 1 + this.deals.length) % this.deals.length;
        this.renderDeals();
        this.resetAutoPlay();
    }

    startAutoPlay() {
        this.autoPlayInterval = setInterval(() => {
            this.nextSlide();
        }, 3000);
    }

    resetAutoPlay() {
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
            this.startAutoPlay();
        }
    }

    setupEventListeners() {
        // Botones de navegación (opcional)
        const container = document.querySelector('.daily-deals .container');
        if (!document.querySelector('.deals-nav')) {
            const nav = document.createElement('div');
            nav.className = 'deals-nav';
            nav.innerHTML = `
                <button class="nav-btn prev-btn" aria-label="Previous deals">‹</button>
                <button class="nav-btn next-btn" aria-label="Next deals">›</button>
            `;
            container.appendChild(nav);
            nav.querySelector('.prev-btn').addEventListener('click', () => {
                this.prevSlide();
            });
            nav.querySelector('.next-btn').addEventListener('click', () => {
                this.nextSlide();
            });
        }
        // Pausar autoplay al hacer hover
        const dealsSection = document.querySelector('.daily-deals');
        if (dealsSection) {
            dealsSection.addEventListener('mouseenter', () => {
                if (this.autoPlayInterval) {
                    clearInterval(this.autoPlayInterval);
                }
            });
            dealsSection.addEventListener('mouseleave', () => {
                this.startAutoPlay();
            });
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.dailyDealsSlider = new DailyDealsSlider();
});

// CSS para centrar y estilizar los puntos e implementar el slide
const dealsStyle = document.createElement('style');
dealsStyle.textContent = `
    .daily-deals .products-grid {
        overflow: hidden;
        position: relative;
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: stretch;
        gap: 0;
        min-height: 420px;
    }
    .deals-inner {
        display: flex;
        width: 100%;
        transition: transform 0.5s cubic-bezier(.4,1.3,.5,1);
    }
    .deal-card {
        min-width: 320px;
        max-width: 340px;
        flex: 1 1 0;
        margin: 0 1rem;
        transition: transform 0.3s;
    }
    .deals-indicators {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 12px;
        margin-top: 30px;
    }
    .indicator {
        width: 14px;
        height: 14px;
        border-radius: 50%;
        border: 2px solid #2563eb;
        background: #fff;
        transition: background 0.3s, border 0.3s;
        cursor: pointer;
        outline: none;
    }
    .indicator.active {
        background: #2563eb;
        border: 2px solid #2563eb;
    }
    @media (max-width: 1100px) {
        .deal-card { min-width: 260px; max-width: 300px; }
    }
    @media (max-width: 900px) {
        .deal-card { min-width: 200px; max-width: 240px; }
    }
    @media (max-width: 700px) {
        .daily-deals .products-grid { gap: 0; }
        .deal-card { min-width: 160px; max-width: 200px; }
    }
`;
document.head.appendChild(dealsStyle); 