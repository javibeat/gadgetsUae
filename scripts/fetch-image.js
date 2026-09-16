#!/usr/bin/env node
/**
 * Download an official product image into assets/images/<id>/ so the site
 * picks it up automatically (see scripts/build-images.js).
 *
 *   node scripts/fetch-image.js <product-id> <page-or-image-url> [--image]
 *
 * Without --image the URL is treated as a manufacturer product page and the
 * og:image / twitter:image meta tag is used. Amazon domains are refused.
 * The file is validated (real image, >= 500px wide), resized to max 1400px
 * with macOS `sips`, and a SOURCE.txt records where it came from.
 */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15';

function die(msg) { console.error('✗ ' + msg); process.exit(1); }

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

function imageInfo(file) {
    const out = execFileSync('sips', ['-g', 'pixelWidth', '-g', 'pixelHeight', '-g', 'format', file], { encoding: 'utf8' });
    const get = (k) => (out.match(new RegExp(k + ': (\\S+)')) || [])[1];
    return { w: +get('pixelWidth'), h: +get('pixelHeight'), format: get('format') };
}

function main() {
    const [id, url, flag] = process.argv.slice(2);
    if (!id || !url) die('usage: fetch-image.js <id> <url> [--image]');
    const isAmazon = (u) => /amazon\.|amzn\.|media-amazon|ssl-images-amazon/i.test(u) && !/aboutamazon\.com/i.test(u); // press site is fine
    if (isAmazon(url)) die('Amazon URLs are not allowed');

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
    let info;
    try { info = imageInfo(tmp); } catch (e) { fs.unlinkSync(tmp); die('downloaded file is not an image: ' + imgUrl); }
    if (!info.w || info.w < 500) { fs.unlinkSync(tmp); die(`image too small (${info.w}x${info.h}): ${imgUrl}`); }

    let fmt = (info.format || '').toLowerCase();
    if (fmt === 'webp' || fmt === 'avif') { // sips cannot write these — convert with ImageMagick first
        execFileSync('magick', [tmp, tmp + '.png'], { stdio: 'ignore' });
        fs.renameSync(tmp + '.png', tmp);
        fmt = 'png';
    }
    const ext = fmt === 'png' ? 'png' : 'jpg';
    const existing = fs.readdirSync(dir).filter(f => /^\d+\.(jpe?g|png|webp)$/i.test(f)).length;
    const dest = path.join(dir, (existing + 1) + '.' + ext);
    const sipsArgs = ['-Z', '1400'];
    if (ext === 'jpg') sipsArgs.push('-s', 'format', 'jpeg', '-s', 'formatOptions', '82');
    execFileSync('sips', [...sipsArgs, tmp, '--out', dest], { stdio: 'ignore' });
    fs.unlinkSync(tmp);
    fs.appendFileSync(path.join(dir, 'SOURCE.txt'), `${path.basename(dest)}\t${imgUrl}\tfrom ${url}\t${new Date().toISOString().slice(0, 10)}\n`);
    const final = imageInfo(dest);
    const kb = Math.round(fs.statSync(dest).size / 1024);
    console.log(`✓ ${id} → ${path.relative(ROOT, dest)} (${final.w}x${final.h}, ${kb} KB) from ${imgUrl}`);
}

main();
