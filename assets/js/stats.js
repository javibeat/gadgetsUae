// Estadísticas de visitas con Umami Cloud (sin cookies, panel en https://cloud.umami.is).
// Sustituye al antiguo analytics.js (Firebase), que nunca llegó a funcionar en producción.
// Eventos: "amazon-click" (clic hacia Amazon), "search" (búsqueda interna), "favorite".
// UMD: en Node solo se exportan los helpers puros para los tests.
(function (root, factory) {
    const api = factory();
    if (typeof module === 'object' && module.exports) module.exports = api;
    else api.init(root);
}(typeof self !== 'undefined' ? self : this, function () {
    'use strict';

    // ID público del sitio en Umami (Settings → Websites). Vacío = estadísticas desactivadas.
    const UMAMI_WEBSITE_ID = '82d3cca2-6851-4c0e-a80f-6fa68ca6d565';
    const UMAMI_SCRIPT = 'https://cloud.umami.is/script.js';
    const SITE_HOSTS = ['gadgetsdxb.com', 'www.gadgetsdxb.com'];
    const SEARCH_DEBOUNCE_MS = 1500;

    function shouldLoad(websiteId, hostname) {
        return Boolean(websiteId) && SITE_HOSTS.includes(hostname);
    }

    function isAmazonLink(href) {
        try {
            const host = new URL(href).hostname.toLowerCase();
            return host === 'amzn.to' || host === 'amzn.eu' || host === 'amazon.ae' || host.endsWith('.amazon.ae');
        } catch (e) {
            return false;
        }
    }

    function amazonClickData(href, productId, page) {
        const data = { page: page || '/' };
        if (productId) data.product = productId;
        const asin = /\/dp\/([A-Z0-9]{10})/i.exec(href);
        if (asin) data.asin = asin[1].toUpperCase();
        return data;
    }

    function searchEventData(query, results) {
        const q = String(query || '').trim().toLowerCase().slice(0, 60);
        if (q.length < 2) return null;
        return { query: q, results: Number(results) || 0 };
    }

    // ?notrack excluye este navegador de las estadísticas (Umami respeta "umami.disabled"); ?track lo revierte
    function trackingFlag(search) {
        const params = new URLSearchParams(search || '');
        if (params.has('notrack')) return 'off';
        if (params.has('track')) return 'on';
        return null;
    }

    function applyTrackingFlag(win) {
        const flag = trackingFlag(win.location.search);
        try {
            if (flag === 'off') win.localStorage.setItem('umami.disabled', '1');
            if (flag === 'on') win.localStorage.removeItem('umami.disabled');
        } catch (e) { /* almacenamiento bloqueado: se ignora */ }
    }

    function init(win) {
        applyTrackingFlag(win);
        const doc = win.document;
        const pending = [];
        let searchTimer = null;

        function track(name, data) {
            if (win.umami && win.umami.track) win.umami.track(name, data);
            else pending.push([name, data]);
        }

        // Puntos de enganche que ya usan script.js y product-renderer.js
        win.analyticsTracker = {
            trackSearch(query, results) {
                const data = searchEventData(query, results);
                clearTimeout(searchTimer);
                if (data) searchTimer = setTimeout(() => track('search', data), SEARCH_DEBOUNCE_MS);
            },
            trackFavorite(id, title, action) {
                track('favorite', { product: id, action });
            }
        };

        if (!shouldLoad(UMAMI_WEBSITE_ID, win.location.hostname)) return;

        const s = doc.createElement('script');
        s.defer = true;
        s.src = UMAMI_SCRIPT;
        s.dataset.websiteId = UMAMI_WEBSITE_ID;
        s.dataset.domains = SITE_HOSTS.join(',');
        s.onload = () => pending.splice(0).forEach(([n, d]) => track(n, d));
        doc.head.appendChild(s);

        // Un solo listener para todos los enlaces a Amazon (tarjetas, posts, guías)
        doc.addEventListener('click', (e) => {
            const a = e.target.closest && e.target.closest('a[href]');
            if (!a || !isAmazonLink(a.href)) return;
            const card = a.closest('[data-product-id]');
            const productId = a.dataset.productId || (card && card.dataset.productId);
            track('amazon-click', amazonClickData(a.href, productId, win.location.pathname));
        }, true);
    }

    return { shouldLoad, isAmazonLink, amazonClickData, searchEventData, trackingFlag, init };
}));
