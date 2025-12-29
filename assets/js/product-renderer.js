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
    }

    createCard(p) {
        const hasDiscount = p.discount && p.original;
        const mainImage = p.image || (p.gallery && p.gallery[0]);

        return `
            <div class="product-card" data-id="${p.id}">
                <div class="product-badges">
                    <span class="badge prime">Prime</span>
                    ${p.discount ? `<span class="badge special">${p.discount} OFF</span>` : ''}
                </div>
                
                <div class="product-image-container">
                    <img src="${mainImage}" 
                         alt="${p.title}" 
                         class="product-image main-image"
                         onerror="this.onerror=null;this.src='https://via.placeholder.com/400x400?text=Product+Image';">
                    ${this.createGalleryDots(p.gallery, p.id)}
                </div>

                <div class="product-info">
                    <h3>${p.title}</h3>
                    <p class="product-category">${p.category}</p>
                    <div class="product-footer">
                        <div class="price-history">
                            ${hasDiscount ? `<span class="discount">${p.discount}</span>` : ''}
                            ${p.original ? `<span class="original-price">${p.original}</span>` : ''}
                            <span class="current-price">${p.price}</span>
                        </div>
                        <a href="${p.url}" class="product-cta" target="_blank" rel="noopener noreferrer">View on Amazon</a>
                    </div>
                </div>
                <button class="favorite-btn" data-id="${p.id}" aria-label="Add to favorites">&#9825;</button>
            </div>
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
        // Dot clicks are handled by the onclick attribute for simplicity now
        // But we could add more advanced listeners here if needed (swipe, etc)
    }
}

// Global instance for simple access
window.initRenderer = (products) => {
    window.renderer = new ProductRenderer(products);
    return window.renderer;
};
