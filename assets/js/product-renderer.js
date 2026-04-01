/**
 * ProductRenderer - Generates product grids dynamically
 */
class ProductRenderer {
    constructor(products) {
        this.products = products || [];
    }

    render(containerId, options = {}) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const { category, limit = 12, excludeId } = options;

        let filtered = this.products;
        if (category) {
            filtered = filtered.filter(p => p.category === category);
        }
        if (excludeId) {
            filtered = filtered.filter(p => p.id !== excludeId);
        }

        const productsToRender = filtered.slice(0, limit);

        if (productsToRender.length === 0) {
            container.innerHTML = '<p class="no-products">No products found in this category.</p>';
            return;
        }

        container.innerHTML = productsToRender.map(product => this.createCard(product)).join('');
        this.initGalleries(container);
        this.initFavorites(container);
        this.initSwipe(container);
    }

    createCard(p) {
        const mainImage = p.image || (p.gallery && p.gallery[0]);

        return `
            <article class="product-card" data-id="${p.id}" data-asin="${p.asin || ''}">
                <div class="product-badges">
                    <span class="badge prime">Prime</span>
                    ${p.discount ? `<span class="badge special">${p.discount} OFF</span>` : ''}
                </div>

                <div class="product-image-container">
                    <img src="${mainImage}"
                         alt="${p.title} - Best price on Amazon.ae"
                         class="product-image main-image"
                         loading="lazy"
                         width="400"
                         height="400"
                         onerror="this.onerror=null;this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22400%22 fill=%22%23333%22%3E%3Crect width=%22400%22 height=%22400%22 fill=%22%23222%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 fill=%22%23666%22 font-size=%2216%22%3EImage unavailable%3C/text%3E%3C/svg%3E';">
                    ${this.createGalleryDots(p.gallery, p.id)}
                </div>

                <div class="product-info">
                    <h3>${p.title}</h3>
                    <p class="product-category">${p.category}</p>
                    <div class="product-footer">
                        <div class="price-history">
                            ${p.discount ? `<span class="discount">${p.discount}</span>` : ''}
                            ${p.original ? `<span class="original-price">${p.original}</span>` : ''}
                            <span class="current-price" data-product-id="${p.id}">${p.price}</span>
                            <span class="price-updated" data-updated-id="${p.id}"></span>
                        </div>
                        <a href="${p.url}" class="product-cta" target="_blank" rel="sponsored noopener noreferrer" data-product-id="${p.id}">Check Price on Amazon.ae</a>
                    </div>
                </div>
                <button class="favorite-btn" data-id="${p.id}" aria-label="Add ${p.title} to favorites">&#9825;</button>
            </article>
        `;
    }

    createGalleryDots(gallery, productId) {
        if (!gallery || gallery.length <= 1) return '';
        const dots = gallery.map((img, idx) => `
            <span class="dot ${idx === 0 ? 'active' : ''}"
                  data-img="${img}"
                  onclick="window.renderer.switchImage(this)"></span>
        `).join('');
        return `<div class="gallery-dots">${dots}</div>`;
    }

    switchImage(dot) {
        const card = dot.closest('.product-card');
        const mainImg = card.querySelector('.main-image');
        const dots = card.querySelectorAll('.dot');

        mainImg.src = dot.getAttribute('data-img');
        dots.forEach(d => d.classList.remove('active'));
        dot.classList.add('active');
    }

    initGalleries(container) {
        // Dot clicks are handled by the onclick attribute
    }

    initFavorites(container) {
        container.querySelectorAll('.favorite-btn').forEach(btn => {
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);

            newBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = newBtn.dataset.id;
                if (window.toggleFavorite) {
                    window.toggleFavorite(id);
                }
            });

            // Set initial state
            if (window.getFavorites) {
                const favs = window.getFavorites();
                if (favs.includes(newBtn.dataset.id)) {
                    newBtn.innerHTML = '❤️';
                    newBtn.classList.add('active');
                } else {
                    newBtn.innerHTML = '\u2661';
                    newBtn.classList.remove('active');
                }
            }
        });
    }

    /**
     * Enable swipe gesture support for mobile galleries
     */
    initSwipe(container) {
        container.querySelectorAll('.product-image-container').forEach(imgContainer => {
            const dots = imgContainer.querySelectorAll('.dot');
            if (dots.length <= 1) return;

            let startX = 0;
            let currentIndex = 0;

            imgContainer.addEventListener('touchstart', (e) => {
                startX = e.touches[0].clientX;
            }, { passive: true });

            imgContainer.addEventListener('touchend', (e) => {
                const diff = startX - e.changedTouches[0].clientX;
                if (Math.abs(diff) < 40) return;

                if (diff > 0 && currentIndex < dots.length - 1) {
                    currentIndex++;
                } else if (diff < 0 && currentIndex > 0) {
                    currentIndex--;
                }

                dots[currentIndex]?.click();
            }, { passive: true });
        });
    }

    /**
     * Update price timestamp displays from prices.json data
     */
    static updateTimestamps(pricesData) {
        if (!pricesData) return;
        Object.entries(pricesData).forEach(([id, data]) => {
            const el = document.querySelector(`[data-updated-id="${id}"]`);
            if (el && data.lastUpdate) {
                const date = new Date(data.lastUpdate);
                const ago = ProductRenderer.timeAgo(date);
                el.textContent = `Price updated ${ago}`;
            }
        });
    }

    static timeAgo(date) {
        const seconds = Math.floor((new Date() - date) / 1000);
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        const days = Math.floor(seconds / 86400);
        if (days === 1) return 'yesterday';
        if (days < 30) return `${days}d ago`;
        return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    }
}

// Global instance
window.initRenderer = (products) => {
    window.renderer = new ProductRenderer(products);
    return window.renderer;
};
