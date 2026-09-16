#!/usr/bin/env node
// Sitemap generator: core pages, category pages, guides and blog posts.
const fs = require('fs');
const path = require('path');
const Catalog = require('../assets/js/catalog.js');
const { GUIDES } = require('./site-content');

const ROOT = path.join(__dirname, '..');
const SITE = 'https://gadgetsdxb.com';
const now = new Date().toISOString().split('T')[0];

function listHtmlFiles(dir) {
    if (!fs.existsSync(dir)) return [];
    return fs.readdirSync(dir).filter(f => f.endsWith('.html')).sort();
}

function entry(loc, changefreq, priority) {
    return `    <url>\n        <loc>${loc}</loc>\n        <lastmod>${now}</lastmod>\n        <changefreq>${changefreq}</changefreq>\n        <priority>${priority}</priority>\n    </url>`;
}

function main() {
    const entries = [
        entry(SITE + '/', 'daily', '1.0'),
        entry(SITE + '/deals.html', 'daily', '0.9'),
        entry(SITE + '/products.html', 'daily', '0.9'),
        ...Catalog.CATEGORIES.map(c => entry(SITE + c.page, 'daily', '0.9')),
        entry(SITE + '/guides.html', 'weekly', '0.8'),
        ...GUIDES.map(g => entry(`${SITE}/guides/${g.slug}.html`, 'monthly', '0.8')),
        entry(SITE + '/blog.html', 'weekly', '0.7'),
        ...listHtmlFiles(path.join(ROOT, 'posts')).map(p => entry(SITE + '/posts/' + p, 'monthly', '0.6')),
        entry(SITE + '/about.html', 'monthly', '0.5'),
        entry(SITE + '/contact.html', 'monthly', '0.4'),
        entry(SITE + '/privacy.html', 'yearly', '0.2'),
        entry(SITE + '/terms.html', 'yearly', '0.2')
    ];
    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join('\n')}\n</urlset>\n`;
    fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), xml, 'utf8');
    console.log(`✓ sitemap.xml — ${entries.length} URLs`);
}

main();
