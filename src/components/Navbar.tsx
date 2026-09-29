'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { 
  Search, 
  Heart, 
  ShoppingBag, 
  User as UserIcon, 
  Languages, 
  ChevronDown, 
  Menu, 
  X, 
  ArrowRight, 
  Shield, 
  PackageCheck, 
  LogOut, 
  Sun, 
  Moon,
  Database,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Category, User } from '@/types/ecommerce';

interface NavbarProps {
  cartCount: number;
  onOpenCart: () => void;
  onOpenAdmin: () => void;
  onOpenAuth: () => void;
  onOpenUserOrders: () => void;
  onLogout: () => void;
  currentUser: User | null;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (id: string) => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  dbStatus: { connected: boolean; mode: string; message: string } | null;
  orderNotifCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  cartCount,
  onOpenCart,
  onOpenAdmin,
  onOpenAuth,
  onOpenUserOrders,
  onLogout,
  currentUser,
  searchTerm,
  onSearchChange,
  categories,
  selectedCategory,
  onSelectCategory,
  theme,
  onToggleTheme,
  dbStatus,
  orderNotifCount = 0,
}) => {
  // Search input slide-down state
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // User menu dropdown state
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // Region / Language selector dropdown
  const [isRegionOpen, setIsRegionOpen] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState('Indonesia');
  const [selectedLang, setSelectedLang] = useState<'id' | 'en'>('id');

  // Wishlist state & toast
  const [wishlistCount, setWishlistCount] = useState(0);
  const [wishlistToast, setWishlistToast] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('plakatku_wishlist');
      if (saved) {
        const parsed = JSON.parse(saved);
        setWishlistCount(Array.isArray(parsed) ? parsed.length : 0);
      }
    } catch (e) {}
  }, []);

  // Mobile drawer state
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Focus search input when open
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  const router = useRouter();
  const pathname = usePathname();

  // Helper to scroll smoothly to catalog section
  const scrollToCatalog = () => {
    const el = document.getElementById('catalog-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSelectCat = (catId: string) => {
    onSelectCategory(catId);
    if (typeof window !== 'undefined') {
      if (window.location.pathname !== '/products') {
        router.push(`/products${catId && catId !== 'all' ? `?category=${catId}` : ''}`);
      } else {
        scrollToCatalog();
      }
    }
  };

  const handleWishlistClick = () => {
    setWishlistToast(true);
    setTimeout(() => setWishlistToast(false), 2400);
  };

  // Language switching via Google Translate
  const handleLanguageChange = (lang: 'id' | 'en') => {
    setSelectedLang(lang);
    setSelectedRegion(lang === 'id' ? 'Indonesia' : 'English');
    setIsRegionOpen(false);
    if (typeof window !== 'undefined') {
      // Set cookie for Google Translate
      document.cookie = `googtrans=/id/${lang}; path=/`;
      document.cookie = `googtrans=/id/${lang}; domain=${window.location.hostname}; path=/`;
      // Try to trigger Google Translate combo element
      const combo = document.querySelector('.goog-te-combo') as HTMLSelectElement | null;
      if (combo) {
        combo.value = lang;
        combo.dispatchEvent(new Event('change'));
      }
      localStorage.setItem('plakatku_lang', lang);
      // Reload to apply translation cleanly if combo not found
      if (!combo) {
        window.location.reload();
      }
    }
  };

  // Restore saved language on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('plakatku_lang') as 'id' | 'en' | null;
      if (saved && saved !== 'id') {
        setSelectedLang(saved);
        setSelectedRegion('English');
      }
    }
  }, []);

  return (
    <>
      {/* Charles & Keith Exact Header Bar */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          backgroundColor: theme === 'dark' ? '#0E1014' : '#FFFFFF',
          borderBottom: '1px solid var(--border-subtle)',
          transition: 'all 0.25s ease',
        }}
      >
        {/* TOP MAIN ROW */}
        <div className="ck-header-inner">
          {/* ===============================================================
              LEFT SECTION: Search Icon + Navigation Links (SHOP, NEW IN, ...)
             =============================================================== */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setIsMobileOpen(true)}
              style={{
                display: 'none',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                padding: '0.5rem 0.5rem 0.5rem 0',
                marginRight: '0.75rem',
              }}
              className="ck-mobile-trigger"
              aria-label="Menu"
            >
              <Menu size={22} strokeWidth={1.6} />
            </button>

            {/* Desktop Left Group */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '2.2rem',
              }}
              className="ck-desktop-nav"
            >
              {/* Search Icon */}
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: isSearchOpen ? 'var(--amber-accent)' : 'var(--text-primary)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0.4rem 0.2rem',
                  transition: 'color 0.2s ease',
                }}
                aria-label="Cari"
                title="Pencarian Produk"
              >
                <Search size={18} strokeWidth={1.6} />
              </button>

              {/* BERANDA Link */}
              <button
                onClick={() => {
                  if (pathname !== '/') {
                    router.push('/');
                  } else {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontFamily: 'var(--font-sans)',
                  fontSize: '0.8rem',
                  fontWeight: pathname === '/' ? 700 : 500,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: pathname === '/' ? 'var(--text-primary)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  padding: '1.2rem 0',
                  transition: 'opacity 0.2s ease',
                  borderBottom: pathname === '/' ? '2px solid var(--accent-primary)' : '2px solid transparent',
                }}
              >
                BERANDA
              </button>

              {/* PRODUK Link */}
              <button
                onClick={() => router.push('/products')}
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontFamily: 'var(--font-sans)',
                  fontSize: '0.8rem',
                  fontWeight: pathname.startsWith('/products') ? 700 : 500,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: pathname.startsWith('/products') ? 'var(--text-primary)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  padding: '1.2rem 0',
                  transition: 'opacity 0.2s ease',
                  borderBottom: pathname.startsWith('/products') ? '2px solid var(--accent-primary)' : '2px solid transparent',
                }}
              >
                PRODUK
              </button>
            </div>
          </div>

          {/* ===============================================================
              CENTER SECTION: Brand Logo EXACTLY Centered
             =============================================================== */}
          <div
            onClick={() => {
              if (typeof window !== 'undefined' && window.location.pathname !== '/') {
                router.push('/');
              } else {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
            className="ck-brand-container"
          >
            <span className="ck-brand-title">
              Agung Citra Sukses Abadi
            </span>
          </div>

          {/* ===============================================================
              RIGHT SECTION: Admin, Theme, Wishlist, Bag, User, Region Pill
             =============================================================== */}
          <div className="ck-header-right">

            {/* Direct Admin Access Button - only for ADMIN role */}
            {currentUser?.role === 'ADMIN' && (
              <button
                onClick={onOpenAdmin}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.3rem',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                }}
                title="Buka Panel Manajemen Admin"
                aria-label="Admin"
              >
                <Shield size={17} strokeWidth={1.6} />
                <span className="hidden lg:inline">Admin</span>
              </button>
            )}

            {/* Theme Toggle Button (Light / Dark) */}
            <button
              onClick={onToggleTheme}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                padding: '0.3rem',
              }}
              title={theme === 'dark' ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap'}
              aria-label="Tema"
            >
              {theme === 'dark' ? (
                <Sun size={18} strokeWidth={1.6} />
              ) : (
                <Moon size={18} strokeWidth={1.6} />
              )}
            </button>

            {/* Wishlist Heart Icon - only when logged in */}
            {currentUser && (
              <button
                onClick={handleWishlistClick}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0.3rem',
                  position: 'relative',
                }}
                title="Wishlist / Favorit"
                aria-label="Wishlist"
              >
                <Heart size={19} strokeWidth={1.5} />
                {wishlistCount > 0 && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '-2px',
                      right: '-4px',
                      fontSize: '0.62rem',
                      fontWeight: 700,
                      color: 'var(--text-primary)',
                    }}
                  >
                    {wishlistCount}
                  </span>
                )}
              </button>
            )}

            {/* Shopping Bag Icon - only when logged in */}
            {currentUser && (
              <button
                onClick={onOpenCart}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0.3rem',
                  position: 'relative',
                }}
                title="Tas Belanja"
                aria-label="Keranjang"
              >
                <ShoppingBag size={19} strokeWidth={1.5} />
                {cartCount > 0 && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '-3px',
                      right: '-5px',
                      backgroundColor: 'var(--text-primary)',
                      color: 'var(--bg-secondary)',
                      fontSize: '0.6rem',
                      fontWeight: 700,
                      width: '16px',
                      height: '16px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {cartCount}
                  </span>
                )}
              </button>
            )}

            {/* User Profile / Auth Button */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => {
                  if (currentUser) {
                    setIsUserMenuOpen(!isUserMenuOpen);
                  } else {
                    onOpenAuth();
                  }
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0.3rem',
                  position: 'relative',
                }}
                title={currentUser ? `Akun: ${currentUser.name}` : 'Masuk ke Akun'}
                aria-label="Akun"
              >
                <UserIcon size={19} strokeWidth={1.5} />
                {orderNotifCount > 0 && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '1px',
                      right: '0',
                      width: '7px',
                      height: '7px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--rose-accent)',
                    }}
                  />
                )}
              </button>

              {/* User Dropdown */}
              <AnimatePresence>
                {isUserMenuOpen && currentUser && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: '130%',
                      backgroundColor: theme === 'dark' ? '#14171D' : '#FFFFFF',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '8px',
                      boxShadow: '0 10px 28px rgba(0, 0, 0, 0.12)',
                      minWidth: '220px',
                      padding: '0.75rem 0',
                      zIndex: 110,
                    }}
                  >
                    <div style={{ padding: '0.5rem 1.25rem', borderBottom: '1px solid var(--border-subtle)' }}>
                      <p style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                        {currentUser.name}
                      </p>
                      <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                        {currentUser.email}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        onOpenUserOrders();
                      }}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.6rem',
                        padding: '0.65rem 1.25rem',
                        background: 'transparent',
                        border: 'none',
                        fontSize: '0.82rem',
                        color: 'var(--text-primary)',
                        cursor: 'pointer',
                        textAlign: 'left',
                      }}
                    >
                      <PackageCheck size={16} />
                      <span>Pesanan Saya</span>
                      {orderNotifCount > 0 && (
                        <span style={{
                          background: 'var(--rose-accent)',
                          color: '#fff',
                          fontSize: '0.65rem',
                          padding: '0.1rem 0.4rem',
                          borderRadius: '9999px',
                          marginLeft: 'auto',
                        }}>
                          {orderNotifCount}
                        </span>
                      )}
                    </button>

                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        onOpenAdmin();
                      }}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.6rem',
                        padding: '0.65rem 1.25rem',
                        background: 'transparent',
                        border: 'none',
                        fontSize: '0.82rem',
                        color: 'var(--text-primary)',
                        cursor: 'pointer',
                        textAlign: 'left',
                      }}
                    >
                      <Shield size={16} />
                      <span>Admin Dashboard</span>
                    </button>

                    <div style={{ borderTop: '1px solid var(--border-subtle)', marginTop: '0.35rem', paddingTop: '0.35rem' }}>
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          onLogout();
                        }}
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.6rem',
                          padding: '0.65rem 1.25rem',
                          background: 'transparent',
                          border: 'none',
                          fontSize: '0.82rem',
                          color: '#C53030',
                          cursor: 'pointer',
                          textAlign: 'left',
                        }}
                      >
                        <LogOut size={16} />
                        <span>Keluar (Logout)</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Language / Region Pill Button */}
            <div style={{ position: 'relative' }} className="ck-region-pill">
              <button
                onClick={() => setIsRegionOpen(!isRegionOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  backgroundColor: theme === 'dark' ? '#1B1E26' : '#F5F5F5',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '9999px',
                  padding: '0.35rem 0.75rem',
                  fontSize: '0.74rem',
                  fontWeight: 500,
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  transition: 'background 0.2s ease',
                }}
              >
                <Languages size={14} strokeWidth={1.8} />
                <span>{selectedRegion}</span>
                <ChevronDown size={12} strokeWidth={2} />
              </button>

              {/* Region Dropdown */}
              <AnimatePresence>
                {isRegionOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.2 }}
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: '120%',
                      backgroundColor: theme === 'dark' ? '#14171D' : '#FFFFFF',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '8px',
                      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.08)',
                      minWidth: '160px',
                      padding: '0.5rem 0',
                      zIndex: 110,
                    }}
                  >
                    {([
                      { label: '🇮🇩 Indonesia', lang: 'id' as const },
                      { label: '🇬🇧 English', lang: 'en' as const },
                    ]).map(({ label, lang }) => (
                      <button
                        key={lang}
                        onClick={() => handleLanguageChange(lang)}
                        style={{
                          width: '100%',
                          textAlign: 'left',
                          padding: '0.5rem 1rem',
                          fontSize: '0.78rem',
                          border: 'none',
                          background: selectedLang === lang ? (theme === 'dark' ? '#1B1E26' : '#F5F5F5') : 'transparent',
                          fontWeight: selectedLang === lang ? 700 : 400,
                          color: 'var(--text-primary)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                        }}
                      >
                        {label}
                        {selectedLang === lang && <Check size={13} strokeWidth={2.5} />}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>



        {/* ===============================================================
            EXPANDABLE SEARCH OVERLAY (ANIMATED SLIDE-DOWN)
           =============================================================== */}
        <AnimatePresence>
          {isSearchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              style={{
                overflow: 'hidden',
                backgroundColor: theme === 'dark' ? '#14171D' : '#FFFFFF',
                borderTop: '1px solid var(--border-subtle)',
                boxShadow: '0 12px 30px rgba(0, 0, 0, 0.06)',
              }}
            >
              <div
                style={{
                  maxWidth: '920px',
                  margin: '0 auto',
                  padding: '2rem 1.5rem 2.5rem 1.5rem',
                }}
              >
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Search
                    size={20}
                    style={{
                      position: 'absolute',
                      left: '1.25rem',
                      color: 'var(--text-muted)',
                      pointerEvents: 'none',
                    }}
                  />
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Cari plakat kristal, akrilik presisi, trophy kuningan, box beludru..."
                    value={searchTerm}
                    onChange={(e) => {
                      onSearchChange(e.target.value);
                      scrollToCatalog();
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        if (typeof window !== 'undefined' && window.location.pathname !== '/products') {
                          router.push(`/products?search=${encodeURIComponent(searchTerm)}`);
                        } else {
                          scrollToCatalog();
                        }
                        setIsSearchOpen(false);
                      }
                    }}
                    style={{
                      width: '100%',
                      height: '52px',
                      paddingLeft: '3.4rem',
                      paddingRight: '3rem',
                      backgroundColor: theme === 'dark' ? '#0E1014' : '#FAFAFA',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '4px',
                      fontSize: '0.94rem',
                      color: 'var(--text-primary)',
                      fontFamily: 'var(--font-sans)',
                      outline: 'none',
                    }}
                  />
                  <button
                    onClick={() => {
                      onSearchChange('');
                      setIsSearchOpen(false);
                    }}
                    style={{
                      position: 'absolute',
                      right: '1.25rem',
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      fontSize: '1rem',
                      padding: '0.4rem',
                    }}
                    aria-label="Tutup pencarian"
                  >
                    ✕
                  </button>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    flexWrap: 'wrap',
                    marginTop: '1.2rem',
                    fontSize: '0.78rem',
                    color: 'var(--text-muted)',
                  }}
                >
                  <span style={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Trending:
                  </span>
                  {['Plakat Kristal 3D Laser', 'Akrilik 15mm Grafir', 'Kayu Jati Plat Kuningan', 'Piala Bergilir Kejuaraan'].map(
                    (tag) => (
                      <button
                        key={tag}
                        onClick={() => {
                          onSearchChange(tag);
                          scrollToCatalog();
                          setIsSearchOpen(false);
                        }}
                        style={{
                          background: theme === 'dark' ? '#1B1E26' : '#F5F5F5',
                          border: 'none',
                          borderRadius: '9999px',
                          padding: '0.3rem 0.85rem',
                          fontSize: '0.75rem',
                          color: 'var(--text-secondary)',
                          cursor: 'pointer',
                          transition: 'background 0.15s ease',
                        }}
                      >
                        {tag}
                      </button>
                    )
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Wishlist Toast Feedback */}
      <AnimatePresence>
        {wishlistToast && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            style={{
              position: 'fixed',
              top: '72px',
              right: '2rem',
              backgroundColor: 'var(--accent-primary)',
              color: 'var(--bg-primary)',
              padding: '0.65rem 1.25rem',
              borderRadius: '4px',
              fontSize: '0.8rem',
              fontWeight: 500,
              zIndex: 120,
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
            }}
          >
            Wishlist: 2 produk plakat tersimpan
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Drawer (Responsive) */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
              style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: 'rgba(0,0,0,0.5)',
                zIndex: 200,
              }}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              style={{
                position: 'fixed',
                top: 0,
                bottom: 0,
                left: 0,
                width: '85%',
                maxWidth: '360px',
                backgroundColor: theme === 'dark' ? '#0E1014' : '#FFFFFF',
                zIndex: 201,
                display: 'flex',
                flexDirection: 'column',
                padding: '1.5rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
                <span style={{ fontSize: '1.15rem', fontWeight: 800, letterSpacing: '0.2em', color: 'var(--text-primary)' }}>
                  PLAKATKU
                </span>
                <button onClick={() => setIsMobileOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-primary)' }}>
                  <X size={20} />
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', flex: 1 }}>
                <span
                  onClick={() => { router.push('/'); setIsMobileOpen(false); }}
                  style={{ fontSize: '0.92rem', fontWeight: pathname === '/' ? 700 : 600, letterSpacing: '0.08em', cursor: 'pointer', color: pathname === '/' ? 'var(--accent-primary)' : 'var(--text-primary)' }}
                >
                  BERANDA
                </span>
                <span
                  onClick={() => { router.push('/products'); setIsMobileOpen(false); }}
                  style={{
                    fontSize: '0.92rem',
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    cursor: 'pointer',
                    color: pathname.startsWith('/products') ? 'var(--amber-accent)' : 'var(--text-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <span>KATALOG PRODUK</span>
                  <span style={{ fontSize: '0.72rem', background: 'var(--amber-soft-bg)', color: 'var(--amber-accent)', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: 600 }}>
                    Semua
                  </span>
                </span>
                <div style={{ height: '1px', background: 'var(--border-subtle)', margin: '0.2rem 0' }} />
                <span style={{ fontSize: '0.74rem', fontWeight: 700, letterSpacing: '0.1em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  KATEGORI PILIHAN
                </span>
                {categories.map((c) => (
                  <span
                    key={c.id}
                    onClick={() => { handleSelectCat(c.id); setIsMobileOpen(false); }}
                    style={{ fontSize: '0.9rem', fontWeight: selectedCategory === c.id ? 700 : 500, color: selectedCategory === c.id ? 'var(--text-primary)' : 'var(--text-secondary)', cursor: 'pointer', paddingLeft: '0.4rem' }}
                  >
                    {c.name}
                  </span>
                ))}
              </div>

              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <button
                  onClick={() => { onToggleTheme(); }}
                  className="btn btn-secondary"
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
                  <span>Ganti Mode {theme === 'dark' ? 'Terang' : 'Gelap'}</span>
                </button>

                {currentUser ? (
                  <button onClick={() => { onOpenUserOrders(); setIsMobileOpen(false); }} className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>
                    <PackageCheck size={16} />
                    <span>Pesanan Saya ({currentUser.name.split(' ')[0]})</span>
                  </button>
                ) : (
                  <button onClick={() => { onOpenAuth(); setIsMobileOpen(false); }} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                    <UserIcon size={16} />
                    <span>Masuk / Daftar Akun</span>
                  </button>
                )}

                <button onClick={() => { onOpenAdmin(); setIsMobileOpen(false); }} className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>
                  <Shield size={16} />
                  <span>Admin Dashboard</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
