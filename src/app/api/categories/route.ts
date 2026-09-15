import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { products: true } } },
    });

    return NextResponse.json(
      {
        success: true,
        categories: categories.map((category) => ({
          id: category.id,
          name: category.name,
          slug: category.slug,
          iconName: category.iconName || 'LayoutGrid',
          description: category.description || '',
          itemCount: category._count.products,
        })),
      },
      { headers: { 'Cache-Control': 'no-store, max-age=0' } }
    );
  } catch (error: unknown) {
    console.error('Public category fetch error:', error);
    return NextResponse.json({ success: false, categories: [], error: 'Failed to load categories.' }, { status: 500 });
  }
}
