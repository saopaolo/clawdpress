import { NextRequest, NextResponse } from 'next/server';
import { getPage, savePage, deletePage } from '@/lib/store/content-store';
import type { Page } from '@/lib/types';

interface Params {
  params: { id: string };
}

/** GET /api/pages/[id] */
export async function GET(_req: NextRequest, { params }: Params) {
  const page = getPage(params.id);
  if (!page) return NextResponse.json({ error: 'Page not found' }, { status: 404 });
  return NextResponse.json({ page });
}

/** PUT /api/pages/[id] — update page content */
export async function PUT(req: NextRequest, { params }: Params) {
  const page = (await req.json()) as Page;
  page.id = params.id;
  savePage(page);
  return NextResponse.json({ page });
}

/** DELETE /api/pages/[id] */
export async function DELETE(_req: NextRequest, { params }: Params) {
  deletePage(params.id);
  return NextResponse.json({ ok: true });
}
