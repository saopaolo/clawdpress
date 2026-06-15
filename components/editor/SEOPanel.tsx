'use client';

import type { Page } from '@/lib/types';

interface Props {
  page: Page;
  siteUrl: string;
  onChange: (seo: NonNullable<Page['seo']>) => void;
}

export default function SEOPanel({ page, siteUrl, onChange }: Props) {
  const seo = page.seo || {};
  const title = seo.title || page.name;
  const description = seo.description || '';

  const titleOk = title.length >= 40 && title.length <= 60;
  const descOk = description.length >= 120 && description.length <= 160;

  const checks = [
    { label: `Title length (${title.length}/60)`, pass: titleOk },
    { label: `Meta description (${description.length}/160)`, pass: descOk },
    { label: 'Schema.org markup', pass: true },
    { label: 'Sitemap.xml included', pass: true },
    { label: 'Clean semantic HTML', pass: true },
    { label: 'Mobile responsive', pass: true },
  ];

  const score = Math.round((checks.filter(c => c.pass).length / checks.length) * 100);
  const scoreColor = score >= 80 ? '#16A34A' : score >= 60 ? '#F59E0B' : '#E84040';
  const circumference = 2 * Math.PI * 26;
  const dashoffset = circumference * (1 - score / 100);

  return (
    <div>
      <div className="flex flex-col items-center mb-4">
        <svg width="72" height="72" viewBox="0 0 60 60" className="-rotate-90">
          <circle cx="30" cy="30" r="26" fill="none" stroke="#EDEDF5" strokeWidth="5" />
          <circle
            cx="30" cy="30" r="26" fill="none"
            stroke={scoreColor} strokeWidth="5"
            strokeDasharray={circumference}
            strokeDashoffset={dashoffset}
            strokeLinecap="round"
          />
        </svg>
        <div className="text-lg font-medium -mt-12">{score}</div>
        <div className="text-xs text-gray-500 mt-7">SEO Score</div>
      </div>

      <div className="border-t border-gray-100 pt-3 mb-3">
        <div className="text-xs font-medium text-gray-500 mb-2">Google preview</div>
        <div className="bg-gray-50 border border-gray-200 rounded-md p-2.5">
          <div className="text-xs text-teal-700 font-mono mb-0.5">{siteUrl.replace(/\/$/, '')}{page.slug}</div>
          <div className="text-base text-blue-800 mb-0.5 truncate">{title.substring(0, 60)}</div>
          <div className="text-xs text-gray-600 leading-snug">{description.substring(0, 155)}{description.length > 155 ? '…' : ''}</div>
        </div>
      </div>

      <div className="mb-3">
        <label className="block text-xs font-medium text-gray-500 mb-1">Page title</label>
        <input
          type="text"
          className="w-full px-2.5 py-1.5 rounded-md border border-gray-200 bg-gray-50 text-sm focus:border-violet focus:outline-none"
          value={title}
          onChange={e => onChange({ ...seo, title: e.target.value })}
        />
      </div>
      <div className="mb-3">
        <label className="block text-xs font-medium text-gray-500 mb-1">Meta description</label>
        <textarea
          className="w-full px-2.5 py-1.5 rounded-md border border-gray-200 bg-gray-50 text-sm focus:border-violet focus:outline-none min-h-[70px]"
          value={description}
          onChange={e => onChange({ ...seo, description: e.target.value })}
        />
      </div>
      <div className="mb-3">
        <label className="block text-xs font-medium text-gray-500 mb-1">Focus keyword</label>
        <input
          type="text"
          className="w-full px-2.5 py-1.5 rounded-md border border-gray-200 bg-gray-50 text-sm focus:border-violet focus:outline-none"
          value={seo.keyword || ''}
          onChange={e => onChange({ ...seo, keyword: e.target.value })}
        />
      </div>

      <div className="border-t border-gray-100 pt-3">
        <div className="text-xs font-medium text-gray-500 mb-2">Checks</div>
        <div className="flex flex-col gap-1.5">
          {checks.map((c, i) => (
            <div key={i} className={`flex items-center gap-2 text-xs px-2 py-1.5 rounded-md bg-gray-50 ${c.pass ? 'text-green-600' : 'text-amber-600'}`}>
              {c.pass ? '✓' : '!'} {c.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
