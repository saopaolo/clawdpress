import { NextRequest, NextResponse } from 'next/server';
import { getAllPages, savePage } from '@/lib/store/content-store';
import type { Page } from '@/lib/types';

/** GET /api/pages — list all pages */
export async function GET() {
  return NextResponse.json({ pages: getAllPages() });
}

/** POST /api/pages — create a new page */
export async function POST(req: NextRequest) {
  const page = (await req.json()) as Page;
  if (!page.id || !page.slug || !page.name) {
    return NextResponse.json({ error: 'id, slug, and name are required' }, { status: 400 });
  }
  savePage(page);
  return NextResponse.json({ page });
}
