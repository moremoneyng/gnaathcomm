import { NextResponse } from 'next/server';
import { getUserSession } from '@/lib/userAuth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getUserSession();

    if (!session) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
    }

    let userDetails = { ...session };
    let userOrders: any[] = [];

    try {
      const dbUser = await prisma.user.findUnique({
        where: { id: session.id },
        include: {
          orders: {
            include: { items: true },
            orderBy: { createdAt: 'desc' },
          },
        },
      });

      if (dbUser) {
        userDetails = {
          id: dbUser.id,
          email: dbUser.email,
          name: dbUser.name,
          phone: dbUser.phone || undefined,
          address: dbUser.address || undefined,
          city: dbUser.city || undefined,
          preferredBranch: dbUser.preferredBranch || undefined,
        };
        userOrders = dbUser.orders;
      } else {
        // Search orders by email
        const ordersByEmail = await prisma.order.findMany({
          where: { customerEmail: session.email },
          include: { items: true },
          orderBy: { createdAt: 'desc' },
        });
        userOrders = ordersByEmail;
      }
    } catch (dbErr: any) {
      console.warn('DB error fetching profile & orders:', dbErr?.message);
    }

    return NextResponse.json({
      authenticated: true,
      user: userDetails,
      orders: userOrders,
    });
  } catch (error: any) {
    return NextResponse.json({ authenticated: false, error: error.message }, { status: 500 });
  }
}
