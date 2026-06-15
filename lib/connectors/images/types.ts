/**
 * Common interface every image provider adapter implements.
 *
 * Adding a new provider (Brandfolder, Bynder, your own DAM, etc.)
 * means writing one file that conforms to this interface and
 * registering it in ./index.ts — no changes to the editor UI
 * or build engine are required.
 */

export interface ImageSearchFilters {
  orientation?: 'landscape' | 'portrait' | 'square';
  color?: string;
  perPage?: number;
}

export interface ImageSearchResult {
  id: string;
  provider: 'unsplash' | 'pexels' | 'getty' | 'cloudinary';
  thumbUrl: string;
  fullUrl: string;
  width: number;
  height: number;
  alt: string;
  author?: string;
  authorUrl?: string;
  license: string;
  licenseType: 'free' | 'licensed' | 'dam';
}

export interface ImageConnector {
  id: 'unsplash' | 'pexels' | 'getty' | 'cloudinary';
  name: string;
  licenseType: 'free' | 'licensed' | 'dam';
  isConfigured(): boolean;
  search(query: string, filters?: ImageSearchFilters): Promise<ImageSearchResult[]>;
}
