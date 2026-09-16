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
        spark: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/>',
        tablet: '<rect x="4" y="3" width="16" height="18" rx="2.5"/><path d="M11 18h2"/>',
        desktop: '<rect x="3" y="8" width="18" height="8" rx="2.5"/><circle cx="7" cy="12" r="1"/><path d="M12 12h5"/>',
        monitor: '<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/>',
        earbuds: '<path d="M8 4a3.5 3.5 0 0 1 3.5 3.5v2A3.5 3.5 0 0 1 8 13a3.5 3.5 0 0 1-3.5-3.5v-2A3.5 3.5 0 0 1 8 4zM8 13v7M16 4a3.5 3.5 0 0 1 3.5 3.5v2A3.5 3.5 0 0 1 16 13a3.5 3.5 0 0 1-3.5-3.5v-2A3.5 3.5 0 0 1 16 4zM16 13v7"/>',
        speaker: '<rect x="6" y="2" width="12" height="20" rx="3"/><circle cx="12" cy="15" r="3"/><circle cx="12" cy="7" r="1.2"/>',
        console: '<path d="M8 3h8a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/><path d="M10 7h4M10 18h4"/>',
        handheld: '<rect x="2" y="6" width="20" height="12" rx="3"/><rect x="8" y="8.5" width="8" height="7" rx="1"/><path d="M5 11v2M4 12h2"/><circle cx="19" cy="11" r=".8"/><circle cx="19" cy="13.5" r=".8"/>',
        vr: '<path d="M3 9a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v5a3 3 0 0 1-3 3h-3l-2-2h-2l-2 2H6a3 3 0 0 1-3-3z"/><circle cx="8.5" cy="12" r="1.2"/><circle cx="15.5" cy="12" r="1.2"/>',
        mouse: '<path d="M12 2a6 6 0 0 1 6 6v8a6 6 0 0 1-12 0V8a6 6 0 0 1 6-6z"/><path d="M12 2v6M9 8h6"/>',
        keyboard: '<rect x="2" y="7" width="20" height="10" rx="2"/><path d="M6 11h.01M10 11h.01M14 11h.01M18 11h.01M7 14h10"/>',
        streamdeck: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M7 9h2.5v2.5H7zM10.75 9h2.5v2.5h-2.5zM14.5 9H17v2.5h-2.5zM7 13h2.5v2.5H7zM10.75 13h2.5v2.5h-2.5zM14.5 13H17v2.5h-2.5z"/>',
        ring: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4.5"/>',
        glasses: '<circle cx="7" cy="12" r="4"/><circle cx="17" cy="12" r="4"/><path d="M11 12h2M2 10l1 1M22 10l-1 1"/>',
        ereader: '<rect x="5" y="2" width="14" height="20" rx="2"/><path d="M9 7h6M9 10.5h6M9 14h4"/>',
        storage: '<rect x="3" y="8" width="18" height="8" rx="2"/><path d="M7 12h6M17 12h.01"/>',
        router: '<path d="M2 17a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2z"/><path d="M6 19h.01M9 8.5a5 5 0 0 1 6 0M6.5 5.5a9 9 0 0 1 11 0M12 11.5V15"/>',
        robot: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3"/><path d="M12 3v2M8 5.5l.8 1.4M16 5.5l-.8 1.4"/>',
        vacuum: '<path d="M14 3h3a2 2 0 0 1 0 4h-1M14 3l-5 12M9 15l-3 6h7l-1-6z"/>',
        purifier: '<rect x="6" y="3" width="12" height="18" rx="3"/><path d="M9 8h6M9 11.5h6M9 15h6"/>',
        bulb: '<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10.5c.7.6 1 1.5 1 2.5h6c0-1 .3-1.9 1-2.5A6 6 0 0 0 12 3z"/>',
        doorbell: '<rect x="8" y="2" width="8" height="20" rx="2.5"/><circle cx="12" cy="8" r="2"/><circle cx="12" cy="16" r="1.5"/>',
        camera: '<path d="M4 10a8 8 0 0 1 16 0v3H4z"/><path d="M12 13v4M8 17h8M12 9h.01"/>',
        wireless: '<circle cx="12" cy="14" r="5"/><circle cx="12" cy="14" r="1.5"/><path d="M12 2v4M8 5.5A8 8 0 0 0 5 8"/>',
        powerbank: '<rect x="3" y="7" width="18" height="10" rx="3"/><path d="M13 9l-3 4h4l-3 4"/>',
        hub: '<rect x="3" y="9" width="18" height="6" rx="3"/><path d="M7 12h.01M11 12h.01M15 12h.01"/>',
        mount: '<rect x="7" y="2" width="10" height="14" rx="2"/><path d="M12 16v3M8 22h8"/>',
        stylus: '<path d="M15 3l6 6-11 11H4v-6zM13 5l6 6"/>',
        tracker: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/>',
        printer: '<path d="M4 4h16v4H4zM6 8v12h12V8M10 8v4h4V8M9 17h6"/>',
        spool: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3.5"/><path d="M3 12h5.5M15.5 12H21"/>',
        coffee: '<path d="M4 8h13a3 3 0 0 1 0 6h-1M4 8v6a5 5 0 0 0 5 5h2a5 5 0 0 0 5-5V8M7 3v2M11 3v2"/>',
    };

    /** Product sub-type → silhouette icon. Falls back to the category icon. */
    const SUB_ICONS = {
        'Smartphone': 'phone', 'Foldable': 'phone', 'Tablet': 'tablet', 'Laptop': 'laptop', 'Gaming Laptop': 'laptop', 'Desktop': 'desktop',
        'Monitor': 'monitor', 'Smart Display': 'monitor', 'Earbuds': 'earbuds', 'Headphones': 'headphones', 'Gaming Headset': 'headphones',
        'Speaker': 'speaker', 'Smart Speaker': 'speaker', 'Console': 'console', 'Controller': 'gamepad', 'Mobile Controller': 'gamepad',
        'Handheld': 'handheld', 'VR Headset': 'vr', 'Gaming Mouse': 'mouse', 'Mouse': 'mouse', 'Keyboard': 'keyboard',
        'Stream Controller': 'streamdeck', 'Streaming': 'streamdeck', 'Smartwatch': 'watch', 'Sports Watch': 'watch', 'Fitness Tracker': 'watch',
        'Smart Ring': 'ring', 'Smart Glasses': 'glasses', 'E-Reader': 'ereader', 'Storage': 'storage', 'Router': 'router', 'Mesh Wi-Fi': 'router',
        'Robot Vacuum': 'robot', 'Vacuum': 'vacuum', 'Air Purifier': 'purifier', 'Smart Light': 'bulb', 'Smart Lighting': 'bulb',
        'Video Doorbell': 'doorbell', 'Security': 'doorbell', 'Security Camera': 'camera', 'Smart Plug': 'plug', 'Charger': 'plug',
        'Wireless Charger': 'wireless', 'Power Bank': 'powerbank', 'USB-C Hub': 'hub', 'Car Mount': 'mount', 'Stylus': 'stylus',
        'Tracker': 'tracker', '3D Printer': 'printer', '3D Printer Upgrade': 'printer', 'Filament': 'spool', 'Coffee Machine': 'coffee'
    };

    function productIcon(p) { return SUB_ICONS[p.sub] || catInfo(p).icon; }

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
                return '<div class="card-media ' + (cls || '') + (p.imageFit === 'contain' ? ' fit-contain' : '') + '">' +
                    '<img src="' + esc(p.image) + '" alt="' + esc(p.title) + '" loading="lazy" decoding="async" width="600" height="450" ' +
                    'onerror="this.onerror=null;this.closest(\'.product-card\')&&this.closest(\'.product-card\').classList.replace(\'has-photo\',\'no-photo\');this.remove();">' +
                    this.galleryDots(p.gallery) + '</div>';
            }
            return '<div class="card-media card-visual ' + (cls || '') + '">' +
                icon(productIcon(p), 'visual-icon') +
                '<span class="visual-text"><span class="visual-brand">' + esc(p.brand) + '</span>' +
                '<span class="visual-model">' + esc(p.model) + '</span></span>' +
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
                '<span class="row-thumb">' + (p.hasImage ? '<img src="' + esc(p.image) + '" alt="" loading="lazy" width="80" height="80">' : icon(productIcon(p))) + '</span>' +
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
                '<button class="gallery-dot' + (i === 0 ? ' active' : '') + '" data-img="' + esc(img) + '" aria-label="Image ' + (i + 1) + '" tabindex="-1"></button>').join('') + '</div>';
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
        static productIcon(p) { return productIcon(p); }
    }

    root.ProductRenderer = ProductRenderer;
    root.initRenderer = function (products) {
        root.renderer = new ProductRenderer(products);
        return root.renderer;
    };
})(window);
