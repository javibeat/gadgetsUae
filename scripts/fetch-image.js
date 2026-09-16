#!/usr/bin/env node
/**
 * Download an official product image into assets/images/<id>/ so the site
 * picks it up automatically (see scripts/build-images.js).
 *
 *   node scripts/fetch-image.js <product-id> <page-or-image-url> [--image]
 *
 * Without --image the URL is treated as a manufacturer product page and the
 * og:image / twitter:image meta tag is used. Amazon store domains are refused
 * (the aboutamazon.com press site is fine). The file is validated (real image,
 * >= 500px wide), resized to max 1400px and saved as WebP when that is smaller,
 * and a SOURCE.txt line records where it came from. Works on macOS and Linux
 * (uses the `sharp` dev dependency, no system tools needed).
 */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const sharp = require('sharp');

const ROOT = path.join(__dirname, '..');
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15';

function die(msg) { console.error('✗ ' + msg); process.exit(1); }

function isAmazon(u) { return /amazon\.|amzn\.|media-amazon|ssl-images-amazon/i.test(u) && !/aboutamazon\.com/i.test(u); }

function curl(url, out) {
    const args = ['-sSL', '--max-time', '40', '-A', UA, '-H', 'Accept: text/html,image/*,*/*', url];
    if (out) args.push('-o', out);
    return execFileSync('curl', args, { encoding: out ? 'buffer' : 'utf8', maxBuffer: 50 * 1024 * 1024 });
}

function ogImage(html, pageUrl) {
    const metas = html.match(/<meta[^>]+>/gi) || [];
    const pick = (prop) => {
        for (const m of metas) {
            if (new RegExp('(property|name)=["\']' + prop + '["\']', 'i').test(m)) {
                const c = m.match(/content=["']([^"']+)["']/i);
                if (c) return c[1];
            }
        }
        return null;
    };
    let src = pick('og:image:secure_url') || pick('og:image') || pick('twitter:image') || pick('twitter:image:src');
    if (!src) return null;
    src = src.replace(/&amp;/g, '&');
    try { return new URL(src, pageUrl).href; } catch (e) { return null; }
}

async function main() {
    const [id, url, flag] = process.argv.slice(2);
    if (!id || !url) die('usage: fetch-image.js <id> <url> [--image]');
    if (isAmazon(url)) die('Amazon store URLs are not allowed');

    let imgUrl = url;
    if (flag !== '--image') {
        const html = curl(url);
        imgUrl = ogImage(html, url);
        if (!imgUrl) die('no og:image found on ' + url);
        if (isAmazon(imgUrl)) die('og:image points to Amazon');
    }

    const dir = path.join(ROOT, 'assets/images', id);
    fs.mkdirSync(dir, { recursive: true });
    const tmp = path.join(dir, '.download');
    curl(imgUrl, tmp);

    let meta;
    try { meta = await sharp(tmp).metadata(); } catch (e) { fs.unlinkSync(tmp); die('downloaded file is not an image: ' + imgUrl); }
    if (!meta.width || meta.width < 500) { fs.unlinkSync(tmp); die(`image too small (${meta.width}x${meta.height}): ${imgUrl}`); }

    const existing = fs.readdirSync(dir).filter(f => /^\d+\.(jpe?g|png|webp)$/i.test(f)).length;
    const base = path.join(dir, String(existing + 1));
    const pipeline = sharp(tmp).rotate().resize({ width: 1400, height: 1400, fit: 'inside', withoutEnlargement: true });
    const webp = await pipeline.clone().webp({ quality: 82 }).toBuffer();
    const hasAlpha = !!meta.hasAlpha;
    const alt = hasAlpha ? await pipeline.clone().png({ compressionLevel: 9 }).toBuffer() : await pipeline.clone().jpeg({ quality: 84, mozjpeg: true }).toBuffer();
    const useWebp = webp.length < alt.length * 0.85 || alt.length > 400 * 1024;
    const dest = base + (useWebp ? '.webp' : (hasAlpha ? '.png' : '.jpg'));
    fs.writeFileSync(dest, useWebp ? webp : alt);
    fs.unlinkSync(tmp);
    fs.appendFileSync(path.join(dir, 'SOURCE.txt'), `${path.basename(dest)}\t${imgUrl}\tfrom ${url}\t${new Date().toISOString().slice(0, 10)}\n`);
    const final = await sharp(dest).metadata();
    console.log(`✓ ${id} → ${path.relative(ROOT, dest)} (${final.width}x${final.height}, ${Math.round(fs.statSync(dest).size / 1024)} KB) from ${imgUrl}`);
}

main().catch(e => die(e.message));
