import { NextRequest, NextResponse } from 'next/server';
import { imageConnectors, getConfiguredConnectors } from '@/lib/connectors/images';
import type { ImageSearchFilters } from '@/lib/connectors/images/types';

/**
 * GET /api/images?q=...&source=all|unsplash|pexels|getty|cloudinary
 *     &orientation=landscape|portrait|square&color=blue
 *
 * Searches one or all configured image connectors and returns a
 * unified result list. Only providers with credentials present in
 * the environment are queried — unconfigured providers are silently
 * skipped (and reported in `unconfigured`).
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('q') || '';
  const source = searchParams.get('source') || 'all';

  if (!query) {
    return NextResponse.json({ error: 'Missing query parameter "q"' }, { status: 400 });
  }

  const filters: ImageSearchFilters = {
    orientation: (searchParams.get('orientation') as ImageSearchFilters['orientation']) || undefined,
    color: searchParams.get('color') || undefined,
    perPage: searchParams.get('perPage') ? Number(searchParams.get('perPage')) : undefined,
  };

  const targets =
    source === 'all'
      ? getConfiguredConnectors()
      : imageConnectors[source]?.isConfigured()
      ? [imageConnectors[source]]
      : [];

  const unconfigured = Object.values(imageConnectors)
    .filter(c => !c.isConfigured() && (source === 'all' || source === c.id))
    .map(c => c.id);

  const results = await Promise.all(
    targets.map(async connector => {
      try {
        return await connector.search(query, filters);
      } catch (err: any) {
        console.error(`${connector.name} search failed:`, err.message);
        return [];
      }
    })
  );

  return NextResponse.json({
    results: results.flat(),
    unconfigured,
  });
}
