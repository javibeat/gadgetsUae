/**
 * ProductRenderer v7 — cards for the merged catalog (window.CATALOG).
 *
 * Two card looks:
 *  - photo card  : legacy products with local images
 *  - visual card : curated products without photos → typographic tile
 *                  (brand + model + category glyph on a tinted surface)
 * Plus a large "pick of the day" hero and a compact row for lists.
 * No prices are rendered anywhere (see catalog.js for why).
 */
(function (root) {
    'use strict';

    const ICONS = {
        gamepad: '<path d="M7 6h10a5 5 0 0 1 5 5v2.5a3.5 3.5 0 0 1-6.3 2.1L14.5 14h-5l-1.2 1.6A3.5 3.5 0 0 1 2 13.5V11a5 5 0 0 1 5-5z"/><path d="M6 11h4M8 9v4"/><circle cx="16" cy="10.5" r=".9"/><circle cx="18.5" cy="12.5" r=".9"/>',
        phone: '<rect x="7" y="2" width="10" height="20" rx="2.5"/><path d="M11 18h2"/>',
        headphones: '<path d="M4 15v-4a8 8 0 0 1 16 0v4"/><rect x="3" y="14" width="4" height="6" rx="1.5"/><rect x="17" y="14" width="4" height="6" rx="1.5"/>',
        laptop: '<rect x="4" y="5" width="16" height="11" rx="2"/><path d="M2 19h20"/>',
        home: '<path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"/>',
        watch: '<rect x="7" y="7" width="10" height="10" rx="3"/><path d="M9 7l.5-4h5l.5 4M9 17l.5 4h5l.5-4M12 10v2l1.5 1"/>',
        plug: '<path d="M9 2v5M15 2v5M7 7h10v4a5 5 0 0 1-10 0zM12 16v6"/>',
        cube: '<path d="M12 2l9 5v10l-9 5-9-5V7z"/><path d="M12 12l9-5M12 12L3 7M12 12v10"/>',
        arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
        heart: '<path d="M12 20.5s-7.5-4.6-7.5-10A4.5 4.5 0 0 1 12 7.6a4.5 4.5 0 0 1 7.5 2.9c0 5.4-7.5 10-7.5 10z"/>',
        spark: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/>'
    };

    function icon(name, cls) {
        return '<svg class="' + (cls || 'icon') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (ICONS[name] || '') + '</svg>';
    }

    function esc(s) {
        return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    }

    function catInfo(p) {
        const C = root.Catalog;
        return (C && C.category(p.category)) || { hue: 220, icon: 'spark', label: p.category, page: '/products.html' };
    }

    const TIER_LABEL = { budget: 'Value pick', mid: 'Sweet spot', premium: 'Premium' };
    const LINK_ATTRS = 'target="_blank" rel="sponsored noopener noreferrer"';

    class ProductRenderer {
        constructor(products) {
            this.products = products || root.CATALOG || [];
        }

        /**
         * Render into a container.
         * options.items   explicit list (already ordered)
         * options.category / limit / excludeId  simple filters (legacy API)
         */
        render(containerId, options) {
            const container = typeof containerId === 'string' ? document.getElementById(containerId) : containerId;
            if (!container) return [];
            const o = options || {};
            let items = o.items;
            if (!items) {
                items = this.products;
                if (o.category) items = items.filter(p => p.category === o.category);
                if (o.excludeId) items = items.filter(p => p.id !== o.excludeId);
                items = items.slice(0, o.limit || 12);
            }
            if (!items.length) {
                container.innerHTML = '<p class="empty-state">' + esc(o.emptyText || 'Nothing here yet.') + '</p>';
                return [];
            }
            container.innerHTML = items.map((p, i) => this.createCard(p, { index: i })).join('');
            this.bind(container);
            return items;
        }

        bind(container) {
            this.initFavorites(container);
            this.initSwipe(container);
            this.trackClicks(container);
        }

        media(p, cls) {
            const c = catInfo(p);
            if (p.hasImage) {
                return '<div class="card-media ' + (cls || '') + '">' +
                    '<img src="' + esc(p.image) + '" alt="' + esc(p.title) + '" loading="lazy" decoding="async" width="600" height="450" ' +
                    'onerror="this.onerror=null;this.closest(\'.product-card\')&&this.closest(\'.product-card\').classList.replace(\'has-photo\',\'no-photo\');this.remove();">' +
                    this.galleryDots(p.gallery) + '</div>';
            }
            return '<div class="card-media card-visual ' + (cls || '') + '">' +
                '<span class="visual-brand">' + esc(p.brand) + '</span>' +
                '<span class="visual-model">' + esc(p.model) + '</span>' +
                icon(c.icon, 'visual-icon') +
                '</div>';
        }

        badges(p) {
            const c = catInfo(p);
            const out = ['<a class="badge badge-cat" href="' + c.page + '">' + esc(c.label) + '</a>'];
            if (p.added === '2026-09') out.push('<span class="badge badge-new">New</span>');
            if (p.heat >= 88) out.push('<span class="badge badge-hot">Top pick</span>');
            return '<div class="card-badges">' + out.join('') + '</div>';
        }

        specs(p) {
            if (!p.specs || !p.specs.length) return '';
            return '<ul class="spec-pills">' + p.specs.map(s => '<li>' + esc(s) + '</li>').join('') + '</ul>';
        }

        createCard(p, opts) {
            const c = catInfo(p);
            const o = opts || {};
            return '<article class="product-card ' + (p.hasImage ? 'has-photo' : 'no-photo') + '" data-id="' + esc(p.id) + '" data-category="' + esc(p.category) + '" style="--hue:' + c.hue + (o.index != null ? ';--i:' + o.index : '') + '">' +
                '<a class="card-media-link" href="' + esc(p.url) + '" ' + LINK_ATTRS + ' tabindex="-1" aria-hidden="true">' + this.media(p) + '</a>' +
                this.badges(p) +
                '<button class="favorite-btn" data-id="' + esc(p.id) + '" aria-label="Save ' + esc(p.title) + '" aria-pressed="false">' + icon('heart') + '</button>' +
                '<div class="card-body">' +
                    '<div class="card-meta"><span>' + esc(p.sub) + '</span><span class="sep"></span><span>' + esc(TIER_LABEL[p.tier] || p.tier) + '</span></div>' +
                    '<h3 class="card-title"><a href="' + esc(p.url) + '" ' + LINK_ATTRS + ' data-product-id="' + esc(p.id) + '">' + esc(p.title) + '</a></h3>' +
                    (p.blurb ? '<p class="card-blurb">' + esc(p.blurb) + '</p>' : '') +
                    this.specs(p) +
                    '<a href="' + esc(p.url) + '" class="card-cta" ' + LINK_ATTRS + ' data-product-id="' + esc(p.id) + '">View on Amazon.ae ' + icon('arrow') + '</a>' +
                '</div>' +
            '</article>';
        }

        /** Large hero for the pick of the day. */
        createHero(p, meta) {
            const c = catInfo(p);
            const m = meta || {};
            return '<article class="deal-hero ' + (p.hasImage ? 'has-photo' : 'no-photo') + '" data-id="' + esc(p.id) + '" style="--hue:' + c.hue + '">' +
                '<a class="deal-hero-media" href="' + esc(p.url) + '" ' + LINK_ATTRS + ' aria-label="' + esc(p.title) + '">' + this.media(p, 'hero') + '</a>' +
                '<div class="deal-hero-body">' +
                    '<div class="eyebrow">' + icon('spark') + ' Pick of the day' + (m.dayLabel ? ' <span class="eyebrow-date">' + esc(m.dayLabel) + '</span>' : '') + '</div>' +
                    '<div class="card-meta"><a href="' + c.page + '">' + esc(c.label) + '</a><span class="sep"></span><span>' + esc(p.sub) + '</span><span class="sep"></span><span>' + esc(TIER_LABEL[p.tier] || p.tier) + '</span></div>' +
                    '<h2 class="deal-hero-title"><a href="' + esc(p.url) + '" ' + LINK_ATTRS + ' data-product-id="' + esc(p.id) + '">' + esc(p.title) + '</a></h2>' +
                    (p.blurb ? '<p class="deal-hero-blurb">' + esc(p.blurb) + '</p>' : '') +
                    this.specs(p) +
                    '<div class="deal-hero-actions">' +
                        '<a href="' + esc(p.url) + '" class="btn-primary" ' + LINK_ATTRS + ' data-product-id="' + esc(p.id) + '">View on Amazon.ae ' + icon('arrow') + '</a>' +
                        '<button class="favorite-btn inline" data-id="' + esc(p.id) + '" aria-label="Save ' + esc(p.title) + '" aria-pressed="false">' + icon('heart') + ' <span>Save</span></button>' +
                    '</div>' +
                    '<p class="deal-hero-note">New pick every midnight UAE · <span class="countdown" data-countdown></span> left</p>' +
                '</div>' +
            '</article>';
        }

        /** Compact row for ranked lists and guides. */
        createRow(p, rank) {
            const c = catInfo(p);
            return '<a class="product-row" href="' + esc(p.url) + '" ' + LINK_ATTRS + ' data-product-id="' + esc(p.id) + '" style="--hue:' + c.hue + '">' +
                (rank != null ? '<span class="row-rank">' + rank + '</span>' : '') +
                '<span class="row-thumb">' + (p.hasImage ? '<img src="' + esc(p.image) + '" alt="" loading="lazy" width="80" height="80">' : icon(c.icon)) + '</span>' +
                '<span class="row-text"><strong>' + esc(p.title) + '</strong><small>' + esc(p.brand) + ' · ' + esc(p.sub) + '</small></span>' +
                icon('arrow', 'row-arrow') +
            '</a>';
        }

        renderRows(containerId, items, startRank) {
            const container = typeof containerId === 'string' ? document.getElementById(containerId) : containerId;
            if (!container) return;
            container.innerHTML = items.map((p, i) => this.createRow(p, startRank != null ? startRank + i : null)).join('');
            this.trackClicks(container);
        }

        galleryDots(gallery) {
            if (!gallery || gallery.length <= 1) return '';
            return '<div class="gallery-dots">' + gallery.map((img, i) =>
                '<button class="gallery-dot' + (i === 0 ? ' active' : '') + '" data-img="' + esc(img) + '" aria-label="Image ' + (i + 1) + '"></button>').join('') + '</div>';
        }

        switchImage(dot) {
            const media = dot.closest('.card-media');
            const img = media && media.querySelector('img');
            if (!img) return;
            img.src = dot.getAttribute('data-img');
            media.querySelectorAll('.gallery-dot').forEach(d => d.classList.remove('active'));
            dot.classList.add('active');
        }

        initFavorites(container) {
            const favs = root.getFavorites ? root.getFavorites() : [];
            container.querySelectorAll('.favorite-btn').forEach(btn => {
                const fresh = btn.cloneNode(true);
                btn.parentNode.replaceChild(fresh, btn);
                const on = favs.includes(fresh.dataset.id);
                fresh.classList.toggle('active', on);
                fresh.setAttribute('aria-pressed', String(on));
                fresh.addEventListener('click', e => {
                    e.preventDefault(); e.stopPropagation();
                    if (root.toggleFavorite) root.toggleFavorite(fresh.dataset.id);
                });
            });
        }

        initSwipe(container) {
            container.querySelectorAll('.card-media').forEach(wrap => {
                const dots = wrap.querySelectorAll('.gallery-dot');
                if (!dots.length) return;
                dots.forEach(d => d.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); this.switchImage(d); }));
                let startX = 0, idx = 0;
                wrap.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
                wrap.addEventListener('touchend', e => {
                    const diff = startX - e.changedTouches[0].clientX;
                    if (Math.abs(diff) < 40) return;
                    if (diff > 0 && idx < dots.length - 1) idx++;
                    else if (diff < 0 && idx > 0) idx--;
                    this.switchImage(dots[idx]);
                }, { passive: true });
            });
        }

        trackClicks(container) {
            container.querySelectorAll('[data-product-id]').forEach(a => {
                a.addEventListener('click', () => {
                    const p = this.products.find(x => x.id === a.dataset.productId);
                    if (p && root.analyticsTracker && root.analyticsTracker.trackProductClick) {
                        root.analyticsTracker.trackProductClick(p.id, p.title, p.category);
                    }
                });
            });
        }

        static icon(name, cls) { return icon(name, cls); }
    }

    root.ProductRenderer = ProductRenderer;
    root.initRenderer = function (products) {
        root.renderer = new ProductRenderer(products);
        return root.renderer;
    };
})(window);
