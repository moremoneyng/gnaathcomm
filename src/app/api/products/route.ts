import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const search = searchParams.get('search');
  const featured = searchParams.get('featured');

  try {
    const whereClause: any = {};

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
      brand: p.brand,
      price: p.price,
      originalPrice: p.originalPrice,
      rating: p.rating,
      reviewsCount: p.reviewsCount,
      image: p.image,
      images: p.images,
      description: p.description,
      features: p.features,
      options: p.options ? (p.options as any) : [],
      badge: p.badge,
      inStock: p.inStock,
      isFeatured: p.isFeatured,
    }));

    return NextResponse.json(
      { success: true, products: formattedProducts },
      { headers: { 'Cache-Control': 'no-store, max-age=0' } }
    );
  } catch (error: any) {
    console.error('Database query failed while loading products:', error?.message || error);
    return NextResponse.json(
      { success: false, products: [], error: 'Product catalog is temporarily unavailable.' },
      { status: 503 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized admin access' }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      category: categorySlug,
      brand,
      price,
      originalPrice,
      image,
      images,
      description,
      features,
      options,
      badge,
      inStock,
      isFeatured,
    } = body;

    const numericPrice = Number(price);
    const numericOriginalPrice = originalPrice === null || originalPrice === '' ? null : Number(originalPrice);

    if (!name?.trim() || !Number.isFinite(numericPrice) || numericPrice <= 0 || !image?.trim() || !categorySlug?.trim()) {
      return NextResponse.json({ success: false, error: 'Missing required product fields (name, price, image, category)' }, { status: 400 });
    }

    if (numericOriginalPrice !== null && (!Number.isFinite(numericOriginalPrice) || numericOriginalPrice < 0)) {
      return NextResponse.json({ success: false, error: 'Original price must be a valid number.' }, { status: 400 });
    }

    const category = await prisma.category.findUnique({
      where: { slug: categorySlug },
    });

    if (!category) {
      return NextResponse.json({ success: false, error: 'Selected category no longer exists. Refresh and choose a category.' }, { status: 400 });
    }

    const slug = `${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now().toString().slice(-4)}`;

    const product = await prisma.product.create({
      data: {
        slug,
        name,
        brand: brand || 'G Naath Global',
        price: numericPrice,
        originalPrice: numericOriginalPrice,
        image,
        images: images && images.length > 0 ? images : [image],
        description: description || '',
        features: Array.isArray(features) ? features : [],
        options: options || null,
        badge: badge || null,
        inStock: inStock !== undefined ? Boolean(inStock) : true,
        isFeatured: Boolean(isFeatured),
        categoryId: category.id,
      },
    });

    return NextResponse.json({ success: true, product }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating product:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized admin access' }, { status: 401 });
    }

    const body = await request.json();
    const { id, name, category: categorySlug, brand, price, originalPrice, image, description, inStock, isFeatured } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Product ID required for update' }, { status: 400 });
    }

    let categoryId: string | undefined;
    if (categorySlug) {
      let category = await prisma.category.findUnique({ where: { slug: categorySlug } });
      if (category) categoryId = category.id;
    }

    const updated = await prisma.product.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(brand && { brand }),
        ...(price && { price: parseFloat(price) }),
        ...(originalPrice !== undefined && { originalPrice: originalPrice ? parseFloat(originalPrice) : null }),
        ...(image && { image, images: [image] }),
        ...(description !== undefined && { description }),
        ...(inStock !== undefined && { inStock: Boolean(inStock) }),
        ...(isFeatured !== undefined && { isFeatured: Boolean(isFeatured) }),
        ...(categoryId && { categoryId }),
      },
    });

    return NextResponse.json({ success: true, product: updated });
  } catch (error: any) {
    console.error('Error updating product:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
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
    const clearAll = searchParams.get('clearAll');

    if (clearAll === 'true') {
      await prisma.product.deleteMany({});
      return NextResponse.json({ success: true, message: 'All products removed' });
    }

    if (!id) {
      return NextResponse.json({ success: false, error: 'Product ID required' }, { status: 400 });
    }

    await prisma.product.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'Product deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
