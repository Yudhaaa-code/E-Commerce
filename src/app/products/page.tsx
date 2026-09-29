'use client';

import React, { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { ProductGrid } from '@/components/ProductGrid';
import { ProductDetailModal } from '@/components/ProductDetailModal';
import { CartDrawer } from '@/components/CartDrawer';
import { CheckoutModal } from '@/components/CheckoutModal';
import { AdminModal } from '@/components/AdminModal';
import { AuthModal } from '@/components/AuthModal';
import { UserOrdersModal } from '@/components/UserOrdersModal';
import { PaymentGatewayModal } from '@/components/PaymentGatewayModal';
import { Footer } from '@/components/Footer';
import { Product, Category, CartItem, Order, User } from '@/types/ecommerce';
import { INITIAL_CATEGORIES, INITIAL_PRODUCTS } from '@/lib/data';
import { Check, ChevronRight, Home, Sparkles } from 'lucide-react';

function ProductsPageContent() {
  const searchParams = useSearchParams();
  const initialCategoryParam = searchParams.get('category') || 'all';
  const initialSearchParam = searchParams.get('search') || '';

  const [theme, setTheme] = useState<'dark' | 'light'>('light');
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [loading, setLoading] = useState(false);

  // User Authentication State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isUserOrdersOpen, setIsUserOrdersOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<{
    type: 'add_to_cart' | 'direct_checkout';
    product: Product;
    quantity: number;
  } | null>(null);
  const [authReason, setAuthReason] = useState<string>('');

  // Filters & Search
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategoryParam);
  const [searchTerm, setSearchTerm] = useState<string>(initialSearchParam);
  const [sortBy, setSortBy] = useState<string>('featured');

  // Update selectedCategory when searchParams change
  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) {
      setSelectedCategory(cat);
    }
  }, [searchParams]);

  // Modals & Drawers
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);
  const [isPaymentGatewayOpen, setIsPaymentGatewayOpen] = useState(false);
  const [gatewayOrder, setGatewayOrder] = useState<Order | null>(null);
  const [gatewaySnapToken, setGatewaySnapToken] = useState<string>('');

  // Promo Coupon
  const [appliedPromo, setAppliedPromo] = useState<string>('');
  const [discountRate, setDiscountRate] = useState<number>(0);

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Database Connection Status
  const [dbStatus, setDbStatus] = useState<{
    connected: boolean;
    mode: string;
    message: string;
  } | null>(null);

  // Background order status polling for user notifications
  const [orderNotifCount, setOrderNotifCount] = useState(0);
  const prevOrderStatusRef = useRef<Record<string, string>>({});
  const orderPollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Toggle Theme
  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
    try {
      localStorage.setItem('plakatku_theme', nextTheme);
    } catch (e) {}
  };

  // Show Toast
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  // Load User, Cart & Theme from localStorage on mount
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('plakatku_theme') as 'dark' | 'light' | null;
      if (savedTheme) {
        setTheme(savedTheme);
        document.documentElement.setAttribute('data-theme', savedTheme);
      }
      const savedUser = localStorage.getItem('plakatku_user') || localStorage.getItem('nexora_user');
      if (savedUser) {
        setCurrentUser(JSON.parse(savedUser));
      }
      const savedCart = localStorage.getItem('plakatku_cart') || localStorage.getItem('nexora_cart');
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }
    } catch (e) {
      console.error('Failed to parse from localStorage', e);
    }
  }, []);

  // Save Cart to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem('plakatku_cart', JSON.stringify(cart));
    } catch (e) {
      console.error('Failed to save cart to localStorage', e);
    }
  }, [cart]);

  // Handle Login Success with Smart Resume
  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('plakatku_user', JSON.stringify(user));
    } catch (e) {}
    showToast(`Masuk sebagai ${user.name} (${user.role === 'ADMIN' ? 'Administrator' : 'Pelanggan'})`);

    if (pendingAction) {
      const action = pendingAction;
      setPendingAction(null);
      setAuthReason('');
      setTimeout(() => {
        if (action.type === 'add_to_cart') {
          setCart((prev) => {
            const existing = prev.find((item) => item.product.id === action.product.id);
            if (existing) {
              return prev.map((item) =>
                item.product.id === action.product.id
                  ? { ...item, quantity: item.quantity + action.quantity }
                  : item
              );
            }
            return [
              ...prev,
              {
                id: `cart-${action.product.id}-${Date.now()}`,
                product: action.product,
                quantity: action.quantity,
              },
            ];
          });
          showToast(`"${action.product.name.slice(0, 30)}..." ditambahkan ke keranjang!`);
        } else if (action.type === 'direct_checkout') {
          setCart((prev) => {
            const existing = prev.find((item) => item.product.id === action.product.id);
            if (existing) {
              return prev.map((item) =>
                item.product.id === action.product.id
                  ? { ...item, quantity: Math.max(item.quantity, action.quantity) }
                  : item
              );
            }
            return [
              ...prev,
              {
                id: `cart-${action.product.id}-${Date.now()}`,
                product: action.product,
                quantity: action.quantity,
              },
            ];
          });
          setDetailProduct(null);
          setIsCheckoutOpen(true);
        }
      }, 350);
    }
  };

  // Handle Logout
  const handleLogout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('plakatku_user');
      localStorage.removeItem('nexora_user');
    } catch (e) {}
    showToast('Anda telah berhasil keluar (logout).');
  };

  // Fetch Database Health / Status
  const checkHealth = async () => {
    try {
      const res = await fetch('/api/health');
      const data = await res.json();
      setDbStatus({
        connected: data.status === 'healthy',
        mode: data.mode,
        message: data.message,
      });
    } catch (e) {
      setDbStatus({
        connected: false,
        mode: 'mock',
        message: 'Koneksi API offline',
      });
    }
  };

  // Fetch Categories from API
  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      if (data.success && data.data) {
        setCategories(data.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Fetch Products from API
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      if (data.success && data.data) {
        setProducts(data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();
    fetchCategories();
    fetchProducts();
  }, []);

  // Poll User Orders
  const pollUserOrders = useCallback(async () => {
    if (!currentUser || currentUser.role === 'ADMIN') return;
    try {
      const res = await fetch('/api/orders');
      const data = await res.json();
      if (data.success && data.data) {
        const myOrders = (data.data as Order[]).filter(
          (o) =>
            (o.userId && o.userId === currentUser.id) ||
            o.customerEmail.toLowerCase() === currentUser.email.toLowerCase()
        );
        let newCount = 0;
        myOrders.forEach((ord) => {
          const prev = prevOrderStatusRef.current[ord.orderNumber];
          if (prev && prev !== ord.orderStatus) {
            newCount++;
          }
          prevOrderStatusRef.current[ord.orderNumber] = ord.orderStatus;
        });
        if (newCount > 0) {
          setOrderNotifCount((c) => c + newCount);
          showToast(
            newCount === 1
              ? `🚚 Status pesanan Anda telah diperbarui! Cek "Pesanan Saya".`
              : `📦 ${newCount} pesanan Anda memiliki update status baru!`
          );
        }
      }
    } catch (e) {
      // silent
    }
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser || currentUser.role === 'ADMIN') {
      if (orderPollRef.current) {
        clearInterval(orderPollRef.current);
        orderPollRef.current = null;
      }
      return;
    }
    fetch('/api/orders')
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.data) {
          (data.data as Order[])
            .filter(
              (o: Order) =>
                (o.userId && o.userId === currentUser.id) ||
                o.customerEmail.toLowerCase() === currentUser.email.toLowerCase()
            )
            .forEach((o: Order) => {
              prevOrderStatusRef.current[o.orderNumber] = o.orderStatus;
            });
        }
      })
      .catch(() => {});

    orderPollRef.current = setInterval(pollUserOrders, 20000);
    return () => {
      if (orderPollRef.current) {
        clearInterval(orderPollRef.current);
        orderPollRef.current = null;
      }
    };
  }, [currentUser, pollUserOrders]);

  // Cart operations (requires login)
  const handleAddToCart = (product: Product, quantity: number = 1): boolean => {
    if (!currentUser) {
      setPendingAction({ type: 'add_to_cart', product, quantity });
      setAuthReason('Silakan login atau buat akun terlebih dahulu untuk memasukkan plakat ke keranjang.');
      setIsAuthOpen(true);
      showToast('Silakan login terlebih dahulu untuk memasukkan ke keranjang.');
      return false;
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [
        ...prev,
        {
          id: `cart-${product.id}-${Date.now()}`,
          product,
          quantity,
        },
      ];
    });

    showToast(`"${product.name.slice(0, 30)}..." ditambahkan ke keranjang!`);
    return true;
  };

  const handleUpdateQuantity = (cartItemId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === cartItemId) {
            const nextQty = item.quantity + delta;
            return nextQty > 0 ? { ...item, quantity: nextQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleRemoveItem = (cartItemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== cartItemId));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  // Direct checkout from card or product modal (requires login)
  const handleDirectCheckout = (product: Product, quantity: number = 1) => {
    if (!currentUser) {
      setPendingAction({ type: 'direct_checkout', product, quantity });
      setAuthReason('Silakan login atau buat akun terlebih dahulu untuk langsung memesan plakat.');
      setIsAuthOpen(true);
      showToast('Silakan login terlebih dahulu untuk memesan plakat.');
      return;
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: Math.max(item.quantity, quantity) }
            : item
        );
      }
      return [
        ...prev,
        {
          id: `cart-${product.id}-${Date.now()}`,
          product,
          quantity,
        },
      ];
    });
    setDetailProduct(null);
    setIsCheckoutOpen(true);
  };

  // Promo coupon application
  const handleApplyPromo = (code: string): boolean => {
    if (code === 'PLAKATKU2026' || code === 'NEXORA2026') {
      setAppliedPromo('PLAKATKU2026');
      setDiscountRate(0.1);
      return true;
    }
    return false;
  };

  const subtotal = cart.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0
  );
  const discountAmount = Math.round(subtotal * discountRate);

  // Called when CheckoutModal submits: open PaymentGatewayModal
  const handleProceedToPaymentGateway = (order: Order, snapToken: string) => {
    setGatewayOrder(order);
    setGatewaySnapToken(snapToken);
    setIsCheckoutOpen(false);
    setIsPaymentGatewayOpen(true);
  };

  // Called when PaymentGatewayModal confirms payment
  const handlePaymentCompleted = (order: Order) => {
    setIsPaymentGatewayOpen(false);
    setGatewayOrder(null);
    setGatewaySnapToken('');
    setCart([]);
    showToast(`🎉 Pembayaran sukses! Pesanan #${order.orderNumber} sedang diproduksi.`);
    setIsUserOrdersOpen(true);
  };

  const handleOrderSuccess = (order: Order) => {
    // If not using snap token redirect
    setCart([]);
    showToast(`Pesanan #${order.orderNumber} berhasil dibuat!`);
  };

  // Filtered and sorted products
  const filteredProducts = products.filter((p) => {
    const matchesCategory =
      selectedCategory === 'all' || p.categoryId === selectedCategory;
    const matchesSearch =
      searchTerm === '' ||
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price-low') return a.price - b.price;
    if (sortBy === 'price-high') return b.price - a.price;
    if (sortBy === 'rating') return b.rating - a.rating;
    return b.rating * b.reviewCount - a.rating * a.reviewCount;
  });

  const currentCategoryName =
    selectedCategory === 'all'
      ? 'Semua Koleksi'
      : categories.find((c) => c.id === selectedCategory)?.name || 'Katalog';

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            bottom: '2rem',
            right: '2rem',
            backgroundColor: 'rgba(15, 23, 42, 0.95)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            color: '#ffffff',
            padding: '0.85rem 1.5rem',
            borderRadius: 'var(--radius-full)',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5), 0 0 20px rgba(16, 185, 129, 0.2)',
            zIndex: 200,
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            fontSize: '0.875rem',
            fontWeight: 500,
          }}
        >
          <div style={{
            width: '22px',
            height: '22px',
            borderRadius: '50%',
            background: '#10b981',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Check size={14} />
          </div>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Navigation Header */}
      <Navbar
        cartCount={cart.reduce((acc, i) => acc + i.quantity, 0)}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenUserOrders={() => {
          setIsUserOrdersOpen(true);
          setOrderNotifCount(0);
        }}
        onLogout={handleLogout}
        currentUser={currentUser}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        theme={theme}
        onToggleTheme={toggleTheme}
        dbStatus={dbStatus}
        orderNotifCount={orderNotifCount}
      />

      {/* Main Content */}
      <main style={{ flex: 1 }}>
        {/* Breadcrumbs & Header Banner */}
        <div style={{
          width: '100%',
          backgroundColor: 'var(--bg-tertiary)',
          borderBottom: '1px solid var(--border-subtle)',
          padding: '1.75rem clamp(1.5rem, 3.5vw, 4rem)',
        }}>
          {/* Breadcrumbs */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.82rem',
            color: 'var(--text-muted)',
            marginBottom: '1rem',
          }}>
            <Link
              href="/"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                color: 'var(--text-secondary)',
                textDecoration: 'none',
              }}
            >
              <Home size={14} />
              <span>Beranda</span>
            </Link>
            <ChevronRight size={13} />
            <Link
              href="/products"
              onClick={(e) => {
                if (selectedCategory === 'all') {
                  e.preventDefault();
                } else {
                  setSelectedCategory('all');
                }
              }}
              style={{
                color: selectedCategory === 'all' ? 'var(--text-primary)' : 'var(--text-secondary)',
                textDecoration: 'none',
                fontWeight: selectedCategory === 'all' ? 600 : 400,
              }}
            >
              Katalog Plakat &amp; Trophy
            </Link>
            {selectedCategory !== 'all' && (
              <>
                <ChevronRight size={13} />
                <span style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>
                  {currentCategoryName}
                </span>
              </>
            )}
          </div>

          {/* Page Title & Subtitle */}
          <div style={{ maxWidth: '800px' }}>
            <div style={{ marginBottom: '0.35rem' }}>
              <span className="eyebrow-badge">
                <Sparkles size={12} />
                Master Catalog 2026
              </span>
            </div>
            <h1 style={{
              fontSize: 'clamp(2rem, 4vw, 2.75rem)',
              fontWeight: 700,
              fontFamily: 'var(--font-serif)',
              letterSpacing: '-0.02em',
              color: 'var(--text-primary)',
              margin: '0 0 0.5rem 0',
            }}>
              Katalog Lengkap Plakat &amp; Cinderamata
            </h1>
            <p style={{
              fontSize: '0.92rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.6,
              margin: 0,
            }}>
              Jelajahi seluruh koleksi plakat akrilik grafir laser, plakat kayu kuningan etsa, kristal optik 3D, dan trophy turnamen berstandar seni tinggi untuk momen penghargaan paling berharga.
            </p>
          </div>
        </div>

        {/* Product Catalog Grid */}
        <ProductGrid
          products={sortedProducts}
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          sortBy={sortBy}
          onSortChange={setSortBy}
          searchTerm={searchTerm}
          onResetFilters={() => {
            setSelectedCategory('all');
            setSearchTerm('');
            setSortBy('featured');
          }}
          onAddToCart={(product) => handleAddToCart(product, 1)}
          onDirectOrder={(product) => handleDirectCheckout(product, 1)}
          onQuickView={(product) => setDetailProduct(product)}
        />
      </main>

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={detailProduct}
        onClose={() => setDetailProduct(null)}
        onAddToCart={handleAddToCart}
        onDirectCheckout={handleDirectCheckout}
      />

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
        onProceedToCheckout={() => {
          if (!currentUser) {
            setIsCartOpen(false);
            setAuthReason('Silakan login terlebih dahulu untuk melanjutkan proses pembayaran pesanan.');
            setIsAuthOpen(true);
            showToast('Silakan login terlebih dahulu untuk checkout.');
            return;
          }
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
        appliedPromo={appliedPromo}
        discountAmount={discountAmount}
        onApplyPromo={handleApplyPromo}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={cart}
        discountAmount={discountAmount}
        onOrderSuccess={handleOrderSuccess}
        currentUser={currentUser}
        onProceedToPaymentGateway={handleProceedToPaymentGateway}
      />

      {/* Payment Gateway Modal */}
      <PaymentGatewayModal
        isOpen={isPaymentGatewayOpen}
        onClose={() => setIsPaymentGatewayOpen(false)}
        order={gatewayOrder}
        snapToken={gatewaySnapToken}
        onPaymentCompleted={handlePaymentCompleted}
      />

      {/* Admin Modal */}
      <AdminModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        categories={categories}
        onProductAdded={() => {
          fetchProducts();
          fetchCategories();
        }}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => {
          setIsAuthOpen(false);
          setPendingAction(null);
          setAuthReason('');
        }}
        onLoginSuccess={handleLoginSuccess}
        initialMessage={authReason}
      />

      {/* User Orders History Modal */}
      <UserOrdersModal
        isOpen={isUserOrdersOpen}
        onClose={() => setIsUserOrdersOpen(false)}
        currentUser={currentUser}
      />

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Memuat katalog produk...</div>}>
      <ProductsPageContent />
    </Suspense>
  );
}
