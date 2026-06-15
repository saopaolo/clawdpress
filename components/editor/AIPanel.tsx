'use client';

import { useState, useEffect } from 'react';
import type { AIAction } from '@/lib/connectors/ai/claude';

interface Props {
  context: string;
  onApply: (text: string) => void;
}

const QUICK_ACTIONS: { action: AIAction; label: string; icon: string }[] = [
  { action: 'rewrite-headline', label: 'Rewrite headline', icon: '✏️' },
  { action: 'headline-variants', label: 'Headline variants', icon: '📝' },
  { action: 'meta-description', label: 'Write meta description', icon: '🔍' },
  { action: 'improve-copy', label: 'Improve copy', icon: '🪄' },
  { action: 'seo-suggestions', label: 'SEO suggestions', icon: '🔗' },
];

const STORAGE_KEY = 'clawdpress_anthropic_key';

export default function AIPanel({ context, onApply }: Props) {
  const [apiKey, setApiKey] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setApiKey(saved);
  }, []);

  const saveKey = () => {
    localStorage.setItem(STORAGE_KEY, apiKey);
  };

  const run = async (action: AIAction, prompt?: string) => {
    if (!apiKey) {
      setOutput('Add your Anthropic API key above first.');
      return;
    }
    setLoading(true);
    setOutput('');
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey, action, context, customPrompt: prompt }),
      });
      const json = await res.json();
      setOutput(json.result || json.error || 'No response');
    } catch (err: any) {
      setOutput('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-base">✨</span>
        <span className="text-sm font-medium">AI Content</span>
        <span className="text-[10px] font-medium bg-amber-100 text-amber-700 rounded-full px-2 py-0.5 font-mono">Claude</span>
      </div>

      {!apiKey && (
        <div className="bg-amber-50 rounded-md p-2.5 text-xs text-amber-800 mb-3 leading-relaxed">
          🔑 Add your Anthropic API key to enable AI features.
        </div>
      )}

      <div className="mb-3">
        <label className="block text-xs font-medium text-gray-500 mb-1">Anthropic API key</label>
        <div className="flex gap-1.5">
          <input
            type="password"
            placeholder="sk-ant-..."
            className="flex-1 px-2.5 py-1.5 rounded-md border border-gray-200 bg-gray-50 text-sm font-mono focus:border-violet focus:outline-none"
            value={apiKey}
            onChange={e => setApiKey(e.target.value)}
          />
          <button onClick={saveKey} className="px-3 py-1.5 rounded-md bg-violet text-white text-sm font-medium hover:bg-violet-light transition">
            Save
          </button>
        </div>
        <div className="text-[11px] text-gray-400 mt-1">
          Stored locally in your browser only.{' '}
          <a href="https://console.anthropic.com" target="_blank" rel="noreferrer" className="text-violet">Get a key →</a>
        </div>
      </div>

      <div className="border-t border-gray-100 pt-3 mb-3">
        <div className="text-xs font-medium text-gray-500 mb-2">Quick actions</div>
        <div className="flex flex-col gap-1.5">
          {QUICK_ACTIONS.map(a => (
            <button
              key={a.action}
              onClick={() => run(a.action)}
              disabled={loading}
              className="px-2.5 py-2 rounded-md border border-gray-200 bg-gray-50 text-sm text-left hover:border-amber-400 hover:bg-amber-50 transition disabled:opacity-50"
            >
              {a.icon} {a.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-1">
        <label className="block text-xs font-medium text-gray-500 mb-1">Custom prompt</label>
        <textarea
          className="w-full px-2.5 py-1.5 rounded-md border border-gray-200 bg-gray-50 text-sm focus:border-violet focus:outline-none min-h-[60px]"
          placeholder="Ask Claude anything about your content..."
          value={customPrompt}
          onChange={e => setCustomPrompt(e.target.value)}
        />
      </div>
      <button
        onClick={() => run('custom', customPrompt)}
        disabled={loading || !customPrompt}
        className="w-full mt-1.5 px-3 py-2 rounded-md bg-violet text-white text-sm font-medium hover:bg-violet-light transition disabled:opacity-50"
      >
        ✨ Generate
      </button>

      <div className="mt-3">
        <label className="block text-xs font-medium text-gray-500 mb-1">Output</label>
        <div className="bg-gray-50 border border-gray-200 rounded-md p-2.5 text-xs leading-relaxed min-h-[80px] max-h-[200px] overflow-y-auto whitespace-pre-wrap">
          {loading ? <span className="text-gray-400 italic">Thinking…</span> : output || <span className="text-gray-400">AI response will appear here.</span>}
        </div>
        <div className="flex gap-1.5 mt-1.5">
          <button
            onClick={() => onApply(output)}
            disabled={!output}
            className="flex-1 px-2.5 py-1.5 rounded-md border border-gray-200 text-sm hover:bg-gray-50 transition disabled:opacity-50"
          >
            ✓ Apply to block
          </button>
          <button onClick={() => setOutput('')} className="px-2.5 py-1.5 rounded-md border border-gray-200 text-sm hover:bg-gray-50 transition">
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}
