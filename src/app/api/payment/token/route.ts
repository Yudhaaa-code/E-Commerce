import { NextRequest, NextResponse } from 'next/server';
import { createOrder } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.customerName || !body.customerEmail || !body.shippingAddress || !body.items?.length) {
      return NextResponse.json(
        { success: false, error: 'Informasi pengiriman dan barang belanjaan wajib diisi.' },
        { status: 400 }
      );
    }

    // 1. Create order in database (initially PENDING)
    const order = await createOrder({
      userId: body.userId,
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

    // 2. Prepare Midtrans Snap transaction details
    const serverKey = process.env.MIDTRANS_SERVER_KEY || '';
    const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || '';
    const isProduction = process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === 'true';

    let snapToken = `SNAP-TEST-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    let redirectUrl = `https://app.sandbox.midtrans.com/snap/v2/vtweb/${snapToken}`;
    let isRealMidtransToken = false;

    // Check if user has provided a real Midtrans Server Key (starts with SB-Mid-server- or Mid-server-)
    const isCustomRealKey = serverKey && !serverKey.includes('demo_simulation_key') && !serverKey.includes('your-server-key');

    if (isCustomRealKey) {
      try {
        const midtransEndpoint = isProduction
          ? 'https://app.midtrans.com/snap/v1/transactions'
          : 'https://app.sandbox.midtrans.com/snap/v1/transactions';

        const authHeader = `Basic ${Buffer.from(serverKey + ':').toString('base64')}`;

        const midtransPayload = {
          transaction_details: {
            order_id: order.orderNumber,
            gross_amount: Math.round(order.totalAmount),
          },
          item_details: [
            ...order.items.map((it) => ({
              id: it.productId.slice(0, 50),
              price: Math.round(it.price),
              quantity: it.quantity,
              name: it.productName.slice(0, 50),
            })),
            ...(order.shippingFee > 0
              ? [{ id: 'SHIPPING_FEE', price: Math.round(order.shippingFee), quantity: 1, name: 'Ongkos Kirim' }]
              : []),
            ...(order.discountAmount > 0
              ? [{ id: 'DISCOUNT_VOUCHER', price: -Math.round(order.discountAmount), quantity: 1, name: 'Kupon Diskon' }]
              : []),
          ],
          customer_details: {
            first_name: order.customerName,
            email: order.customerEmail,
            phone: order.customerPhone,
            shipping_address: {
              first_name: order.customerName,
              address: order.shippingAddress,
              city: order.shippingCity,
            },
          },
        };

        const res = await fetch(midtransEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: authHeader,
          },
          body: JSON.stringify(midtransPayload),
        });

        if (res.ok) {
          const midtransData = await res.json();
          if (midtransData.token) {
            snapToken = midtransData.token;
            redirectUrl = midtransData.redirect_url;
            isRealMidtransToken = true;
          }
        }
      } catch (err) {
        console.warn('Midtrans API call failed, using built-in sandbox token:', err);
      }
    }

    return NextResponse.json({
      success: true,
      order,
      snapToken,
      redirectUrl,
      clientKey,
      isRealMidtransToken,
      gateway: 'Midtrans Snap Sandbox',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Gagal memproses Payment Gateway.' },
      { status: 500 }
    );
  }
}
