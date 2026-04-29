// Crawl connect-transit.com via Wayback Machine `id_` modifier (raw content).
// CF blocks our IP from the live site, but Wayback has clean snapshots and
// serves them via plain HTTP with no challenge.
import * as cheerio from 'cheerio';
import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import https from 'node:https';

const ROOT = 'https://connect-transit.com';
const ROOT_HOST = new URL(ROOT).host;
const OUT = path.resolve('site2');
const ASSETS_DIR = path.join(OUT, '_assets');

await fs.rm(OUT, { recursive: true, force: true });
await fs.mkdir(ASSETS_DIR, { recursive: true });

// ---------- Step 1: build URL → wayback timestamp index from CDX ----------
import zlib from 'node:zlib';
function fetchText(url, depth = 0) {
  return new Promise((resolve, reject) => {
    if (depth > 8) return reject(new Error('too many redirects'));
    const req = https.get(url, {
      headers: {
        'user-agent': 'Mozilla/5.0 clone-tool',
        'accept-encoding': 'gzip, deflate, br',
      },
    }, (res) => {
      if ([301, 302, 303, 307, 308].includes(res.statusCode) && res.headers.location) {
        // drain response so socket can close
        res.on('data', () => {});
        res.on('end', () => {});
        return resolve(fetchText(res.headers.location, depth + 1));
      }
      const bufs = [];
      res.on('data', b => bufs.push(b));
      res.on('end', () => {
        let body = Buffer.concat(bufs);
        const enc = (res.headers['content-encoding'] || '').toLowerCase();
        try {
          if (enc === 'gzip') body = zlib.gunzipSync(body);
          else if (enc === 'deflate') body = zlib.inflateSync(body);
          else if (enc === 'br') body = zlib.brotliDecompressSync(body);
        } catch (e) { /* leave as-is */ }
        // Wayback sometimes serves a gzipped body without the header.
        if (body.length >= 2 && body[0] === 0x1f && body[1] === 0x8b) {
          try { body = zlib.gunzipSync(body); } catch {}
        }
        resolve({ status: res.statusCode, headers: res.headers, body });
      });
      res.on('error', reject);
    });
    req.on('error', reject);
    req.setTimeout(20000, () => req.destroy(new Error('timeout')));
  });
}

console.log('--- Querying CDX ---');
const cdxUrl = 'https://web.archive.org/cdx/search/cdx?url=connect-transit.com/&matchType=domain&filter=statuscode:200&filter=mimetype:text/html&fl=original,timestamp&from=2024&to=2025';
const cdxResp = await fetchText(cdxUrl);
const lines = cdxResp.body.toString('utf8').trim().split('\n').filter(Boolean);
console.log(`CDX rows: ${lines.length}`);

const latestForUrl = new Map();
for (const line of lines) {
  const [orig, ts] = line.split(' ');
  if (!orig || !ts) continue;
  if (!orig.startsWith('http://connect-transit.com') && !orig.startsWith('https://connect-transit.com')) continue;
  // normalize to https + drop trailing slash variants
  const norm = orig.replace(/^http:/, 'https:').replace(/\/$/, '');
  const prev = latestForUrl.get(norm);
  if (!prev || ts > prev) latestForUrl.set(norm, ts);
}
console.log(`Unique pages: ${latestForUrl.size}`);

// Always include homepage
if (!latestForUrl.has('https://connect-transit.com')) {
  latestForUrl.set('https://connect-transit.com', '2025');
}

// ---------- Step 2: fetch each page via Wayback id_ ----------
function pagePathFor(absUrl) {
  const u = new URL(absUrl);
  let p = u.pathname;
  if (p.endsWith('/')) p += 'index.html';
  else if (!path.extname(p)) p += '/index.html';
  return path.join(OUT, p.replace(/^\/+/, ''));
}

function assetPathFor(absUrl, contentType) {
  const u = new URL(absUrl);
  let p = u.pathname;
  if (p.endsWith('/')) p += 'index';
  let ext = path.extname(p) || '';
  if (!ext && contentType) {
    const ct = contentType.toLowerCase();
    if (/jpe?g/.test(ct)) ext = '.jpg';
    else if (/png/.test(ct)) ext = '.png';
    else if (/gif/.test(ct)) ext = '.gif';
    else if (/svg/.test(ct)) ext = '.svg';
    else if (/webp/.test(ct)) ext = '.webp';
    else if (/avif/.test(ct)) ext = '.avif';
    else if (/woff2/.test(ct)) ext = '.woff2';
    else if (/woff/.test(ct)) ext = '.woff';
    else if (/ttf|truetype/.test(ct)) ext = '.ttf';
    else if (/css/.test(ct)) ext = '.css';
    else if (/javascript|js/.test(ct)) ext = '.js';
    if (ext) p += ext;
  }
  const queryHash = u.search ? '_q' + crypto.createHash('md5').update(u.search).digest('hex').slice(0, 6) : '';
  if (queryHash) {
    if (ext) p = p.replace(new RegExp(ext.replace('.', '\\.') + '$'), queryHash + ext);
    else p += queryHash;
  }
  return path.join(ASSETS_DIR, u.host, p.replace(/^\/+/, ''));
}

function waybackUrl(absUrl, ts = '2025') {
  return `https://web.archive.org/web/${ts}id_/${absUrl}`;
}

async function fetchVia(absUrl, ts, retries = 2) {
  const w = waybackUrl(absUrl, ts);
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const r = await fetchText(w);
      if (r.status === 200 && r.body && r.body.length > 0) return r;
      if (r.status === 404) return null;
    } catch (e) {
      // retry
    }
    if (attempt < retries) await new Promise(r => setTimeout(r, 700));
  }
  return null;
}

const pageMap = new Map();
const assetMap = new Map();
const failedAssets = new Set();

console.log('--- Fetching pages from Wayback ---');
async function fetchPage([pageUrl, ts], idx, total) {
  const local = pagePathFor(pageUrl);
  const r = await fetchVia(pageUrl, ts);
  if (!r) {
    console.log(`[${idx}/${total}] ${pageUrl} FAIL`);
    return;
  }
  await fs.mkdir(path.dirname(local), { recursive: true });
  await fs.writeFile(local, r.body);
  pageMap.set(pageUrl, { local, ts });
  console.log(`[${idx}/${total}] ${pageUrl} OK (${r.body.length}B)`);
}
{
  const entries = [...latestForUrl.entries()];
  const PAGE_CONC = 6;
  for (let i = 0; i < entries.length; i += PAGE_CONC) {
    const slice = entries.slice(i, i + PAGE_CONC);
    await Promise.all(slice.map((e, j) => fetchPage(e, i + j + 1, entries.length)));
  }
}
console.log(`Pages fetched: ${pageMap.size}/${latestForUrl.size}`);

// ---------- Step 3: extract asset URLs from every page ----------
console.log('--- Extracting asset URLs ---');
const assetUrls = new Set();
const SKIP_HOST = /(google-analytics|googletagmanager|doubleclick|facebook|hotjar|clarity\.ms|userway|cdn77\.api|cloudflareinsights|challenges\.cloudflare\.com|recaptcha|translate\.google|translate-pa\.googleapis|wp\.com)/i;
const KEEP_HOST = (host) => host === ROOT_HOST
  || /(fonts\.googleapis|fonts\.gstatic|jsdelivr|unpkg|jquery|cdnjs|cybernautic|wpengine)/i.test(host);

for (const [pageUrl, { local }] of pageMap) {
  let html;
  try { html = await fs.readFile(local, 'utf8'); } catch { continue; }
  const $ = cheerio.load(html);
  const harvest = (sel, attr) => $(sel).each((_, el) => {
    const v = $(el).attr(attr);
    if (!v) return;
    if (attr === 'srcset') {
      v.split(',').forEach(part => {
        const u = part.trim().split(/\s+/)[0];
        if (u) try {
          const abs = new URL(u, pageUrl).toString();
          if (KEEP_HOST(new URL(abs).host) && !SKIP_HOST.test(new URL(abs).host)) assetUrls.add(abs);
        } catch {}
      });
    } else {
      try {
        const abs = new URL(v, pageUrl).toString();
        const host = new URL(abs).host;
        if (!SKIP_HOST.test(host) && KEEP_HOST(host)) assetUrls.add(abs);
      } catch {}
    }
  });
  harvest('link[href]', 'href');
  harvest('script[src]', 'src');
  harvest('img[src]', 'src');
  harvest('img[srcset]', 'srcset');
  harvest('img[data-src]', 'data-src');
  harvest('source[src]', 'src');
  harvest('source[srcset]', 'srcset');

  // url(...) inside inline <style> blocks
  $('style').each((_, el) => {
    const css = $(el).html() || '';
    css.replace(/url\(\s*['"]?([^'")]+)['"]?\s*\)/g, (_m, u) => {
      if (u && !u.startsWith('data:')) try {
        const abs = new URL(u, pageUrl).toString();
        if (KEEP_HOST(new URL(abs).host) && !SKIP_HOST.test(new URL(abs).host)) assetUrls.add(abs);
      } catch {}
    });
  });
}
console.log(`Asset URLs (round 1): ${assetUrls.size}`);

// ---------- Step 4: download every asset ----------
async function downloadAsset(absUrl) {
  if (assetMap.has(absUrl) || failedAssets.has(absUrl)) return;
  // try original timestamp from CDX (closest to 2025)
  const r = await fetchVia(absUrl, '2025');
  if (!r) { failedAssets.add(absUrl); return; }
  const ct = (r.headers['content-type'] || '').split(';')[0];
  const local = assetPathFor(absUrl, ct);
  await fs.mkdir(path.dirname(local), { recursive: true });
  await fs.writeFile(local, r.body);
  assetMap.set(absUrl, { local, contentType: ct });
}

const assetList = [...assetUrls];
const BATCH = 6;
console.log(`--- Downloading ${assetList.length} assets ---`);
for (let i = 0; i < assetList.length; i += BATCH) {
  const slice = assetList.slice(i, i + BATCH);
  await Promise.all(slice.map(downloadAsset));
  if (i % 30 === 0 || i + BATCH >= assetList.length) {
    process.stdout.write(`  ${Math.min(i + BATCH, assetList.length)}/${assetList.length} (ok=${assetMap.size}, fail=${failedAssets.size})\n`);
  }
}

// ---------- Step 5: scan downloaded CSS for nested url(...) refs ----------
console.log('--- Scanning CSS for nested assets ---');
const round2 = new Set();
for (const [absUrl, { local }] of assetMap) {
  if (!/\.css(\?|$)/i.test(absUrl) && !/\.css$/.test(local)) continue;
  let css;
  try { css = await fs.readFile(local, 'utf8'); } catch { continue; }
  css.replace(/url\(\s*['"]?([^'")]+)['"]?\s*\)/g, (_m, u) => {
    if (u && !u.startsWith('data:')) try {
      const abs = new URL(u, absUrl).toString();
      const host = new URL(abs).host;
      if (KEEP_HOST(host) && !SKIP_HOST.test(host) && !assetMap.has(abs) && !failedAssets.has(abs)) round2.add(abs);
    } catch {}
  });
  css.replace(/@import\s+(?:url\()?\s*['"]([^'"]+)['"]\s*\)?\s*;/g, (_m, u) => {
    try {
      const abs = new URL(u, absUrl).toString();
      const host = new URL(abs).host;
      if (KEEP_HOST(host) && !SKIP_HOST.test(host) && !assetMap.has(abs) && !failedAssets.has(abs)) round2.add(abs);
    } catch {}
  });
}
console.log(`CSS-discovered new assets: ${round2.size}`);
const round2List = [...round2];
for (let i = 0; i < round2List.length; i += BATCH) {
  await Promise.all(round2List.slice(i, i + BATCH).map(downloadAsset));
}
console.log(`Total assets: ${assetMap.size}`);

// ---------- Step 6: also scan pages for /image/N/M srcset variants and fetch ----------
const imageVariants = new Set();
for (const pageUrl of pageMap.keys()) {
  const html = await fs.readFile(pageMap.get(pageUrl).local, 'utf8');
  for (const m of html.matchAll(/\/image\/\d+\/\d+(?:\/[^"' )]*)?/g)) {
    const abs = new URL(m[0], pageUrl).toString();
    if (!assetMap.has(abs) && !failedAssets.has(abs)) imageVariants.add(abs);
  }
}
console.log(`/image/N/M variants to try: ${imageVariants.size}`);
const ivList = [...imageVariants];
for (let i = 0; i < ivList.length; i += BATCH) {
  await Promise.all(ivList.slice(i, i + BATCH).map(downloadAsset));
}
console.log(`Total assets after image pass: ${assetMap.size}`);

// ---------- Manifest ----------
const manifest = {
  pages: [...pageMap.entries()].map(([u, v]) => ({ url: u, file: path.relative(OUT, v.local), ts: v.ts })),
  assets: [...assetMap.entries()].map(([u, v]) => ({ url: u, file: path.relative(OUT, v.local), contentType: v.contentType })),
};
await fs.writeFile('manifest.json', JSON.stringify(manifest, null, 2));
console.log(`Manifest: ${manifest.pages.length} pages, ${manifest.assets.length} assets`);
