/**
 * Shared HTML fragments for generated pages (categories, guides).
 * Pure functions, no I/O — unit tested in tests/templates.test.js.
 */
const V = '7.0';
const SITE = 'https://gadgetsdxb.com';

function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}

function head({ title, description, path, image, extraHead, robots }) {
    const url = SITE + path;
    return `<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${esc(title)}</title>
    <meta name="description" content="${esc(description)}">
    <meta name="robots" content="${robots || 'index, follow, max-image-preview:large, max-snippet:-1'}">
    <link rel="canonical" href="${url}">
    <link rel="icon" type="image/x-icon" href="/favicon.ico">
    <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
    <meta property="og:title" content="${esc(title)}">
    <meta property="og:description" content="${esc(description)}">
    <meta property="og:type" content="website">
    <meta property="og:url" content="${url}">
    <meta property="og:image" content="${SITE}${image || '/assets/images/banners/products.jpg?v=7'}">
    <meta property="og:site_name" content="GadgetsUAE">
    <meta name="twitter:card" content="summary_large_image">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="/assets/css/style.css?v=${V}">
${extraHead || ''}</head>
`;
}

function searchOverlay() {
    return `
    <!-- Search Overlay -->
    <div class="search-overlay" id="searchOverlay">
        <div class="container">
            <div class="search-header">
                <div class="search-input-wrap">
                    <input type="text" id="searchOverlayInput" placeholder="Search 140+ products…" aria-label="Search">
                </div>
                <button class="search-close" id="closeSearch" aria-label="Close search">&times;</button>
            </div>
            <div id="searchSuggestions" class="search-suggestions"></div>
            <div class="search-results">
                <div class="products-grid" id="searchResultsContent"></div>
            </div>
        </div>
    </div>
`;
}

function scripts() {
    return `
    <script src="/assets/js/products.js?v=${V}"></script>
    <script src="/assets/data/catalog-items.js?v=${V}"></script>
    <script src="/assets/data/catalog-images.js?v=${V}"></script>
    <script src="/assets/js/catalog.js?v=${V}"></script>
    <script src="/assets/js/rotation.js?v=${V}"></script>
    <script src="/assets/js/product-renderer.js?v=${V}"></script>
    <script src="/assets/js/script.js?v=${V}"></script>
    <script src="/assets/js/page.js?v=${V}"></script>
    <script src="/assets/js/jsonld-injector.js?v=${V}"></script>
    <script type="module" src="/assets/js/analytics.js?v=${V}"></script>
`;
}

function faq(items, heading) {
    if (!items || !items.length) return '';
    return `
        <section class="section faq-section">
            <div class="container">
                <div class="section-header" style="display:block;text-align:center;margin-bottom:var(--s-xl)">
                    <h2>${esc(heading || 'Frequently asked questions')}</h2>
                </div>
                <div class="faq-list">
${items.map(f => `                    <details class="faq-item">
                        <summary>${esc(f.q)}</summary>
                        <div class="faq-answer">${esc(f.a)}</div>
                    </details>`).join('\n')}
                </div>
            </div>
        </section>`;
}

function faqJsonLd(items) {
    if (!items || !items.length) return '';
    const data = {
        '@context': 'https://schema.org', '@type': 'FAQPage',
        mainEntity: items.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } }))
    };
    return `    <script type="application/ld+json">${JSON.stringify(data)}</script>\n`;
}

function breadcrumb(trail) {
    return `<nav class="breadcrumb" aria-label="Breadcrumb">${trail.map((t, i) =>
        i === trail.length - 1 ? `<strong>${esc(t.label)}</strong>` : `<a href="${t.href}">${esc(t.label)}</a> <span class="separator">/</span>`
    ).join(' ')}</nav>`;
}

function page({ title, description, path, image, extraHead, bodyAttrs, main, robots }) {
    return head({ title, description, path, image, extraHead, robots }) +
`<body${bodyAttrs ? ' ' + bodyAttrs : ''}>
    <div id="menu-include"></div>

    <main>
${main}
    </main>
${searchOverlay()}
    <div id="footer-include"></div>
${scripts()}</body>

</html>
`;
}

module.exports = { V, SITE, esc, head, searchOverlay, scripts, faq, faqJsonLd, breadcrumb, page };
