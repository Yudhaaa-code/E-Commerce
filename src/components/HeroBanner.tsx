'use client';

import React from 'react';
import { HeroSection } from '@/components/ui/hero-section-2';
import { ShieldCheck, Clock, Award, PenTool, Box } from 'lucide-react';

interface HeroBannerProps {
  onExploreClick: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ onExploreClick }) => {
  return (
    <section style={{
      position: 'relative',
      width: '100%',
      padding: 0,
      margin: 0,
    }}>
      {/* Full-Width & Full-Height Split Screen Hero (Edge-to-Edge) */}
      <HeroSection
        logo={{
          icon: (
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--amber-soft-bg)',
              border: '1px solid rgba(122, 72, 13, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--amber-accent)',
            }}>
              <Award size={24} />
            </div>
          ),
          text: 'Agung Citra Sukses Abadi',
          alt: 'PLAKATKU Logo',
        }}
        slogan="PRODUSEN PLAKAT &amp; TROPHY EKSKLUSIF"
        title={
          <>
            Cinderamata Plakat <br />
            <span style={{ fontStyle: 'italic', fontWeight: 400, color: 'var(--amber-accent)' }}>
              &amp; Trophy Eksklusif
            </span>
          </>
        }
        subtitle="Pusat kreasi plakat akrilik presisi, kayu jati etsa kuningan, kristal optik 3D laser internal, dan piala kejuaraan. Dilengkapi box beludru mewah dan garansi presisi 100%."
        callToAction={{
          text: 'Jelajahi Koleksi Plakat',
          href: '#catalog-section',
          onClick: onExploreClick,
        }}
        backgroundImage="https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=1400&auto=format&fit=crop"
        contactInfo={{
          website: 'acsa.com',
          phone: '+62 895-3643-58323',
          address: 'Jl. Galur Raya No.2 Rt.13/Rw.4, Jakarta',
        }}
      />

      {/* Feature Craftsmanship Value Strip */}
      <div style={{
        width: '100%',
        padding: '2.5rem clamp(1.5rem, 3.5vw, 4rem)',
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.25rem',
          width: '100%',
        }}>
          <div className="gallery-card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--amber-soft-bg)',
              color: 'var(--amber-accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <PenTool size={18} />
            </div>
            <div>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>Free Custom Desain</h4>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px', lineHeight: 1.5 }}>
                Gratis konsultasi tata letak logo dan format teks instansi
              </p>
            </div>
          </div>

          <div className="gallery-card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--emerald-soft-bg)',
              color: 'var(--emerald-accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <ShieldCheck size={18} />
            </div>
            <div>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>Garansi Presisi 100%</h4>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px', lineHeight: 1.5 }}>
                Penggantian baru tanpa biaya jika terdapat cacat produksi
              </p>
            </div>
          </div>

          <div className="gallery-card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--bg-tertiary)',
              color: 'var(--text-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Clock size={18} />
            </div>
            <div>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>Pengerjaan Kilat</h4>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px', lineHeight: 1.5 }}>
                Layanan express pengerjaan 1 hingga 2 hari kerja
              </p>
            </div>
          </div>

          <div className="gallery-card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--bg-tertiary)',
              color: 'var(--text-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Box size={18} />
            </div>
            <div>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>Box Beludru Eksklusif</h4>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px', lineHeight: 1.5 }}>
                Tiap plakat dikemas rapi dalam kotak beludru resmi
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
