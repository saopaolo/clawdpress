'use client';

import type { Block, HeroBlockData, TextBlockData, FeaturesBlockData, CTABlockData, FAQBlockData, ImageBlockData } from '@/lib/types';

/**
 * Editor canvas preview for a block.
 *
 * Mirrors the structure of lib/build/render-block.ts (same sections,
 * same semantic groupings) so what the user edits visually matches
 * the exported HTML's structure — just styled for the editor chrome
 * rather than the published theme.
 */
export default function BlockPreview({ block }: { block: Block }) {
  switch (block.type) {
    case 'hero':
      return <HeroPreview data={block.data as HeroBlockData} />;
    case 'text':
      return <TextPreview data={block.data as TextBlockData} />;
    case 'features':
      return <FeaturesPreview data={block.data as FeaturesBlockData} />;
    case 'cta':
      return <CTAPreview data={block.data as CTABlockData} />;
    case 'faq':
      return <FAQPreview data={block.data as FAQBlockData} />;
    case 'image':
      return <ImagePreview data={block.data as ImageBlockData} />;
    default:
      return null;
  }
}

function HeroPreview({ data }: { data: HeroBlockData }) {
  return (
    <div className="bg-ink text-white rounded-lg p-12">
      {data.tag && (
        <div className="text-xs font-medium tracking-widest uppercase text-violet-light mb-3">{data.tag}</div>
      )}
      <h1 className="text-3xl font-medium leading-tight mb-3">{data.title}</h1>
      {data.body && <p className="text-white/65 max-w-xl mb-6">{data.body}</p>}
      <div className="flex gap-3 flex-wrap">
        {data.cta && <span className="px-5 py-2.5 bg-violet text-white rounded-md text-sm font-medium">{data.cta}</span>}
        {data.cta2 && (
          <span className="px-5 py-2.5 border border-white/25 text-white/80 rounded-md text-sm">{data.cta2}</span>
        )}
      </div>
    </div>
  );
}

function TextPreview({ data }: { data: TextBlockData }) {
  return (
    <div className="bg-white rounded-lg p-8 border border-gray-100">
      {data.title && <h2 className="text-xl font-medium mb-3">{data.title}</h2>}
      <p className="text-gray-600 leading-relaxed">{data.body}</p>
    </div>
  );
}

function FeaturesPreview({ data }: { data: FeaturesBlockData }) {
  return (
    <div className="bg-white rounded-lg p-9 border border-gray-100">
      <h2 className="text-xl font-medium mb-1">{data.title}</h2>
      {data.sub && <p className="text-gray-600 mb-6">{data.sub}</p>}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {(data.features || []).map((f, i) => (
          <div key={i} className="bg-violet-tint/40 rounded-md p-4 border border-gray-100">
            <h3 className="text-sm font-medium mb-1">{f.title}</h3>
            <p className="text-xs text-gray-600 leading-relaxed">{f.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function CTAPreview({ data }: { data: CTABlockData }) {
  return (
    <div className="bg-gradient-to-br from-violet to-purple-500 rounded-lg p-10 text-center text-white">
      <h2 className="text-2xl font-medium mb-2">{data.title}</h2>
      {data.body && <p className="text-white/75 mb-6">{data.body}</p>}
      <div className="flex gap-3 justify-center">
        {data.cta && <span className="px-6 py-2.5 bg-white text-violet rounded-md text-sm font-medium">{data.cta}</span>}
        {data.cta2 && <span className="px-6 py-2.5 border border-white/30 text-white rounded-md text-sm">{data.cta2}</span>}
      </div>
    </div>
  );
}

function FAQPreview({ data }: { data: FAQBlockData }) {
  return (
    <div className="bg-white rounded-lg p-8 border border-gray-100">
      <h2 className="text-xl font-medium mb-4">{data.title}</h2>
      {(data.faqs || []).map((f, i) => (
        <div key={i} className="border-b border-gray-100 py-3 last:border-0">
          <div className="text-sm font-medium mb-1">{f.q}</div>
          <div className="text-xs text-gray-600 leading-relaxed">{f.a}</div>
        </div>
      ))}
    </div>
  );
}

function ImagePreview({ data }: { data: ImageBlockData }) {
  return (
    <figure className="m-0">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={data.image?.url} alt={data.image?.alt || ''} className="rounded-lg w-full" />
      {data.caption && <figcaption className="text-xs text-gray-500 mt-2">{data.caption}</figcaption>}
    </figure>
  );
}
