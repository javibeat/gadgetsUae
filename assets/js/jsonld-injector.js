// Inject JSON-LD Product, ItemList, and BreadcrumbList from prices.json and window.products
(function(){
    function isoDatePlusDays(days) {
        const d = new Date();
        d.setDate(d.getDate() + days);
        return d.toISOString().split('T')[0];
    }

    function createScript(json) {
        const s = document.createElement('script');
        s.type = 'application/ld+json';
        s.textContent = JSON.stringify(json);
        document.head.appendChild(s);
    }

    function extractBrand(title) {
        const brands = ['Samsung', 'Apple', 'Sony', 'Nintendo', 'Amazon', 'Xiaomi', 'Bambu Lab', 'Nespresso', 'JBL', 'Bose', 'SanDisk', 'Elgato', 'HP', 'Dell', 'Lenovo', 'ASUS', 'Logitech'];
        for (const brand of brands) {
            if (title.toLowerCase().includes(brand.toLowerCase())) return brand;
        }
        return title.split(' ')[0] || '';
    }

    function buildProductLd(product, priceData) {
        const brand = extractBrand(product.title);
        const price = priceData && priceData.current ? priceData.current : product.price.replace(/[^0-9.]/g, '');

        const ld = {
            '@context': 'https://schema.org',
            '@type': 'Product',
            'name': product.title,
            'image': product.gallery && product.gallery.length
                ? product.gallery.map(p => location.origin + '/' + p.replace(/^\//, ''))
                : [location.origin + '/' + product.image.replace(/^\//, '')],
            'description': product.description || product.title,
            'sku': product.asin || product.id,
            'brand': {
                '@type': 'Brand',
                'name': brand
            },
            'offers': {
                '@type': 'Offer',
                'url': product.url,
                'priceCurrency': 'AED',
                'price': price,
                'priceValidUntil': isoDatePlusDays(60),
                'availability': 'https://schema.org/InStock',
                'seller': {
                    '@type': 'Organization',
                    'name': 'Amazon.ae'
                }
            }
        };

        return ld;
    }

    function buildItemList(products, prices) {
        return {
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            'itemListElement': products.map((p, i) => {
                const price = prices[p.id] || null;
                return {
                    '@type': 'ListItem',
                    'position': i + 1,
                    'item': {
                        '@type': 'Product',
                        'name': p.title,
                        'image': location.origin + '/' + p.image.replace(/^\//, ''),
                        'offers': {
                            '@type': 'Offer',
                            'priceCurrency': 'AED',
                            'price': price ? price.current : p.price.replace(/[^0-9.]/g, ''),
                            'priceValidUntil': isoDatePlusDays(60),
                            'availability': 'https://schema.org/InStock',
                            'url': p.url
                        }
                    }
                };
            })
        };
    }

    function buildBreadcrumb(pathSegments) {
        return {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            'itemListElement': pathSegments.map((seg, i) => ({
                '@type': 'ListItem',
                'position': i + 1,
                'name': seg.name,
                'item': seg.url
            }))
        };
    }

    document.addEventListener('DOMContentLoaded', () => {
        if (!window.products) return;

        fetch('/assets/data/prices.json')
            .then(r => r.json())
            .then(prices => {
                try {
                    // Inject ItemList for home page
                    const isHome = document.body.id === 'index';
                    if (isHome) {
                        const itemList = buildItemList(window.products.slice(0, 10), prices);
                        createScript(itemList);
                    }

                    // Inject BreadcrumbList for category pages
                    const categoryBody = document.body.dataset.category;
                    if (categoryBody) {
                        const bc = buildBreadcrumb([
                            { name: 'Home', url: location.origin + '/' },
                            { name: categoryBody, url: location.href }
                        ]);
                        createScript(bc);
                    }

                    // Inject Product JSON-LD for product post pages
                    const postBody = document.querySelector('body.post');
                    if (postBody && postBody.dataset.productId) {
                        const pid = postBody.dataset.productId;
                        const prod = window.products.find(p => p.id === pid);
                        const priceData = prices[pid] || null;
                        if (prod) {
                            createScript(buildProductLd(prod, priceData));
                            createScript(buildBreadcrumb([
                                { name: 'Home', url: location.origin + '/' },
                                { name: prod.category, url: location.origin + '/' },
                                { name: prod.title, url: location.href }
                            ]));
                        }
                    }
                } catch(e) {
                    console.error('JSON-LD injector error', e);
                }
            })
            .catch(err => console.warn('Failed to load prices.json for JSON-LD', err));
    });
})();
