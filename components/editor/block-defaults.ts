import type { Block, BlockType } from '@/lib/types';

let counter = 0;
function newId(prefix: string): string {
  counter += 1;
  return `${prefix}-${Date.now()}-${counter}`;
}

/**
 * Returns a new Block of the given type pre-filled with sensible
 * placeholder content. Used by the "Add block" picker in the editor.
 */
export function createDefaultBlock(type: BlockType): Block {
  switch (type) {
    case 'hero':
      return {
        id: newId('block'),
        type,
        data: {
          tag: 'Section',
          title: 'New hero section',
          body: 'Describe your value proposition here.',
          cta: 'Get started',
          ctaHref: '#',
          cta2: 'Learn more',
          cta2Href: '#',
        },
      };
    case 'text':
      return {
        id: newId('block'),
        type,
        data: {
          title: 'Section title',
          body: "Write your content here. Keep it clear and focused on your audience's needs.",
        },
      };
    case 'features':
      return {
        id: newId('block'),
        type,
        data: {
          title: 'Key features',
          sub: 'Why choose us?',
          features: [
            { title: 'Feature one', body: 'Describe this feature briefly.' },
            { title: 'Feature two', body: 'Another benefit for your customers.' },
            { title: 'Feature three', body: 'Build trust with this point.' },
          ],
        },
      };
    case 'cta':
      return {
        id: newId('block'),
        type,
        data: {
          title: 'Ready to get started?',
          body: 'Join thousands of brands who trust ClawdPress.',
          cta: 'Start free',
          ctaHref: '#',
          cta2: 'Contact sales',
          cta2Href: '#',
        },
      };
    case 'faq':
      return {
        id: newId('block'),
        type,
        data: {
          title: 'Frequently asked questions',
          faqs: [
            { q: 'Question one?', a: 'Answer one.' },
            { q: 'Question two?', a: 'Answer two.' },
          ],
        },
      };
    case 'image':
      return {
        id: newId('block'),
        type,
        data: {
          image: { url: '', alt: '' },
          caption: '',
        },
      };
    default:
      return { id: newId('block'), type: 'text', data: { body: '' } };
  }
}

export function cloneBlock(block: Block): Block {
  return { ...JSON.parse(JSON.stringify(block)), id: newId('block') };
}
