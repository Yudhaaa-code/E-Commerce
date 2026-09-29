'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Layers, Award, Sparkles, Trophy, Shield, ArrowRight, CheckCircle2, TrendingUp, Package } from 'lucide-react';

// Icon map matching db category icons
const ICON_MAP: Record<string, React.ReactNode> = {
  Layers: <Layers size={22} />,
  Award: <Award size={22} />,
  Sparkles: <Sparkles size={22} />,
  Trophy: <Trophy size={22} />,
  Shield: <Shield size={22} />,
  Package: <Package size={22} />,
};

// Visual config per category — badge label, colors, image, description, popularFor
const CATEGORY_VISUALS: Record<string, {
  badge: string;
  badgeColor: string;
  badgeBg: string;
  image: string;
  description: string;
  popularFor: string;
}> = {
  'cat-akrilik': {
    badge: 'TERLARIS #1',
    badgeColor: '#10b981',
    badgeBg: 'rgba(16, 185, 129, 0.12)',
    image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=800&auto=format&fit=crop',
    description: 'Potongan diamond bevel presisi dengan UV flatbed print tahan gores. Favorit seminar, wisuda, & souvenir instansi.',
    popularFor: 'Seminar, Wisuda, Souvenir Kunjungan',
  },
  'cat-kayu': {
    badge: 'FAVORIT KEDINASAN & BUMN',
    badgeColor: '#f59e0b',
    badgeBg: 'rgba(245, 158, 11, 0.12)',
    image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=800&auto=format&fit=crop',
    description: 'Kayu jati solid finishing plitur berpadu plat kuningan sepuh etsa timbul. Lambang wibawa resmi instansi pemerintah.',
    popularFor: 'Kementerian, BUMN, Purna Tugas',
  },
  'cat-kristal': {
    badge: 'PRESTISIUS & MEWAH',
    badgeColor: '#6366f1',
    badgeBg: 'rgba(99, 102, 241, 0.12)',
    image: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=800&auto=format&fit=crop',
    description: 'Kemewahan kristal K9 ultra-bening dengan grafir laser 3D internal. Penghargaan puncak untuk eksekutif & mitra global.',
    popularFor: 'Awarding Night, Executive Recognition',
  },
  'cat-logam': {
    badge: 'EKSKLUSIF & BERKARAKTER',
    badgeColor: '#f59e0b',
    badgeBg: 'rgba(245, 158, 11, 0.12)',
    image: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=800&auto=format&fit=crop',
    description: 'Plat kuningan murni etsa timbul dan cor logam tembaga untuk cinderamata instansi & korporat bergengsi.',
    popularFor: 'Korporat, Instansi, Kedinasan',
  },
  'cat-trophy': {
    badge: 'TOP TOURNAMENT CHOICE',
    badgeColor: '#ec4899',
    badgeBg: 'rgba(236, 72, 153, 0.12)',
    image: 'https://images.unsplash.com/photo-1589487391730-58f20eb2c308?q=80&w=800&auto=format&fit=crop',
    description: 'Piala cor logam sepuh emas berkilau tinggi & tatakan marmer mewah. Dirancang untuk kejuaraan bergengsi & turnamen olahraga.',
    popularFor: 'Piala Bergilir, Turnamen Golf, E-Sports',
  },
};

// Badge label based on rank
function getRankBadge(rank: number, totalOrdered: number, original: string): string {
  if (rank === 0) return `TERLARIS #1`;
  if (rank === 1) return `#2 TERPOPULER`;
  if (rank === 2) return `#3 FAVORIT`;
  return original || `TOP ${rank + 1}`;
}

interface CategoryStat {
  categoryId: string;
  categoryName: string;
  categorySlug: string;
  categoryIcon?: string;
  categoryDescription?: string;
  totalOrdered: number;
  productCount: number;
}

export const PopularCategoriesSection: React.FC = () => {
  const [stats, setStats] = useState<CategoryStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/category-stats')
      .then((res) => res.json())
      .then((data) => {
        setStats(data.stats || []);
      })
      .catch(() => setStats([]))
      .finally(() => setLoading(false));
  }, []);

  // Show top 4 categories sorted by order count (already sorted by API)
  const top4 = stats.slice(0, 4);

  return (
    <section style={{ width: '100%', padding: '4.5rem 0 3.5rem 0' }}>
      <div style={{ width: '100%', padding: '0 clamp(1.5rem, 3.5vw, 4rem)' }}>
        {/* Header Title */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          gap: '1.5rem',
          marginBottom: '2.5rem',
          paddingBottom: '1.25rem',
          borderBottom: '1px solid var(--border-subtle)',
        }}>
          <div>
            <h2 style={{
              fontSize: 'clamp(1.85rem, 3.6vw, 2.45rem)',
              fontWeight: 600,
              fontFamily: 'var(--font-serif)',
              letterSpacing: '-0.015em',
              color: 'var(--text-primary)',
            }}>
              Kategori Plakat Terfavorit
            </h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.35rem', maxWidth: '640px' }}>
              Format plakat dan cinderamata yang paling banyak dipilih untuk penghargaan resmi, wisuda, purna tugas, dan cinderamata kunjungan instansi.
            </p>
          </div>

          <Link
            href="/products"
            className="btn btn-secondary"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '0.6rem 1.25rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.85rem',
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            <span>Buka Seluruh Katalog Produk</span>
          </Link>
        </div>

        {/* Skeleton loading */}
        {loading && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.5rem',
          }}>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} style={{
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
                border: '1px solid var(--border-subtle)',
                background: 'var(--bg-card)',
              }}>
                <div style={{ height: '210px', background: 'var(--bg-tertiary)', animation: 'pulse 1.5s infinite' }} />
                <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ height: '12px', background: 'var(--bg-tertiary)', borderRadius: '6px', width: '70%' }} />
                  <div style={{ height: '10px', background: 'var(--bg-tertiary)', borderRadius: '6px', width: '90%' }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 4 Cards Bento Grid */}
        {!loading && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.5rem',
          }}>
            {top4.map((item, idx) => {
              const visual = CATEGORY_VISUALS[item.categoryId] || {
                badge: `#${idx + 1} POPULER`,
                badgeColor: '#6366f1',
                badgeBg: 'rgba(99, 102, 241, 0.12)',
                image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=800&auto=format&fit=crop',
                description: item.categoryDescription || 'Kategori populer pilihan pelanggan.',
                popularFor: 'Berbagai acara & instansi',
              };
              const dynamicBadge = getRankBadge(idx, item.totalOrdered, visual.badge);
              const icon = ICON_MAP[item.categoryIcon || ''] || <Package size={22} />;

              return (
                <Link
                  key={item.categoryId}
                  href={`/products?category=${item.categoryId}`}
                  style={{ textDecoration: 'none', color: 'inherit' }}
                  className="gallery-card"
                >
                  <div style={{
                    position: 'relative',
                    height: '210px',
                    width: '100%',
                    overflow: 'hidden',
                    backgroundColor: 'var(--bg-tertiary)',
                  }}>
                    {/* Image */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={visual.image}
                      alt={item.categoryName}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 0.5s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.06)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                      }}
                    />

                    {/* Gradient Shadow Overlay */}
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.65) 100%)',
                    }} />

                    {/* Badge on top */}
                    <div style={{
                      position: 'absolute',
                      top: '0.75rem',
                      left: '0.75rem',
                      zIndex: 2,
                    }}>
                      <span style={{
                        padding: '0.25rem 0.65rem',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        letterSpacing: '0.04em',
                        background: visual.badgeBg,
                        color: visual.badgeColor,
                        backdropFilter: 'blur(8px)',
                        border: `1px solid ${visual.badgeColor}40`,
                      }}>
                        {dynamicBadge}
                      </span>
                    </div>

                    {/* Bottom title over image */}
                    <div style={{
                      position: 'absolute',
                      bottom: '0.85rem',
                      left: '1rem',
                      right: '1rem',
                      zIndex: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      color: '#ffffff',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <div style={{
                          width: '34px',
                          height: '34px',
                          borderRadius: '8px',
                          background: 'rgba(255,255,255,0.2)',
                          backdropFilter: 'blur(6px)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#ffffff',
                        }}>
                          {icon}
                        </div>
                        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff', margin: 0, textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>
                          {item.categoryName}
                        </h3>
                      </div>
                      <span style={{
                        fontSize: '0.75rem',
                        color: '#ffffff',
                        background: 'rgba(0,0,0,0.4)',
                        padding: '0.2rem 0.5rem',
                        borderRadius: '4px',
                        fontWeight: 600,
                      }}>
                        {item.productCount}+ Model
                      </span>
                    </div>
                  </div>

                  {/* Card Body Info */}
                  <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.85rem', flex: 1, justifyContent: 'space-between' }}>
                    <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.55, margin: 0 }}>
                      {visual.description}
                    </p>

                    <div style={{
                      paddingTop: '0.75rem',
                      borderTop: '1px solid var(--border-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '0.78rem',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)' }}>
                        <CheckCircle2 size={13} color="var(--emerald-accent)" />
                        <span>Cocok: {visual.popularFor}</span>
                      </div>

                      <span style={{
                        color: 'var(--accent-primary)',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                      }}>
                        Lihat Koleksi <ArrowRight size={13} />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* No data state */}
        {!loading && top4.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Belum ada data kategori tersedia.
          </div>
        )}
      </div>
    </section>
  );
};
