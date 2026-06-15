import type { Block, HeroBlockData, TextBlockData, FeaturesBlockData, CTABlockData, FAQBlockData, ImageBlockData } from '@/lib/types';

/**
 * Renders a single content block to clean, semantic HTML.
 *
 * Design principles:
 *  - No client-side JS required for content to render or be indexed.
 *  - Semantic elements (section, article, dl/dt/dd, figure/figcaption)
 *    so crawlers and LLMs can parse structure without guessing.
 *  - All images get explicit width/height + lazy loading + alt text.
 *  - Output is hand-readable — this is what a developer (or an LLM)
 *    will read when inspecting the page source.
 */
export function renderBlock(block: Block): string {
  switch (block.type) {
    case 'hero':
      return renderHero(block.data as HeroBlockData);
    case 'text':
      return renderText(block.data as TextBlockData);
    case 'features':
      return renderFeatures(block.data as FeaturesBlockData);
    case 'cta':
      return renderCTA(block.data as CTABlockData);
    case 'faq':
      return renderFAQ(block.data as FAQBlockData);
    case 'image':
      return renderImage(block.data as ImageBlockData);
    default:
      return '';
  }
}

function esc(str: string | undefined): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function renderHero(d: HeroBlockData): string {
  const buttons = [
    d.cta ? `<a href="${esc(d.ctaHref || '#')}" class="btn btn-primary">${esc(d.cta)}</a>` : '',
    d.cta2 ? `<a href="${esc(d.cta2Href || '#')}" class="btn btn-secondary">${esc(d.cta2)}</a>` : '',
  ].filter(Boolean).join('\n      ');

  return `  <section class="block-hero" aria-label="Hero">
    ${d.tag ? `<p class="eyebrow">${esc(d.tag)}</p>` : ''}
    <h1>${esc(d.title)}</h1>
    ${d.body ? `<p class="lead">${esc(d.body)}</p>` : ''}
    ${buttons ? `<div class="btn-group">\n      ${buttons}\n    </div>` : ''}
    ${d.image ? renderFigure(d.image) : ''}
  </section>`;
}

function renderText(d: TextBlockData): string {
  return `  <section class="block-text">
    ${d.title ? `<h2>${esc(d.title)}</h2>` : ''}
    <p>${esc(d.body)}</p>
  </section>`;
}

function renderFeatures(d: FeaturesBlockData): string {
  const cards = (d.features || []).map(f => `      <article class="feature-card">
        <h3>${esc(f.title)}</h3>
        <p>${esc(f.body)}</p>
      </article>`).join('\n');

  return `  <section class="block-features" aria-label="Features">
    <h2>${esc(d.title)}</h2>
    ${d.sub ? `<p class="subtitle">${esc(d.sub)}</p>` : ''}
    <div class="features-grid">
${cards}
    </div>
  </section>`;
}

function renderCTA(d: CTABlockData): string {
  const buttons = [
    d.cta ? `<a href="${esc(d.ctaHref || '#')}" class="btn btn-primary">${esc(d.cta)}</a>` : '',
    d.cta2 ? `<a href="${esc(d.cta2Href || '#')}" class="btn btn-secondary">${esc(d.cta2)}</a>` : '',
  ].filter(Boolean).join('\n      ');

  return `  <section class="block-cta" aria-label="Call to action">
    <h2>${esc(d.title)}</h2>
    ${d.body ? `<p>${esc(d.body)}</p>` : ''}
    ${buttons ? `<div class="btn-group">\n      ${buttons}\n    </div>` : ''}
  </section>`;
}

function renderFAQ(d: FAQBlockData): string {
  const items = (d.faqs || []).map(f => `      <dt>${esc(f.q)}</dt>
      <dd>${esc(f.a)}</dd>`).join('\n');

  return `  <section class="block-faq" aria-label="Frequently asked questions">
    <h2>${esc(d.title)}</h2>
    <dl>
${items}
    </dl>
  </section>`;
}

function renderImage(d: ImageBlockData): string {
  return `  <section class="block-image">
${renderFigure(d.image, d.caption)}
  </section>`;
}

function renderFigure(image: ImageBlockData['image'], caption?: string): string {
  const attr = image.attribution;
  const figcap = caption || (attr?.author ? `Photo: ${esc(attr.author)}${attr.sourceName ? ` / ${esc(attr.sourceName)}` : ''}` : '');
  return `    <figure class="media-figure">
      <img
        src="${esc(image.fullUrl || image.url)}"
        alt="${esc(image.alt)}"
        ${image.width ? `width="${image.width}"` : ''}
        ${image.height ? `height="${image.height}"` : ''}
        loading="lazy"
        decoding="async"
      >
      ${figcap ? `<figcaption>${figcap}</figcaption>` : ''}
    </figure>`;
}
