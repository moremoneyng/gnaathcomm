import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/auth';
import {
  CATEGORY_ICON_NAMES,
  defaultCategoryDescription,
  resolveCategoryIcon,
  slugifyCategoryName,
  suggestCategoryIcon,
} from '@/lib/categoryIntelligence';

export const dynamic = 'force-dynamic';

function unauthorized() {
  return NextResponse.json({ success: false, error: 'Unauthorized admin access' }, { status: 401 });
}

function cleanImage(value: unknown) {
  if (typeof value !== 'string' || !value.trim()) return null;
  try {
    const url = new URL(value.trim());
    return url.protocol === 'https:' ? url.toString() : null;
  } catch {
    return null;
  }
}

function cleanIcon(value: unknown) {
  return typeof value === 'string' && CATEGORY_ICON_NAMES.includes(value) ? value : null;
}

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) return unauthorized();

    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: { select: { products: true } },
        products: { select: { image: true }, orderBy: { createdAt: 'desc' }, take: 1 },
      },
    });

    return NextResponse.json(
      {
        success: true,
        categories: categories.map((category) => ({
          id: category.id,
          name: category.name,
          slug: category.slug,
          description: category.description || '',
          iconName: resolveCategoryIcon(category.iconName, category.name, category.description || ''),
          customIcon: Boolean(category.iconName && category.iconName !== 'LayoutGrid'),
          image: category.image || '',
          fallbackImage: category.products[0]?.image || '',
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
    if (!session) return unauthorized();

    const body = await request.json();
    const name = typeof body.name === 'string' ? body.name.trim().slice(0, 80) : '';
    const description = typeof body.description === 'string' ? body.description.trim().slice(0, 500) : '';

    if (!name) {
      return NextResponse.json({ success: false, error: 'Category name is required.' }, { status: 400 });
    }

    const slug = slugifyCategoryName(name);
    if (!slug || slug === 'all') {
      return NextResponse.json({ success: false, error: 'Choose a valid category name.' }, { status: 400 });
    }

    const category = await prisma.category.create({
      data: {
        name,
        slug,
        description: description || defaultCategoryDescription(name),
        iconName: cleanIcon(body.iconName) || suggestCategoryIcon(name, description),
        image: cleanImage(body.image),
      },
    });

    return NextResponse.json({ success: true, category }, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json({ success: false, error: 'A category with this name already exists.' }, { status: 409 });
    }
    console.error('Category creation error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create category.' }, { status: 500 });
  }
}

/**
 * Edits a category. The slug is kept stable on rename so shared links like
 * /shop?category=smartphones and saved carts keep working.
 */
export async function PATCH(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) return unauthorized();

    const body = await request.json();
    const id = typeof body.id === 'string' ? body.id : '';
    if (!id) {
      return NextResponse.json({ success: false, error: 'Category ID required' }, { status: 400 });
    }

    const data: Prisma.CategoryUpdateInput = {};
    if (body.name !== undefined) {
      const name = typeof body.name === 'string' ? body.name.trim().slice(0, 80) : '';
      if (!name) return NextResponse.json({ success: false, error: 'Category name cannot be empty.' }, { status: 400 });
      data.name = name;
    }
    if (body.description !== undefined) {
      data.description = typeof body.description === 'string' ? body.description.trim().slice(0, 500) : '';
    }
    if (body.iconName !== undefined) {
      // An empty value means "let the store choose", stored as the schema default.
      data.iconName = cleanIcon(body.iconName) || 'LayoutGrid';
    }
    if (body.image !== undefined) {
      data.image = cleanImage(body.image);
    }

    const category = await prisma.category.update({ where: { id }, data });
    return NextResponse.json({ success: true, category });
  } catch (error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json({ success: false, error: 'Category not found' }, { status: 404 });
    }
    console.error('Category update error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update category.' }, { status: 500 });
  }
}

/**
 * Deletes a category. Products cascade-delete with their category in the schema, so a
 * category that still has products can only be removed when they are moved first.
 */
export async function DELETE(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) return unauthorized();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const moveTo = searchParams.get('moveTo');
    if (!id) {
      return NextResponse.json({ success: false, error: 'Category ID required' }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      const category = await tx.category.findUnique({
        where: { id },
        include: { _count: { select: { products: true } } },
      });
      if (!category) return { status: 404, error: 'Category not found' } as const;

      let moved = 0;
      if (category._count.products > 0) {
        if (!moveTo || moveTo === id) {
          return {
            status: 409,
            error: `Move the ${category._count.products} product(s) in this category to another category first.`,
          } as const;
        }
        const target = await tx.category.findUnique({ where: { id: moveTo } });
        if (!target) return { status: 400, error: 'Target category not found.' } as const;
        moved = (await tx.product.updateMany({ where: { categoryId: id }, data: { categoryId: target.id } })).count;
      }

      // Re-check inside the transaction so nothing added meanwhile is cascade-deleted.
      const remaining = await tx.product.count({ where: { categoryId: id } });
      if (remaining > 0) return { status: 409, error: 'Products were added to this category. Try again.' } as const;

      await tx.category.delete({ where: { id } });
      return { status: 200, moved } as const;
    });

    if (result.status !== 200) {
      return NextResponse.json({ success: false, error: result.error }, { status: result.status });
    }
    return NextResponse.json({ success: true, moved: result.moved, message: 'Category deleted successfully' });
  } catch (error: unknown) {
    console.error('Category deletion error:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete category.' }, { status: 500 });
  }
}
