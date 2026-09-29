'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { X, Database, RefreshCw, Shield, Truck, CheckCircle2, Lock, Loader2, Package, User as UserIcon, ShieldCheck, Mail, Phone, Calendar } from 'lucide-react';
import { Order, Category, User } from '@/types/ecommerce';
import { formatRupiah } from '@/lib/utils';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  onProductAdded: () => void;
  currentUser: User | null;
  onOpenAuth: () => void;
}

// Status config helper
const STATUS_CONFIG = {
  PROCESSING: { label: 'Diproses', color: '#818cf8', bg: 'rgba(99,102,241,0.15)', border: 'rgba(99,102,241,0.3)' },
  SHIPPED:    { label: 'Dikirim', color: '#fbbf24', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)' },
  DELIVERED:  { label: 'Selesai', color: '#34d399', bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.3)' },
  CANCELLED:  { label: 'Dibatalkan', color: '#f43f5e', bg: 'rgba(244,63,94,0.12)', border: 'rgba(244,63,94,0.3)' },
} as const;

const PAYMENT_STATUS_CONFIG = {
  PAID:    { label: 'PAID', color: '#34d399', bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.3)' },
  PENDING: { label: 'PENDING', color: '#fbbf24', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)' },
  FAILED:  { label: 'FAILED', color: '#f43f5e', bg: 'rgba(244,63,94,0.12)', border: 'rgba(244,63,94,0.3)' },
} as const;

export const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  categories,
  onProductAdded,
  currentUser,
  onOpenAuth,
}) => {
  const [tab, setTab] = useState<'orders' | 'users' | 'addProduct' | 'dbStatus'>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [dbHealth, setDbHealth] = useState<any>(null);
  // Track which orders are currently being updated
  const [updatingOrders, setUpdatingOrders] = useState<Record<string, boolean>>({});

  // Users management state
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [updatingUserRole, setUpdatingUserRole] = useState<Record<string, boolean>>({});
  const [userActionMessage, setUserActionMessage] = useState<string | null>(null);

  // New product form
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newOrigPrice, setNewOrigPrice] = useState('');
  const [newCatId, setNewCatId] = useState(categories[0]?.id || 'cat-gadgets');
  const [newImg, setNewImg] = useState('');
  const [newStock, setNewStock] = useState('15');
  const [newBadge, setNewBadge] = useState('Produk Baru');
  const [isSubmittingProd, setIsSubmittingProd] = useState(false);
  const [addProdSuccess, setAddProdSuccess] = useState('');
  const [addProdError, setAddProdError] = useState('');

  const isAdmin = currentUser?.role === 'ADMIN';

  const fetchOrders = useCallback(async () => {
    if (!isAdmin) return;
    setLoadingOrders(true);
    try {
      const res = await fetch('/api/orders');
      const data = await res.json();
      if (data.success && data.data) {
        setOrders(data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingOrders(false);
    }
  }, [isAdmin]);

  const fetchUsers = useCallback(async () => {
    if (!isAdmin) return;
    setLoadingUsers(true);
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      if (data.success && data.data) {
        setUsers(data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingUsers(false);
    }
  }, [isAdmin]);

  const fetchHealth = async () => {
    try {
      const res = await fetch('/api/health');
      const data = await res.json();
      setDbHealth(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (isOpen) {
      if (isAdmin) {
        fetchOrders();
        fetchUsers();
      }
      fetchHealth();
    }
  }, [isOpen, isAdmin, fetchOrders, fetchUsers]);

  // Handle changing user role (CUSTOMER <-> ADMIN)
  const handleToggleRole = async (targetUser: User) => {
    const newRole = targetUser.role === 'ADMIN' ? 'CUSTOMER' : 'ADMIN';

    if (targetUser.id === currentUser?.id && newRole === 'CUSTOMER') {
      const confirmDemote = window.confirm(
        'Perhatian: Anda sedang mengubah akun Anda sendiri menjadi Pelanggan (Customer). Anda akan kehilangan hak akses admin setelah ini. Lanjutkan?'
      );
      if (!confirmDemote) return;
    }

    setUpdatingUserRole((prev) => ({ ...prev, [targetUser.id]: true }));
    setUserActionMessage(null);
    try {
      const res = await fetch('/api/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: targetUser.id, role: newRole }),
      });
      const data = await res.json();
      if (data.success && data.user) {
        setUsers((prev) =>
          prev.map((u) => (u.id === targetUser.id ? data.user : u))
        );
        setUserActionMessage(`Role ${targetUser.name} berhasil diubah menjadi ${newRole}.`);
        setTimeout(() => setUserActionMessage(null), 3500);

        if (targetUser.id === currentUser?.id) {
          try {
            const updatedUser = { ...currentUser, role: newRole };
            localStorage.setItem('plakatku_user', JSON.stringify(updatedUser));
          } catch (e) {}
        }
      } else {
        setUserActionMessage(`Gagal: ${data.error || 'Terjadi kesalahan'}`);
      }
    } catch (e) {
      setUserActionMessage('Gagal menghubungi server untuk mengubah role');
    } finally {
      setUpdatingUserRole((prev) => ({ ...prev, [targetUser.id]: false }));
    }
  };

  if (!isOpen) return null;

  // Update order shipping status (admin action)
  const handleUpdateStatus = async (orderNumber: string, newStatus: 'SHIPPED' | 'DELIVERED') => {
    setUpdatingOrders((prev) => ({ ...prev, [orderNumber]: true }));
    try {
      const res = await fetch(`/api/orders/${orderNumber}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderStatus: newStatus }),
      });
      const data = await res.json();
      if (data.success && data.order) {
        // Update local state immediately — no full refetch needed
        setOrders((prev) =>
          prev.map((o) => (o.orderNumber === orderNumber ? data.order : o))
        );
      }
    } catch (e) {
      console.error('Failed to update order status', e);
    } finally {
      setUpdatingOrders((prev) => ({ ...prev, [orderNumber]: false }));
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddProdError('');
    setAddProdSuccess('');

    if (!newTitle.trim() || !newPrice) {
      setAddProdError('Nama produk dan harga wajib diisi');
      return;
    }

    setIsSubmittingProd(true);
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newTitle,
          description: newDesc || 'Perangkat elektronik berkualitas tinggi dengan garansi resmi.',
          price: Number(newPrice),
          originalPrice: newOrigPrice ? Number(newOrigPrice) : undefined,
          categoryId: newCatId,
          image: newImg || 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?q=80&w=800&auto=format&fit=crop',
          stock: Number(newStock || 10),
          badge: newBadge,
          featured: true,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setAddProdSuccess('Produk berhasil ditambahkan ke katalog!');
        setNewTitle('');
        setNewDesc('');
        setNewPrice('');
        setNewOrigPrice('');
        setNewImg('');
        onProductAdded();
      } else {
        setAddProdError(data.error || 'Gagal menambahkan produk');
      }
    } catch (err: any) {
      setAddProdError(err?.message || 'Gagal terhubung ke server');
    } finally {
      setIsSubmittingProd(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        zIndex: 105,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
      }}
      onClick={onClose}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '920px',
          maxHeight: '90vh',
          borderRadius: 'var(--radius-lg)',
          overflowY: 'auto',
          position: 'relative',
          padding: '2rem',
          backgroundColor: 'var(--bg-secondary)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="btn-icon"
          style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', zIndex: 10 }}
        >
          <X size={18} />
        </button>

        {/* Protection Gate: If user is not Admin */}
        {!isAdmin ? (
          <div style={{
            padding: '3rem 1.5rem',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1.25rem',
          }}>
            <div style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              background: 'rgba(168, 85, 247, 0.15)',
              color: '#c084fc',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 25px rgba(168, 85, 247, 0.3)',
            }}>
              <Shield size={36} />
            </div>

            <div>
              <span className="badge badge-accent" style={{ marginBottom: '0.5rem' }}>
                Hak Akses Diperlukan
              </span>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 700 }}>Akses Khusus Administrator</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '460px', margin: '0.5rem auto 0' }}>
                Halaman ini digunakan untuk mengelola pesanan, menambahkan produk ke PostgreSQL, dan konfigurasi server. Silakan masuk dengan akun Administrator.
              </p>
            </div>

            <div className="glass-card" style={{ padding: '1rem 1.5rem', background: 'var(--bg-tertiary)', fontSize: '0.85rem' }}>
              <strong>Kredensial Demo Admin:</strong><br />
              Email: <code style={{ color: '#f59e0b' }}>admin@plakatku.com</code> | Password: <code style={{ color: '#f59e0b' }}>admin123</code>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button
                onClick={() => {
                  onClose();
                  onOpenAuth();
                }}
                className="btn btn-primary"
              >
                Masuk sebagai Admin Sekarang
              </button>
              <button onClick={onClose} className="btn btn-secondary">
                Tutup
              </button>
            </div>
          </div>
        ) : (
          /* Normal Admin View */
          <>
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                <Shield size={18} color="#f59e0b" />
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Pusat Pengelolaan PLAKATKU (Admin)</h2>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                Login sebagai <strong>{currentUser?.name}</strong> • Kelola katalog, transaksi, dan database PostgreSQL
              </p>

              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.25rem', flexWrap: 'wrap' }}>
                <button
                  onClick={() => setTab('orders')}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    border: 'none',
                    background: tab === 'orders' ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                    color: tab === 'orders' ? '#fff' : 'var(--text-secondary)',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                  }}
                >
                  Riwayat Pesanan ({orders.length})
                </button>
                <button
                  onClick={() => setTab('users')}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    border: 'none',
                    background: tab === 'users' ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                    color: tab === 'users' ? '#fff' : 'var(--text-secondary)',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                  }}
                >
                  <UserIcon size={14} />
                  <span>Kelola Pengguna ({users.length})</span>
                </button>
                <button
                  onClick={() => setTab('addProduct')}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    border: 'none',
                    background: tab === 'addProduct' ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                    color: tab === 'addProduct' ? '#fff' : 'var(--text-secondary)',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                  }}
                >
                  + Tambah Produk Baru
                </button>
                <button
                  onClick={() => setTab('dbStatus')}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    border: 'none',
                    background: tab === 'dbStatus' ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                    color: tab === 'dbStatus' ? '#fff' : 'var(--text-secondary)',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                  }}
                >
                  <Database size={14} />
                  Status PostgreSQL
                </button>
              </div>
            </div>

            {/* Tab 1: Orders List */}
            {tab === 'orders' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 600 }}>Daftar Transaksi Masuk</h4>
                  <button
                    onClick={fetchOrders}
                    className="btn btn-secondary"
                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', gap: '0.35rem' }}
                  >
                    <RefreshCw size={13} className={loadingOrders ? 'animate-spin' : ''} />
                    <span>Segarkan</span>
                  </button>
                </div>

                {orders.length === 0 ? (
                  <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    Belum ada transaksi. Cobalah melakukan checkout di halaman utama!
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {orders.map((ord) => {
                      const payConf = PAYMENT_STATUS_CONFIG[ord.paymentStatus as keyof typeof PAYMENT_STATUS_CONFIG] || PAYMENT_STATUS_CONFIG.PENDING;
                      const ordConf = STATUS_CONFIG[ord.orderStatus as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.PROCESSING;
                      const isDelivered = ord.orderStatus === 'DELIVERED';
                      const isShipped = ord.orderStatus === 'SHIPPED';
                      const isProcessing = ord.orderStatus === 'PROCESSING';
                      const isPaid = ord.paymentStatus === 'PAID';
                      const isUpdating = updatingOrders[ord.orderNumber];

                      // Can move to SHIPPED only if PAID + PROCESSING
                      const canShip = isPaid && isProcessing;
                      // Can move to DELIVERED only if SHIPPED
                      const canDeliver = isPaid && isShipped;

                      return (
                        <div key={ord.id} className="glass-card" style={{
                          padding: '1.25rem',
                          backgroundColor: 'var(--bg-tertiary)',
                          border: isDelivered
                            ? '1px solid rgba(16,185,129,0.2)'
                            : isShipped
                            ? '1px solid rgba(245,158,11,0.2)'
                            : '1px solid var(--border-subtle)',
                        }}>
                          {/* Order header row */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.85rem' }}>
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                                <strong style={{ fontSize: '1rem', color: 'var(--accent-primary)', fontFamily: 'var(--font-display)' }}>
                                  {ord.orderNumber}
                                </strong>
                                {/* Payment status badge */}
                                <span style={{
                                  padding: '0.15rem 0.55rem',
                                  borderRadius: '999px',
                                  fontSize: '0.68rem',
                                  fontWeight: 700,
                                  letterSpacing: '0.04em',
                                  color: payConf.color,
                                  background: payConf.bg,
                                  border: `1px solid ${payConf.border}`,
                                }}>
                                  {payConf.label}
                                </span>
                                {/* Order status badge */}
                                <span style={{
                                  padding: '0.15rem 0.55rem',
                                  borderRadius: '999px',
                                  fontSize: '0.68rem',
                                  fontWeight: 700,
                                  letterSpacing: '0.04em',
                                  color: ordConf.color,
                                  background: ordConf.bg,
                                  border: `1px solid ${ordConf.border}`,
                                }}>
                                  {ordConf.label}
                                </span>
                                {isDelivered && (
                                  <span style={{ fontSize: '0.7rem', color: '#34d399', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                                    <Lock size={11} /> Terkunci
                                  </span>
                                )}
                              </div>
                              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                                {new Date(ord.createdAt).toLocaleString('id-ID')}
                              </div>
                            </div>

                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                                {formatRupiah(ord.totalAmount)}
                              </div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                {ord.paymentMethod}
                              </div>
                            </div>
                          </div>

                          <div style={{ fontSize: '0.85rem', marginBottom: '0.75rem' }}>
                            <strong>Penerima:</strong> {ord.customerName} ({ord.customerPhone}) • {ord.shippingAddress}, {ord.shippingCity} ({ord.shippingCourier})
                          </div>

                          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.85rem' }}>
                            <strong>Barang ({ord.items.length}):</strong>{' '}
                            {ord.items.map((it) => `${it.productName} (x${it.quantity})`).join(', ')}
                          </div>

                          {/* ─── Admin Action Buttons ─── */}
                          {!isDelivered && (
                            <div style={{
                              display: 'flex',
                              gap: '0.6rem',
                              flexWrap: 'wrap',
                              paddingTop: '0.65rem',
                              borderTop: '1px dashed var(--border-subtle)',
                            }}>
                              {/* Button 1: Sedang Dikirim */}
                              <button
                                onClick={() => handleUpdateStatus(ord.orderNumber, 'SHIPPED')}
                                disabled={!canShip || isUpdating}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.45rem',
                                  padding: '0.5rem 1rem',
                                  borderRadius: 'var(--radius-md)',
                                  border: canShip
                                    ? '1px solid rgba(245,158,11,0.5)'
                                    : '1px solid var(--border-subtle)',
                                  background: canShip
                                    ? 'rgba(245,158,11,0.12)'
                                    : 'rgba(255,255,255,0.04)',
                                  color: canShip ? '#fbbf24' : 'var(--text-muted)',
                                  fontSize: '0.8rem',
                                  fontWeight: 600,
                                  cursor: canShip && !isUpdating ? 'pointer' : 'not-allowed',
                                  opacity: canShip ? 1 : 0.5,
                                  transition: 'all 0.15s ease',
                                }}
                                title={
                                  isShipped ? 'Sudah dalam pengiriman'
                                  : !isPaid ? 'Hanya tersedia untuk pesanan yang sudah PAID'
                                  : 'Ubah status menjadi Sedang Dikirim'
                                }
                              >
                                {isUpdating ? <Loader2 size={14} className="animate-spin" /> : <Truck size={14} />}
                                <span>Sedang Dikirim</span>
                              </button>

                              {/* Button 2: Pesanan Selesai */}
                              <button
                                onClick={() => handleUpdateStatus(ord.orderNumber, 'DELIVERED')}
                                disabled={!canDeliver || isUpdating}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.45rem',
                                  padding: '0.5rem 1rem',
                                  borderRadius: 'var(--radius-md)',
                                  border: canDeliver
                                    ? '1px solid rgba(16,185,129,0.5)'
                                    : '1px solid var(--border-subtle)',
                                  background: canDeliver
                                    ? 'rgba(16,185,129,0.12)'
                                    : 'rgba(255,255,255,0.04)',
                                  color: canDeliver ? '#34d399' : 'var(--text-muted)',
                                  fontSize: '0.8rem',
                                  fontWeight: 600,
                                  cursor: canDeliver && !isUpdating ? 'pointer' : 'not-allowed',
                                  opacity: canDeliver ? 1 : 0.5,
                                  transition: 'all 0.15s ease',
                                }}
                                title={
                                  !isShipped ? 'Aktifkan setelah status berubah menjadi "Sedang Dikirim" terlebih dahulu'
                                  : 'Tandai pesanan ini sebagai Selesai (terminal)'
                                }
                              >
                                {isUpdating ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                                <span>Pesanan Selesai</span>
                              </button>

                              {!isPaid && (
                                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', alignSelf: 'center' }}>
                                  ⚠ Menunggu pembayaran
                                </span>
                              )}
                            </div>
                          )}

                          {/* Delivered final state banner */}
                          {isDelivered && (
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem',
                              paddingTop: '0.65rem',
                              borderTop: '1px dashed rgba(16,185,129,0.3)',
                              fontSize: '0.8rem',
                              color: '#34d399',
                              fontWeight: 500,
                            }}>
                              <CheckCircle2 size={15} />
                              <span>Pesanan telah selesai &amp; terkirim (Status terkunci, tidak dapat diubah lagi).</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Tab: Users Management */}
            {tab === 'users' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      Daftar Pengguna &amp; Hak Akses
                    </h4>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      Semua pengguna yang mendaftar otomatis menjadi User (Pelanggan). Anda dapat menaikkan hak aksesnya menjadi Admin di sini.
                    </p>
                  </div>
                  <button
                    onClick={fetchUsers}
                    className="btn btn-secondary"
                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', gap: '0.35rem' }}
                  >
                    <RefreshCw size={13} className={loadingUsers ? 'animate-spin' : ''} />
                    <span>Segarkan</span>
                  </button>
                </div>

                {userActionMessage && (
                  <div style={{
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--emerald-soft-bg)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    color: 'var(--emerald-accent)',
                    fontSize: '0.82rem',
                    marginBottom: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}>
                    <CheckCircle2 size={16} />
                    <span>{userActionMessage}</span>
                  </div>
                )}

                {loadingUsers && (
                  <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    <Loader2 size={24} className="animate-spin" style={{ margin: '0 auto 0.75rem auto' }} />
                    <p style={{ fontSize: '0.85rem' }}>Memuat daftar pengguna...</p>
                  </div>
                )}

                {!loadingUsers && users.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '3.5rem 1rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                    <UserIcon size={36} color="var(--text-muted)" style={{ margin: '0 auto 0.75rem auto', opacity: 0.6 }} />
                    <h5 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.35rem' }}>Belum Ada Pengguna Lain</h5>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: '420px', margin: '0 auto' }}>
                      Ketika ada pembeli yang mendaftar akun baru di toko, data dan akun mereka akan langsung muncul di sini.
                    </p>
                  </div>
                )}

                {!loadingUsers && users.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                    {users.map((u) => {
                      const isTargetAdmin = u.role === 'ADMIN';
                      const isCurrentLoggedIn = u.id === currentUser?.id;
                      const isUpdatingThis = updatingUserRole[u.id];

                      return (
                        <div
                          key={u.id}
                          className="gallery-card"
                          style={{
                            padding: '1.15rem 1.35rem',
                            display: 'flex',
                            flexWrap: 'wrap',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '1rem',
                            borderLeft: isTargetAdmin ? '3px solid var(--amber-accent)' : '3px solid var(--emerald-accent)',
                          }}
                        >
                          {/* User Details */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem', minWidth: '240px' }}>
                            <div style={{
                              width: '42px',
                              height: '42px',
                              borderRadius: '50%',
                              background: isTargetAdmin ? 'var(--amber-soft-bg)' : 'var(--emerald-soft-bg)',
                              color: isTargetAdmin ? 'var(--amber-accent)' : 'var(--emerald-accent)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                              fontWeight: 700,
                              fontSize: '1rem',
                            }}>
                              {isTargetAdmin ? <Shield size={18} /> : <UserIcon size={18} />}
                            </div>

                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                                <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                                  {u.name}
                                </span>
                                {isCurrentLoggedIn && (
                                  <span style={{
                                    fontSize: '0.68rem',
                                    background: 'var(--bg-tertiary)',
                                    color: 'var(--text-muted)',
                                    padding: '0.1rem 0.45rem',
                                    borderRadius: '4px',
                                    fontWeight: 600,
                                  }}>
                                    Akun Anda
                                  </span>
                                )}
                              </div>

                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginTop: '0.35rem', flexWrap: 'wrap', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                                  <Mail size={12} color="var(--text-muted)" />
                                  {u.email}
                                </span>
                                {u.phone && (
                                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                                    <Phone size={12} color="var(--text-muted)" />
                                    {u.phone}
                                  </span>
                                )}
                                {u.city && (
                                  <span style={{ color: 'var(--text-muted)' }}>
                                    • {u.city}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Role Badge & Action Button */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.35rem',
                              padding: '0.25rem 0.65rem',
                              borderRadius: 'var(--radius-sm)',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              letterSpacing: '0.04em',
                              background: isTargetAdmin ? 'var(--amber-soft-bg)' : 'var(--emerald-soft-bg)',
                              color: isTargetAdmin ? 'var(--amber-accent)' : 'var(--emerald-accent)',
                              border: isTargetAdmin ? '1px solid rgba(122, 72, 13, 0.25)' : '1px solid rgba(42, 88, 47, 0.25)',
                            }}>
                              {isTargetAdmin ? <ShieldCheck size={13} /> : <UserIcon size={13} />}
                              <span>{isTargetAdmin ? 'ADMINISTRATOR' : 'PELANGGAN (USER)'}</span>
                            </span>

                            <button
                              type="button"
                              onClick={() => handleToggleRole(u)}
                              disabled={isUpdatingThis}
                              className="btn btn-secondary"
                              style={{
                                fontSize: '0.78rem',
                                padding: '0.45rem 0.85rem',
                                gap: '0.4rem',
                                borderRadius: 'var(--radius-sm)',
                                borderColor: isTargetAdmin ? 'var(--border-subtle)' : 'var(--amber-accent)',
                                color: isTargetAdmin ? 'var(--text-secondary)' : 'var(--amber-accent)',
                                background: isTargetAdmin ? 'var(--bg-tertiary)' : 'var(--amber-soft-bg)',
                                cursor: isUpdatingThis ? 'not-allowed' : 'pointer',
                              }}
                              title={isTargetAdmin ? 'Ubah role pengguna ini menjadi Pelanggan biasa' : 'Berikan hak akses Administrator ke pengguna ini'}
                            >
                              {isUpdatingThis ? (
                                <>
                                  <Loader2 size={13} className="animate-spin" />
                                  <span>Memproses...</span>
                                </>
                              ) : isTargetAdmin ? (
                                <>
                                  <UserIcon size={14} />
                                  <span>Ubah ke User</span>
                                </>
                              ) : (
                                <>
                                  <ShieldCheck size={14} />
                                  <span>Jadikan Admin</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Tab 2: Add Product Form */}
            {tab === 'addProduct' && (
              <form onSubmit={handleCreateProduct}>
                {addProdSuccess && (
                  <div style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', padding: '0.75rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontSize: '0.85rem' }}>
                    {addProdSuccess}
                  </div>
                )}
                {addProdError && (
                  <div style={{ background: 'rgba(244, 63, 94, 0.15)', color: '#f43f5e', padding: '0.75rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontSize: '0.85rem' }}>
                    {addProdError}
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                      Nama Produk *
                    </label>
                    <input
                      type="text"
                      required
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="input-control"
                      placeholder="e.g. Sony WH-1000XM5 Silver"
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                      Kategori *
                    </label>
                    <select
                      value={newCatId}
                      onChange={(e) => setNewCatId(e.target.value)}
                      className="input-control"
                      style={{ cursor: 'pointer' }}
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                      Harga Jual (Rp) *
                    </label>
                    <input
                      type="number"
                      required
                      value={newPrice}
                      onChange={(e) => setNewPrice(e.target.value)}
                      className="input-control"
                      placeholder="e.g. 4999000"
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                      Harga Asal / Coret (Rp)
                    </label>
                    <input
                      type="number"
                      value={newOrigPrice}
                      onChange={(e) => setNewOrigPrice(e.target.value)}
                      className="input-control"
                      placeholder="e.g. 5499000 (Opsional)"
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                      URL Gambar Produk (Unsplash / CDN)
                    </label>
                    <input
                      type="url"
                      value={newImg}
                      onChange={(e) => setNewImg(e.target.value)}
                      className="input-control"
                      placeholder="https://images.unsplash.com/..."
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                      Jumlah Stok Awal
                    </label>
                    <input
                      type="number"
                      value={newStock}
                      onChange={(e) => setNewStock(e.target.value)}
                      className="input-control"
                    />
                  </div>
                </div>

                <div style={{ marginTop: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                    Deskripsi Produk
                  </label>
                  <textarea
                    rows={3}
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    className="input-control"
                    placeholder="Rincian spesifikasi, garansi, dan kelengkapan kotak..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingProd}
                  className="btn btn-primary"
                  style={{ marginTop: '1.25rem', width: '100%', height: '44px' }}
                >
                  {isSubmittingProd ? 'Menyimpan Produk...' : '+ Simpan Produk ke Katalog'}
                </button>
              </form>
            )}

            {/* Tab 3: DB Status & Instructions */}
            {tab === 'dbStatus' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="glass-card" style={{ padding: '1.25rem', backgroundColor: 'var(--bg-tertiary)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
                    <Database size={20} color="var(--accent-primary)" />
                    <h4 style={{ fontSize: '1rem', fontWeight: 600 }}>Informasi Koneksi PostgreSQL</h4>
                  </div>

                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    <div><strong>Status Saat Ini:</strong> {dbHealth?.status === 'healthy' ? '✅ Terhubung ke PostgreSQL' : '⚡ Mode Fallback Aktif (Siap Terhubung)'}</div>
                    <div><strong>Pesan:</strong> {dbHealth?.message}</div>
                    <div><strong>ORM:</strong> Prisma 6.4.1 Client</div>
                  </div>
                </div>

                <div className="glass-card" style={{ padding: '1.25rem', backgroundColor: 'var(--bg-tertiary)' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                    Cara Menghubungkan PostgreSQL Anda:
                  </h4>
                  <ol style={{ paddingLeft: '1.25rem', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                    <li>Buka file <code style={{ color: 'var(--accent-primary)' }}>.env</code> di root proyek ini.</li>
                    <li>Sesuaikan <code style={{ color: 'var(--accent-primary)' }}>DATABASE_URL</code> dengan kredensial PostgreSQL Anda:
                      <pre style={{ background: 'rgba(0,0,0,0.3)', padding: '0.5rem', borderRadius: '6px', margin: '0.35rem 0', color: '#a5b4fc' }}>
                        DATABASE_URL=&quot;postgresql://user:password@localhost:5432/ecommerce?schema=public&quot;
                      </pre>
                    </li>
                    <li>Jalankan perintah berikut di terminal:
                      <pre style={{ background: 'rgba(0,0,0,0.3)', padding: '0.5rem', borderRadius: '6px', margin: '0.35rem 0', color: '#34d399' }}>
                        npm run db:push; npm run db:seed
                      </pre>
                    </li>
                    <li>Website akan otomatis membaca dan menyimpan seluruh produk dan transaksi langsung dari PostgreSQL!</li>
                  </ol>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
