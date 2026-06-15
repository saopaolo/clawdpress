import type { ImageConnector, ImageSearchFilters, ImageSearchResult } from './types';

/**
 * Getty Images adapter — https://developers.gettyimages.com/
 *
 * Requires a Getty developer account (API key + secret) and an
 * OAuth client-credentials token. Results are licensed/premium —
 * the editor surfaces a rights reminder before insertion.
 */
export const gettyConnector: ImageConnector = {
  id: 'getty',
  name: 'Getty Images',
  licenseType: 'licensed',

  isConfigured() {
    return !!process.env.GETTY_API_KEY && !!process.env.GETTY_API_SECRET;
  },

  async search(query: string, filters: ImageSearchFilters = {}): Promise<ImageSearchResult[]> {
    const apiKey = process.env.GETTY_API_KEY;
    const apiSecret = process.env.GETTY_API_SECRET;
    if (!apiKey || !apiSecret) throw new Error('GETTY_API_KEY / GETTY_API_SECRET not configured');

    const token = await getGettyToken(apiKey, apiSecret);

    const params = new URLSearchParams({
      phrase: query,
      page_size: String(filters.perPage || 12),
      fields: 'id,title,referral_destinations,display_sizes,artist',
    });
    if (filters.orientation) params.set('orientations', filters.orientation);

    const res = await fetch(`https://api.gettyimages.com/v3/search/images?${params}`, {
      headers: {
        'Api-Key': apiKey,
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) throw new Error(`Getty API error: ${res.status}`);
    const json = await res.json();

    return (json.images || []).map((img: any): ImageSearchResult => {
      const preview = img.display_sizes?.find((s: any) => s.name === 'preview') || img.display_sizes?.[0];
      const comp = img.display_sizes?.find((s: any) => s.name === 'comp') || preview;
      return {
        id: img.id,
        provider: 'getty',
        thumbUrl: preview?.uri,
        fullUrl: comp?.uri,
        width: comp?.width || 0,
        height: comp?.height || 0,
        alt: img.title || query,
        author: img.artist,
        license: 'Getty Editorial / Licensed',
        licenseType: 'licensed',
      };
    });
  },
};

async function getGettyToken(apiKey: string, apiSecret: string): Promise<string> {
  const res = await fetch('https://authentication.gettyimages.com/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: apiKey,
      client_secret: apiSecret,
    }),
  });
  if (!res.ok) throw new Error(`Getty auth error: ${res.status}`);
  const json = await res.json();
  return json.access_token;
}
