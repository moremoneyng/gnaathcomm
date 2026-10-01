import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/auth';
import { effectiveStoreConfig, parseStoreConfigInput } from '@/lib/storeConfig';
import { DEFAULT_STORE_CONFIG } from '@/data/storeCatalog';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const row = await prisma.storeConfig.findUnique({ where: { id: 'default' } });
    return NextResponse.json(
      { success: true, config: effectiveStoreConfig(row) },
      { headers: { 'Cache-Control': 'no-store, max-age=0' } }
    );
  } catch (error: unknown) {
    console.error('Store config fetch error:', error);
    // The storefront keeps working on built-in defaults if the database is unreachable.
    return NextResponse.json({ success: true, config: DEFAULT_STORE_CONFIG, fallback: true });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Only admins can change store settings.' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const current = effectiveStoreConfig(await prisma.storeConfig.findUnique({ where: { id: 'default' } }));
    const parsed = parseStoreConfigInput(body, current);
    if (!parsed.ok) {
      return NextResponse.json({ success: false, error: parsed.error }, { status: 400 });
    }

    // Single settings row: update in place, or create it if it has never existed.
    const saved = await prisma.storeConfig.upsert({
      where: { id: 'default' },
      update: parsed.config,
      create: { id: 'default', ...parsed.config },
    });

    return NextResponse.json({ success: true, config: effectiveStoreConfig(saved) });
  } catch (error: unknown) {
    console.error('Store config save error:', error);
    return NextResponse.json({ success: false, error: 'Could not save store settings.' }, { status: 500 });
  }
}
