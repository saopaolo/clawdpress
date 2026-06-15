import fs from 'fs';
import path from 'path';
import type { Page, SiteConfig } from '@/lib/types';

/**
 * ClawdPress content store.
 *
 * Content lives as plain JSON files under /content. This is intentional:
 *  - Git-diffable: every content edit is a reviewable diff
 *  - No database, no migrations, no ORM
 *  - Portable: copy /content to move or back up an entire site
 *  - Editable by hand, by the CMS UI, or by AI tooling
 *
 * Structure:
 *   /content/site.json          → SiteConfig
 *   /content/pages/<id>.json    → Page
 */

const CONTENT_DIR = path.join(process.cwd(), 'content');
const PAGES_DIR = path.join(CONTENT_DIR, 'pages');

export function getSiteConfig(): SiteConfig {
  const file = path.join(CONTENT_DIR, 'site.json');
  if (!fs.existsSync(file)) {
    return { name: 'My Brand', url: 'https://example.com' };
  }
  return JSON.parse(fs.readFileSync(file, 'utf-8'));
}

export function saveSiteConfig(config: SiteConfig): void {
  ensureDir(CONTENT_DIR);
  fs.writeFileSync(path.join(CONTENT_DIR, 'site.json'), JSON.stringify(config, null, 2));
}

export function getAllPages(): Page[] {
  if (!fs.existsSync(PAGES_DIR)) return [];
  return fs
    .readdirSync(PAGES_DIR)
    .filter(f => f.endsWith('.json'))
    .map(f => JSON.parse(fs.readFileSync(path.join(PAGES_DIR, f), 'utf-8')) as Page)
    .sort((a, b) => (a.slug === '/' ? -1 : a.slug.localeCompare(b.slug)));
}

export function getPage(id: string): Page | null {
  const file = path.join(PAGES_DIR, `${id}.json`);
  if (!fs.existsSync(file)) return null;
  return JSON.parse(fs.readFileSync(file, 'utf-8'));
}

export function savePage(page: Page): void {
  ensureDir(PAGES_DIR);
  page.updatedAt = new Date().toISOString();
  fs.writeFileSync(path.join(PAGES_DIR, `${page.id}.json`), JSON.stringify(page, null, 2));
}

export function deletePage(id: string): void {
  const file = path.join(PAGES_DIR, `${id}.json`);
  if (fs.existsSync(file)) fs.unlinkSync(file);
}

function ensureDir(dir: string): void {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}
