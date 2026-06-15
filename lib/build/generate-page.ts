import type { Page, SiteConfig } from '@/lib/types';
import { renderBlock } from './render-block';

/**
 * Generates a complete, standalone HTML document for a page.
 *
 * Every output page is:
 *  - Valid HTML5, semantic, zero required JS
 *  - Fully tagged for SEO (title, meta description, canonical, OG, Twitter)
 *  - Annotated with schema.org JSON-LD so search engines and LLM
 *    crawlers can extract structured facts about the page
 *  - Linked to a single shared /styles.css (no inline style bloat,
 *    no per-component CSS-in-JS runtime)
 */
export function generatePageHTML(page: Page, site: SiteConfig): string {
  const title = page.seo?.title || `${page.name} | ${site.name}`;
  const description = page.seo?.description || site.description || '';
  const canonical = `${site.url.replace(/\/$/, '')}${page.slug}`;
  const ogImage = page.seo?.ogImage || site.logo;

  const sections = page.blocks.map(renderBlock).join('\n');

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': page.slug === '/' ? 'WebSite' : 'WebPage',
    name: title,
    description,
    url: canonical,
    ...(page.slug === '/' ? { publisher: { '@type': 'Organization', name: site.name, url: site.url, logo: site.logo } } : {}),
  };

  const navLinks = (site.navigation || [])
    .map(n => `      <li><a href="${n.href}">${escAttr(n.label)}</a></li>`)
    .join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escAttr(title)}</title>
  <meta name="description" content="${escAttr(description)}">
  ${page.seo?.keyword ? `<meta name="keywords" content="${escAttr(page.seo.keyword)}">` : ''}
  ${page.seo?.noindex ? `<meta name="robots" content="noindex,nofollow">` : ''}
  <link rel="canonical" href="${canonical}">

  <meta property="og:type" content="website">
  <meta property="og:title" content="${escAttr(title)}">
  <meta property="og:description" content="${escAttr(description)}">
  <meta property="og:url" content="${canonical}">
  ${ogImage ? `<meta property="og:image" content="${escAttr(ogImage)}">` : ''}

  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escAttr(title)}">
  <meta name="twitter:description" content="${escAttr(description)}">
  ${ogImage ? `<meta name="twitter:image" content="${escAttr(ogImage)}">` : ''}

  <link rel="stylesheet" href="/styles.css">
  ${site.favicon ? `<link rel="icon" href="${escAttr(site.favicon)}">` : ''}

  <script type="application/ld+json">
${JSON.stringify(jsonLd, null, 2)}
  </script>
</head>
<body>
  <header class="site-header">
    <a href="/" class="site-logo">${escAttr(site.name)}</a>
    ${navLinks ? `<nav aria-label="Main navigation">\n      <ul>\n${navLinks}\n      </ul>\n    </nav>` : ''}
  </header>
  <main>
${sections}
  </main>
  <footer class="site-footer">
    <p>&copy; ${new Date().getFullYear()} ${escAttr(site.name)}. Built with <a href="https://github.com/your-org/clawdpress">ClawdPress</a>.</p>
  </footer>
</body>
</html>
`;
}

function escAttr(str: string | undefined): string {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
