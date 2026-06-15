import type { ImageConnector, ImageSearchFilters, ImageSearchResult } from './types';

/**
 * Cloudinary adapter — https://cloudinary.com/documentation/admin_api
 *
 * Searches the brand's OWN asset library (their DAM). Results are
 * served through Cloudinary's CDN with on-the-fly transforms —
 * ClawdPress requests an optimised f_auto,q_auto URL for the exported
 * <img>, giving brands automatic format/quality optimisation with
 * no build step.
 */
export const cloudinaryConnector: ImageConnector = {
  id: 'cloudinary',
  name: 'Cloudinary',
  licenseType: 'dam',

  isConfigured() {
    return !!process.env.CLOUDINARY_CLOUD_NAME && !!process.env.CLOUDINARY_API_KEY && !!process.env.CLOUDINARY_API_SECRET;
  },

  async search(query: string, filters: ImageSearchFilters = {}): Promise<ImageSearchResult[]> {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    if (!cloudName || !apiKey || !apiSecret) {
      throw new Error('Cloudinary credentials not configured');
    }

    const auth = Buffer.from(`${apiKey}:${apiSecret}`).toString('base64');
    const expression = query ? `resource_type:image AND ${escapeExpr(query)}` : 'resource_type:image';

    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/resources/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${auth}`,
      },
      body: JSON.stringify({
        expression,
        max_results: filters.perPage || 12,
        with_field: ['context', 'tags'],
      }),
    });
    if (!res.ok) throw new Error(`Cloudinary API error: ${res.status}`);
    const json = await res.json();

    return (json.resources || []).map((r: any): ImageSearchResult => {
      const optimised = injectTransform(r.secure_url, 'f_auto,q_auto,w_1200');
      const thumb = injectTransform(r.secure_url, 'f_auto,q_auto,w_320');
      return {
        id: r.public_id,
        provider: 'cloudinary',
        thumbUrl: thumb,
        fullUrl: optimised,
        width: r.width,
        height: r.height,
        alt: r.context?.custom?.alt || r.public_id.split('/').pop() || query,
        license: 'Brand asset (Cloudinary DAM)',
        licenseType: 'dam',
      };
    });
  },
};

function injectTransform(url: string, transform: string): string {
  return url.replace('/upload/', `/upload/${transform}/`);
}

function escapeExpr(q: string): string {
  return `"${q.replace(/"/g, '\\"')}"`;
}
