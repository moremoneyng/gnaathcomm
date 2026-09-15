import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized admin access' }, { status: 401 });
    }

    // 1. Fetch Orders Metrics
    const orders = await prisma.order.findMany({
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });

    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const pendingOrdersCount = orders.filter((o) => o.orderStatus === 'PENDING').length;
    const deliveredOrdersCount = orders.filter((o) => o.orderStatus === 'DELIVERED').length;

    // Branch Breakdown
    const lagosOrders = orders.filter((o) => o.preferredBranch === 'lagos_head_office');
    const abiaOrders = orders.filter((o) => o.preferredBranch === 'abia_branch_office');

    const lagosRevenue = lagosOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const abiaRevenue = abiaOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    // 2. Fetch Inventory Metrics
    const products = await prisma.product.findMany({
      include: { category: true },
    });

    const totalProducts = products.length;
    const inStockCount = products.filter((p) => p.inStock).length;
    const outOfStockCount = products.filter((p) => !p.inStock).length;
    const featuredCount = products.filter((p) => p.isFeatured).length;

    // Categories breakdown
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    const categoryBreakdown = categories.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      productCount: c._count.products,
    }));

    // 3. Customer & Service Counts
    const repairCount = await prisma.repairBooking.count();
    const solarCount = await prisma.solarQuoteRequest.count();

    return NextResponse.json({
      success: true,
      metrics: {
        totalRevenue,
        totalOrders,
        pendingOrdersCount,
        deliveredOrdersCount,
        totalProducts,
        inStockCount,
        outOfStockCount,
        featuredCount,
        repairCount,
        solarCount,
        branchMetrics: {
          lagos: { count: lagosOrders.length, revenue: lagosRevenue },
          abia: { count: abiaOrders.length, revenue: abiaRevenue },
        },
        categoryBreakdown,
      },
    });
  } catch (error: any) {
    console.error('Error fetching admin reports metrics:', error?.message || error);
    return NextResponse.json(
      { success: false, error: 'Reports are temporarily unavailable.' },
      { status: 503 }
    );
  }
}
