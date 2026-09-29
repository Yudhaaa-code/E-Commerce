'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, PackageCheck, Clock, Truck, CheckCircle2, RefreshCw, Bell, BellRing } from 'lucide-react';
import { Order, User } from '@/types/ecommerce';
import { formatRupiah } from '@/lib/utils';

interface UserOrdersModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
}

// Status visual config for user-friendly display
const STATUS_CONFIG = {
  PROCESSING: {
    label: 'Sedang Diproses',
    icon: Clock,
    color: '#818cf8',
    bg: 'rgba(99,102,241,0.12)',
    border: 'rgba(99,102,241,0.3)',
    emoji: '⚙️',
  },
  SHIPPED: {
    label: 'Sedang Dikirim',
    icon: Truck,
    color: '#fbbf24',
    bg: 'rgba(245,158,11,0.12)',
    border: 'rgba(245,158,11,0.3)',
    emoji: '🚚',
  },
  DELIVERED: {
    label: 'Pesanan Selesai',
    icon: CheckCircle2,
    color: '#34d399',
    bg: 'rgba(16,185,129,0.12)',
    border: 'rgba(16,185,129,0.3)',
    emoji: '✅',
  },
  CANCELLED: {
    label: 'Dibatalkan',
    icon: X,
    color: '#f43f5e',
    bg: 'rgba(244,63,94,0.12)',
    border: 'rgba(244,63,94,0.3)',
    emoji: '❌',
  },
} as const;

const PAYMENT_CONFIG = {
  PAID:    { label: 'LUNAS', color: '#34d399', bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.3)' },
  PENDING: { label: 'MENUNGGU', color: '#fbbf24', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)' },
  FAILED:  { label: 'GAGAL', color: '#f43f5e', bg: 'rgba(244,63,94,0.12)', border: 'rgba(244,63,94,0.3)' },
} as const;

interface StatusNotification {
  orderNumber: string;
  newStatus: string;
  label: string;
  emoji: string;
  timestamp: number;
}

const POLL_INTERVAL_MS = 15000; // 15 seconds

export const UserOrdersModal: React.FC<UserOrdersModalProps> = ({
  isOpen,
  onClose,
  currentUser,
}) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  // Track previous status per order to detect changes
  const prevStatusRef = useRef<Record<string, string>>({});
  // Notifications queue for status changes
  const [notifications, setNotifications] = useState<StatusNotification[]>([]);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchMyOrders = useCallback(async (silent = false) => {
    if (!currentUser) return;
    if (!silent) setLoading(true);
    try {
      const res = await fetch('/api/orders');
      const data = await res.json();
      if (data.success && data.data) {
        const myOrders = (data.data as Order[]).filter(
          (o) =>
            (o.userId && o.userId === currentUser.id) ||
            o.customerEmail.toLowerCase() === currentUser.email.toLowerCase()
        );

        // Detect status changes vs previous snapshot
        const newNotifs: StatusNotification[] = [];
        myOrders.forEach((ord) => {
          const prevStatus = prevStatusRef.current[ord.orderNumber];
          if (prevStatus && prevStatus !== ord.orderStatus) {
            const conf = STATUS_CONFIG[ord.orderStatus as keyof typeof STATUS_CONFIG];
            if (conf) {
              newNotifs.push({
                orderNumber: ord.orderNumber,
                newStatus: ord.orderStatus,
                label: conf.label,
                emoji: conf.emoji,
                timestamp: Date.now(),
              });
            }
          }
          // Update snapshot
          prevStatusRef.current[ord.orderNumber] = ord.orderStatus;
        });

        if (newNotifs.length > 0) {
          setNotifications((prev) => [...newNotifs, ...prev].slice(0, 10));
        }

        setOrders(myOrders);
      }
    } catch (e) {
      console.error(e);
    } finally {
      if (!silent) setLoading(false);
    }
  }, [currentUser]);

  // Initial load + polling
  useEffect(() => {
    if (isOpen && currentUser) {
      fetchMyOrders(false);

      // Start background polling
      pollRef.current = setInterval(() => {
        fetchMyOrders(true);
      }, POLL_INTERVAL_MS);
    }

    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, [isOpen, currentUser, fetchMyOrders]);

  // Auto-dismiss notifications after 8 seconds
  useEffect(() => {
    if (notifications.length === 0) return;
    const timer = setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => Date.now() - n.timestamp < 8000));
    }, 8000);
    return () => clearTimeout(timer);
  }, [notifications]);

  if (!isOpen || !currentUser) return null;

  const dismissNotification = (orderNumber: string) => {
    setNotifications((prev) => prev.filter((n) => n.orderNumber !== orderNumber));
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
        zIndex: 115,
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
          maxWidth: '740px',
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

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <PackageCheck size={20} color="var(--accent-primary)" />
              <h2 style={{ fontSize: '1.45rem', fontWeight: 700 }}>Pesanan Saya</h2>
              {notifications.length > 0 && (
                <span style={{
                  background: '#f43f5e',
                  color: '#fff',
                  borderRadius: '999px',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  padding: '0.1rem 0.45rem',
                  animation: 'pulse 1.5s infinite',
                }}>
                  {notifications.length} Notifikasi
                </span>
              )}
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Riwayat belanja untuk akun <strong>{currentUser.name}</strong> ({currentUser.email})
            </p>
          </div>

          <button
            onClick={() => fetchMyOrders(false)}
            className="btn btn-secondary"
            style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', gap: '0.35rem' }}
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            <span>Segarkan</span>
          </button>
        </div>

        {/* Live Status Update Notifications */}
        {notifications.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.25rem' }}>
            {notifications.map((notif) => {
              const conf = STATUS_CONFIG[notif.newStatus as keyof typeof STATUS_CONFIG];
              return (
                <div
                  key={`${notif.orderNumber}-${notif.timestamp}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.8rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    background: conf ? conf.bg : 'rgba(99,102,241,0.12)',
                    border: `1px solid ${conf ? conf.border : 'rgba(99,102,241,0.3)'}`,
                    fontSize: '0.85rem',
                    animation: 'fadeIn 0.3s ease',
                  }}
                >
                  <BellRing size={16} color={conf?.color || '#818cf8'} style={{ flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <strong style={{ color: conf?.color || '#818cf8' }}>
                      {notif.emoji} Update Pesanan {notif.orderNumber}
                    </strong>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '0.1rem' }}>
                      Status berubah menjadi <strong style={{ color: conf?.color }}>{notif.label}</strong>
                    </div>
                  </div>
                  <button
                    onClick={() => dismissNotification(notif.orderNumber)}
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '0.2rem' }}
                  >
                    <X size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Polling indicator */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.35rem',
          marginBottom: '1rem',
          fontSize: '0.72rem',
          color: 'var(--text-muted)',
        }}>
          <Bell size={11} />
          <span>Status pesanan diperbarui otomatis setiap 15 detik dari server</span>
        </div>

        {orders.length === 0 ? (
          <div style={{
            padding: '3rem 1.5rem',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1rem',
            color: 'var(--text-muted)',
          }}>
            <PackageCheck size={48} />
            <h4 style={{ color: 'var(--text-primary)', fontSize: '1.1rem' }}>Belum Ada Riwayat Pesanan</h4>
            <p style={{ fontSize: '0.875rem', maxWidth: '380px' }}>
              Anda belum memiliki transaksi pesanan. Mulai jelajahi koleksi plakat &amp; trophy eksklusif kami sekarang!
            </p>
            <button onClick={onClose} className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
              Mulai Belanja
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {orders.map((ord) => {
              const ordConf = STATUS_CONFIG[ord.orderStatus as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.PROCESSING;
              const payConf = PAYMENT_CONFIG[ord.paymentStatus as keyof typeof PAYMENT_CONFIG] || PAYMENT_CONFIG.PENDING;
              const OrdIcon = ordConf.icon;
              const hasNewNotif = notifications.some((n) => n.orderNumber === ord.orderNumber);

              return (
                <div
                  key={ord.id}
                  className="glass-card"
                  style={{
                    padding: '1.25rem',
                    backgroundColor: 'var(--bg-tertiary)',
                    border: hasNewNotif
                      ? `2px solid ${ordConf.color}`
                      : ord.orderStatus === 'DELIVERED'
                      ? '1px solid rgba(16,185,129,0.2)'
                      : ord.orderStatus === 'SHIPPED'
                      ? '1px solid rgba(245,158,11,0.2)'
                      : '1px solid var(--border-subtle)',
                    transition: 'border-color 0.3s ease',
                    boxShadow: hasNewNotif ? `0 0 15px ${ordConf.color}33` : 'none',
                  }}
                >
                  {/* Order header */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    flexWrap: 'wrap',
                    gap: '0.5rem',
                    marginBottom: '0.85rem',
                  }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <strong style={{ fontSize: '1.05rem', color: 'var(--accent-primary)', fontFamily: 'var(--font-display)' }}>
                          {ord.orderNumber}
                        </strong>
                        {/* Payment badge */}
                        <span style={{
                          padding: '0.15rem 0.55rem',
                          borderRadius: '999px',
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          color: payConf.color,
                          background: payConf.bg,
                          border: `1px solid ${payConf.border}`,
                        }}>
                          {payConf.label}
                        </span>
                        {/* Order status badge (larger + icon) */}
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                          padding: '0.2rem 0.65rem',
                          borderRadius: '999px',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          color: ordConf.color,
                          background: ordConf.bg,
                          border: `1px solid ${ordConf.border}`,
                        }}>
                          <OrdIcon size={12} />
                          {ordConf.label}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                        {new Date(ord.createdAt).toLocaleString('id-ID')} • {ord.shippingCourier}
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

                  {/* Status progress bar */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0',
                    marginBottom: '0.85rem',
                    fontSize: '0.7rem',
                    color: 'var(--text-muted)',
                  }}>
                    {(['PROCESSING', 'SHIPPED', 'DELIVERED'] as const).map((step, idx, arr) => {
                      const stepConf = STATUS_CONFIG[step];
                      const currentIdx = ['PROCESSING', 'SHIPPED', 'DELIVERED'].indexOf(ord.orderStatus);
                      const isActive = idx <= currentIdx;
                      const isCurrentStep = ord.orderStatus === step;
                      const StepIcon = stepConf.icon;
                      return (
                        <React.Fragment key={step}>
                          <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '0.2rem',
                            flex: idx < arr.length - 1 ? 'none' : 'none',
                          }}>
                            <div style={{
                              width: '28px',
                              height: '28px',
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              background: isActive ? stepConf.bg : 'var(--bg-secondary)',
                              border: `2px solid ${isActive ? stepConf.color : 'var(--border-subtle)'}`,
                              color: isActive ? stepConf.color : 'var(--text-muted)',
                              transition: 'all 0.3s ease',
                              boxShadow: isCurrentStep ? `0 0 10px ${stepConf.color}55` : 'none',
                            }}>
                              <StepIcon size={13} />
                            </div>
                            <span style={{
                              fontSize: '0.62rem',
                              color: isActive ? stepConf.color : 'var(--text-muted)',
                              fontWeight: isCurrentStep ? 700 : 400,
                              whiteSpace: 'nowrap',
                            }}>
                              {stepConf.label}
                            </span>
                          </div>
                          {idx < arr.length - 1 && (
                            <div style={{
                              flex: 1,
                              height: '2px',
                              background: idx < currentIdx ? ordConf.color : 'var(--border-subtle)',
                              margin: '0 4px',
                              marginBottom: '18px',
                              transition: 'background 0.3s ease',
                            }} />
                          )}
                        </React.Fragment>
                      );
                    })}
                  </div>

                  {/* Items */}
                  <div style={{
                    borderTop: '1px solid var(--border-subtle)',
                    paddingTop: '0.75rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                  }}>
                    {ord.items.map((item) => (
                      <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={item.productImage}
                            alt=""
                            style={{ width: '36px', height: '36px', borderRadius: '4px', objectFit: 'cover' }}
                          />
                          <span>
                            {item.productName} <strong>x{item.quantity}</strong>
                          </span>
                        </div>
                        <span style={{ fontWeight: 600 }}>{formatRupiah(item.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>

                  {/* Shipping destination */}
                  <div style={{
                    marginTop: '0.75rem',
                    paddingTop: '0.5rem',
                    borderTop: '1px dashed var(--border-subtle)',
                    fontSize: '0.78rem',
                    color: 'var(--text-muted)',
                  }}>
                    Tujuan Pengiriman: {ord.shippingAddress}, {ord.shippingCity}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
