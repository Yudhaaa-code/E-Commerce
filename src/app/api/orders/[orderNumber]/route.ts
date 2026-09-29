import { NextRequest, NextResponse } from 'next/server';
import { updateOrderShippingStatus } from '@/lib/db';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ orderNumber: string }> }
) {
  try {
    const { orderNumber } = await params;
    const body = await request.json();
    const { orderStatus } = body as { orderStatus: 'SHIPPED' | 'DELIVERED' };

    if (!orderNumber) {
      return NextResponse.json(
        { success: false, error: 'orderNumber is required' },
        { status: 400 }
      );
    }

    if (orderStatus !== 'SHIPPED' && orderStatus !== 'DELIVERED') {
      return NextResponse.json(
        { success: false, error: 'Status yang diizinkan: SHIPPED atau DELIVERED saja.' },
        { status: 400 }
      );
    }

    const updatedOrder = await updateOrderShippingStatus(orderNumber, orderStatus);

    if (!updatedOrder) {
      return NextResponse.json(
        { success: false, error: `Pesanan ${orderNumber} tidak ditemukan atau sudah berstatus DELIVERED.` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Status pesanan ${orderNumber} berhasil diubah menjadi ${orderStatus}.`,
      order: updatedOrder,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Gagal mengubah status pesanan.' },
      { status: 500 }
    );
  }
}
