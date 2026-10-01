import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * Small, frequently polled snapshot so open storefronts pick up stock, pre-order and price
 * changes within a minute, without re-downloading the whole catalogue.
 */
export async function GET() {
  try {
    const products = await prisma.product.findMany({
      select: {
        id: true,
        inStock: true,
        isPreorder: true,
        preorderNote: true,
        stockQuantity: true,
        price: true,
        originalPrice: true,
      },
    });
    return NextResponse.json(
      { success: true, products },
      { headers: { 'Cache-Control': 'no-store, max-age=0' } }
    );
  } catch (error: unknown) {
    console.error('Availability snapshot failed:', error instanceof Error ? error.message : error);
    return NextResponse.json({ success: false, products: [] }, { status: 503 });
  }
}
