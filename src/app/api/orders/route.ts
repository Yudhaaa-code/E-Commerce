import { NextRequest, NextResponse } from 'next/server';
import { getOrders, createOrder } from '@/lib/db';

export async function GET() {
  try {
    const orders = await getOrders();
    return NextResponse.json({
      success: true,
      data: orders,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Gagal mengambil data pesanan' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.customerName || !body.customerEmail || !body.shippingAddress || !body.items?.length) {
      return NextResponse.json(
        { success: false, error: 'Data pesanan belum lengkap (Nama, Email, Alamat, dan Barang wajib diisi).' },
        { status: 400 }
      );
    }

    const order = await createOrder({
      customerName: body.customerName,
      customerEmail: body.customerEmail,
      customerPhone: body.customerPhone || '08123456789',
      shippingAddress: body.shippingAddress,
      shippingCity: body.shippingCity || 'Jakarta',
      shippingCourier: body.shippingCourier || 'JNE Regular',
      paymentMethod: body.paymentMethod || 'BCA Virtual Account',
      subtotal: Number(body.subtotal || 0),
      shippingFee: Number(body.shippingFee || 0),
      discountAmount: Number(body.discountAmount || 0),
      totalAmount: Number(body.totalAmount || 0),
      notes: body.notes,
      items: body.items,
    });

    return NextResponse.json({
      success: true,
      message: 'Pesanan berhasil dibuat!',
      data: order,
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Gagal memproses pesanan' },
      { status: 500 }
    );
  }
}
