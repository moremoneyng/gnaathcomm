import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized admin access' }, { status: 401 });
    }

    const repairs = await prisma.repairBooking.findMany({
      orderBy: { createdAt: 'desc' },
    });

    const solarQuotes = await prisma.solarQuoteRequest.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      repairs,
      solarQuotes,
    });
  } catch (error: any) {
    console.error('Error fetching admin services:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
