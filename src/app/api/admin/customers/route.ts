import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized admin access' }, { status: 401 });
    }

    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
    });

    const repairs = await prisma.repairBooking.findMany({
      orderBy: { createdAt: 'desc' },
    });

    const solarQuotes = await prisma.solarQuoteRequest.findMany({
      orderBy: { createdAt: 'desc' },
    });

    const customerMap: Record<string, any> = {};

    // Process Orders
    for (const order of orders) {
      const phoneKey = order.customerPhone.trim() || order.customerName.trim().toLowerCase();
      if (!phoneKey) continue;

      if (!customerMap[phoneKey]) {
        customerMap[phoneKey] = {
          name: order.customerName,
          phone: order.customerPhone,
          city: order.customerCity || 'Lagos',
          address: order.customerAddress || '',
          preferredBranch: order.preferredBranch || 'lagos_head_office',
          totalOrders: 0,
          totalSpent: 0,
          repairBookings: 0,
          solarInquiries: 0,
          lastActive: order.createdAt,
        };
      }

      customerMap[phoneKey].totalOrders += 1;
      customerMap[phoneKey].totalSpent += order.totalAmount || 0;
      if (new Date(order.createdAt) > new Date(customerMap[phoneKey].lastActive)) {
        customerMap[phoneKey].lastActive = order.createdAt;
      }
    }

    // Process Repairs
    for (const repair of repairs) {
      if (!repair.customerPhone) continue;
      const phoneKey = repair.customerPhone.trim();
      if (!customerMap[phoneKey]) {
        customerMap[phoneKey] = {
          name: repair.customerName || 'Customer',
          phone: repair.customerPhone,
          city: 'Lagos/Abia',
          address: '',
          preferredBranch: repair.preferredBranch || 'lagos_head_office',
          totalOrders: 0,
          totalSpent: 0,
          repairBookings: 0,
          solarInquiries: 0,
          lastActive: repair.createdAt,
        };
      }
      customerMap[phoneKey].repairBookings += 1;
    }

    // Process Solar Quotes
    for (const solar of solarQuotes) {
      if (!solar.customerPhone) continue;
      const phoneKey = solar.customerPhone.trim();
      if (!customerMap[phoneKey]) {
        customerMap[phoneKey] = {
          name: solar.customerName || 'Customer',
          phone: solar.customerPhone,
          city: solar.location || 'Nigeria',
          address: '',
          preferredBranch: 'lagos_head_office',
          totalOrders: 0,
          totalSpent: 0,
          repairBookings: 0,
          solarInquiries: 0,
          lastActive: solar.createdAt,
        };
      }
      customerMap[phoneKey].solarInquiries += 1;
    }

    const customers = Object.values(customerMap).sort(
      (a, b) => new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime()
    );

    return NextResponse.json({ success: true, customers });
  } catch (error: any) {
    console.error('Error fetching admin customers:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
