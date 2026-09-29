'use client';

import React, { useState } from 'react';
import { X, Star, ShoppingCart, ShieldCheck, Truck, RotateCcw, Check, ArrowRight, Sparkles, Box } from 'lucide-react';
import { Product } from '@/types/ecommerce';
import { formatRupiah, calculateDiscountPercentage } from '@/lib/utils';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => boolean | void;
  onDirectCheckout: (product: Product, quantity: number) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onAddToCart,
  onDirectCheckout,
}) => {
  const [selectedImg, setSelectedImg] = useState<string>('');
  const [qty, setQty] = useState(1);
  const [addedSuccess, setAddedSuccess] = useState(false);

  if (!product) return null;

  const currentImg = selectedImg || product.image;
  const discount = product.originalPrice
    ? calculateDiscountPercentage(product.originalPrice, product.price)
    : 0;

  const handleAdd = () => {
    const success = onAddToCart(product, qty);
    if (success !== false) {
      setAddedSuccess(true);
      setTimeout(() => setAddedSuccess(false), 1500);
    }
  };

  const handleDirect = () => {
    onDirectCheckout(product, qty);
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
        zIndex: 100,
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
          maxWidth: '900px',
          maxHeight: '90vh',
          borderRadius: 'var(--radius-lg)',
          overflowY: 'auto',
          position: 'relative',
          padding: '2rem',
          background: 'var(--bg-secondary)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="btn-icon"
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            zIndex: 10,
          }}
        >
          <X size={20} />
        </button>

        {/* Modal Layout Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '2.5rem',
          alignItems: 'start',
        }}>
          {/* Left: Image Gallery */}
          <div>
            <div style={{
              width: '100%',
              aspectRatio: '1/1',
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden',
              backgroundColor: 'rgba(0, 0, 0, 0.2)',
              marginBottom: '1rem',
              border: '1px solid var(--border-subtle)',
            }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={currentImg}
                alt={product.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>

            {/* Thumbnail selector */}
            {product.images && product.images.length > 1 && (
              <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImg(img)}
                    style={{
                      width: '68px',
                      height: '68px',
                      borderRadius: 'var(--radius-sm)',
                      overflow: 'hidden',
                      border: `2px solid ${currentImg === img ? 'var(--accent-primary)' : 'var(--border-subtle)'}`,
                      padding: 0,
                      cursor: 'pointer',
                      background: 'transparent',
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Info & Purchase */}
          <div>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
              {product.badge && <span className="badge badge-accent">{product.badge}</span>}
              {discount > 0 && <span className="badge badge-emerald">Diskon {discount}%</span>}
              <span className="badge" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>
                {product.stock > 0 ? `Stok: ${product.stock} unit` : 'Habis'}
              </span>
            </div>

            <h2 style={{ fontSize: '1.6rem', fontWeight: 700, lineHeight: 1.3, marginBottom: '0.75rem' }}>
              {product.name}
            </h2>

            {/* Rating */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#fbbf24' }}>
                <Star size={16} fill="#fbbf24" />
                <strong style={{ color: 'var(--text-primary)' }}>{product.rating.toFixed(1)}</strong>
              </div>
              <span style={{ color: 'var(--text-muted)' }}>|</span>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                {product.reviewCount} ulasan pembeli
              </span>
              <span style={{ color: 'var(--text-muted)' }}>|</span>
              <span style={{ color: '#34d399', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <ShieldCheck size={14} /> Terverifikasi Original
              </span>
            </div>

            {/* Price section */}
            <div style={{
              padding: '1rem 1.25rem',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-tertiary)',
              marginBottom: '1.25rem',
            }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem' }}>
                <span style={{
                  fontSize: '1.75rem',
                  fontWeight: 800,
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-display)',
                }}>
                  {formatRupiah(product.price)}
                </span>
                {product.originalPrice && (
                  <span className="price-strike" style={{ fontSize: '1rem' }}>
                    {formatRupiah(product.originalPrice)}
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            <p style={{
              color: 'var(--text-secondary)',
              fontSize: '0.925rem',
              lineHeight: 1.6,
              marginBottom: '1.5rem',
            }}>
              {product.description}
            </p>

            {/* Tech Specs */}
            {product.specs && Object.keys(product.specs).length > 0 && (
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                  Spesifikasi Utama:
                </h4>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                  gap: '0.5rem',
                  fontSize: '0.8rem',
                }}>
                  {Object.entries(product.specs).map(([key, val]) => (
                    <div
                      key={key}
                      style={{
                        padding: '0.5rem 0.75rem',
                        background: 'var(--bg-card)',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-subtle)',
                      }}
                    >
                      <div style={{ color: 'var(--text-muted)' }}>{key}</div>
                      <strong style={{ color: 'var(--text-primary)' }}>{val}</strong>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selector & Action */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Jumlah:</span>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                background: 'var(--bg-tertiary)',
              }}>
                <button
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  style={{
                    width: '36px',
                    height: '36px',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                    fontSize: '1rem',
                  }}
                >
                  -
                </button>
                <span style={{ width: '40px', textAlign: 'center', fontWeight: 600, fontSize: '0.9rem' }}>
                  {qty}
                </span>
                <button
                  onClick={() => setQty(Math.min(product.stock, qty + 1))}
                  style={{
                    width: '36px',
                    height: '36px',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                    fontSize: '1rem',
                  }}
                >
                  +
                </button>
              </div>
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button
                onClick={handleAdd}
                className="btn btn-secondary"
                style={{ flex: 1, minWidth: '160px', height: '48px', borderRadius: '9999px', fontSize: '0.9rem' }}
              >
                {addedSuccess ? (
                  <>
                    <Check size={18} color="#34d399" />
                    <span style={{ color: '#34d399', fontWeight: 700 }}>Tersimpan!</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart size={18} />
                    <span>+ Keranjang</span>
                  </>
                )}
              </button>

              <button
                onClick={handleDirect}
                className="btn-nested-cta"
                style={{ flex: 1.2, minWidth: '200px', height: '48px' }}
              >
                <span>Pesan Sekarang</span>
                <div className="icon-bubble">
                  <ArrowRight size={17} />
                </div>
              </button>
            </div>

            {/* Value Props */}
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '1.25rem',
              marginTop: '1.5rem',
              paddingTop: '1.25rem',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              fontSize: '0.78rem',
              color: 'var(--text-muted)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Sparkles size={15} color="#fbbf24" />
                <span>Free Konsultasi Desain</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <ShieldCheck size={15} color="#34d399" />
                <span>100% Garansi Presisi</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Box size={15} color="#818cf8" />
                <span>Free Box Beludru</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
