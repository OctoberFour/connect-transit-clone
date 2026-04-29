// Crawl connect-transit.com using Playwright, save raw HTML, and capture every
// asset response body into assets/ during navigation (so server-side bot
// protection that only allows browser-driven image loads is bypassed).
import { chromium } from 'playwright';
import * as cheerio from 'cheerio';
import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const ROOT = 'https://connect-transit.com';
const ROOT_HOST = new URL(ROOT).host;
const OUT = path.resolve('site');
const ASSETS_DIR = path.join(OUT, '_assets');

await fs.rm(OUT, { recursive: true, force: true });
await fs.mkdir(ASSETS_DIR, { recursive: true });

const visited = new Set();
const queue = [ROOT + '/'];
const pageMap = new Map();           // page URL -> local html path
const assetBodies = new Map();       // asset URL -> { localPath, contentType }

const SKIP_HOST = /(google-analytics|googletagmanager|doubleclick|facebook\.com|hotjar|clarity\.ms|userway\.org|cdn77\.api|cloudflareinsights|challenges\.cloudflare\.com|www\.google\.com\/recaptcha|www\.gstatic\.com\/recaptcha|recaptcha)/i;
const KEEP_HOST = (host) => host === ROOT_HOST
  || /(fonts\.googleapis|fonts\.gstatic|jsdelivr|unpkg|jquery|cdnjs|cybernautic)/i.test(host);

function pagePathFor(url) {
  const u = new URL(url);
  let p = u.pathname;
  if (p.endsWith('/')) p += 'index.html';
  else if (!path.extname(p)) p += '/index.html';
  return path.join(OUT, p.replace(/^\/+/, ''));
}

function assetPathFor(url, contentType) {
  const u = new URL(url);
  let p = u.pathname;
  if (p.endsWith('/')) p += 'index';
  let ext = path.extname(p) || '';

  // If no extension, infer one from content type so the file works locally
  if (!ext && contentType) {
    if (/jpeg|jpg/i.test(contentType)) ext = '.jpg';
    else if (/png/i.test(contentType)) ext = '.png';
    else if (/gif/i.test(contentType)) ext = '.gif';
    else if (/svg/i.test(contentType)) ext = '.svg';
    else if (/webp/i.test(contentType)) ext = '.webp';
    else if (/avif/i.test(contentType)) ext = '.avif';
    else if (/woff2/i.test(contentType)) ext = '.woff2';
    else if (/woff/i.test(contentType)) ext = '.woff';
    else if (/ttf|truetype/i.test(contentType)) ext = '.ttf';
    else if (/css/i.test(contentType)) ext = '.css';
    else if (/javascript|js/i.test(contentType)) ext = '.js';
    p += ext;
  }
  // Encode query string into filename so distinct versions don't collide
  const queryHash = u.search ? '_q' + crypto.createHash('md5').update(u.search).digest('hex').slice(0, 6) : '';
  if (queryHash) {
    if (ext) p = p.replace(new RegExp(ext.replace('.', '\\.') + '$'), queryHash + ext);
    else p += queryHash;
  }
  return path.join(ASSETS_DIR, u.host, p.replace(/^\/+/, ''));
}

function isInternalPage(url) {
  try {
    const u = new URL(url);
    if (u.host !== ROOT_HOST) return false;
    if (!['http:', 'https:'].includes(u.protocol)) return false;
    const ext = path.extname(u.pathname).toLowerCase();
    if (ext && !['.html', '.htm', '.php'].includes(ext)) return false;
    return true;
  } catch { return false; }
}

function normalizePageUrl(url) {
  const u = new URL(url);
  u.hash = '';
  for (const k of ['utm_source','utm_medium','utm_campaign','utm_term','utm_content','fbclid','gclid']) {
    u.searchParams.delete(k);
  }
  return u.toString();
}

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
  viewport: { width: 1440, height: 900 },
});

context.on('response', async (resp) => {
  let url, host, type;
  try {
    url = resp.url();
    host = new URL(url).host;
    type = resp.request().resourceType();
  } catch { return; }
  if (SKIP_HOST.test(host)) return;
  if (!KEEP_HOST(host)) return;
  if (!['stylesheet', 'image', 'font', 'script', 'media'].includes(type)) return;
  if (!resp.ok()) return;
  if (assetBodies.has(url)) return;

  let body, contentType;
  try {
    body = await resp.body();
    contentType = (resp.headers()['content-type'] || '').split(';')[0];
  } catch { return; }
  if (!body || body.length === 0) return;

  const local = assetPathFor(url, contentType);
  await fs.mkdir(path.dirname(local), { recursive: true });
  await fs.writeFile(local, body);
  assetBodies.set(url, { localPath: local, contentType });
});

const MAX_PAGES = 200;
let pageIdx = 0;
const page = await context.newPage();   // reuse one tab so CF state stays warm

async function waitForRealContent(p, url) {
  // Cloudflare challenge has <title>Just a moment...</title>. Wait until that
  // resolves into the real page (or give up after a reasonable timeout).
  const start = Date.now();
  for (let i = 0; i < 30; i++) {
    let t;
    try { t = await p.title(); } catch { t = ''; }
    if (t && !/just a moment/i.test(t)) return true;
    if (Date.now() - start > 45000) break;
    await p.waitForTimeout(1000);
  }
  return false;
}

while (queue.length && pageIdx < MAX_PAGES) {
  const url = normalizePageUrl(queue.shift());
  if (visited.has(url)) continue;
  visited.add(url);
  pageIdx++;
  process.stdout.write(`[${pageIdx}] ${url} ... `);
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
  } catch (e) {
    process.stdout.write(`goto err: ${e.message}\n`);
    continue;
  }
  // wait briefly for in-flight assets to fire
  await page.waitForTimeout(1500);
  // if title is still CF challenge, give it a few more seconds
  for (let i = 0; i < 8; i++) {
    let t;
    try { t = await page.title(); } catch { t = ''; }
    if (!/just a moment/i.test(t)) break;
    await page.waitForTimeout(1000);
  }
  // scroll to trigger lazy images
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight)).catch(() => {});
  await page.waitForTimeout(1000);
  await page.evaluate(() => window.scrollTo(0, 0)).catch(() => {});
  await page.waitForTimeout(400);

  let html;
  try { html = await page.content(); } catch (e) {
    process.stdout.write(`content err: ${e.message}\n`);
    continue;
  }
  if (/just a moment/i.test(html.slice(0, 600))) {
    process.stdout.write('SKIP CF\n');
    continue;
  }

  const $ = cheerio.load(html);
  $('a[href]').each((_, el) => {
    const href = $(el).attr('href');
    if (!href) return;
    let abs;
    try { abs = new URL(href, url).toString(); } catch { return; }
    abs = normalizePageUrl(abs);
    if (isInternalPage(abs) && !visited.has(abs) && !queue.includes(abs)) {
      queue.push(abs);
    }
  });

  const localHtml = pagePathFor(url);
  await fs.mkdir(path.dirname(localHtml), { recursive: true });
  await fs.writeFile(localHtml, html);
  pageMap.set(url, localHtml);
  process.stdout.write(`OK (${html.length}B)\n`);
}
await page.close();

console.log(`\nCrawled ${visited.size} pages, captured ${assetBodies.size} assets.`);

const manifest = {
  pages: [...pageMap.entries()].map(([u, p]) => ({ url: u, file: path.relative(OUT, p) })),
  assets: [...assetBodies.entries()].map(([u, v]) => ({ url: u, file: path.relative(OUT, v.localPath), contentType: v.contentType })),
};
await fs.writeFile('manifest.json', JSON.stringify(manifest, null, 2));

await browser.close();
console.log('Manifest written to manifest.json');
