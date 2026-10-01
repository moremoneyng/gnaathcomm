import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/auth';
import { AVAILABILITY_VALUES, parseProductInput, productSlug, type Availability, type ProductData } from '@/lib/productInput';

export const dynamic = 'force-dynamic';

function unauthorized() {
  return NextResponse.json({ success: false, error: 'Unauthorized admin access' }, { status: 401 });
}

function toPrismaData(data: ProductData) {
  const { options, ...rest } = data;
  return {
    ...rest,
    ...(options !== undefined && { options: options === null ? Prisma.DbNull : (options as unknown as Prisma.InputJsonValue) }),
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const search = searchParams.get('search');
  const featured = searchParams.get('featured');

  try {
    const whereClause: Prisma.ProductWhereInput = {};

    if (category && category !== 'all') {
      whereClause.category = {
        slug: category,
      };
    }

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { brand: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (featured === 'true') {
      whereClause.isFeatured = true;
    }

    const products = await prisma.product.findMany({
      where: whereClause,
      include: {
        category: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const formattedProducts = products.map((p) => ({
      id: p.id,
      name: p.name,
      category: p.category.slug,
      categoryName: p.category.name,
      brand: p.brand,
      price: p.price,
      originalPrice: p.originalPrice,
      rating: p.rating,
      reviewsCount: p.reviewsCount,
      image: p.image,
      images: p.images,
      video: p.video,
      description: p.description,
      features: p.features,
      options: Array.isArray(p.options) ? p.options : [],
      badge: p.badge,
      inStock: p.inStock,
      stockQuantity: p.stockQuantity,
      isPreorder: p.isPreorder,
      preorderNote: p.preorderNote,
      isFeatured: p.isFeatured,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    }));

    return NextResponse.json(
      { success: true, products: formattedProducts },
      { headers: { 'Cache-Control': 'no-store, max-age=0' } }
    );
  } catch (error: unknown) {
    console.error('Database query failed while loading products:', error instanceof Error ? error.message : error);
    return NextResponse.json(
      { success: false, products: [], error: 'Product catalog is temporarily unavailable.' },
      { status: 503 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) return unauthorized();

    const parsed = parseProductInput(await request.json(), 'create');
    if (!parsed.ok) {
      return NextResponse.json({ success: false, error: parsed.error }, { status: 400 });
    }

    const category = await prisma.category.findUnique({ where: { slug: parsed.categorySlug } });
    if (!category) {
      return NextResponse.json({ success: false, error: 'Selected category no longer exists. Refresh and choose a category.' }, { status: 400 });
    }

    const data = toPrismaData(parsed.data);
    const product = await prisma.product.create({
      data: {
        ...data,
        name: parsed.data.name!,
        price: parsed.data.price!,
        image: parsed.data.image!,
        description: parsed.data.description ?? '',
        slug: productSlug(parsed.data.name!),
        categoryId: category.id,
      },
    });

    return NextResponse.json({ success: true, product }, { status: 201 });
  } catch (error: unknown) {
    console.error('Error creating product:', error);
    return NextResponse.json({ success: false, error: 'Could not save the product. Please try again.' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) return unauthorized();

    const body = await request.json();
    const id = typeof body.id === 'string' ? body.id : '';
    if (!id) {
      return NextResponse.json({ success: false, error: 'Product ID required for update' }, { status: 400 });
    }

    const parsed = parseProductInput(body, 'update');
    if (!parsed.ok) {
      return NextResponse.json({ success: false, error: parsed.error }, { status: 400 });
    }

    let categoryId: string | undefined;
    if (parsed.categorySlug) {
      const category = await prisma.category.findUnique({ where: { slug: parsed.categorySlug } });
      if (!category) {
        return NextResponse.json({ success: false, error: 'Selected category no longer exists.' }, { status: 400 });
      }
      categoryId = category.id;
    }

    const updated = await prisma.product.update({
      where: { id },
      data: { ...toPrismaData(parsed.data), ...(categoryId && { categoryId }) },
    });

    return NextResponse.json({ success: true, product: updated });
  } catch (error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json({ success: false, error: 'This product no longer exists.' }, { status: 404 });
    }
    console.error('Error updating product:', error);
    return NextResponse.json({ success: false, error: 'Could not update the product. Please try again.' }, { status: 500 });
  }
}

/** Bulk inventory actions: stock status, featured flag, or moving products to another category. */
export async function PATCH(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) return unauthorized();

    const body = await request.json();
    const ids: string[] = Array.isArray(body.ids)
      ? Array.from(new Set(body.ids.filter((id: unknown): id is string => typeof id === 'string'))).slice(0, 500) as string[]
      : [];
    if (ids.length === 0) {
      return NextResponse.json({ success: false, error: 'Select at least one product.' }, { status: 400 });
    }

    const data: Prisma.ProductUpdateManyMutationInput & { categoryId?: string } = {};
    if (typeof body.inStock === 'boolean') data.inStock = body.inStock;
    if (typeof body.isFeatured === 'boolean') data.isFeatured = body.isFeatured;
    if (body.availability !== undefined) {
      if (!AVAILABILITY_VALUES.includes(body.availability as Availability)) {
        return NextResponse.json({ success: false, error: 'Unknown availability.' }, { status: 400 });
      }
      data.isPreorder = body.availability === 'preorder';
      data.inStock = body.availability !== 'out_of_stock';
    }
    if (typeof body.category === 'string' && body.category) {
      const category = await prisma.category.findUnique({ where: { slug: body.category } });
      if (!category) {
        return NextResponse.json({ success: false, error: 'Target category not found.' }, { status: 400 });
      }
      data.categoryId = category.id;
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ success: false, error: 'Nothing to update.' }, { status: 400 });
    }

    // A tracked product with no units left can't be switched back on without a restock.
    // Pre-orders ignore stock counts; otherwise availability needs units on hand.
    const where: Prisma.ProductWhereInput =
      data.inStock === true && data.isPreorder !== true
        ? { id: { in: ids }, OR: [{ stockQuantity: null }, { stockQuantity: { gt: 0 } }] }
        : { id: { in: ids } };
    const result = await prisma.product.updateMany({ where, data });
    return NextResponse.json({ success: true, updated: result.count });
  } catch (error: unknown) {
    console.error('Error bulk-updating products:', error);
    return NextResponse.json({ success: false, error: 'Could not update the selected products.' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) return unauthorized();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Product ID required' }, { status: 400 });
    }

    // Order history keeps the product name and price because OrderItem.productId is SET NULL.
    await prisma.product.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'Product deleted successfully' });
  } catch (error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json({ success: false, error: 'This product was already deleted.' }, { status: 404 });
    }
    console.error('Error deleting product:', error);
    return NextResponse.json({ success: false, error: 'Could not delete the product.' }, { status: 500 });
  }
}
