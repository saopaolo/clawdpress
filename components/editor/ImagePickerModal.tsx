'use client';

import { useState } from 'react';
import type { ImageSearchResult } from '@/lib/connectors/images/types';
import type { ImageAsset } from '@/lib/types';

interface Props {
  onSelect: (asset: ImageAsset) => void;
  onClose: () => void;
}

const SOURCES: { id: string; label: string }[] = [
  { id: 'all', label: 'All sources' },
  { id: 'unsplash', label: 'Unsplash' },
  { id: 'pexels', label: 'Pexels' },
  { id: 'getty', label: 'Getty Images' },
  { id: 'cloudinary', label: 'Cloudinary' },
];

export default function ImagePickerModal({ onSelect, onClose }: Props) {
  const [query, setQuery] = useState('');
  const [source, setSource] = useState('all');
  const [results, setResults] = useState<ImageSearchResult[]>([]);
  const [unconfigured, setUnconfigured] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<ImageSearchResult | null>(null);
  const [altText, setAltText] = useState('');

  const search = async (q: string, src: string) => {
    if (!q.trim()) { setResults([]); return; }
    setLoading(true);
    try {
      const params = new URLSearchParams({ q, source: src });
      const res = await fetch(`/api/images?${params}`);
      const json = await res.json();
      setResults(json.results || []);
      setUnconfigured(json.unconfigured || []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleQueryChange = (v: string) => {
    setQuery(v);
    search(v, source);
  };

  const handleSourceChange = (s: string) => {
    setSource(s);
    search(query, s);
  };

  const select = (img: ImageSearchResult) => {
    setSelected(img);
    setAltText(img.alt);
  };

  const confirm = () => {
    if (!selected) return;
    onSelect({
      url: selected.thumbUrl,
      fullUrl: selected.fullUrl,
      width: selected.width,
      height: selected.height,
      alt: altText || selected.alt,
      provider: selected.provider,
      attribution: {
        author: selected.author,
        sourceName: SOURCES.find(s => s.id === selected.provider)?.label,
        sourceUrl: selected.authorUrl,
        license: selected.license,
      },
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-3xl h-[600px] flex overflow-hidden shadow-xl">
        <div className="flex-1 flex flex-col">
          <div className="p-3 border-b border-gray-100 flex items-center gap-2">
            <input
              type="text"
              autoFocus
              placeholder="Search images…"
              className="flex-1 px-3 py-2 rounded-md border border-gray-200 bg-gray-50 text-sm focus:border-violet focus:outline-none"
              value={query}
              onChange={e => handleQueryChange(e.target.value)}
            />
            <select
              className="px-2 py-2 rounded-md border border-gray-200 bg-white text-sm"
              value={source}
              onChange={e => handleSourceChange(e.target.value)}
            >
              {SOURCES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
            <button onClick={onClose} className="px-2 py-2 text-gray-400 hover:text-gray-700">✕</button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 bg-gray-50">
            {loading && <div className="text-center text-sm text-gray-400 py-10">Searching…</div>}
            {!loading && !query && (
              <div className="text-center text-sm text-gray-400 py-10">Search for images to get started</div>
            )}
            {!loading && query && results.length === 0 && (
              <div className="text-center text-sm text-gray-400 py-10">
                No results.
                {unconfigured.length > 0 && (
                  <div className="mt-2 text-xs">
                    Not configured: {unconfigured.join(', ')} — add API keys in <code>.env</code>.
                  </div>
                )}
              </div>
            )}
            <div className="grid grid-cols-3 gap-2">
              {results.map(img => (
                <div
                  key={img.provider + img.id}
                  onClick={() => select(img)}
                  className={`relative rounded-md overflow-hidden cursor-pointer border-2 transition aspect-[4/3] ${selected?.id === img.id ? 'border-violet' : 'border-transparent hover:border-violet/40'}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.thumbUrl} alt={img.alt} className="w-full h-full object-cover" loading="lazy" />
                  <span className={`absolute top-1.5 left-1.5 text-[9px] px-1.5 py-0.5 rounded-full font-medium ${img.licenseType === 'free' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                    {img.licenseType === 'free' ? 'Free' : img.licenseType === 'dam' ? 'Brand' : 'Licensed'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="w-56 border-l border-gray-100 flex flex-col">
          <div className="p-3 border-b border-gray-100 text-xs font-medium text-gray-500">Image details</div>
          <div className="flex-1 overflow-y-auto p-3">
            {!selected ? (
              <div className="text-center text-xs text-gray-400 py-8">Select an image to see details</div>
            ) : (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={selected.thumbUrl} alt={selected.alt} className="w-full aspect-[4/3] object-cover rounded-md border border-gray-100 mb-2.5" />
                <div className="text-[10px] font-medium text-gray-400 uppercase mb-0.5">Source</div>
                <div className="text-xs mb-2">{SOURCES.find(s => s.id === selected.provider)?.label}</div>
                <div className="text-[10px] font-medium text-gray-400 uppercase mb-0.5">Dimensions</div>
                <div className="text-xs mb-2">{selected.width} × {selected.height}px</div>
                <div className="text-[10px] font-medium text-gray-400 uppercase mb-0.5">License</div>
                <div className="text-xs mb-2">{selected.license}</div>
                {selected.author && (
                  <>
                    <div className="text-[10px] font-medium text-gray-400 uppercase mb-0.5">Photographer</div>
                    <div className="text-xs mb-2">{selected.author}</div>
                  </>
                )}
                <div className="text-[10px] font-medium text-gray-400 uppercase mb-0.5">Alt text</div>
                <input
                  type="text"
                  className="w-full px-2 py-1 rounded-md border border-gray-200 text-xs focus:border-violet focus:outline-none mb-2"
                  value={altText}
                  onChange={e => setAltText(e.target.value)}
                />
                {selected.licenseType === 'licensed' && (
                  <div className="bg-amber-50 text-amber-800 text-[11px] rounded-md p-2 leading-relaxed">
                    ⚠️ Licensed image — ensure you have rights before publishing.
                  </div>
                )}
              </>
            )}
          </div>
          <div className="p-3 border-t border-gray-100">
            <button
              onClick={confirm}
              disabled={!selected}
              className="w-full px-3 py-2 rounded-md bg-violet text-white text-sm font-medium hover:bg-violet-light transition disabled:opacity-40"
            >
              + Insert into block
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
