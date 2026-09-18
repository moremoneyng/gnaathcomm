import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/auth';

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
          description: category.description || '',
          itemCount: category._count.products,
        })),
      },
      { headers: { 'Cache-Control': 'no-store, max-age=0' } }
    );
  } catch (error: unknown) {
    console.error('Category fetch error:', error);
    return NextResponse.json({ success: false, error: 'Failed to load categories.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized admin access' }, { status: 401 });
    }

    const body = await request.json();
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const description = typeof body.description === 'string' ? body.description.trim() : '';

    if (!name) {
      return NextResponse.json({ success: false, error: 'Category name is required.' }, { status: 400 });
    }

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    if (!slug || slug === 'all') {
      return NextResponse.json({ success: false, error: 'Choose a valid category name.' }, { status: 400 });
    }

    const category = await prisma.category.create({
      data: {
        name,
        slug,
        description: description || `${name} products`,
      },
    });

    return NextResponse.json({ success: true, category }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create category.';
    if (message.toLowerCase().includes('unique')) {
      return NextResponse.json({ success: false, error: 'A category with this name already exists.' }, { status: 409 });
    }
    console.error('Category creation error:', error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized admin access' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'Category ID required' }, { status: 400 });
    }

    const category = await prisma.category.findUnique({
      where: { id },
      include: { _count: { select: { products: true } } },
    });

    if (!category) {
      return NextResponse.json({ success: false, error: 'Category not found' }, { status: 404 });
    }

    if (category._count.products > 0) {
      return NextResponse.json(
        { success: false, error: `Remove the ${category._count.products} product(s) in this category before deleting it.` },
        { status: 409 }
      );
    }

    await prisma.category.delete({ where: { id } });
    return NextResponse.json({ success: true, message: 'Category deleted successfully' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to delete category.';
    console.error('Category deletion error:', error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
