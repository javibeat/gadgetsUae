#!/usr/bin/env node
/**
 * Writes menu.html and footer.html into every page's #menu-include / #footer-include,
 * so the navigation and footer links are in the static HTML (crawlers and AI readers
 * that don't run JavaScript see them). Idempotent: re-running replaces the previous copy.
 * script.js detects the pre-filled markup and skips its fetch.
 * Run: node scripts/inline-includes.js (part of `npm run build`).
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

/** Replace the contents of <div id="<name>-include"> with the given fragment. Pure, unit tested. */
function inlineInclude(html, name, fragment) {
    const re = new RegExp(`<div id="${name}-include">(?:<!--include:${name}-->[\\s\\S]*?<!--/include:${name}-->)?</div>`, 'g');
    return html.replace(re, () => `<div id="${name}-include"><!--include:${name}-->\n${fragment.trim()}\n<!--/include:${name}--></div>`);
}

function htmlFiles() {
    const dirs = ['', 'guides', 'posts'];
    return dirs.flatMap(d => fs.readdirSync(path.join(ROOT, d))
        .filter(f => f.endsWith('.html') && !['menu.html', 'footer.html'].includes(f))
        .map(f => path.join(d, f)));
}

function main() {
    const menu = fs.readFileSync(path.join(ROOT, 'menu.html'), 'utf8');
    const footer = fs.readFileSync(path.join(ROOT, 'footer.html'), 'utf8');
    let changed = 0;
    for (const rel of htmlFiles()) {
        const file = path.join(ROOT, rel);
        const before = fs.readFileSync(file, 'utf8');
        const after = inlineInclude(inlineInclude(before, 'menu', menu), 'footer', footer);
        if (after !== before) { fs.writeFileSync(file, after); changed++; }
    }
    console.log(`✓ menu + footer inlined (${changed} pages updated)`);
}

if (require.main === module) main();

module.exports = { inlineInclude };
