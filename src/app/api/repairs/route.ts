import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { deviceName, issueType, preferredBranch, additionalNotes, customerPhone, customerName } = body;

    if (!deviceName || !issueType) {
      return NextResponse.json({ success: false, error: 'Device name and issue type are required' }, { status: 400 });
    }

    const booking = await prisma.repairBooking.create({
      data: {
        customerName: customerName || 'Guest Customer',
        customerPhone: customerPhone || '',
        deviceName,
        issueType,
        preferredBranch: preferredBranch || 'lagos_head_office',
        additionalNotes: additionalNotes || '',
        status: 'PENDING',
      },
    });

    return NextResponse.json({ success: true, booking });
  } catch (error: any) {
    console.error('Error creating repair booking:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
