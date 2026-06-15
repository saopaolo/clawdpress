import { NextRequest, NextResponse } from 'next/server';
import { runAIAction, AIAction } from '@/lib/connectors/ai/claude';

/**
 * POST /api/ai
 *
 * Body: { apiKey: string, action: AIAction, context: string, customPrompt?: string }
 *
 * The Anthropic API key is supplied by the editor (bring-your-own-key),
 * sent per-request, and never persisted server-side. This route exists
 * to keep prompt templates centralised and consistent.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { apiKey, action, context, customPrompt } = body as {
      apiKey: string;
      action: AIAction;
      context: string;
      customPrompt?: string;
    };

    if (!apiKey) {
      return NextResponse.json({ error: 'Missing Anthropic API key' }, { status: 400 });
    }
    if (!action || !context) {
      return NextResponse.json({ error: 'Missing action or context' }, { status: 400 });
    }

    const result = await runAIAction({ apiKey, action, context, customPrompt });
    return NextResponse.json({ result });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'AI request failed' }, { status: 500 });
  }
}
