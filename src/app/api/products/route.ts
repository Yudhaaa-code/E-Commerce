import { NextRequest, NextResponse } from 'next/server';
import { getProducts, createProduct } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('category') || undefined;
    const search = searchParams.get('search') || undefined;
    const sort = searchParams.get('sort') || undefined;
    const featured = searchParams.get('featured') === 'true';

    const products = await getProducts({
      categoryId,
      search,
      sort,
      featuredOnly: featured,
    });

    return NextResponse.json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Gagal mengambil data produk' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.name || !body.price || !body.categoryId) {
      return NextResponse.json(
        { success: false, error: 'Nama, harga, dan kategori produk wajib diisi.' },
        { status: 400 }
      );
    }

    const product = await createProduct({
      name: body.name,
      slug: body.slug || body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description: body.description || '',
      price: Number(body.price),
      originalPrice: body.originalPrice ? Number(body.originalPrice) : undefined,
      image: body.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800&auto=format&fit=crop',
      images: body.images || [body.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800&auto=format&fit=crop'],
      stock: Number(body.stock || 10),
      rating: 5.0,
      reviewCount: 1,
      featured: Boolean(body.featured),
      badge: body.badge || 'Baru',
      specs: body.specs || {},
      categoryId: body.categoryId,
    });

    return NextResponse.json({
      success: true,
      message: 'Produk berhasil ditambahkan',
      data: product,
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Gagal menambahkan produk' },
      { status: 500 }
    );
  }
}
