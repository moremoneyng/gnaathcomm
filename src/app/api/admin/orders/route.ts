import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/auth';

const ORDER_STATUSES = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
const PAYMENT_STATUSES = ['PENDING', 'PAID', 'FAILED'];

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized admin access' }, { status: 401 });
    }

    const orders = await prisma.order.findMany({
      include: {
        items: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ success: true, orders });
  } catch (error: any) {
    console.error('Error fetching admin orders:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized admin access' }, { status: 401 });
    }

    const body = await request.json();
    const { id, orderStatus, paymentStatus } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Order ID required' }, { status: 400 });
    }
    if (orderStatus !== undefined && !ORDER_STATUSES.includes(orderStatus)) {
      return NextResponse.json({ success: false, error: 'Unknown order status.' }, { status: 400 });
    }
    if (paymentStatus !== undefined && !PAYMENT_STATUSES.includes(paymentStatus)) {
      return NextResponse.json({ success: false, error: 'Unknown payment status.' }, { status: 400 });
    }

    const updated = await prisma.order.update({
      where: { id },
      data: {
        ...(orderStatus && { orderStatus }),
        ...(paymentStatus && { paymentStatus }),
      },
    });

    return NextResponse.json({ success: true, order: updated });
  } catch (error: any) {
    console.error('Error updating order:', error);
    return NextResponse.json({ success: false, error: 'Could not update the order.' }, { status: 500 });
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
      return NextResponse.json({ success: false, error: 'Order ID required' }, { status: 400 });
    }

    await prisma.order.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'Order deleted' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
