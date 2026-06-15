'use client';

import type { Block, HeroBlockData, TextBlockData, FeaturesBlockData, CTABlockData, FAQBlockData, ImageBlockData } from '@/lib/types';

interface Props {
  block: Block | null;
  onChange: (data: Block['data']) => void;
  onOpenAI: () => void;
  onOpenImagePicker: (target: 'hero' | 'image') => void;
}

/**
 * Renders form fields appropriate to the selected block's type.
 * Field labels deliberately use plain-English marketer language
 * ("Headline", "Body text") rather than schema field names.
 */
export default function BlockEditorPanel({ block, onChange, onOpenAI, onOpenImagePicker }: Props) {
  if (!block) {
    return (
      <div className="text-center py-10 text-gray-400">
        <div className="text-2xl mb-2">✏️</div>
        <div className="text-sm">Select a block to edit its content</div>
      </div>
    );
  }

  return (
    <div className="pb-2">
      <div className="text-[11px] font-medium text-gray-400 uppercase tracking-wide mb-3">
        {block.type} block
      </div>

      {block.type === 'hero' && <HeroFields data={block.data as HeroBlockData} onChange={onChange} onOpenImagePicker={() => onOpenImagePicker('hero')} />}
      {block.type === 'text' && <TextFields data={block.data as TextBlockData} onChange={onChange} />}
      {block.type === 'features' && <FeaturesFields data={block.data as FeaturesBlockData} onChange={onChange} />}
      {block.type === 'cta' && <CTAFields data={block.data as CTABlockData} onChange={onChange} />}
      {block.type === 'faq' && <FAQFields data={block.data as FAQBlockData} onChange={onChange} />}
      {block.type === 'image' && <ImageFields data={block.data as ImageBlockData} onChange={onChange} onOpenImagePicker={() => onOpenImagePicker('image')} />}

      <div className="border-t border-gray-100 pt-3 mt-3">
        <button
          onClick={onOpenAI}
          className="w-full mb-1 px-3 py-2 rounded-md border border-gray-200 text-sm text-amber-700 bg-amber-50 hover:bg-amber-100 transition flex items-center justify-center gap-2"
        >
          ✨ Improve with AI
        </button>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, multiline, hint }: { label: string; value: string; onChange: (v: string) => void; multiline?: boolean; hint?: string }) {
  return (
    <div className="mb-3">
      <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
      {multiline ? (
        <textarea
          className="w-full px-2.5 py-1.5 rounded-md border border-gray-200 bg-gray-50 text-sm focus:border-violet focus:outline-none min-h-[80px] resize-y"
          value={value || ''}
          onChange={e => onChange(e.target.value)}
        />
      ) : (
        <input
          type="text"
          className="w-full px-2.5 py-1.5 rounded-md border border-gray-200 bg-gray-50 text-sm focus:border-violet focus:outline-none"
          value={value || ''}
          onChange={e => onChange(e.target.value)}
        />
      )}
      {hint && <div className="text-[11px] text-gray-400 mt-1">{hint}</div>}
    </div>
  );
}

function HeroFields({ data, onChange, onOpenImagePicker }: { data: HeroBlockData; onChange: (d: HeroBlockData) => void; onOpenImagePicker: () => void }) {
  return (
    <>
      <Field label="Tag / eyebrow" value={data.tag || ''} onChange={v => onChange({ ...data, tag: v })} />
      <Field label="Headline" value={data.title} onChange={v => onChange({ ...data, title: v })} />
      <Field label="Body text" value={data.body || ''} onChange={v => onChange({ ...data, body: v })} multiline />
      <Field label="Primary button" value={data.cta || ''} onChange={v => onChange({ ...data, cta: v })} />
      <Field label="Primary link" value={data.ctaHref || ''} onChange={v => onChange({ ...data, ctaHref: v })} />
      <Field label="Secondary button" value={data.cta2 || ''} onChange={v => onChange({ ...data, cta2: v })} />
      <Field label="Secondary link" value={data.cta2Href || ''} onChange={v => onChange({ ...data, cta2Href: v })} />
      <button
        onClick={onOpenImagePicker}
        className="w-full px-3 py-2 rounded-md border border-gray-200 text-sm hover:bg-gray-50 transition flex items-center justify-center gap-2 mb-2"
      >
        🖼️ {data.image?.url ? 'Change image' : 'Add image'}
      </button>
    </>
  );
}

function TextFields({ data, onChange }: { data: TextBlockData; onChange: (d: TextBlockData) => void }) {
  return (
    <>
      <Field label="Heading" value={data.title || ''} onChange={v => onChange({ ...data, title: v })} />
      <Field label="Body" value={data.body} onChange={v => onChange({ ...data, body: v })} multiline />
    </>
  );
}

function FeaturesFields({ data, onChange }: { data: FeaturesBlockData; onChange: (d: FeaturesBlockData) => void }) {
  const updateFeature = (i: number, field: 'title' | 'body', value: string) => {
    const features = [...(data.features || [])];
    features[i] = { ...features[i], [field]: value };
    onChange({ ...data, features });
  };
  const addFeature = () => onChange({ ...data, features: [...(data.features || []), { title: 'New feature', body: 'Description' }] });
  const removeFeature = (i: number) => onChange({ ...data, features: (data.features || []).filter((_, idx) => idx !== i) });

  return (
    <>
      <Field label="Section title" value={data.title} onChange={v => onChange({ ...data, title: v })} />
      <Field label="Subtitle" value={data.sub || ''} onChange={v => onChange({ ...data, sub: v })} />
      <div className="border-t border-gray-100 pt-3 mt-1">
        <div className="text-xs font-medium text-gray-500 mb-2">Feature cards</div>
        {(data.features || []).map((f, i) => (
          <div key={i} className="bg-gray-50 rounded-md p-2.5 mb-2 border border-gray-100">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-[11px] font-medium text-gray-400">Feature {i + 1}</span>
              <button onClick={() => removeFeature(i)} className="text-[11px] text-red-500 hover:underline">Remove</button>
            </div>
            <Field label="Title" value={f.title} onChange={v => updateFeature(i, 'title', v)} />
            <Field label="Description" value={f.body} onChange={v => updateFeature(i, 'body', v)} multiline />
          </div>
        ))}
        <button onClick={addFeature} className="w-full px-3 py-1.5 rounded-md border border-gray-200 text-sm hover:bg-gray-50 transition">+ Add feature</button>
      </div>
    </>
  );
}

function CTAFields({ data, onChange }: { data: CTABlockData; onChange: (d: CTABlockData) => void }) {
  return (
    <>
      <Field label="Heading" value={data.title} onChange={v => onChange({ ...data, title: v })} />
      <Field label="Body" value={data.body || ''} onChange={v => onChange({ ...data, body: v })} multiline />
      <Field label="Primary button" value={data.cta || ''} onChange={v => onChange({ ...data, cta: v })} />
      <Field label="Primary link" value={data.ctaHref || ''} onChange={v => onChange({ ...data, ctaHref: v })} />
      <Field label="Secondary button" value={data.cta2 || ''} onChange={v => onChange({ ...data, cta2: v })} />
      <Field label="Secondary link" value={data.cta2Href || ''} onChange={v => onChange({ ...data, cta2Href: v })} />
    </>
  );
}

function FAQFields({ data, onChange }: { data: FAQBlockData; onChange: (d: FAQBlockData) => void }) {
  const updateFAQ = (i: number, field: 'q' | 'a', value: string) => {
    const faqs = [...(data.faqs || [])];
    faqs[i] = { ...faqs[i], [field]: value };
    onChange({ ...data, faqs });
  };
  const addFAQ = () => onChange({ ...data, faqs: [...(data.faqs || []), { q: 'New question?', a: 'Answer here.' }] });
  const removeFAQ = (i: number) => onChange({ ...data, faqs: (data.faqs || []).filter((_, idx) => idx !== i) });

  return (
    <>
      <Field label="Section title" value={data.title} onChange={v => onChange({ ...data, title: v })} />
      <div className="border-t border-gray-100 pt-3 mt-1">
        <div className="text-xs font-medium text-gray-500 mb-2">Questions</div>
        {(data.faqs || []).map((f, i) => (
          <div key={i} className="bg-gray-50 rounded-md p-2.5 mb-2 border border-gray-100">
            <div className="flex justify-end mb-1.5">
              <button onClick={() => removeFAQ(i)} className="text-[11px] text-red-500 hover:underline">Remove</button>
            </div>
            <Field label="Question" value={f.q} onChange={v => updateFAQ(i, 'q', v)} />
            <Field label="Answer" value={f.a} onChange={v => updateFAQ(i, 'a', v)} multiline />
          </div>
        ))}
        <button onClick={addFAQ} className="w-full px-3 py-1.5 rounded-md border border-gray-200 text-sm hover:bg-gray-50 transition">+ Add question</button>
      </div>
    </>
  );
}

function ImageFields({ data, onChange, onOpenImagePicker }: { data: ImageBlockData; onChange: (d: ImageBlockData) => void; onOpenImagePicker: () => void }) {
  return (
    <>
      {data.image?.url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={data.image.url} alt={data.image.alt} className="w-full rounded-md mb-2 border border-gray-100" />
      ) : null}
      <button onClick={onOpenImagePicker} className="w-full px-3 py-2 rounded-md border border-gray-200 text-sm hover:bg-gray-50 transition mb-2">
        🖼️ {data.image?.url ? 'Change image' : 'Choose image'}
      </button>
      <Field label="Alt text" value={data.image?.alt || ''} onChange={v => onChange({ ...data, image: { ...data.image, alt: v } })} hint="Required for SEO & accessibility" />
      <Field label="Caption" value={data.caption || ''} onChange={v => onChange({ ...data, caption: v })} />
    </>
  );
}
