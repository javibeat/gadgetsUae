#!/usr/bin/env node
// Sitemap generator: includes all static pages, category pages, and product posts
const fs = require('fs');
const path = require('path');
const sitemapPath = path.join(__dirname, '..', 'sitemap.xml');
const postsDir = path.join(__dirname, '..', 'posts');
const now = new Date().toISOString().split('T')[0];

function listHtmlFiles(dir) {
    if (!fs.existsSync(dir)) return [];
    return fs.readdirSync(dir).filter(f => f.endsWith('.html'));
}

function buildUrlEntry(loc, lastmod, changefreq = 'monthly', priority = '0.8') {
    return `    <url>\n        <loc>${loc}</loc>\n        <lastmod>${lastmod}</lastmod>\n        <changefreq>${changefreq}</changefreq>\n        <priority>${priority}</priority>\n    </url>`;
}

function main() {
    const site = 'https://gadgetsdxb.com';
    const posts = listHtmlFiles(postsDir);

    const entries = [
        // Core pages
        buildUrlEntry(site + '/', now, 'daily', '1.0'),
        buildUrlEntry(site + '/products.html', now, 'daily', '0.9'),
        buildUrlEntry(site + '/deals.html', now, 'daily', '0.9'),

        // Category pages
        buildUrlEntry(site + '/gaming.html', now, 'daily', '0.9'),
        buildUrlEntry(site + '/mobiles.html', now, 'daily', '0.9'),
        buildUrlEntry(site + '/audio.html', now, 'daily', '0.9'),
        buildUrlEntry(site + '/tech.html', now, 'daily', '0.9'),
        buildUrlEntry(site + '/smarthome.html', now, 'daily', '0.9'),
        buildUrlEntry(site + '/3d-printing.html', now, 'daily', '0.9'),

        // Content pages
        buildUrlEntry(site + '/blog.html', now, 'weekly', '0.8'),
        buildUrlEntry(site + '/favoritos.html', now, 'weekly', '0.7'),
        buildUrlEntry(site + '/about.html', now, 'monthly', '0.6'),
        buildUrlEntry(site + '/contact.html', now, 'monthly', '0.5'),
        buildUrlEntry(site + '/privacy.html', now, 'yearly', '0.3'),
        buildUrlEntry(site + '/terms.html', now, 'yearly', '0.3'),
    ];

    // Product post pages
    const postEntries = posts.map(p => buildUrlEntry(site + '/posts/' + p, now, 'weekly', '0.8'));

    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join('\n')}\n${postEntries.join('\n')}\n</urlset>`;

    fs.writeFileSync(sitemapPath, xml, 'utf8');
    console.log(`Sitemap regenerated: ${entries.length + postEntries.length} URLs`);
}

main();
