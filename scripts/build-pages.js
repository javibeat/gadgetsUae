#!/usr/bin/env node
/**
 * Generates category pages, buying guides and the guides index from
 * scripts/site-content.js. Run: npm run build:pages
 */
const fs = require('fs');
const path = require('path');
const T = require('./site-templates');
const { CATEGORY_PAGES, GUIDES } = require('./site-content');
const Catalog = require('../assets/js/catalog.js');
const { CATALOG_ITEMS } = require('../assets/data/catalog-items.js');
const { discover } = require('./build-images.js');

const ROOT = path.join(__dirname, '..');
const legacySrc = fs.readFileSync(path.join(ROOT, 'assets/js/products.js'), 'utf8');
const legacy = new Function(legacySrc.replace('window.products = products;', 'return products;'))();
const catalog = Catalog.build(CATALOG_ITEMS, legacy, discover(CATALOG_ITEMS.map(p => p.id).concat(legacy.map(p => p.id))));
const byId = Object.fromEntries(catalog.map(p => [p.id, p]));

function write(rel, html) {
    fs.writeFileSync(path.join(ROOT, rel), html);
    console.log('✓', rel);
}

/* ---------- Category pages ---------- */
function categoryPage(cat, content) {
    const count = catalog.filter(p => p.category === cat.key).length;
    const guides = GUIDES.filter(g => g.category === cat.key);
    const main = `
        <div class="container">
            ${T.breadcrumb([{ label: 'Home', href: '/' }, { label: content.h1 }])}
        </div>

        <section class="category-hero">
            <div class="container">
                <div class="eyebrow">${cat.label} · <span data-catalog-count>${count}</span> curated picks</div>
                <h1>${T.esc(content.h1)}</h1>
                <p>${T.esc(content.intro)}</p>
            </div>
        </section>

        <section class="section tight">
            <div class="container">
                <div class="section-header">
                    <div class="section-title-row"><h2>Today's spotlight</h2><span class="section-tag">Rotates daily</span></div>
                </div>
                <div class="products-grid cols-3" id="category-spotlight"></div>
            </div>
        </section>

        <section class="section tight">
            <div class="container">
                <div class="section-header">
                    <h2>All ${T.esc(content.h1.toLowerCase())} picks</h2>
                    <span class="result-count"><span data-result-count>${count}</span> shown</span>
                </div>
                <div class="filter-bar" id="filter-bar"></div>
                <div class="products-grid stagger" id="category-products-grid"></div>
                <div class="view-more-wrap">
                    <a href="https://www.amazon.ae/s?k=${encodeURIComponent(content.amazonQuery)}&tag=${Catalog.TAG}" class="btn-outline" target="_blank" rel="sponsored noopener noreferrer">Browse more on Amazon.ae &#8594;</a>
                </div>
            </div>
        </section>
${guides.length ? `
        <section class="section tight">
            <div class="container">
                <div class="section-header"><h2>Buying guides</h2><a href="/guides.html" class="view-all">All guides &#8594;</a></div>
                <div class="guides-grid">
${guides.map(g => guideCard(g)).join('\n')}
                </div>
            </div>
        </section>` : ''}
${T.faq(content.faq)}`;

    return T.page({
        title: content.title,
        description: content.description,
        path: cat.page,
        extraHead: T.faqJsonLd(content.faq),
        bodyAttrs: `data-page="category" data-category="${cat.key}"`,
        main
    });
}

function guideCard(g) {
    return `                    <a class="guide-card" href="/guides/${g.slug}.html">
                        <span class="eyebrow">Buying guide</span>
                        <h3>${T.esc(g.title)}</h3>
                        <p>${T.esc(g.quick)}</p>
                        <span class="link">Read the guide &#8594;</span>
                    </a>`;
}

/* ---------- Guide pages ---------- */
function guidePage(g) {
    const cat = Catalog.category(g.category);
    const missing = g.picks.filter(p => !byId[p.id]).map(p => p.id);
    if (missing.length) throw new Error(`Guide ${g.slug} references unknown products: ${missing.join(', ')}`);
    const others = GUIDES.filter(x => x.slug !== g.slug).slice(0, 3);
    const itemList = {
        '@context': 'https://schema.org', '@type': 'ItemList', name: g.title,
        itemListElement: g.picks.map((p, i) => ({ '@type': 'ListItem', position: i + 1, name: byId[p.id].title, url: byId[p.id].url }))
    };
    const main = `
        <div class="container">
            ${T.breadcrumb([{ label: 'Home', href: '/' }, { label: 'Guides', href: '/guides.html' }, { label: g.title }])}
        </div>

        <section class="category-hero guide-hero">
            <div class="container">
                <div class="eyebrow">Buying guide · <a href="${cat.page}">${cat.label}</a> · Updated September 2026</div>
                <h1>${T.esc(g.title)}</h1>
                <p>${T.esc(g.intro)}</p>
                <div class="quick-answer"><strong>Quick answer</strong><span>${T.esc(g.quick)}</span></div>
            </div>
        </section>

        <section class="section tight">
            <div class="container guide-picks">
${g.picks.map((p, i) => `                <div class="guide-pick">
                    <div class="guide-pick-text">
                        <span class="guide-rank">${String(i + 1).padStart(2, '0')}</span>
                        <h2>${T.esc(byId[p.id].title)}</h2>
                        <p>${T.esc(p.why)}</p>
                    </div>
                    <div class="guide-pick-card" data-pick="${p.id}"></div>
                </div>`).join('\n')}
            </div>
        </section>

        <section class="section tight">
            <div class="container">
                <div class="section-header"><h2>More from ${cat.label}</h2><a href="${cat.page}" class="view-all">View all &#8594;</a></div>
                <div class="products-grid" id="guide-related" data-category="${cat.key}" data-exclude="${g.picks.map(p => p.id).join(',')}"></div>
            </div>
        </section>
${T.faq(g.faq)}
        <section class="section tight">
            <div class="container">
                <div class="section-header"><h2>Other guides</h2><a href="/guides.html" class="view-all">All guides &#8594;</a></div>
                <div class="guides-grid">
${others.map(guideCard).join('\n')}
                </div>
            </div>
        </section>`;

    return T.page({
        title: g.seoTitle,
        description: g.description,
        path: `/guides/${g.slug}.html`,
        extraHead: T.faqJsonLd(g.faq) + `    <script type="application/ld+json">${JSON.stringify(itemList)}</script>\n`,
        bodyAttrs: `data-page="guide" data-category="${g.category}"`,
        main
    });
}

function guidesIndex() {
    const main = `
        <div class="container">
            <section class="page-hero">
                <div class="eyebrow">Buying guides</div>
                <h1>What to buy, without the noise</h1>
                <p>Short, opinionated guides for UAE shoppers. Each one names a clear pick per budget and links straight to Amazon.ae.</p>
            </section>
            <section class="section tight">
                <div class="guides-grid">
${GUIDES.map(guideCard).join('\n')}
                </div>
            </section>
        </div>`;
    return T.page({
        title: 'Tech Buying Guides for UAE Shoppers 2026 | GadgetsUAE',
        description: 'Opinionated buying guides for the UAE: best earbuds, headphones, consoles, laptops, robot vacuums, smartwatches, chargers and 3D printers on Amazon.ae.',
        path: '/guides.html',
        bodyAttrs: 'data-page="guides"',
        main
    });
}

/* ---------- Hand-designed pages that share the template ---------- */
function productsPage() {
    return T.page({
        title: 'All Products — ' + catalog.length + ' Hand-Picked Gadgets on Amazon.ae | GadgetsUAE',
        description: 'Browse every curated product on GadgetsUAE. Filter by category, budget and brand; gaming, phones, audio, laptops, smart home, wearables and accessories with Prime delivery in the UAE.',
        path: '/products.html', bodyAttrs: 'data-page="products"',
        main: `
        <div class="container">
            <section class="page-hero">
                <div class="eyebrow">Full catalog</div>
                <h1>All products</h1>
                <p>Every pick in one place. Filter by category, budget or brand, or search. The order reshuffles daily so nothing gets buried.</p>
            </section>

            <section class="section tight">
                <h2 class="sr-only">Products</h2>
                <div class="toolbar">
                    <label class="catalog-search">
                        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
                        <input type="search" id="catalog-search" placeholder="Search brand, model or type…" aria-label="Search the catalog" autocomplete="off">
                    </label>
                    <span class="result-count"><span data-result-count>${catalog.length}</span> products</span>
                </div>
                <div class="filter-bar" id="filter-bar"></div>
                <div class="products-grid stagger" id="all-products-grid"></div>
                <div class="view-more-wrap">
                    <a href="https://www.amazon.ae/s?k=electronics&tag=${Catalog.TAG}" class="btn-outline" target="_blank" rel="sponsored noopener noreferrer">Browse Amazon.ae electronics &#8594;</a>
                </div>
            </section>
        </div>`
    });
}

function dealsPage() {
    return T.page({
        title: "Today's Picks — Pick of the Day & Trending Tech in UAE | GadgetsUAE",
        description: "Today's pick of the day plus twelve fresh product picks from Amazon.ae, reshuffled every midnight UAE. Gaming, phones, audio, laptops, smart home and more.",
        path: '/deals.html', bodyAttrs: 'data-page="deals"',
        main: `
        <div class="container">
            <section class="page-hero">
                <div class="eyebrow">Today · <span data-day-label></span></div>
                <h1>Today's picks</h1>
                <p>A new pick of the day and twelve fresh suggestions every midnight UAE. Prices and stock are live on Amazon.ae.</p>
            </section>

            <section class="section tight">
                <div id="deal-of-day" aria-live="polite"></div>
            </section>

            <section class="section tight">
                <div class="section-header">
                    <div class="section-title-row"><h2>Twelve for today</h2><span class="section-tag">Rotates daily</span></div>
                    <a href="/products.html" class="view-all">All products &#8594;</a>
                </div>
                <div class="products-grid stagger" id="container-today"></div>
            </section>

            <section class="section tight">
                <div class="section-header">
                    <div class="section-title-row"><h2>Trending this week</h2><span class="section-tag">Refreshes Mondays</span></div>
                </div>
                <div class="products-grid stagger" id="container-trending"></div>
            </section>

            <section class="section tight">
                <div class="deals-banner">
                    <div class="deals-banner-text">
                        <h3>Amazon Prime UAE</h3>
                        <p>Free same-day delivery in Dubai and Abu Dhabi, Prime Video and early access to sales.</p>
                    </div>
                    <a href="https://amzn.to/3Tn9NkR" target="_blank" rel="sponsored noopener noreferrer" class="cta-btn">Try Prime free &#8594;</a>
                </div>
            </section>
        </div>`
    });
}

function favoritesPage() {
    return T.page({
        title: 'Your Favourites | GadgetsUAE',
        description: 'Products you saved on GadgetsUAE.',
        path: '/favoritos.html', bodyAttrs: 'data-page="favorites"', robots: 'noindex, follow',
        main: `
        <div class="container">
            <section class="page-hero">
                <div class="eyebrow">Saved on this device</div>
                <h1>Your favourites</h1>
                <p>Products you tapped the heart on. They are stored in this browser only.</p>
            </section>
            <section class="section tight">
                <div class="products-grid" id="favoritesGrid"></div>
            </section>
        </div>`
    });
}

function notFoundPage() {
    return T.page({
        title: 'Page not found | GadgetsUAE', description: 'That page does not exist. Here are some picks instead.',
        path: '/404.html', bodyAttrs: 'data-page="notfound"', robots: 'noindex, follow',
        main: `
        <div class="container">
            <section class="page-hero">
                <div class="eyebrow">Error 404</div>
                <h1>That page has moved on</h1>
                <p>The link is old or mistyped. Try the <a href="/products.html">full catalog</a>, <a href="/guides.html">buying guides</a> or today's picks below.</p>
            </section>
            <section class="section tight">
                <div class="section-header"><div class="section-title-row"><h2>Trending this week</h2></div><a href="/deals.html" class="view-all">Today's picks &#8594;</a></div>
                <div class="products-grid" id="container-trending"></div>
            </section>
        </div>`
    });
}

write('404.html', notFoundPage());
write('products.html', productsPage());
write('deals.html', dealsPage());
write('favoritos.html', favoritesPage());

Catalog.CATEGORIES.forEach(cat => {
    const content = CATEGORY_PAGES[cat.key];
    if (!content) throw new Error('No page content for category ' + cat.key);
    write(cat.page.replace(/^\//, ''), categoryPage(cat, content));
});
GUIDES.forEach(g => write(`guides/${g.slug}.html`, guidePage(g)));
write('guides.html', guidesIndex());
console.log(`Done: ${Catalog.CATEGORIES.length} categories, ${GUIDES.length} guides, ${catalog.length} products in catalog.`);
