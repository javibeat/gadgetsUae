#!/usr/bin/env node
// Simple sitemap updater: updates lastmod for homepage and writes entries for product posts listed in posts/.
const fs = require('fs');
const path = require('path');
const sitemapPath = path.join(__dirname,'..','sitemap.xml');
const postsDir = path.join(__dirname,'..','posts');
const now = new Date().toISOString().split('T')[0];

function listHtmlFiles(dir){
  return fs.readdirSync(dir).filter(f=>f.endsWith('.html'));
}

function buildUrlEntry(loc, lastmod, changefreq='monthly', priority='0.8'){
  return `    <url>\n        <loc>${loc}</loc>\n        <lastmod>${lastmod}</lastmod>\n        <changefreq>${changefreq}</changefreq>\n        <priority>${priority}</priority>\n    </url>`;
}

function main(){
  const site = 'https://gadgetsdxb.com';
  const posts = listHtmlFiles(postsDir);

  const staticEntries = [
    buildUrlEntry(site+'/', now, 'daily','1.0'),
    buildUrlEntry(site+'/favoritos.html', now, 'weekly','0.8'),
    buildUrlEntry(site+'/products.html', now, 'daily','0.9'),
    buildUrlEntry(site+'/deals.html', now, 'daily','0.9'),
    buildUrlEntry(site+'/about.html', now, 'monthly','0.7'),
    buildUrlEntry(site+'/contact.html', now, 'monthly','0.6'),
    buildUrlEntry(site+'/privacy.html', now, 'yearly','0.5'),
    buildUrlEntry(site+'/terms.html', now, 'yearly','0.5'),
  ];

  const postEntries = posts.map(p=> buildUrlEntry(site+'/posts/'+p, now, 'monthly','0.8'));

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${staticEntries.join('\n')}\n${postEntries.join('\n')}\n</urlset>`;

  fs.writeFileSync(sitemapPath, xml, 'utf8');
  console.log('Sitemap regenerated at', sitemapPath);
}

main();
