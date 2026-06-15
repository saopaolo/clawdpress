import { notFound } from 'next/navigation';
import { getAllPages, getSiteConfig } from '@/lib/store/content-store';
import { generatePageHTML } from '@/lib/build/generate-page';

/**
 * Live preview of the exported site.
 *
 * Renders the EXACT same HTML the static export would produce
 * (via generatePageHTML), injected raw — so what you see here is
 * byte-for-byte what ships to your host. This is the "Preview"
 * mode of the CMS.
 */
export default function SitePage({ params }: { params: { slug?: string[] } }) {
  const slug = '/' + (params.slug?.join('/') || '');
  const pages = getAllPages();
  const site = getSiteConfig();

  const page = pages.find(p => p.slug === slug || (slug === '/' && p.slug === '/'));
  if (!page) return notFound();

  const html = generatePageHTML(page, site);
  const bodyHtml = html
    .replace(/<!DOCTYPE[^>]*>/i, '')
    .replace(/<\/?(html|head|body)[^>]*>/g, '');

  return <div style={{ width: '100%' }} dangerouslySetInnerHTML={{ __html: bodyHtml }} />;
}

export function generateStaticParams() {
  const pages = getAllPages();
  return pages.map(p => ({
    slug: p.slug === '/' ? [] : p.slug.replace(/^\//, '').split('/'),
  }));
}
