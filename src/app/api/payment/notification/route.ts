import { NextRequest, NextResponse } from 'next/server';
import { updateOrderStatus } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const notification = await request.json();

    const orderId = notification.order_id;
    const transactionStatus = notification.transaction_status;
    const fraudStatus = notification.fraud_status;

    if (!orderId) {
      return NextResponse.json(
        { success: false, message: 'Invalid notification: order_id is required' },
        { status: 400 }
      );
    }

    let paymentStatus: 'PAID' | 'PENDING' | 'FAILED' = 'PENDING';
    let orderStatus: 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' = 'PROCESSING';

    if (transactionStatus === 'capture') {
      if (fraudStatus === 'challenge') {
        paymentStatus = 'PENDING';
      } else if (fraudStatus === 'accept') {
        paymentStatus = 'PAID';
      }
    } else if (transactionStatus === 'settlement') {
      paymentStatus = 'PAID';
    } else if (
      transactionStatus === 'cancel' ||
      transactionStatus === 'deny' ||
      transactionStatus === 'expire'
    ) {
      paymentStatus = 'FAILED';
      orderStatus = 'CANCELLED';
    } else if (transactionStatus === 'pending') {
      paymentStatus = 'PENDING';
    }

    const updatedOrder = await updateOrderStatus(orderId, paymentStatus, orderStatus);

    return NextResponse.json({
      success: true,
      message: `Order ${orderId} updated to ${paymentStatus}`,
      order: updatedOrder,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to process webhook notification' },
      { status: 500 }
    );
  }
}
