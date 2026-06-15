import type { ImageConnector, ImageSearchFilters, ImageSearchResult } from './types';

/**
 * Pexels adapter — https://www.pexels.com/api/
 * Free tier: 200 requests/hour, 20,000/month.
 */
export const pexelsConnector: ImageConnector = {
  id: 'pexels',
  name: 'Pexels',
  licenseType: 'free',

  isConfigured() {
    return !!process.env.PEXELS_API_KEY;
  },

  async search(query: string, filters: ImageSearchFilters = {}): Promise<ImageSearchResult[]> {
    const key = process.env.PEXELS_API_KEY;
    if (!key) throw new Error('PEXELS_API_KEY is not configured');

    const params = new URLSearchParams({
      query,
      per_page: String(filters.perPage || 12),
    });
    if (filters.orientation) params.set('orientation', filters.orientation);
    if (filters.color) params.set('color', filters.color);

    const res = await fetch(`https://api.pexels.com/v1/search?${params}`, {
      headers: { Authorization: key },
    });
    if (!res.ok) throw new Error(`Pexels API error: ${res.status}`);
    const json = await res.json();

    return (json.photos || []).map((p: any): ImageSearchResult => ({
      id: String(p.id),
      provider: 'pexels',
      thumbUrl: p.src.medium,
      fullUrl: p.src.large2x,
      width: p.width,
      height: p.height,
      alt: p.alt || query,
      author: p.photographer,
      authorUrl: p.photographer_url,
      license: 'Pexels License',
      licenseType: 'free',
    }));
  },
};
