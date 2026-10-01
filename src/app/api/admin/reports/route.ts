import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/auth';
import { LOW_STOCK_THRESHOLD } from '@/lib/productInput';
import { buildSalesReport } from '@/lib/salesReport';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized admin access' }, { status: 401 });
    }

    const [orders, products, categories, repairCount, solarCount, pendingRepairs, pendingSolar] = await Promise.all([
      prisma.order.findMany({
        select: {
          id: true,
          orderNumber: true,
          customerName: true,
          totalAmount: true,
          paymentStatus: true,
          orderStatus: true,
          preferredBranch: true,
          createdAt: true,
          paidAt: true,
          items: { select: { productId: true, productName: true, price: true, quantity: true } },
        },
      }),
      prisma.product.findMany({
        select: { inStock: true, isPreorder: true, isFeatured: true, stockQuantity: true, description: true, images: true },
      }),
      prisma.category.findMany({ include: { _count: { select: { products: true } } } }),
      prisma.repairBooking.count(),
      prisma.solarQuoteRequest.count(),
      prisma.repairBooking.count({ where: { status: 'PENDING' } }),
      prisma.solarQuoteRequest.count({ where: { status: 'PENDING' } }),
    ]);

    const sales = buildSalesReport(orders);

    const inventory = {
      total: products.length,
      available: products.filter((p) => p.inStock && !p.isPreorder).length,
      preorder: products.filter((p) => p.inStock && p.isPreorder).length,
      outOfStock: products.filter((p) => !p.inStock).length,
      featured: products.filter((p) => p.isFeatured).length,
      lowStock: products.filter(
        (p) => !p.isPreorder && p.stockQuantity !== null && p.stockQuantity > 0 && p.stockQuantity <= LOW_STOCK_THRESHOLD
      ).length,
      thinListings: products.filter((p) => !p.description.trim() || p.images.length < 2).length,
    };

    return NextResponse.json(
      {
        success: true,
        metrics: {
          sales,
          inventory,
          lowStockCount: inventory.lowStock,
          services: { repairs: repairCount, solar: solarCount, pending: pendingRepairs + pendingSolar },
          categoryBreakdown: categories
            .map((c) => ({ id: c.id, name: c.name, slug: c.slug, productCount: c._count.products }))
            .sort((a, b) => b.productCount - a.productCount),
          generatedAt: new Date().toISOString(),
        },
      },
      { headers: { 'Cache-Control': 'no-store, max-age=0' } }
    );
  } catch (error: unknown) {
    console.error('Error fetching admin reports metrics:', error instanceof Error ? error.message : error);
    return NextResponse.json({ success: false, error: 'Reports are temporarily unavailable.' }, { status: 503 });
  }
}
