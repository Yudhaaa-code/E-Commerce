'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { HeroBanner } from '@/components/HeroBanner';
import { PopularCategoriesSection } from '@/components/PopularCategoriesSection';
import { ProductCard } from '@/components/ProductCard';
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
import { Check, ArrowRight, Sparkles, ShieldCheck, Box, MessageCircle, Clock, Award } from 'lucide-react';

export default function HomePage() {
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
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('featured');

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

  // Handle Login Success
  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('plakatku_user', JSON.stringify(user));
    } catch (e) {}
    showToast(`Masuk sebagai ${user.name} (${user.role === 'ADMIN' ? 'Administrator' : 'Pelanggan'})`);

    // Resume any pending action that required login
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

  // Fetch Products with filters
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory && selectedCategory !== 'all') {
        params.set('category', selectedCategory);
      }
      if (searchTerm) {
        params.set('search', searchTerm);
      }
      if (sortBy) {
        params.set('sort', sortBy);
      }

      const res = await fetch(`/api/products?${params.toString()}`);
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
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, searchTerm, sortBy]);

  // Background polling: detect order status changes for logged-in customer
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
    // Seed initial snapshot
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
      setDiscountRate(0.1); // 10% discount
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
    showToast(`✅ Pembayaran berhasil! Pesanan ${order.orderNumber} sedang diproses.`);
  };

  const handleOrderSuccess = (order: Order) => {
    setCart([]);
    showToast(`Pesanan ${order.orderNumber} berhasil dibuat!`);
  };

  const handleScrollToCatalog = () => {
    const el = document.getElementById('popular-categories') || document.getElementById('best-sellers');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const bestSellers = products
    .filter((p) => (p.badge && (p.badge.toLowerCase().includes('terlaris') || p.badge.toLowerCase().includes('hemat') || p.badge.toLowerCase().includes('populer'))) || p.rating >= 4.8)
    .slice(0, 4);

  const displayBestSellers = bestSellers.length >= 2 ? bestSellers : products.slice(0, 4);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className="animate-fade"
          style={{
            position: 'fixed',
            bottom: '2rem',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(15, 23, 42, 0.94)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(16, 185, 129, 0.4)',
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
          setOrderNotifCount(0); // reset badge when user opens modal
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

      {/* Hero Showcase Section */}
      <main style={{ flex: 1 }}>
        <HeroBanner onExploreClick={handleScrollToCatalog} />

        {/* Section 1: Kategori Paling Sering Dipesan / Terlaku */}
        <div id="popular-categories">
          <PopularCategoriesSection />
        </div>



        {/* Section 3: High-End Corporate & Custom Order Consultation Banner */}
        <section style={{
          width: '100%',
          padding: '0 clamp(1.5rem, 3.5vw, 4rem) 6rem clamp(1.5rem, 3.5vw, 4rem)',
        }}>
          <div
            className="gallery-card"
            style={{
              padding: 'clamp(2rem, 4vw, 3.5rem)',
              borderRadius: 'var(--radius-lg)',
              background: 'linear-gradient(135deg, var(--bg-card) 0%, var(--bg-tertiary) 100%)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '2.5rem',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div style={{ maxWidth: '600px', zIndex: 2 }}>
              <div style={{ marginBottom: '0.75rem' }}>
                <span className="eyebrow-badge">
                  <Award size={13} color="var(--amber-accent)" />
                  Layanan Korporasi &amp; Instansi Resmi
                </span>
              </div>
              <h3 style={{
                fontSize: 'clamp(1.6rem, 3vw, 2.2rem)',
                fontFamily: 'var(--font-serif)',
                fontWeight: 600,
                color: 'var(--text-primary)',
                lineHeight: 1.3,
                marginBottom: '1rem',
              }}>
                Butuh Plakat Custom Desain Khusus atau Pengadaan Skala Besar?
              </h3>
              <p style={{
                fontSize: '0.92rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.6,
                marginBottom: '1.75rem',
              }}>
                Kami melayani pembuatan plakat kilat 24 jam, invoice faktur pajak resmi, gratis preview mockup 3D sebelum produksi, serta pengiriman aman bergaransi ke seluruh kota di Indonesia.
              </p>

              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '1.25rem',
                fontSize: '0.84rem',
                color: 'var(--text-primary)',
                fontWeight: 500,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <Clock size={16} color="var(--amber-accent)" />
                  <span>Preview Desain 2 Jam</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <ShieldCheck size={16} color="var(--emerald-accent)" />
                  <span>Garansi Presisi 100%</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <Box size={16} color="#818cf8" />
                  <span>Free Box Beludru Mewah</span>
                </div>
              </div>
            </div>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.85rem',
              minWidth: '240px',
              zIndex: 2,
            }}>
              <Link
                href="/products"
                className="btn btn-primary"
                style={{
                  padding: '0.75rem 1.6rem',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textDecoration: 'none',
                }}
              >
                <span>Buka Katalog Lengkap</span>
              </Link>
              <a
                href="https://wa.me/62895364358323?text=Halo%20Admin%20ACSA,%20saya%20ingin%20konsultasi%20pembuatan%20plakat%20custom"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary"
                style={{
                  padding: '0.75rem 1.6rem',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  textDecoration: 'none',
                }}
              >
                <MessageCircle size={17} color="#25D366" />
                <span>Konsultasi WhatsApp</span>
              </a>
            </div>
          </div>
        </section>
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

      {/* Payment Gateway Modal (Midtrans Sandbox Simulator) */}
      <PaymentGatewayModal
        isOpen={isPaymentGatewayOpen}
        onClose={() => setIsPaymentGatewayOpen(false)}
        order={gatewayOrder}
        snapToken={gatewaySnapToken}
        onPaymentCompleted={handlePaymentCompleted}
      />

      {/* Admin / Orders / Database Modal */}
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

      {/* Authentication Modal (Login / Register) */}
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
