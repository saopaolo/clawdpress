import Anthropic from '@anthropic-ai/sdk';

/**
 * Claude content connector.
 *
 * Used for in-editor AI actions: rewriting headlines, generating
 * meta descriptions, suggesting internal links, improving copy, etc.
 *
 * Bring-your-own-key model: an Anthropic API key is supplied per
 * request from the editor (stored client-side only) and passed to
 * this function via the /app/api/ai route.
 */

export type AIAction =
  | 'rewrite-headline'
  | 'headline-variants'
  | 'meta-description'
  | 'improve-copy'
  | 'seo-suggestions'
  | 'custom';

const PROMPTS: Record<AIAction, (context: string, custom?: string) => string> = {
  'rewrite-headline': (ctx) =>
    `Rewrite the headline in this content to be more compelling and SEO-friendly. Return ONLY the new headline text, nothing else.\n\nContent:\n${ctx}`,
  'headline-variants': (ctx) =>
    `Generate 5 alternative headline variations for this content. Be concise, benefit-driven, and SEO-optimised. Return a numbered list only.\n\nContent:\n${ctx}`,
  'meta-description': (ctx) =>
    `Write a compelling meta description (under 155 characters) for this page content. Include the main keyword naturally and end with a soft call to action. Return ONLY the description text.\n\nContent:\n${ctx}`,
  'improve-copy': (ctx) =>
    `Improve this body copy to be clearer, more benefit-focused, and better for both readers and search engines. Keep the same tone and approximate length. Return ONLY the improved copy.\n\nContent:\n${ctx}`,
  'seo-suggestions': (ctx) =>
    `Suggest 5 relevant internal linking opportunities and content gaps based on this page content. Format as a bulleted list with brief reasoning for each.\n\nContent:\n${ctx}`,
  custom: (ctx, custom) =>
    `You are a professional copywriter and SEO expert working inside the ClawdPress CMS.\n\nCurrent content:\n${ctx}\n\nRequest: ${custom}`,
};

export interface RunAIOptions {
  apiKey: string;
  action: AIAction;
  context: string;
  customPrompt?: string;
  maxTokens?: number;
}

export async function runAIAction({ apiKey, action, context, customPrompt, maxTokens = 600 }: RunAIOptions): Promise<string> {
  if (!apiKey) throw new Error('Anthropic API key is required');

  const anthropic = new Anthropic({ apiKey });
  const prompt = PROMPTS[action](context, customPrompt);

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: maxTokens,
    messages: [{ role: 'user', content: prompt }],
  });

  const textBlock = message.content.find(b => b.type === 'text');
  return textBlock && 'text' in textBlock ? textBlock.text : '';
}
