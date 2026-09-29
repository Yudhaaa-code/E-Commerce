import { prisma } from './prisma';
import { INITIAL_CATEGORIES, INITIAL_PRODUCTS } from './data';
import { Product, Category, Order, User } from '@/types/ecommerce';

// Demo users store
export const INITIAL_USERS: Array<User & { password: string }> = [
  {
    id: 'usr-admin-1',
    name: 'PLAKATKU Administrator',
    email: 'admin@plakatku.com',
    password: 'admin123',
    role: 'ADMIN',
    phone: '081234567890',
    address: 'Galeri & Workshop PLAKATKU, SCBD Park Lt. 3',
    city: 'Jakarta Selatan',
  },
];

let fallbackUsers: Array<User & { password: string }> = [...INITIAL_USERS];
let fallbackProducts: Product[] = [...INITIAL_PRODUCTS];
let fallbackCategories: Category[] = [...INITIAL_CATEGORIES];
let fallbackOrders: Order[] = [
  {
    id: 'ord-1001',
    orderNumber: 'PLK-882914',
    userId: undefined,
    customerName: 'Pelanggan Instansi',
    customerEmail: 'pemesan@instansi.go.id',
    customerPhone: '081298765432',
    shippingAddress: 'Jl. Senopati No. 88, Selong',
    shippingCity: 'Jakarta Selatan',
    shippingCourier: 'JNE Cargo + Packing Kayu',
    paymentMethod: 'BCA Virtual Account',
    paymentStatus: 'PAID',
    orderStatus: 'SHIPPED',
    subtotal: 650000,
    shippingFee: 35000,
    discountAmount: 50000,
    totalAmount: 635000,
    notes: 'Teks ucapan: "Terima Kasih atas Dedikasi 10 Tahun Bapak Bambang". Packing aman box beludru.',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    items: [
      {
        id: 'item-1',
        productId: 'prod-1',
        productName: 'Plakat Akrilik Diamond Bevel Custom UV Print (Tebal 15mm)',
        productImage: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=800&auto=format&fit=crop',
        price: 325000,
        quantity: 2,
        total: 650000,
      }
    ]
  }
];

export async function checkDatabaseConnection(): Promise<{ connected: boolean; message: string; mode: 'postgresql' | 'mock' }> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return {
      connected: true,
      message: 'PostgreSQL Database terhubung dengan sukses!',
      mode: 'postgresql'
    };
  } catch (error) {
    return {
      connected: false,
      message: 'PostgreSQL belum terhubung atau sedang offline. Menggunakan mode katalog fallback.',
      mode: 'mock'
    };
  }
}

// User Authentication
export async function authenticateUser(email: string, password: string): Promise<User | null> {
  const cleanEmail = email.toLowerCase().trim();
  try {
    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });
    if (user && user.password === password) {
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role as any,
        phone: user.phone || undefined,
        address: user.address || undefined,
        city: user.city || undefined,
      };
    }
  } catch (e) {
    // Database offline, check fallback
  }

  const found = fallbackUsers.find(
    (u) => u.email.toLowerCase() === cleanEmail && u.password === password
  );
  if (found) {
    const { password: _, ...userData } = found;
    return userData;
  }
  return null;
}

export async function registerUser(data: {
  name: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
  city?: string;
}): Promise<{ user: User | null; error?: string }> {
  const cleanEmail = data.email.toLowerCase().trim();

  // Check if exists in DB
  try {
    const existing = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });
    if (existing) {
      return { user: null, error: 'Email sudah terdaftar. Silakan masuk.' };
    }

    const created = await prisma.user.create({
      data: {
        name: data.name,
        email: cleanEmail,
        password: data.password,
        role: 'CUSTOMER',
        phone: data.phone,
        address: data.address,
        city: data.city,
      },
    });

    return {
      user: {
        id: created.id,
        name: created.name,
        email: created.email,
        role: created.role as any,
        phone: created.phone || undefined,
        address: created.address || undefined,
        city: created.city || undefined,
      },
    };
  } catch (e) {
    // Fallback mode
  }

  const existingFallback = fallbackUsers.find((u) => u.email.toLowerCase() === cleanEmail);
  if (existingFallback) {
    return { user: null, error: 'Email sudah terdaftar. Silakan masuk.' };
  }

  const newUser = {
    id: `usr-${Date.now()}`,
    name: data.name,
    email: cleanEmail,
    password: data.password,
    role: 'CUSTOMER' as const,
    phone: data.phone,
    address: data.address,
    city: data.city,
  };

  fallbackUsers.push(newUser);
  const { password: _, ...safeUser } = newUser;
  return { user: safeUser };
}

export async function getUserById(id: string): Promise<User | null> {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    if (user) {
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role as any,
        phone: user.phone || undefined,
        address: user.address || undefined,
        city: user.city || undefined,
      };
    }
  } catch (e) {}

  const found = fallbackUsers.find((u) => u.id === id);
  if (found) {
    const { password: _, ...userData } = found;
    return userData;
  }
  return null;
}

export async function getAllUsers(): Promise<User[]> {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        address: true,
        city: true,
        createdAt: true,
      },
    });
    if (users && users.length > 0) {
      return users.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role as any,
        phone: u.phone || undefined,
        address: u.address || undefined,
        city: u.city || undefined,
        createdAt: u.createdAt.toISOString(),
      }));
    }
  } catch (e) {
    // Fallback
  }

  return fallbackUsers.map(({ password: _, ...userData }) => userData);
}

export async function updateUserRole(
  userId: string,
  newRole: 'ADMIN' | 'CUSTOMER'
): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    const updated = await prisma.user.update({
      where: { id: userId },
      data: { role: newRole },
    });
    return {
      success: true,
      user: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        role: updated.role as any,
        phone: updated.phone || undefined,
        address: updated.address || undefined,
        city: updated.city || undefined,
        createdAt: updated.createdAt.toISOString(),
      },
    };
  } catch (e) {
    // Fallback
  }

  const idx = fallbackUsers.findIndex((u) => u.id === userId);
  if (idx !== -1) {
    fallbackUsers[idx].role = newRole;
    const { password: _, ...safeUser } = fallbackUsers[idx];
    return { success: true, user: safeUser };
  }

  return { success: false, error: 'Pengguna tidak ditemukan.' };
}

export async function getCategories(): Promise<Category[]> {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { products: true }
        }
      }
    });

    if (categories && categories.length > 0) {
      return categories.map(c => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        icon: c.icon || undefined,
        description: c.description || undefined,
        productCount: c._count.products,
      }));
    }
  } catch (err) {
    // Fallback
  }

  return fallbackCategories.map(cat => ({
    ...cat,
    productCount: fallbackProducts.filter(p => p.categoryId === cat.id).length
  }));
}

/**
 * Returns each category with its total order quantity (sum of item quantities across all orders).
 * Sorted from most-ordered to least-ordered.
 */
export async function getCategoryOrderStats(): Promise<Array<{
  categoryId: string;
  categoryName: string;
  categorySlug: string;
  categoryIcon?: string;
  categoryDescription?: string;
  totalOrdered: number;
  productCount: number;
}>> {
  try {
    // Try Prisma: aggregate order item quantities grouped by product's category
    const orderItems = await prisma.orderItem.findMany({
      include: {
        product: {
          include: { category: true }
        }
      }
    });

    if (orderItems && orderItems.length > 0) {
      const statsMap = new Map<string, {
        categoryId: string;
        categoryName: string;
        categorySlug: string;
        categoryIcon?: string;
        categoryDescription?: string;
        totalOrdered: number;
        productCount: number;
      }>();

      // Seed with all categories at 0
      const cats = await prisma.category.findMany({ include: { _count: { select: { products: true } } } });
      for (const c of cats) {
        statsMap.set(c.id, {
          categoryId: c.id,
          categoryName: c.name,
          categorySlug: c.slug,
          categoryIcon: c.icon || undefined,
          categoryDescription: c.description || undefined,
          totalOrdered: 0,
          productCount: c._count.products,
        });
      }

      // Accumulate order quantities
      for (const item of orderItems) {
        if (!item.product?.category) continue;
        const catId = item.product.category.id;
        const existing = statsMap.get(catId);
        if (existing) {
          existing.totalOrdered += item.quantity;
        }
      }

      return [...statsMap.values()].sort((a, b) => b.totalOrdered - a.totalOrdered);
    }
  } catch (err) {
    // Fallback below
  }

  // ---- Fallback: use reviewCount as proxy for popularity ----
  const countPerCategory = new Map<string, number>();
  for (const p of fallbackProducts) {
    const cat = p.categoryId;
    countPerCategory.set(cat, (countPerCategory.get(cat) || 0) + (p.reviewCount || 0));
  }

  return fallbackCategories
    .map(cat => ({
      categoryId: cat.id,
      categoryName: cat.name,
      categorySlug: cat.slug,
      categoryIcon: cat.icon,
      categoryDescription: cat.description,
      totalOrdered: countPerCategory.get(cat.id) || 0,
      productCount: fallbackProducts.filter(p => p.categoryId === cat.id).length,
    }))
    .sort((a, b) => b.totalOrdered - a.totalOrdered);
}

export async function getProducts(options?: {
  categoryId?: string;
  search?: string;
  sort?: string;
  featuredOnly?: boolean;
}): Promise<Product[]> {
  try {
    const where: any = {};
    if (options?.categoryId && options.categoryId !== 'all') {
      where.categoryId = options.categoryId;
    }
    if (options?.featuredOnly) {
      where.featured = true;
    }
    if (options?.search) {
      where.OR = [
        { name: { contains: options.search, mode: 'insensitive' } },
        { description: { contains: options.search, mode: 'insensitive' } },
      ];
    }

    let orderBy: any = { createdAt: 'desc' };
    if (options?.sort === 'price-low') orderBy = { price: 'asc' };
    if (options?.sort === 'price-high') orderBy = { price: 'desc' };
    if (options?.sort === 'rating') orderBy = { rating: 'desc' };

    const products = await prisma.product.findMany({
      where,
      orderBy,
      include: { category: true }
    });

    if (products && products.length > 0) {
      return products.map(p => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        description: p.description,
        price: p.price,
        originalPrice: p.originalPrice || undefined,
        image: p.image,
        images: p.images,
        stock: p.stock,
        rating: p.rating,
        reviewCount: p.reviewCount,
        featured: p.featured,
        badge: p.badge || undefined,
        specs: (p.specs as Record<string, string>) || undefined,
        categoryId: p.categoryId,
        category: p.category ? {
          id: p.category.id,
          name: p.category.name,
          slug: p.category.slug,
        } : undefined,
        createdAt: p.createdAt.toISOString()
      }));
    }
  } catch (err) {}

  let result = [...fallbackProducts];

  if (options?.categoryId && options.categoryId !== 'all') {
    result = result.filter(p => p.categoryId === options.categoryId);
  }

  if (options?.featuredOnly) {
    result = result.filter(p => p.featured);
  }

  if (options?.search) {
    const query = options.search.toLowerCase();
    result = result.filter(p =>
      p.name.toLowerCase().includes(query) ||
      p.description.toLowerCase().includes(query)
    );
  }

  if (options?.sort === 'price-low') {
    result.sort((a, b) => a.price - b.price);
  } else if (options?.sort === 'price-high') {
    result.sort((a, b) => b.price - a.price);
  } else if (options?.sort === 'rating') {
    result.sort((a, b) => b.rating - a.rating);
  }

  return result;
}

export async function getProductById(id: string): Promise<Product | null> {
  try {
    const product = await prisma.product.findUnique({
      where: { id },
      include: { category: true }
    });

    if (product) {
      return {
        id: product.id,
        name: product.name,
        slug: product.slug,
        description: product.description,
        price: product.price,
        originalPrice: product.originalPrice || undefined,
        image: product.image,
        images: product.images,
        stock: product.stock,
        rating: product.rating,
        reviewCount: product.reviewCount,
        featured: product.featured,
        badge: product.badge || undefined,
        specs: (product.specs as Record<string, string>) || undefined,
        categoryId: product.categoryId,
        category: product.category ? {
          id: product.category.id,
          name: product.category.name,
          slug: product.category.slug,
        } : undefined,
        createdAt: product.createdAt.toISOString()
      };
    }
  } catch (err) {}

  const found = fallbackProducts.find(p => p.id === id || p.slug === id);
  return found || null;
}

export async function createProduct(data: Omit<Product, 'id'>): Promise<Product> {
  try {
    const newProduct = await prisma.product.create({
      data: {
        name: data.name,
        slug: data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        description: data.description,
        price: data.price,
        originalPrice: data.originalPrice,
        image: data.image,
        images: data.images || [data.image],
        stock: data.stock || 10,
        rating: data.rating || 5.0,
        reviewCount: data.reviewCount || 1,
        featured: Boolean(data.featured),
        badge: data.badge,
        specs: data.specs || {},
        categoryId: data.categoryId,
      },
      include: { category: true }
    });

    return {
      id: newProduct.id,
      name: newProduct.name,
      slug: newProduct.slug,
      description: newProduct.description,
      price: newProduct.price,
      originalPrice: newProduct.originalPrice || undefined,
      image: newProduct.image,
      images: newProduct.images,
      stock: newProduct.stock,
      rating: newProduct.rating,
      reviewCount: newProduct.reviewCount,
      featured: newProduct.featured,
      badge: newProduct.badge || undefined,
      specs: (newProduct.specs as Record<string, string>) || undefined,
      categoryId: newProduct.categoryId,
      category: newProduct.category ? {
        id: newProduct.category.id,
        name: newProduct.category.name,
        slug: newProduct.category.slug
      } : undefined,
      createdAt: newProduct.createdAt.toISOString()
    };
  } catch (err) {
    const fallbackItem: Product = {
      ...data,
      id: `prod-${Date.now()}`,
      slug: data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      createdAt: new Date().toISOString()
    };
    fallbackProducts.unshift(fallbackItem);
    return fallbackItem;
  }
}

export async function getOrders(userId?: string): Promise<Order[]> {
  try {
    const where: any = {};
    if (userId) {
      where.userId = userId;
    }

    const orders = await prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { items: true }
    });

    if (orders && orders.length > 0) {
      return orders.map(o => ({
        id: o.id,
        orderNumber: o.orderNumber,
        userId: o.userId || undefined,
        customerName: o.customerName,
        customerEmail: o.customerEmail,
        customerPhone: o.customerPhone,
        shippingAddress: o.shippingAddress,
        shippingCity: o.shippingCity,
        shippingCourier: o.shippingCourier,
        paymentMethod: o.paymentMethod,
        paymentStatus: o.paymentStatus as any,
        orderStatus: o.orderStatus as any,
        subtotal: o.subtotal,
        shippingFee: o.shippingFee,
        discountAmount: o.discountAmount,
        totalAmount: o.totalAmount,
        notes: o.notes || undefined,
        createdAt: o.createdAt.toISOString(),
        items: o.items.map(it => ({
          id: it.id,
          orderId: it.orderId,
          productId: it.productId,
          productName: it.productName,
          productImage: it.productImage,
          price: it.price,
          quantity: it.quantity,
          total: it.total,
        }))
      }));
    }
  } catch (err) {}

  if (userId) {
    return fallbackOrders.filter((o) => o.userId === userId);
  }
  return fallbackOrders;
}

export async function createOrder(data: {
  userId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  shippingCity: string;
  shippingCourier: string;
  paymentMethod: string;
  subtotal: number;
  shippingFee: number;
  discountAmount: number;
  totalAmount: number;
  notes?: string;
  items: Array<{
    productId: string;
    productName: string;
    productImage: string;
    price: number;
    quantity: number;
    total: number;
  }>;
}): Promise<Order> {
  const orderNumber = `PLK-${Math.floor(100000 + Math.random() * 900000)}`;

  try {
    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: data.userId,
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        customerPhone: data.customerPhone,
        shippingAddress: data.shippingAddress,
        shippingCity: data.shippingCity,
        shippingCourier: data.shippingCourier,
        paymentMethod: data.paymentMethod,
        paymentStatus: 'PAID',
        orderStatus: 'PROCESSING',
        subtotal: data.subtotal,
        shippingFee: data.shippingFee,
        discountAmount: data.discountAmount,
        totalAmount: data.totalAmount,
        notes: data.notes,
        items: {
          create: data.items.map(item => ({
            productId: item.productId,
            productName: item.productName,
            productImage: item.productImage,
            price: item.price,
            quantity: item.quantity,
            total: item.total
          }))
        }
      },
      include: { items: true }
    });

    return {
      id: order.id,
      orderNumber: order.orderNumber,
      userId: order.userId || undefined,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      customerPhone: order.customerPhone,
      shippingAddress: order.shippingAddress,
      shippingCity: order.shippingCity,
      shippingCourier: order.shippingCourier,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus as any,
      orderStatus: order.orderStatus as any,
      subtotal: order.subtotal,
      shippingFee: order.shippingFee,
      discountAmount: order.discountAmount,
      totalAmount: order.totalAmount,
      notes: order.notes || undefined,
      createdAt: order.createdAt.toISOString(),
      items: order.items.map(it => ({
        id: it.id,
        orderId: it.orderId,
        productId: it.productId,
        productName: it.productName,
        productImage: it.productImage,
        price: it.price,
        quantity: it.quantity,
        total: it.total
      }))
    };
  } catch (err) {
    const fallbackOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber,
      userId: data.userId,
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      customerPhone: data.customerPhone,
      shippingAddress: data.shippingAddress,
      shippingCity: data.shippingCity,
      shippingCourier: data.shippingCourier,
      paymentMethod: data.paymentMethod,
      paymentStatus: 'PAID',
      orderStatus: 'PROCESSING',
      subtotal: data.subtotal,
      shippingFee: data.shippingFee,
      discountAmount: data.discountAmount,
      totalAmount: data.totalAmount,
      notes: data.notes,
      createdAt: new Date().toISOString(),
      items: data.items.map((it, idx) => ({
        id: `item-${Date.now()}-${idx}`,
        productId: it.productId,
        productName: it.productName,
        productImage: it.productImage,
        price: it.price,
        quantity: it.quantity,
        total: it.total
      }))
    };

    fallbackOrders.unshift(fallbackOrder);
    return fallbackOrder;
  }
}

export async function updateOrderStatus(
  orderNumber: string,
  paymentStatus: 'PAID' | 'PENDING' | 'FAILED',
  orderStatus: 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' = 'PROCESSING'
): Promise<Order | null> {
  try {
    const updated = await prisma.order.update({
      where: { orderNumber },
      data: {
        paymentStatus,
        orderStatus,
      },
      include: { items: true },
    });
    if (updated) {
      return {
        id: updated.id,
        orderNumber: updated.orderNumber,
        userId: updated.userId || undefined,
        customerName: updated.customerName,
        customerEmail: updated.customerEmail,
        customerPhone: updated.customerPhone,
        shippingAddress: updated.shippingAddress,
        shippingCity: updated.shippingCity,
        shippingCourier: updated.shippingCourier,
        paymentMethod: updated.paymentMethod,
        paymentStatus: updated.paymentStatus as any,
        orderStatus: updated.orderStatus as any,
        subtotal: updated.subtotal,
        shippingFee: updated.shippingFee,
        discountAmount: updated.discountAmount,
        totalAmount: updated.totalAmount,
        notes: updated.notes || undefined,
        createdAt: updated.createdAt.toISOString(),
        items: updated.items.map((it) => ({
          id: it.id,
          orderId: it.orderId,
          productId: it.productId,
          productName: it.productName,
          productImage: it.productImage,
          price: it.price,
          quantity: it.quantity,
          total: it.total,
        })),
      };
    }
  } catch (err) {}

  const found = fallbackOrders.find((o) => o.orderNumber === orderNumber);
  if (found) {
    found.paymentStatus = paymentStatus;
    found.orderStatus = orderStatus;
    return found;
  }
  return null;
}

// Admin-only: update order shipping status (SHIPPED or DELIVERED)
// DELIVERED is a terminal state — cannot be changed further
export async function updateOrderShippingStatus(
  orderNumber: string,
  orderStatus: 'SHIPPED' | 'DELIVERED'
): Promise<Order | null> {
  try {
    const current = await prisma.order.findUnique({ where: { orderNumber } });
    if (!current) return null;
    if (current.orderStatus === 'DELIVERED') return null; // terminal guard

    const updated = await prisma.order.update({
      where: { orderNumber },
      data: { orderStatus },
      include: { items: true },
    });

    return {
      id: updated.id,
      orderNumber: updated.orderNumber,
      userId: updated.userId || undefined,
      customerName: updated.customerName,
      customerEmail: updated.customerEmail,
      customerPhone: updated.customerPhone,
      shippingAddress: updated.shippingAddress,
      shippingCity: updated.shippingCity,
      shippingCourier: updated.shippingCourier,
      paymentMethod: updated.paymentMethod,
      paymentStatus: updated.paymentStatus as any,
      orderStatus: updated.orderStatus as any,
      subtotal: updated.subtotal,
      shippingFee: updated.shippingFee,
      discountAmount: updated.discountAmount,
      totalAmount: updated.totalAmount,
      notes: updated.notes || undefined,
      createdAt: updated.createdAt.toISOString(),
      items: updated.items.map((it) => ({
        id: it.id,
        orderId: it.orderId,
        productId: it.productId,
        productName: it.productName,
        productImage: it.productImage,
        price: it.price,
        quantity: it.quantity,
        total: it.total,
      })),
    };
  } catch (err) {
    // Fallback: in-memory update
    const found = fallbackOrders.find((o) => o.orderNumber === orderNumber);
    if (!found) return null;
    if (found.orderStatus === 'DELIVERED') return null; // terminal guard
    found.orderStatus = orderStatus;
    return { ...found };
  }
}
