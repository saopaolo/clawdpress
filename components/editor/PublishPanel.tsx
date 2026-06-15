'use client';

import type { Page } from '@/lib/types';

interface Props {
  pages: Page[];
}

export default function PublishPanel({ pages }: Props) {
  const totalBlocks = pages.reduce((sum, p) => sum + p.blocks.length, 0);

  return (
    <div>
      <div className="text-[11px] font-medium text-gray-400 uppercase tracking-wide mb-3">Deploy</div>

      <div className="bg-gray-50 border border-gray-200 rounded-md p-2.5 mb-2">
        <div className="text-[10px] text-gray-400 mb-0.5">Status</div>
        <div className="text-sm font-medium flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" /> Ready to publish
        </div>
      </div>
      <div className="bg-gray-50 border border-gray-200 rounded-md p-2.5 mb-2">
        <div className="text-[10px] text-gray-400 mb-0.5">Pages</div>
        <div className="text-sm font-medium">{pages.length} pages · {totalBlocks} blocks</div>
      </div>
      <div className="bg-gray-50 border border-gray-200 rounded-md p-2.5 mb-3">
        <div className="text-[10px] text-gray-400 mb-0.5">Output</div>
        <div className="text-sm font-medium font-mono">Clean HTML + CSS · No JS required</div>
      </div>

      <div className="border-t border-gray-100 pt-3 mb-3">
        <div className="text-xs font-medium text-gray-500 mb-2">Export</div>
        <div className="bg-ink text-green-300 font-mono text-[11px] rounded-md p-2.5 mb-2 leading-relaxed">
          $ npm run export
          <br />
          <span className="text-white/40"># writes static HTML to /exported-site</span>
        </div>
        <p className="text-[11px] text-gray-400 leading-relaxed">
          Running the export script reads everything in <code>/content</code> and writes
          a fully static site — <code>index.html</code>, per-page directories,{' '}
          <code>styles.css</code>, <code>sitemap.xml</code>, and <code>robots.txt</code> —
          ready to deploy to Netlify, Cloudflare Pages, S3, or any static host.
        </p>
      </div>

      <div className="border-t border-gray-100 pt-3">
        <div className="text-xs font-medium text-gray-500 mb-2">Deploy targets</div>
        <div className="flex flex-col gap-1.5 text-sm">
          <div className="px-2.5 py-2 rounded-md border border-gray-200 flex items-center justify-between">
            Netlify <span className="text-[10px] text-gray-400">via netlify-cli or drag &amp; drop</span>
          </div>
          <div className="px-2.5 py-2 rounded-md border border-gray-200 flex items-center justify-between">
            Cloudflare Pages <span className="text-[10px] text-gray-400">via wrangler</span>
          </div>
          <div className="px-2.5 py-2 rounded-md border border-gray-200 flex items-center justify-between">
            Any static host <span className="text-[10px] text-gray-400">/exported-site</span>
          </div>
        </div>
      </div>
    </div>
  );
}
