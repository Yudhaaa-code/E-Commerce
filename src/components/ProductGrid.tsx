'use client';

import React from 'react';
import { ProductCard } from './ProductCard';
import { Product, Category } from '@/types/ecommerce';
import { SlidersHorizontal, PackageX, RefreshCw } from 'lucide-react';

interface ProductGridProps {
  products: Product[];
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (id: string) => void;
  sortBy: string;
  onSortChange: (value: string) => void;
  searchTerm: string;
  onResetFilters: () => void;
  onAddToCart: (product: Product) => boolean | void;
  onDirectOrder: (product: Product) => void;
  onQuickView: (product: Product) => void;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  categories,
  selectedCategory,
  onSelectCategory,
  sortBy,
  onSortChange,
  searchTerm,
  onResetFilters,
  onAddToCart,
  onDirectOrder,
  onQuickView,
}) => {
  const currentCatObj = categories.find((c) => c.id === selectedCategory);

  return (
    <section id="catalog-section" style={{ width: '100%', padding: '2.5rem 0 6rem 0' }}>
      <div style={{
        width: '100%',
        padding: '0 clamp(1.5rem, 3.5vw, 4rem)',
      }}>
        {/* Controls & Heading Header */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          gap: '1.5rem',
          marginBottom: '2rem',
          paddingBottom: '1.25rem',
          borderBottom: '1px solid var(--border-subtle)',
        }}>
          <div>
            <h2 style={{
              fontSize: 'clamp(1.85rem, 3.8vw, 2.5rem)',
              fontWeight: 600,
              fontFamily: 'var(--font-serif)',
              letterSpacing: '-0.015em',
              color: 'var(--text-primary)',
            }}>
              {selectedCategory === 'all'
                ? 'Koleksi Plakat & Trophy Pilihan'
                : currentCatObj?.name || 'Katalog Produk'}
            </h2>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              Menampilkan {products.length} karya cinderamata bermutu tinggi dengan ukiran presisi laser
            </p>
          </div>

          {/* Sort Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              color: 'var(--text-muted)',
              fontSize: '0.8rem',
              fontWeight: 500,
            }}>
              <SlidersHorizontal size={13} />
              <span>Urutkan:</span>
            </div>
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              className="input-control"
              style={{
                width: 'auto',
                padding: '0.45rem 1rem',
                fontSize: '0.82rem',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                background: 'var(--bg-card)',
                color: 'var(--text-primary)',
              }}
            >
              <option value="featured">Paling Populer</option>
              <option value="price-low">Harga: Terendah ke Tertinggi</option>
              <option value="price-high">Harga: Tertinggi ke Terendah</option>
              <option value="rating">Rating Kepuasan</option>
            </select>
          </div>
        </div>

        {/* Quick Category Filter Pills in Catalog Section */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          flexWrap: 'wrap',
          marginBottom: '2rem',
        }}>
          <button
            onClick={() => onSelectCategory('all')}
            style={{
              padding: '0.4rem 1rem',
              borderRadius: '9999px',
              fontSize: '0.8rem',
              fontWeight: selectedCategory === 'all' ? 700 : 500,
              cursor: 'pointer',
              border: selectedCategory === 'all' ? '1px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
              backgroundColor: selectedCategory === 'all' ? 'var(--accent-primary)' : 'var(--bg-card)',
              color: selectedCategory === 'all' ? 'var(--bg-primary)' : 'var(--text-secondary)',
              transition: 'all 0.15s ease',
            }}
          >
            Semua Koleksi
          </button>
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                style={{
                  padding: '0.4rem 1rem',
                  borderRadius: '9999px',
                  fontSize: '0.8rem',
                  fontWeight: isSelected ? 700 : 500,
                  cursor: 'pointer',
                  border: isSelected ? '1px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                  backgroundColor: isSelected ? 'var(--accent-primary)' : 'var(--bg-card)',
                  color: isSelected ? 'var(--bg-primary)' : 'var(--text-secondary)',
                  transition: 'all 0.15s ease',
                }}
              >
                {cat.name}
              </button>
            );
          })}

          {searchTerm && (
            <div style={{
              marginLeft: 'auto',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'var(--amber-soft-bg)',
              color: 'var(--amber-accent)',
              border: '1px solid rgba(122, 72, 13, 0.2)',
              padding: '0.35rem 0.85rem',
              borderRadius: '9999px',
              fontSize: '0.78rem',
              fontWeight: 600,
            }}>
              <span>Pencarian: &ldquo;{searchTerm}&rdquo;</span>
              <button
                onClick={onResetFilters}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--amber-accent)',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                }}
              >
                ✕
              </button>
            </div>
          )}
        </div>

        {/* Product Grid or Empty State */}
        {products.length === 0 ? (
          <div className="gallery-card" style={{ maxWidth: '540px', margin: '3rem auto', padding: '3.5rem 2rem', textAlign: 'center' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '8px',
              background: '#FDF0F0',
              color: '#9B2C2C',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem auto',
            }}>
              <PackageX size={28} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              Koleksi Tidak Ditemukan
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              {searchTerm
                ? `Tidak ditemukan plakat dengan kata kunci "${searchTerm}". Silakan coba kata kunci umum seperti "akrilik", "kayu", atau "kristal".`
                : 'Belum ada produk dalam kategori ini.'}
            </p>
            <button
              onClick={onResetFilters}
              className="btn btn-secondary"
              style={{ padding: '0.55rem 1.25rem', gap: '0.5rem' }}
            >
              <RefreshCw size={14} />
              <span>Reset Filter</span>
            </button>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '1.75rem',
            width: '100%',
          }}>
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={onAddToCart}
                onDirectOrder={onDirectOrder}
                onQuickView={onQuickView}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
