// Build the final clone from crawl output:
// - copy raw HTML pages to clone/
// - copy captured assets to clone/assets/
// - rewrite all page links + asset URLs to local relative paths
// - rewrite url(...) in CSS files
// - strip Cloudflare challenge scripts and analytics
import * as cheerio from 'cheerio';
import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

const ROOT = 'https://connect-transit.com';
const ROOT_HOST = new URL(ROOT).host;
const SITE = path.resolve('../clone');
const ASSETS_DST = path.join(SITE, 'assets');
const SRC = path.resolve(process.argv[2] || 'site2');
const SRC_ASSETS = path.join(SRC, '_assets');

await fs.rm(SITE, { recursive: true, force: true });
await fs.mkdir(ASSETS_DST, { recursive: true });

const manifest = JSON.parse(await fs.readFile('manifest.json', 'utf8'));

// Page URL -> local html path (in clone/)
const pageUrlToLocal = new Map();
for (const p of manifest.pages) {
  // skip pages that captured CF challenge content
  const file = path.join(SRC, p.file);
  let head = '';
  try { head = (await fs.readFile(file, 'utf8')).slice(0, 800); } catch {}
  if (/just a moment/i.test(head)) {
    console.log(`  SKIP page (CF challenge captured): ${p.url}`);
    continue;
  }
  pageUrlToLocal.set(p.url, path.join(SITE, p.file));
}

function pageLocalForUrl(absUrl) {
  if (!absUrl) return null;
  let u;
  try { u = new URL(absUrl); } catch { return null; }
  u.hash = '';
  for (const k of ['utm_source','utm_medium','utm_campaign','utm_term','utm_content','fbclid','gclid']) {
    u.searchParams.delete(k);
  }
  const candidates = [
    u.toString(),
    u.toString().replace(/\/$/, ''),
    u.toString() + '/',
  ];
  for (const c of candidates) if (pageUrlToLocal.has(c)) return pageUrlToLocal.get(c);
  return null;
}

// Asset URL -> local asset path (in clone/assets/)
// Sources: wayback's `site2/_assets` (manifest) + the earlier live crawl's
// `site/_assets` (which had the real CSS bundles before our IP got blocked).
const assetUrlToLocal = new Map();

// Helper to copy a host-relative asset directory tree into the clone
async function ingestAssetTree(rootDir) {
  if (!existsSync(rootDir)) return 0;
  let count = 0;
  async function walk(d) {
    for (const e of await fs.readdir(d, { withFileTypes: true })) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) { await walk(p); continue; }
      const rel = path.relative(rootDir, p);
      // Filter out cloudflare and analytics noise
      if (/cdn-cgi\/challenge-platform/.test(rel)) continue;
      if (/^challenges\.cloudflare\.com/i.test(rel)) continue;
      if (/^static\.cloudflareinsights\.com/i.test(rel)) continue;
      if (/^translate(\.|-pa\.)/i.test(rel) || /^www\.gstatic\.com\b/i.test(rel) || /^www\.google\.com\b/i.test(rel)) continue;
      if (/userway/i.test(rel)) continue;
      if (/connect-transit\.com\/modules\/seo\/analytics/.test(rel)) continue;
      const dst = path.join(ASSETS_DST, rel);
      await fs.mkdir(path.dirname(dst), { recursive: true });
      try { await fs.copyFile(p, dst); } catch { continue; }
      count++;
      const parts = rel.split(path.sep);
      const host = parts.shift();
      const pathPart = '/' + parts.join('/');
      const cleaned = pathPart.replace(/_q[0-9a-f]{6}(\.[a-z0-9]+)?$/i, '$1');
      const baseUrl = `https://${host}${cleaned}`;
      assetUrlToLocal.set(baseUrl, dst);
      // Also register the URL with the extension stripped — the live site
      // serves the same image at /image/N/M (no ext), and that's how the HTML
      // refers to it.
      const noExt = baseUrl.replace(/\.(png|jpg|jpeg|svg|gif|webp|avif)$/i, '');
      if (noExt !== baseUrl && !assetUrlToLocal.has(noExt)) {
        assetUrlToLocal.set(noExt, dst);
      }
    }
  }
  await walk(rootDir);
  return count;
}

// First, copy all assets that came with the manifest (from wayback)
for (const a of manifest.assets) {
  const srcPath = path.join(SRC, a.file);            // e.g. site2/_assets/connect-transit.com/.../foo.css
  const rel = path.relative(SRC_ASSETS, srcPath);     // connect-transit.com/.../foo.css
  if (rel.startsWith('..')) continue;
  // Skip Cloudflare challenge platform junk
  if (/cdn-cgi\/challenge-platform/.test(rel)) continue;
  if (/^challenges\.cloudflare\.com/i.test(rel)) continue;
  if (/^static\.cloudflareinsights\.com/i.test(rel)) continue;
  if (/^translate\.google/i.test(rel) || /^translate-pa\.googleapis/i.test(rel)) continue;
  if (/^www\.google\.com\b/i.test(rel) || /^www\.gstatic\.com\b/i.test(rel)) continue;
  if (/userway/i.test(rel)) continue;
  // Skip the SEO analytics module (it's a tracker)
  if (/connect-transit\.com\/modules\/seo\/analytics/.test(rel)) continue;

  const dst = path.join(ASSETS_DST, rel);
  await fs.mkdir(path.dirname(dst), { recursive: true });
  try {
    await fs.copyFile(srcPath, dst);
  } catch (e) {
    console.log(`  copy fail ${a.url}: ${e.message}`);
    continue;
  }
  assetUrlToLocal.set(a.url, dst);
}

// Then, ingest the earlier live-crawl asset tree to fill in CSS bundles + JS
// + key images that wayback didn't archive.
const liveCrawlAssets = path.resolve('site/_assets');
const liveAdded = await ingestAssetTree(liveCrawlAssets);

// Rename .scss → .css so static servers serve them with text/css MIME.
// The original site served scss files compiled-to-css under the .scss URL.
console.log('--- Renaming .scss → .css ---');
{
  const updated = new Map();
  for (const [url, local] of assetUrlToLocal) {
    let nu = url, nl = local;
    if (/\.scss(\?|$)/i.test(url) || /\.scss$/i.test(local)) {
      const newUrl = url.replace(/\.scss(\?|$)/i, '.css$1');
      const newLocal = local.replace(/\.scss$/i, '.css');
      try {
        await fs.rename(local, newLocal);
        nu = newUrl;
        nl = newLocal;
      } catch {}
    }
    updated.set(nu, nl);
  }
  assetUrlToLocal.clear();
  for (const [k, v] of updated) assetUrlToLocal.set(k, v);
  // also accept lookups against the original .scss URL by registering both forms
  for (const [url, local] of [...assetUrlToLocal]) {
    if (/\.css$/.test(local)) {
      const scssUrl = url.replace(/\.css(\?|$)/, '.scss$1');
      if (!assetUrlToLocal.has(scssUrl)) assetUrlToLocal.set(scssUrl, local);
    }
  }
}

console.log(`Pages: ${pageUrlToLocal.size}, assets: ${assetUrlToLocal.size} (+${liveAdded} from live)`);

function rel(fromFile, toFile) {
  const r = path.relative(path.dirname(fromFile), toFile).split(path.sep).join('/');
  return r || './';
}

const SKIP_HOST = /(google-analytics|googletagmanager|doubleclick|facebook\.com|hotjar|clarity\.ms|userway|cdn77\.api|cloudflareinsights|challenges\.cloudflare\.com|recaptcha|translate\.google|translate-pa\.googleapis)/i;

// Rewrite CSS url(...) and @import to point at local assets
function rewriteCss(css, baseUrl, cssLocalPath) {
  let out = css.replace(/url\(\s*(['"]?)([^'")]+)\1\s*\)/g, (m, q, u) => {
    if (!u || u.startsWith('data:') || u.startsWith('#')) return m;
    let abs;
    try { abs = new URL(u, baseUrl).toString(); } catch { return m; }
    const local = assetUrlToLocal.get(abs);
    if (!local) return m;
    return `url("${rel(cssLocalPath, local)}")`;
  });
  out = out.replace(/@import\s+(?:url\()?\s*(['"])([^'"]+)\1\s*\)?\s*;/g, (m, q, u) => {
    let abs;
    try { abs = new URL(u, baseUrl).toString(); } catch { return m; }
    const local = assetUrlToLocal.get(abs);
    if (!local) return m;
    return `@import "${rel(cssLocalPath, local)}";`;
  });
  return out;
}

console.log('--- Rewriting CSS files ---');
for (const [absUrl, local] of assetUrlToLocal) {
  if (!/\.css(\?|$)/i.test(absUrl) && !/text\/css/i.test('') /* placeholder */) {
    // also rewrite if file extension is css
    if (!/\.css$/i.test(local)) continue;
  }
  let css;
  try { css = await fs.readFile(local, 'utf8'); } catch { continue; }
  await fs.writeFile(local, rewriteCss(css, absUrl, local));
}

console.log('--- Rewriting HTML pages ---');
for (const p of manifest.pages) {
  const dst = pageUrlToLocal.get(p.url);
  if (!dst) continue;
  const srcFile = path.join(SRC, p.file);
  let html;
  try { html = await fs.readFile(srcFile, 'utf8'); } catch { continue; }

  const $ = cheerio.load(html, { decodeEntities: false });

  // Strip CF + analytics scripts / iframes
  $('script[src]').each((_, el) => {
    const s = $(el).attr('src') || '';
    try {
      const abs = new URL(s, p.url).toString();
      const host = new URL(abs).host;
      if (SKIP_HOST.test(host)) { $(el).remove(); return; }
      if (/cdn-cgi\/challenge-platform/.test(abs)) { $(el).remove(); return; }
      if (/connect-transit\.com\/modules\/seo\/analytics/.test(abs)) { $(el).remove(); return; }
    } catch {}
  });
  $('script:not([src])').each((_, el) => {
    const t = $(el).html() || '';
    if (/google-analytics|googletagmanager|gtag\(|dataLayer|fbq\(|hotjar|clarity\.ms|_cf_chl_opt|cloudflare\.com|userway/i.test(t)) {
      $(el).remove();
    }
  });
  $('iframe[src]').each((_, el) => {
    const s = $(el).attr('src') || '';
    if (SKIP_HOST.test(s) || /challenges\.cloudflare/.test(s)) $(el).remove();
  });
  $('noscript').each((_, el) => {
    const t = $(el).html() || '';
    if (SKIP_HOST.test(t)) $(el).remove();
  });
  $('meta[http-equiv="refresh"]').remove();
  $('link[rel="dns-prefetch"], link[rel="preconnect"]').each((_, el) => {
    const h = $(el).attr('href') || '';
    if (SKIP_HOST.test(h)) $(el).remove();
  });
  // Remove userway floating widget container if any
  $('[class*="userway"], [id*="userway"], [class*="UserWay"]').remove();

  function rewriteAttr(sel, attr) {
    $(sel).each((_, el) => {
      const v = $(el).attr(attr);
      if (!v || v.startsWith('data:') || v.startsWith('#') || v.startsWith('mailto:') || v.startsWith('tel:') || v.startsWith('javascript:')) return;
      let abs;
      try { abs = new URL(v, p.url).toString(); } catch { return; }
      let host;
      try { host = new URL(abs).host; } catch { return; }
      if (SKIP_HOST.test(host)) {
        $(el).removeAttr(attr);
        return;
      }
      // Check page link
      const pageLocal = pageLocalForUrl(abs);
      if (pageLocal) {
        $(el).attr(attr, rel(dst, pageLocal));
        return;
      }
      // Asset?
      const assetLocal = assetUrlToLocal.get(abs);
      if (assetLocal) {
        $(el).attr(attr, rel(dst, assetLocal));
        return;
      }
      // Try without query string for assets
      try {
        const noQuery = new URL(abs);
        noQuery.search = '';
        const al2 = assetUrlToLocal.get(noQuery.toString());
        if (al2) {
          $(el).attr(attr, rel(dst, al2));
          return;
        }
      } catch {}
      // Internal page we didn't capture: still rewrite to a local relative
      // path so navigation stays inside the clone. The target won't exist on
      // disk (will 404 in the dev server), but it's a better experience than
      // leaving a link to the live (CF-blocked) site.
      if (host === ROOT_HOST) {
        let u;
        try { u = new URL(abs); } catch { return; }
        let pp = u.pathname;
        if (pp.endsWith('/')) pp += 'index.html';
        else if (!path.extname(pp)) pp += '/index.html';
        const synthetic = path.join(SITE, pp.replace(/^\/+/, ''));
        $(el).attr(attr, rel(dst, synthetic));
      }
    });
  }

  rewriteAttr('a[href]', 'href');
  rewriteAttr('link[href]', 'href');
  rewriteAttr('script[src]', 'src');
  rewriteAttr('img[src]', 'src');
  rewriteAttr('img[data-src]', 'data-src');
  rewriteAttr('source[src]', 'src');
  rewriteAttr('video[src]', 'src');
  rewriteAttr('video[poster]', 'poster');
  rewriteAttr('audio[src]', 'src');
  rewriteAttr('iframe[src]', 'src');

  // srcset rewrite
  $('[srcset], [data-srcset]').each((_, el) => {
    for (const attr of ['srcset', 'data-srcset']) {
      const ss = $(el).attr(attr);
      if (!ss) continue;
      const parts = ss.split(',').map(part => {
        const bits = part.trim().split(/\s+/);
        const u = bits[0];
        if (!u) return part;
        try {
          const abs = new URL(u, p.url).toString();
          const local = assetUrlToLocal.get(abs);
          if (local) {
            bits[0] = rel(dst, local);
            return bits.join(' ');
          }
        } catch {}
        return part;
      });
      $(el).attr(attr, parts.join(', '));
    }
  });

  // inline style url(...)
  $('[style]').each((_, el) => {
    const s = $(el).attr('style') || '';
    const out = s.replace(/url\(\s*(['"]?)([^'")]+)\1\s*\)/g, (m, q, u) => {
      if (u.startsWith('data:')) return m;
      try {
        const abs = new URL(u, p.url).toString();
        const local = assetUrlToLocal.get(abs);
        if (local) return `url("${rel(dst, local)}")`;
      } catch {}
      return m;
    });
    $(el).attr('style', out);
  });

  // <style> blocks
  $('style').each((_, el) => {
    const s = $(el).html() || '';
    const out = s.replace(/url\(\s*(['"]?)([^'")]+)\1\s*\)/g, (m, q, u) => {
      if (u.startsWith('data:')) return m;
      try {
        const abs = new URL(u, p.url).toString();
        const local = assetUrlToLocal.get(abs);
        if (local) return `url("${rel(dst, local)}")`;
      } catch {}
      return m;
    });
    $(el).html(out);
  });

  await fs.mkdir(path.dirname(dst), { recursive: true });
  await fs.writeFile(dst, $.html());
}

// Add a placeholder for missing connect-transit.com /image/<id>/<size> files
// so broken image icons don't appear. We point unresolved image refs at this.
const placeholderSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" preserveAspectRatio="xMidYMid slice"><rect width="200" height="200" fill="#dedede"/><text x="100" y="105" font-family="system-ui,sans-serif" font-size="14" fill="#727272" text-anchor="middle">missing image</text></svg>`;
await fs.writeFile(path.join(ASSETS_DST, 'placeholder.svg'), placeholderSvg);

// Sweep HTML once more to point any unresolved /image/<id>/<size>(/index.html)?
// references (which my synthetic-page fallback created) at the placeholder.
for (const p of manifest.pages) {
  const dst = pageUrlToLocal.get(p.url);
  if (!dst) continue;
  let html;
  try { html = await fs.readFile(dst, 'utf8'); } catch { continue; }
  const $ = cheerio.load(html, { decodeEntities: false });
  const placeholderRel = rel(dst, path.join(ASSETS_DST, 'placeholder.svg'));
  let changed = false;
  $('img[src]').each((_, el) => {
    const v = $(el).attr('src') || '';
    if (/(^|\/)image\/\d+\/\d+(\/index\.html)?$/.test(v)) {
      const target = path.resolve(path.dirname(dst), v.split('?')[0]);
      if (!existsSync(target)) {
        $(el).attr('src', placeholderRel);
        $(el).removeAttr('srcset');
        changed = true;
      }
    }
  });
  if (changed) await fs.writeFile(dst, $.html());
}

console.log(`\nDone. Output: ${SITE}`);
console.log(`Pages written: ${pageUrlToLocal.size}`);
console.log(`Assets copied: ${assetUrlToLocal.size}`);
