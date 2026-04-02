/**
 * ProductRenderer — Generates product cards for the new design system
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
        if (category) filtered = filtered.filter(p => p.category === category);
        if (excludeId) filtered = filtered.filter(p => p.id !== excludeId);

        const items = filtered.slice(0, limit);

        if (items.length === 0) {
            container.innerHTML = '<p style="color:var(--text-2);text-align:center;padding:2rem">No products found in this category.</p>';
            return;
        }

        container.innerHTML = items.map(p => this.createCard(p)).join('');
        this.initFavorites(container);
        this.initSwipe(container);
    }

    createCard(p) {
        const img = p.image || (p.gallery && p.gallery[0]) || '';
        const galleryDots = this.createGalleryDots(p.gallery, p.id);

        return `
            <article class="product-card" data-id="${p.id}" data-asin="${p.asin || ''}">
                <div class="card-image">
                    <div class="card-badges">
                        <span class="badge badge-prime">Prime</span>
                        ${p.discount ? `<span class="badge badge-discount">${p.discount}</span>` : ''}
                    </div>
                    <button class="favorite-btn" data-id="${p.id}" aria-label="Add ${p.title} to favorites">&#9825;</button>
                    <img src="${img}"
                         alt="${p.title}"
                         class="main-image"
                         loading="lazy"
                         decoding="async"
                         width="400"
                         height="300"
                         onerror="this.onerror=null;this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22300%22%3E%3Crect width=%22400%22 height=%22300%22 fill=%22%23f2f2f2%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 fill=%22%23999%22 font-size=%2214%22%3EImage unavailable%3C/text%3E%3C/svg%3E';">
                    ${galleryDots}
                </div>
                <div class="card-body">
                    <span class="card-category">${p.category}</span>
                    <h3 class="card-title"><a href="${p.url}" target="_blank" rel="sponsored noopener noreferrer">${p.title}</a></h3>
                    <div class="card-price">
                        <span class="price-current" data-product-id="${p.id}">${p.price}</span>
                        ${p.original ? `<span class="price-original">${p.original}</span>` : ''}
                        ${p.discount ? `<span class="price-discount">${p.discount}</span>` : ''}
                        <span class="price-timestamp" data-updated-id="${p.id}"></span>
                    </div>
                    <a href="${p.url}" class="card-cta" target="_blank" rel="sponsored noopener noreferrer" data-product-id="${p.id}">
                        Check Price <span class="arrow">&#8594;</span>
                    </a>
                </div>
            </article>
        `;
    }

    createGalleryDots(gallery, productId) {
        if (!gallery || gallery.length <= 1) return '';
        const dots = gallery.map((img, i) => `
            <button class="gallery-dot ${i === 0 ? 'active' : ''}"
                    data-img="${img}"
                    aria-label="Image ${i + 1}"
                    onclick="window.renderer.switchImage(this)"></button>
        `).join('');
        return `<div class="gallery-dots">${dots}</div>`;
    }

    switchImage(dot) {
        const card = dot.closest('.product-card');
        const mainImg = card.querySelector('.main-image');
        const dots = card.querySelectorAll('.gallery-dot');

        mainImg.src = dot.getAttribute('data-img');
        dots.forEach(d => d.classList.remove('active'));
        dot.classList.add('active');
    }

    initFavorites(container) {
        container.querySelectorAll('.favorite-btn').forEach(btn => {
            const fresh = btn.cloneNode(true);
            btn.parentNode.replaceChild(fresh, btn);

            fresh.addEventListener('click', (e) => {
                e.stopPropagation();
                e.preventDefault();
                if (window.toggleFavorite) window.toggleFavorite(fresh.dataset.id);
            });

            if (window.getFavorites) {
                const favs = window.getFavorites();
                if (favs.includes(fresh.dataset.id)) {
                    fresh.innerHTML = '&#10084;';
                    fresh.classList.add('active');
                }
            }
        });
    }

    initSwipe(container) {
        container.querySelectorAll('.card-image').forEach(wrap => {
            const dots = wrap.querySelectorAll('.gallery-dot');
            if (dots.length <= 1) return;

            let startX = 0, idx = 0;

            wrap.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
            wrap.addEventListener('touchend', e => {
                const diff = startX - e.changedTouches[0].clientX;
                if (Math.abs(diff) < 40) return;
                if (diff > 0 && idx < dots.length - 1) idx++;
                else if (diff < 0 && idx > 0) idx--;
                dots[idx]?.click();
            }, { passive: true });
        });
    }

    static updateTimestamps(pricesData) {
        if (!pricesData) return;
        Object.entries(pricesData).forEach(([id, data]) => {
            const el = document.querySelector(`[data-updated-id="${id}"]`);
            if (el && data.lastUpdate) {
                el.textContent = `Updated ${ProductRenderer.timeAgo(new Date(data.lastUpdate))}`;
            }
        });
    }

    static timeAgo(date) {
        const s = Math.floor((Date.now() - date) / 1000);
        if (s < 3600) return `${Math.floor(s / 60)}m ago`;
        if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
        const d = Math.floor(s / 86400);
        if (d === 1) return 'yesterday';
        if (d < 30) return `${d}d ago`;
        return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    }
}

window.initRenderer = (products) => {
    window.renderer = new ProductRenderer(products);
    return window.renderer;
};
