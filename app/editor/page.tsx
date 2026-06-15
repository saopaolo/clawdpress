'use client';

import { useState, useEffect } from 'react';
import type { Page, Block, BlockType, SiteConfig } from '@/lib/types';
import BlockPreview from '@/components/editor/BlockPreview';
import BlockEditorPanel from '@/components/editor/BlockEditorPanel';
import AIPanel from '@/components/editor/AIPanel';
import SEOPanel from '@/components/editor/SEOPanel';
import PublishPanel from '@/components/editor/PublishPanel';
import ImagePickerModal from '@/components/editor/ImagePickerModal';
import { createDefaultBlock, cloneBlock } from '@/components/editor/block-defaults';
import { renderBlock } from '@/lib/build/render-block';

type RightTab = 'block' | 'seo' | 'ai' | 'publish';
type ViewMode = 'editor' | 'preview' | 'html';

const BLOCK_TYPES: { type: BlockType; label: string; icon: string }[] = [
  { type: 'hero', label: 'Hero', icon: '🎯' },
  { type: 'text', label: 'Text', icon: '📝' },
  { type: 'features', label: 'Features', icon: '▦' },
  { type: 'cta', label: 'CTA', icon: '📣' },
  { type: 'faq', label: 'FAQ', icon: '❓' },
  { type: 'image', label: 'Image', icon: '🖼️' },
];

export default function EditorPage() {
  const [pages, setPages] = useState<Page[]>([]);
  const [site, setSite] = useState<SiteConfig | null>(null);
  const [currentPageId, setCurrentPageId] = useState<string>('home');
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [rightTab, setRightTab] = useState<RightTab>('block');
  const [viewMode, setViewMode] = useState<ViewMode>('editor');
  const [blockPickerOpen, setBlockPickerOpen] = useState(false);
  const [imagePicker, setImagePicker] = useState<'hero' | 'image' | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/pages').then(r => r.json()).then(json => {
      setPages(json.pages || []);
      if (json.pages?.length) setCurrentPageId(json.pages[0].id);
    });
    setSite({ name: 'My Brand', url: 'https://example.com' });
  }, []);

  const currentPage = pages.find(p => p.id === currentPageId);
  const selectedBlock = currentPage?.blocks.find(b => b.id === selectedBlockId) || null;

  const updatePage = (updater: (page: Page) => Page) => {
    setPages(prev => prev.map(p => (p.id === currentPageId ? updater(p) : p)));
  };

  const updateBlock = (id: string, data: Block['data']) => {
    updatePage(page => ({
      ...page,
      blocks: page.blocks.map(b => (b.id === id ? { ...b, data } : b)),
    }));
  };

  const addBlock = (type: BlockType) => {
    const block = createDefaultBlock(type);
    updatePage(page => ({ ...page, blocks: [...page.blocks, block] }));
    setSelectedBlockId(block.id);
    setBlockPickerOpen(false);
  };

  const deleteBlock = (id: string) => {
    updatePage(page => ({ ...page, blocks: page.blocks.filter(b => b.id !== id) }));
    if (selectedBlockId === id) setSelectedBlockId(null);
  };

  const moveBlock = (id: string, dir: 'up' | 'down') => {
    updatePage(page => {
      const blocks = [...page.blocks];
      const i = blocks.findIndex(b => b.id === id);
      const j = dir === 'up' ? i - 1 : i + 1;
      if (j < 0 || j >= blocks.length) return page;
      [blocks[i], blocks[j]] = [blocks[j], blocks[i]];
      return { ...page, blocks };
    });
  };

  const duplicateBlock = (id: string) => {
    updatePage(page => {
      const i = page.blocks.findIndex(b => b.id === id);
      if (i < 0) return page;
      const clone = cloneBlock(page.blocks[i]);
      const blocks = [...page.blocks];
      blocks.splice(i + 1, 0, clone);
      setSelectedBlockId(clone.id);
      return { ...page, blocks };
    });
  };

  const savePage = async () => {
    if (!currentPage) return;
    setSaving(true);
    try {
      await fetch(`/api/pages/${currentPage.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentPage),
      });
    } finally {
      setSaving(false);
    }
  };

  const addPage = () => {
    const name = prompt('Page name:', 'New Page');
    if (!name) return;
    const slug = '/' + name.toLowerCase().replace(/\s+/g, '-');
    const id = 'page-' + Date.now();
    const page: Page = { id, name, slug, blocks: [createDefaultBlock('text')] };
    setPages(prev => [...prev, page]);
    setCurrentPageId(id);
    fetch('/api/pages', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(page) });
  };

  const applyAIOutput = (text: string) => {
    if (!selectedBlock) return;
    const firstLine = text.split('\n')[0].replace(/^[#*\d.\s]+/, '').trim();
    const data = { ...selectedBlock.data } as any;
    if ('title' in data) data.title = firstLine.substring(0, 100);
    updateBlock(selectedBlock.id, data);
  };

  const handleImageSelect = (asset: any) => {
    if (!selectedBlock) return;
    const data = { ...selectedBlock.data } as any;
    if (selectedBlock.type === 'hero') data.image = asset;
    if (selectedBlock.type === 'image') data.image = asset;
    updateBlock(selectedBlock.id, data);
  };

  if (!currentPage || !site) {
    return <div className="h-screen flex items-center justify-center text-gray-400">Loading ClawdPress…</div>;
  }

  const aiContext = JSON.stringify(selectedBlock?.data || currentPage.blocks.map(b => b.data));
  const fullHTML = currentPage.blocks.map(renderBlock).join('\n');

  return (
    <div className="h-screen flex flex-col bg-white">
      <div className="h-12 flex items-center gap-3 px-4 border-b border-gray-100 shrink-0">
        <div className="flex items-center gap-2 font-medium text-sm">
          <div className="w-6 h-6 bg-violet rounded-md flex items-center justify-center text-white text-xs font-mono">CP</div>
          ClawdPress
        </div>
        <div className="text-xs text-gray-500 bg-gray-50 border border-gray-100 rounded-md px-2 py-1">{site.name}</div>
        <div className="w-px h-5 bg-gray-100" />
        <div className="flex-1 flex items-center justify-center gap-1">
          {(['editor', 'preview', 'html'] as ViewMode[]).map(v => (
            <button
              key={v}
              onClick={() => setViewMode(v)}
              className={`px-3 py-1 rounded-md text-sm transition ${viewMode === v ? 'bg-violet-tint text-violet font-medium' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              {v === 'editor' ? 'Edit' : v === 'preview' ? 'Preview' : 'HTML Output'}
            </button>
          ))}
        </div>
        <button onClick={savePage} disabled={saving} className="px-3 py-1.5 rounded-md border border-gray-200 text-sm hover:bg-gray-50 transition">
          {saving ? 'Saving…' : '💾 Save'}
        </button>
        <button onClick={() => setRightTab('publish')} className="px-3 py-1.5 rounded-md bg-violet text-white text-sm font-medium hover:bg-violet-light transition">
          🚀 Publish
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-56 border-r border-gray-100 flex flex-col shrink-0">
          <div className="px-3 py-2 text-[11px] font-medium text-gray-400 uppercase tracking-wide">Pages</div>
          <div className="flex-1 overflow-y-auto">
            {pages.map(p => (
              <button
                key={p.id}
                onClick={() => { setCurrentPageId(p.id); setSelectedBlockId(null); }}
                className={`w-full text-left px-3 py-2 border-l-2 transition ${p.id === currentPageId ? 'border-violet bg-violet-tint/30' : 'border-transparent hover:bg-gray-50'}`}
              >
                <div className="text-sm">{p.name}</div>
                <div className="text-[11px] text-gray-400 font-mono">{p.slug}</div>
              </button>
            ))}
          </div>
          <div className="p-2 border-t border-gray-100">
            <button onClick={addPage} className="w-full px-3 py-1.5 rounded-md border border-gray-200 text-sm hover:bg-gray-50 transition">+ New page</button>
          </div>
        </div>

        <div className="flex-1 flex flex-col overflow-hidden">
          {viewMode === 'editor' && (
            <>
              <div className="h-10 flex items-center gap-2 px-3 border-b border-gray-100 shrink-0">
                <span className="text-sm font-medium text-gray-700">{currentPage.name}</span>
                <div className="w-px h-4 bg-gray-100 mx-1" />
                <button disabled={!selectedBlockId} onClick={() => selectedBlockId && moveBlock(selectedBlockId, 'up')} className="px-2 py-1 text-sm text-gray-500 hover:bg-gray-50 rounded disabled:opacity-30">↑</button>
                <button disabled={!selectedBlockId} onClick={() => selectedBlockId && moveBlock(selectedBlockId, 'down')} className="px-2 py-1 text-sm text-gray-500 hover:bg-gray-50 rounded disabled:opacity-30">↓</button>
                <button disabled={!selectedBlockId} onClick={() => selectedBlockId && duplicateBlock(selectedBlockId)} className="px-2 py-1 text-sm text-gray-500 hover:bg-gray-50 rounded disabled:opacity-30">⧉</button>
                <button disabled={!selectedBlockId} onClick={() => selectedBlockId && deleteBlock(selectedBlockId)} className="px-2 py-1 text-sm text-red-500 hover:bg-red-50 rounded disabled:opacity-30">🗑</button>
                <div className="w-px h-4 bg-gray-100 mx-1" />
                <button onClick={() => setRightTab('ai')} className="px-2 py-1 text-sm text-amber-600 hover:bg-amber-50 rounded">✨ AI Write</button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
                <div className="max-w-3xl mx-auto flex flex-col gap-2">
                  {currentPage.blocks.map(block => (
                    <div
                      key={block.id}
                      onClick={() => setSelectedBlockId(block.id)}
                      className={`relative rounded-lg cursor-pointer border-2 transition ${selectedBlockId === block.id ? 'border-violet' : 'border-transparent hover:border-violet/30'}`}
                    >
                      <BlockPreview block={block} />
                    </div>
                  ))}

                  {blockPickerOpen && (
                    <div className="bg-white border border-gray-200 rounded-lg p-3">
                      <div className="text-xs font-medium text-gray-500 mb-2">Add a block</div>
                      <div className="grid grid-cols-3 gap-2">
                        {BLOCK_TYPES.map(bt => (
                          <button
                            key={bt.type}
                            onClick={() => addBlock(bt.type)}
                            className="px-2 py-3 rounded-md border border-gray-200 bg-gray-50 hover:border-violet hover:bg-violet-tint hover:text-violet transition flex flex-col items-center gap-1 text-xs"
                          >
                            <span className="text-lg">{bt.icon}</span>{bt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  <button
                    onClick={() => setBlockPickerOpen(o => !o)}
                    className="border-2 border-dashed border-gray-200 rounded-lg py-5 text-sm text-gray-400 hover:border-violet hover:text-violet hover:bg-violet-tint/30 transition"
                  >
                    + Add block
                  </button>
                </div>
              </div>
            </>
          )}

          {viewMode === 'preview' && (
            <div className="flex-1 overflow-y-auto bg-gray-50 p-4">
              <div className="max-w-3xl mx-auto bg-white rounded-lg overflow-hidden border border-gray-100">
                <iframe
                  title="Site preview"
                  className="w-full"
                  style={{ height: '700px', border: 'none' }}
                  srcDoc={`<!DOCTYPE html><html><head><link rel="stylesheet" href="/styles/theme.css"></head><body><main>${fullHTML}</main></body></html>`}
                />
              </div>
            </div>
          )}

          {viewMode === 'html' && (
            <div className="flex-1 overflow-y-auto bg-ink p-4">
              <pre className="text-[12px] text-green-200 font-mono leading-relaxed whitespace-pre-wrap">{fullHTML}</pre>
            </div>
          )}
        </div>

        <div className="w-72 border-l border-gray-100 flex flex-col shrink-0">
          <div className="flex border-b border-gray-100 shrink-0">
            {(['block', 'seo', 'ai', 'publish'] as RightTab[]).map(t => (
              <button
                key={t}
                onClick={() => setRightTab(t)}
                className={`flex-1 py-2.5 text-xs transition ${rightTab === t ? 'text-violet font-medium border-b-2 border-violet' : 'text-gray-400 hover:text-gray-600'}`}
              >
                {t === 'block' ? '◫ Block' : t === 'seo' ? '📈 SEO' : t === 'ai' ? '✨ AI' : '🚀 Publish'}
              </button>
            ))}
          </div>
          <div className="flex-1 overflow-y-auto p-3.5">
            {rightTab === 'block' && (
              <BlockEditorPanel
                block={selectedBlock}
                onChange={data => selectedBlock && updateBlock(selectedBlock.id, data)}
                onOpenAI={() => setRightTab('ai')}
                onOpenImagePicker={target => setImagePicker(target)}
              />
            )}
            {rightTab === 'seo' && (
              <SEOPanel
                page={currentPage}
                siteUrl={site.url}
                onChange={seo => updatePage(page => ({ ...page, seo }))}
              />
            )}
            {rightTab === 'ai' && <AIPanel context={aiContext} onApply={applyAIOutput} />}
            {rightTab === 'publish' && <PublishPanel pages={pages} />}
          </div>
        </div>
      </div>

      {imagePicker && (
        <ImagePickerModal onSelect={handleImageSelect} onClose={() => setImagePicker(null)} />
      )}
    </div>
  );
}
