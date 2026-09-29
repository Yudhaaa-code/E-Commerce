'use client';

import React, { useState } from 'react';
import { ShoppingCart, Star, Check, ArrowRight } from 'lucide-react';
import { Product } from '@/types/ecommerce';
import { formatRupiah, calculateDiscountPercentage } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => boolean | void;
  onDirectOrder: (product: Product) => void;
  onQuickView: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  onDirectOrder,
  onQuickView,
}) => {
  const [isAdded, setIsAdded] = useState(false);
  const discount = product.originalPrice
    ? calculateDiscountPercentage(product.originalPrice, product.price)
    : 0;

  const handleAddCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    const success = onAddToCart(product);
    if (success !== false) {
      setIsAdded(true);
      setTimeout(() => setIsAdded(false), 1600);
    }
  };

  const handleOrder = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDirectOrder(product);
  };

  const materialTag = product.specs?.['Bahan'] 
    ? product.specs['Bahan'].split('(')[0].trim()
    : null;

  return (
    <div
      className="gallery-card"
      onClick={() => onQuickView(product)}
      style={{
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
      }}
    >
      {/* Product Image Area */}
      <div style={{
        position: 'relative',
        width: '100%',
        paddingTop: '82%',
        backgroundColor: 'var(--bg-tertiary)',
        overflow: 'hidden',
      }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.image}
          alt={product.name}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
            transition: 'transform 0.5s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.04)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
        />

        {/* Badges */}
        <div style={{
          position: 'absolute',
          top: '0.65rem',
          left: '0.65rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.35rem',
          zIndex: 2,
        }}>
          {product.badge && (
            <span className="eyebrow-badge" style={{ fontSize: '0.65rem', padding: '0.2rem 0.55rem' }}>
              {product.badge}
            </span>
          )}
          {discount > 0 && (
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '0.18rem 0.5rem',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--emerald-soft-bg)',
              color: 'var(--emerald-accent)',
              border: '1px solid rgba(42, 88, 47, 0.2)',
              fontSize: '0.68rem',
              fontWeight: 600,
              width: 'fit-content',
            }}>
              Hemat {discount}%
            </span>
          )}
        </div>

        {/* Add to Cart Floating Button (Replaces Quick View Eye) */}
        <button
          onClick={handleAddCart}
          className="btn-icon"
          title={isAdded ? 'Berhasil Masuk Keranjang' : 'Masukkan ke Keranjang'}
          aria-label="Masukkan ke Keranjang"
          style={{
            position: 'absolute',
            bottom: '0.65rem',
            right: '0.65rem',
            zIndex: 2,
            width: '34px',
            height: '34px',
            borderRadius: 'var(--radius-sm)',
            background: isAdded ? 'var(--emerald-soft-bg, #ecfdf5)' : 'var(--bg-card)',
            border: isAdded ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid var(--border-subtle)',
            color: isAdded ? '#059669' : 'var(--text-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.12)',
            transition: 'all 0.2s ease',
            cursor: 'pointer',
          }}
        >
          {isAdded ? <Check size={16} /> : <ShoppingCart size={15} />}
        </button>
      </div>

      {/* Product Information Body */}
      <div style={{
        padding: '1.15rem',
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        justifyContent: 'space-between',
      }}>
        <div>
          {/* Rating and Material Tag */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '0.5rem',
            fontSize: '0.76rem',
            color: 'var(--text-muted)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#8A5800' }}>
              <Star size={12} fill="#8A5800" />
              <strong style={{ color: 'var(--text-primary)' }}>{product.rating.toFixed(1)}</strong>
              <span style={{ color: 'var(--text-muted)' }}>({product.reviewCount})</span>
            </div>

            {materialTag && (
              <span style={{
                fontSize: '0.68rem',
                color: 'var(--text-secondary)',
                background: 'var(--bg-tertiary)',
                padding: '0.15rem 0.45rem',
                borderRadius: '4px',
                maxWidth: '120px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                {materialTag}
              </span>
            )}
          </div>

          {/* Product Title */}
          <h3 style={{
            fontSize: '0.95rem',
            fontWeight: 600,
            lineHeight: 1.45,
            marginBottom: '0.85rem',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            minHeight: '2.75rem',
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-sans)',
          }}>
            {product.name}
          </h3>
        </div>

        <div>
          {/* Pricing */}
          <div style={{ marginBottom: '1rem' }}>
            <div style={{
              fontSize: '1.18rem',
              fontWeight: 700,
              color: 'var(--text-primary)',
              letterSpacing: '-0.01em',
            }}>
              {formatRupiah(product.price)}
            </div>
            {product.originalPrice && (
              <div className="price-strike" style={{ fontSize: '0.8rem', marginTop: '1px' }}>
                {formatRupiah(product.originalPrice)}
              </div>
            )}
          </div>

          {/* Direct Order Button: Langsung ke Pemesanan */}
          <button
            onClick={handleOrder}
            className="btn btn-primary"
            style={{
              width: '100%',
              padding: '0.6rem',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--accent-primary)',
              borderColor: 'var(--accent-primary)',
              color: 'var(--bg-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.84rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <span>Pesan Plakat</span>
          </button>
        </div>
      </div>
    </div>
  );
};
