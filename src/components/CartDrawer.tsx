'use client';

import React, { useState } from 'react';
import { X, Trash2, ShoppingBag, ArrowRight, Tag, Check, Sparkles } from 'lucide-react';
import { CartItem } from '@/types/ecommerce';
import { formatRupiah } from '@/lib/utils';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onClearCart: () => void;
  onProceedToCheckout: () => void;
  appliedPromo: string;
  discountAmount: number;
  onApplyPromo: (code: string) => boolean;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onProceedToCheckout,
  appliedPromo,
  discountAmount,
  onApplyPromo,
}) => {
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [promoError, setPromoError] = useState('');
  const [promoSuccess, setPromoSuccess] = useState('');

  if (!isOpen) return null;

  const subtotal = items.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const shipping = subtotal > 500000 || subtotal === 0 ? 0 : 25000;
  const grandTotal = Math.max(0, subtotal - discountAmount + shipping);

  const handleCouponSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError('');
    setPromoSuccess('');

    if (!promoCodeInput.trim()) return;

    const valid = onApplyPromo(promoCodeInput.trim().toUpperCase());
    if (valid) {
      setPromoSuccess('Kupon PLAKATKU2026 berhasil dipasang! (Diskon 10%)');
      setPromoCodeInput('');
    } else {
      setPromoError('Kode voucher tidak valid. Gunakan: PLAKATKU2026');
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
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        zIndex: 100,
        display: 'flex',
        justifyContent: 'flex-end',
      }}
      onClick={onClose}
    >
      <div
        className="animate-slide-right"
        style={{
          width: '100%',
          maxWidth: '460px',
          height: '100%',
          backgroundColor: 'var(--bg-secondary)',
          borderLeft: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '-10px 0 30px rgba(0, 0, 0, 0.4)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <ShoppingBag size={20} color="var(--accent-primary)" />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Keranjang Belanja</h3>
            <span className="badge badge-accent">
              {items.reduce((acc, i) => acc + i.quantity, 0)} item
            </span>
          </div>

          <button onClick={onClose} className="btn-icon" style={{ width: '36px', height: '36px' }}>
            <X size={18} />
          </button>
        </div>

        {/* Drawer Body Items */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}>
          {items.length === 0 ? (
            <div style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              color: 'var(--text-muted)',
              gap: '1rem',
              padding: '2rem',
            }}>
              <div style={{
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                background: 'var(--bg-tertiary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-secondary)',
              }}>
                <ShoppingBag size={32} />
              </div>
              <h4 style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>Keranjang Anda Kosong</h4>
              <p style={{ fontSize: '0.85rem' }}>
                Pilih berbagai perangkat elektronik andalan untuk memulai pesanan Anda.
              </p>
              <button onClick={onClose} className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
                Jelajahi Produk
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="glass-card"
                style={{
                  padding: '0.9rem',
                  display: 'flex',
                  gap: '0.9rem',
                  alignItems: 'center',
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.product.image}
                  alt={item.product.name}
                  style={{
                    width: '68px',
                    height: '68px',
                    borderRadius: 'var(--radius-sm)',
                    objectFit: 'cover',
                    backgroundColor: 'rgba(0,0,0,0.2)',
                  }}
                />

                <div style={{ flex: 1, minWidth: 0 }}>
                  <h4 style={{
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    marginBottom: '0.25rem',
                  }}>
                    {item.product.name}
                  </h4>

                  <div style={{
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    fontFamily: 'var(--font-display)',
                    marginBottom: '0.5rem',
                  }}>
                    {formatRupiah(item.product.price)}
                  </div>

                  {/* Quantity Stepper */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--bg-tertiary)',
                    }}>
                      <button
                        onClick={() => onUpdateQuantity(item.id, -1)}
                        style={{
                          width: '26px',
                          height: '26px',
                          border: 'none',
                          background: 'transparent',
                          color: 'var(--text-primary)',
                          cursor: 'pointer',
                        }}
                      >
                        -
                      </button>
                      <span style={{ width: '28px', textAlign: 'center', fontSize: '0.8rem', fontWeight: 600 }}>
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(item.id, 1)}
                        style={{
                          width: '26px',
                          height: '26px',
                          border: 'none',
                          background: 'transparent',
                          color: 'var(--text-primary)',
                          cursor: 'pointer',
                        }}
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={() => onRemoveItem(item.id)}
                      title="Hapus dari keranjang"
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        padding: '4px',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = '#f43f5e')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Drawer Footer / Checkout summary */}
        {items.length > 0 && (
          <div style={{
            padding: '1.25rem 1.5rem',
            borderTop: '1px solid var(--border-subtle)',
            backgroundColor: 'var(--bg-tertiary)',
          }}>
            {/* Promo Code input */}
            <form onSubmit={handleCouponSubmit} style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <Tag size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    placeholder="Kode Kupon (PLAKATKU2026)"
                    value={promoCodeInput}
                    onChange={(e) => setPromoCodeInput(e.target.value)}
                    className="input-control"
                    style={{ paddingLeft: '2.25rem', height: '38px', fontSize: '0.8rem' }}
                  />
                </div>
                <button type="submit" className="btn btn-secondary" style={{ height: '38px', fontSize: '0.8rem', padding: '0 0.9rem' }}>
                  Pasang
                </button>
              </div>
              {promoSuccess && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#34d399', fontSize: '0.75rem', marginTop: '0.35rem' }}>
                  <Check size={13} /> {promoSuccess}
                </div>
              )}
              {promoError && (
                <div style={{ color: '#f43f5e', fontSize: '0.75rem', marginTop: '0.35rem' }}>
                  {promoError}
                </div>
              )}
            </form>

            {/* Calculations Breakdown */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', fontSize: '0.85rem', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                <span>Subtotal</span>
                <span>{formatRupiah(subtotal)}</span>
              </div>

              {discountAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#34d399' }}>
                  <span>Diskon Promo ({appliedPromo})</span>
                  <span>-{formatRupiah(discountAmount)}</span>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                <span>Estimasi Ongkos Kirim</span>
                <span>{shipping === 0 ? <strong style={{ color: '#34d399' }}>Gratis</strong> : formatRupiah(shipping)}</span>
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                paddingTop: '0.6rem',
                borderTop: '1px solid var(--border-subtle)',
                fontWeight: 700,
                fontSize: '1.05rem',
                color: 'var(--text-primary)',
              }}>
                <span>Total Belanja</span>
                <span style={{ color: 'var(--accent-primary)', fontFamily: 'var(--font-display)' }}>
                  {formatRupiah(grandTotal)}
                </span>
              </div>
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <button
                onClick={onProceedToCheckout}
                className="btn btn-primary"
                style={{ width: '100%', height: '44px', fontSize: '0.95rem' }}
              >
                <span>Lanjut ke Pembayaran</span>
                <ArrowRight size={16} />
              </button>

              <button
                onClick={onClearCart}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  textAlign: 'center',
                  padding: '4px',
                }}
              >
                Kosongkan Keranjang
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
