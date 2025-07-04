// Daily Deals Slider - Ofertas diarias automáticas
class DailyDealsSlider {
    constructor() {
        this.deals = [
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
        
        // Mostrar 4 productos a la vez
        const visibleDeals = this.deals.slice(this.currentIndex, this.currentIndex + 4);
        
        visibleDeals.forEach(deal => {
            const dealCard = this.createDealCard(deal);
            container.appendChild(dealCard);
        });

        // Actualizar indicadores
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
        const totalPages = Math.ceil(this.deals.length / 4);
        
        for (let i = 0; i < totalPages; i++) {
            const indicator = document.createElement('button');
            indicator.className = `indicator ${i === Math.floor(this.currentIndex / 4) ? 'active' : ''}`;
            indicator.onclick = () => this.goToPage(i);
            indicatorsContainer.appendChild(indicator);
        }
    }

    goToPage(pageIndex) {
        this.currentIndex = pageIndex * 4;
        this.renderDeals();
        this.resetAutoPlay();
    }

    nextSlide() {
        this.currentIndex = (this.currentIndex + 4) % this.deals.length;
        this.renderDeals();
    }

    prevSlide() {
        this.currentIndex = this.currentIndex - 4 < 0 ? this.deals.length - 4 : this.currentIndex - 4;
        this.renderDeals();
    }

    startAutoPlay() {
        this.autoPlayInterval = setInterval(() => {
            this.nextSlide();
        }, 5000); // Cambiar cada 5 segundos
    }

    resetAutoPlay() {
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
            this.startAutoPlay();
        }
    }

    setupEventListeners() {
        // Añadir botones de navegación si no existen
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
                this.resetAutoPlay();
            });

            nav.querySelector('.next-btn').addEventListener('click', () => {
                this.nextSlide();
                this.resetAutoPlay();
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

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.dailyDealsSlider = new DailyDealsSlider();
});

// Añadir estilos CSS para el slider
const dealsStyle = document.createElement('style');
dealsStyle.textContent = `
    .daily-deals {
        position: relative;
        overflow: hidden;
    }
    
    .deals-nav {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        width: 100%;
        display: flex;
        justify-content: space-between;
        pointer-events: none;
        z-index: 10;
    }
    
    .nav-btn {
        background: rgba(37, 99, 235, 0.9);
        color: white;
        border: none;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        font-size: 20px;
        cursor: pointer;
        pointer-events: all;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .nav-btn:hover {
        background: rgba(37, 99, 235, 1);
        transform: scale(1.1);
    }
    
    .deals-indicators {
        display: flex;
        justify-content: center;
        gap: 8px;
        margin-top: 20px;
    }
    
    .indicator {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        border: none;
        background: #d1d5db;
        cursor: pointer;
        transition: all 0.3s ease;
    }
    
    .indicator.active {
        background: #2563eb;
        transform: scale(1.2);
    }
    
    .deal-card {
        transition: transform 0.3s ease;
    }
    
    .deal-card:hover {
        transform: translateY(-5px);
    }
    
    .badge.deal {
        background: #dc2626;
        color: white;
        font-size: 0.75rem;
        font-weight: bold;
    }
    
    @media (max-width: 768px) {
        .deals-nav {
            display: none;
        }
        
        .deals-indicators {
            margin-top: 15px;
        }
    }
`;
document.head.appendChild(dealsStyle); 