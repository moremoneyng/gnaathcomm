import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserSession } from '@/lib/userAuth';
import { sendOrderReceiptEmail, sendAdminOrderNotification } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { customerDetails, cart, totalAmount } = body;

    if (!customerDetails || !cart || cart.length === 0) {
      return NextResponse.json({ success: false, error: 'Invalid checkout payload' }, { status: 400 });
    }

    const session = await getUserSession();
    const userId = session?.id || null;
    const customerEmail = customerDetails.email || session?.email || '';

    const orderNumber = `GNG-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;

    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId,
        customerName: customerDetails.name,
        customerEmail,
        customerPhone: customerDetails.phone,
        customerAddress: customerDetails.address,
        customerCity: customerDetails.city || 'Lagos',
        preferredBranch: customerDetails.preferredBranch || 'lagos_head_office',
        deliveryNotes: customerDetails.deliveryNotes || '',
        paymentPreference: customerDetails.paymentPreference || 'whatsapp_discuss',
        totalAmount: totalAmount,
        paymentStatus: 'PENDING',
        orderStatus: 'PENDING',
        items: {
          create: cart.map((item: any) => ({
            productId: item.product?.id && !item.product.id.startsWith('prod-') ? item.product.id : null,
            productName: item.product?.name || 'Product',
            price: item.product?.price || 0,
            quantity: item.quantity,
            selectedOptions: item.selectedOptions || {},
          })),
        },
      },
      include: {
        items: true,
      },
    });

    // Send emails via Resend asynchronously (don't block order creation if email fails)
    if (customerEmail) {
      sendOrderReceiptEmail(customerEmail, customerDetails.name, order).catch((err) =>
        console.error('Failed to send order receipt email:', err)
      );
    }
    sendAdminOrderNotification(order).catch((err) =>
      console.error('Failed to send admin order notification email:', err)
    );

    return NextResponse.json({ success: true, order });
  } catch (error: any) {
    console.error('Error creating order in database:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

