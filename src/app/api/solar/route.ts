import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { systemSize, applianceDetails, location, serviceType, customerPhone, customerName } = body;

    if (!systemSize || !location) {
      return NextResponse.json({ success: false, error: 'System size and location are required' }, { status: 400 });
    }

    const quoteRequest = await prisma.solarQuoteRequest.create({
      data: {
        customerName: customerName || 'Guest Customer',
        customerPhone: customerPhone || '',
        systemSize,
        applianceDetails: applianceDetails || '',
        location,
        serviceType: serviceType || 'new_installation',
        status: 'PENDING',
      },
    });

    return NextResponse.json({ success: true, quoteRequest });
  } catch (error: any) {
    console.error('Error creating solar quote request:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
