import type { Page, SiteConfig } from '@/lib/types';

export function generateSitemap(pages: Page[], site: SiteConfig): string {
  const base = site.url.replace(/\/$/, '');
  const urls = pages
    .filter(p => !p.seo?.noindex)
    .map(p => `  <url>
    <loc>${base}${p.slug}</loc>
    <lastmod>${(p.updatedAt || new Date().toISOString()).split('T')[0]}</lastmod>
  </url>`)
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
}

export function generateRobotsTxt(site: SiteConfig): string {
  const base = site.url.replace(/\/$/, '');
  return `User-agent: *
Allow: /

Sitemap: ${base}/sitemap.xml
`;
}
