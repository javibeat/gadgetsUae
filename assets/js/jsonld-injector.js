/**
 * Injects structured data (ItemList + BreadcrumbList) from the live catalog.
 * No Offer/price data on purpose: prices are only shown on Amazon.ae.
 */
(function () {
    'use strict';
    const SITE = 'https://gadgetsdxb.com';

    function inject(data) {
        const s = document.createElement('script');
        s.type = 'application/ld+json';
        s.textContent = JSON.stringify(data);
        document.head.appendChild(s);
    }

    function product(p) {
        const out = { '@type': 'Product', name: p.title, brand: { '@type': 'Brand', name: p.brand }, category: p.category, url: p.url };
        if (p.image) out.image = /^https?:\/\//.test(p.image) ? p.image : SITE + '/' + p.image.replace(/^\//, '');
        if (p.blurb) out.description = p.blurb;
        return out;
    }

    document.addEventListener('DOMContentLoaded', () => {
        const catalog = window.CATALOG;
        if (!catalog || !window.Rotation || !window.Catalog) return;
        const body = document.body;
        const type = body.dataset.page;
        const catKey = body.dataset.category;

        let items = [];
        let name = 'GadgetsUAE curated picks';
        if (type === 'category' && catKey) {
            items = window.Rotation.dailyOrder(catalog.filter(p => p.category === catKey), new Date(), catKey).slice(0, 12);
            name = (window.Catalog.category(catKey) || {}).label + ' picks';
        } else if (type === 'home' || type === 'deals') {
            const deal = window.Rotation.dealOfDay(catalog, new Date());
            items = [deal].concat(window.Rotation.trending(catalog, 8, new Date(), deal ? [deal.id] : [])).filter(Boolean);
            name = "Today's picks on Amazon.ae";
        }
        if (items.length) {
            inject({
                '@context': 'https://schema.org', '@type': 'ItemList', name,
                itemListElement: items.map((p, i) => ({ '@type': 'ListItem', position: i + 1, item: product(p) }))
            });
        }

        const crumbs = Array.from(document.querySelectorAll('.breadcrumb a, .breadcrumb strong'));
        if (crumbs.length > 1) {
            inject({
                '@context': 'https://schema.org', '@type': 'BreadcrumbList',
                itemListElement: crumbs.map((el, i) => {
                    const item = { '@type': 'ListItem', position: i + 1, name: el.textContent.trim() };
                    if (el.href) item.item = el.href; else item.item = location.href.split('#')[0];
                    return item;
                })
            });
        }
    });
})();
