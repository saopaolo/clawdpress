#!/usr/bin/env tsx
/**
 * ClawdPress static export.
 *
 * Reads /content/*.json and writes a fully static site to /exported-site:
 *
 *   exported-site/
 *     index.html
 *     about/index.html
 *     faq/index.html
 *     styles.css
 *     sitemap.xml
 *     robots.txt
 *
 * Output is plain HTML + CSS — deployable to any static host
 * (Netlify, Cloudflare Pages, S3, GitHub Pages, your own nginx box).
 *
 * Usage:
 *   npm run export
 */

import fs from 'fs';
import path from 'path';
import { getAllPages, getSiteConfig } from '@/lib/store/content-store';
import { generatePageHTML } from '@/lib/build/generate-page';
import { generateSitemap, generateRobotsTxt } from '@/lib/build/generate-sitemap';

const OUT_DIR = path.join(process.cwd(), 'exported-site');

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function pagePathFor(slug: string): string {
  if (slug === '/' || slug === '') return path.join(OUT_DIR, 'index.html');
  const clean = slug.replace(/^\//, '').replace(/\/$/, '');
  return path.join(OUT_DIR, clean, 'index.html');
}

function run() {
  const site = getSiteConfig();
  const pages = getAllPages();

  if (pages.length === 0) {
    console.error('No pages found in /content/pages. Nothing to export.');
    process.exit(1);
  }

  ensureDir(OUT_DIR);

  for (const page of pages) {
    const html = generatePageHTML(page, site);
    const outPath = pagePathFor(page.slug);
    ensureDir(path.dirname(outPath));
    fs.writeFileSync(outPath, html);
    console.log(`  ✓ ${page.slug === '/' ? '/' : page.slug} → ${path.relative(process.cwd(), outPath)}`);
  }

  // Shared stylesheet
  const themeCss = fs.readFileSync(path.join(process.cwd(), 'public', 'styles', 'theme.css'), 'utf-8');
  fs.writeFileSync(path.join(OUT_DIR, 'styles.css'), themeCss);
  console.log(`  ✓ styles.css`);

  // sitemap + robots
  fs.writeFileSync(path.join(OUT_DIR, 'sitemap.xml'), generateSitemap(pages, site));
  fs.writeFileSync(path.join(OUT_DIR, 'robots.txt'), generateRobotsTxt(site));
  console.log(`  ✓ sitemap.xml`);
  console.log(`  ✓ robots.txt`);

  console.log(`\nExport complete → ${path.relative(process.cwd(), OUT_DIR)}/`);
  console.log(`${pages.length} pages, zero client-side JS required.`);
}

run();
