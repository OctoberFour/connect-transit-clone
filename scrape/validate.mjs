// Sanity-check the built clone:
// - report any leftover absolute connect-transit.com refs
// - report any href/src that points at a missing local file
import * as cheerio from 'cheerio';
import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

const SITE = path.resolve('../clone');
const html = [];
async function walk(dir) {
  for (const e of await fs.readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) await walk(p);
    else if (e.name.endsWith('.html')) html.push(p);
  }
}
await walk(SITE);
console.log(`HTML files: ${html.length}`);

let totalRefs = 0;
let absoluteRemaining = 0;
let missingLocal = 0;
const sampleAbs = [];
const sampleMissing = [];

for (const file of html) {
  const txt = await fs.readFile(file, 'utf8');
  const $ = cheerio.load(txt);
  const checkAttr = (sel, attr) => $(sel).each((_, el) => {
    let v = $(el).attr(attr);
    if (!v || v.startsWith('data:') || v.startsWith('#') || v.startsWith('mailto:') || v.startsWith('tel:') || v.startsWith('javascript:')) return;
    totalRefs++;
    if (/^https?:\/\/connect-transit\.com/.test(v)) {
      absoluteRemaining++;
      if (sampleAbs.length < 10) sampleAbs.push(`${path.relative(SITE, file)}: ${v}`);
      return;
    }
    if (v.startsWith('http://') || v.startsWith('https://') || v.startsWith('//')) return; // external CDN
    const target = path.resolve(path.dirname(file), v.split('?')[0].split('#')[0]);
    if (!existsSync(target)) {
      missingLocal++;
      if (sampleMissing.length < 15) sampleMissing.push(`${path.relative(SITE, file)} → ${v}`);
    }
  });
  checkAttr('a[href]', 'href');
  checkAttr('link[href]', 'href');
  checkAttr('script[src]', 'src');
  checkAttr('img[src]', 'src');
  checkAttr('source[src]', 'src');
}

console.log(`Total refs checked: ${totalRefs}`);
console.log(`Still absolute connect-transit URLs: ${absoluteRemaining}`);
if (sampleAbs.length) for (const s of sampleAbs) console.log('  abs:', s);
console.log(`Missing local files: ${missingLocal}`);
if (sampleMissing.length) for (const s of sampleMissing) console.log('  miss:', s);
