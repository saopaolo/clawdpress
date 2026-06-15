import type { ImageConnector, ImageSearchFilters, ImageSearchResult } from './types';

/**
 * Unsplash adapter — https://unsplash.com/developers
 * Free tier: 50 requests/hour (demo apps).
 */
export const unsplashConnector: ImageConnector = {
  id: 'unsplash',
  name: 'Unsplash',
  licenseType: 'free',

  isConfigured() {
    return !!process.env.UNSPLASH_ACCESS_KEY;
  },

  async search(query: string, filters: ImageSearchFilters = {}): Promise<ImageSearchResult[]> {
    const key = process.env.UNSPLASH_ACCESS_KEY;
    if (!key) throw new Error('UNSPLASH_ACCESS_KEY is not configured');

    const params = new URLSearchParams({
      query,
      per_page: String(filters.perPage || 12),
    });
    if (filters.orientation) params.set('orientation', filters.orientation);
    if (filters.color) params.set('color', filters.color);

    const res = await fetch(`https://api.unsplash.com/search/photos?${params}`, {
      headers: { Authorization: `Client-ID ${key}` },
    });
    if (!res.ok) throw new Error(`Unsplash API error: ${res.status}`);
    const json = await res.json();

    return (json.results || []).map((r: any): ImageSearchResult => ({
      id: r.id,
      provider: 'unsplash',
      thumbUrl: r.urls.small,
      fullUrl: r.urls.regular,
      width: r.width,
      height: r.height,
      alt: r.alt_description || query,
      author: r.user?.name,
      authorUrl: r.user?.links?.html,
      license: 'Unsplash License',
      licenseType: 'free',
    }));
  },
};
