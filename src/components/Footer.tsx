'use client';

import React from 'react';
import Link from 'next/link';
import { Award, MapPin, ShieldCheck, MessageCircle, FileText, ArrowUpRight } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer style={{
      borderTop: '1px solid var(--border-subtle)',
      background: 'var(--bg-secondary)',
      padding: '4rem 0 2.5rem 0',
      position: 'relative',
      zIndex: 10,
    }}>
      <div style={{ width: '100%', padding: '0 clamp(1.5rem, 3.5vw, 4rem)' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '2.5rem',
          marginBottom: '3rem',
        }}>
          {/* Col 1: Brand & Workshop Authenticity */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1rem' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--accent-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--bg-primary)',
              }}>
                <Award size={18} />
              </div>
              <span style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '1.15rem',
                fontWeight: 700,
                letterSpacing: '-0.01em',
                color: 'var(--text-primary)',
              }}>
                Agung Citra Sukses Abadi
              </span>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.65, marginBottom: '1.25rem' }}>
              Pusat produksi plakat akrilik presisi, kayu jati etsa kuningan, kristal laser 3D optik, dan piala kejuaraan. Dilengkapi box beludru eksklusif dan garansi presisi.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
              <span style={{
                fontSize: '0.74rem',
                color: 'var(--text-secondary)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
              }}>
                <MapPin size={13} color="var(--amber-accent)" />
                Jl. Galur Raya No.2, Jakarta Pusat
              </span>
              <span style={{
                fontSize: '0.74rem',
                color: 'var(--text-secondary)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
              }}>
                <ShieldCheck size={13} color="var(--emerald-accent)" />
                Melayani invoice resmi &amp; faktur pajak instansi
              </span>
            </div>
          </div>

          {/* Col 2: Navigation Links (Real Destinations) */}
          <div>
            <h4 style={{ fontSize: '0.84rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-primary)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              Kategori Plakat
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.85rem' }}>
              <li>
                <Link href="/products?category=cat-akrilik" style={{ color: 'var(--text-secondary)', textDecoration: 'none', transition: 'color 0.15s ease' }}>
                  Plakat Akrilik UV Print
                </Link>
              </li>
              <li>
                <Link href="/products?category=cat-kayu" style={{ color: 'var(--text-secondary)', textDecoration: 'none', transition: 'color 0.15s ease' }}>
                  Plakat Kayu Jati Plat Kuningan
                </Link>
              </li>
              <li>
                <Link href="/products?category=cat-kristal" style={{ color: 'var(--text-secondary)', textDecoration: 'none', transition: 'color 0.15s ease' }}>
                  Plakat Kristal Grafir Laser 3D
                </Link>
              </li>
              <li>
                <Link href="/products?category=cat-trophy" style={{ color: 'var(--text-secondary)', textDecoration: 'none', transition: 'color 0.15s ease' }}>
                  Piala &amp; Trophy Turnamen
                </Link>
              </li>
              <li>
                <Link href="/products" style={{ color: 'var(--text-secondary)', textDecoration: 'none', transition: 'color 0.15s ease' }}>
                  Lihat Semua Katalog Produk
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Customer Service (Real Actions) */}
          <div>
            <h4 style={{ fontSize: '0.84rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-primary)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              Layanan &amp; Konsultasi
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.85rem' }}>
              <li>
                <a
                  href="https://wa.me/62895364358323?text=Halo%20Admin%20ACSA,%20saya%20ingin%20konsultasi%20desain%20plakat"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'var(--text-secondary)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                >
                  <MessageCircle size={14} color="#25D366" />
                  <span>Konsultasi Desain WhatsApp</span>
                </a>
              </li>
              <li>
                <a
                  href="https://wa.me/62895364358323?text=Halo%20Admin%20ACSA,%20saya%20ingin%20permintaan%20surat%20penawaran%20harga"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'var(--text-secondary)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                >
                  <FileText size={14} color="var(--amber-accent)" />
                  <span>Permintaan Penawaran Harga</span>
                </a>
              </li>
              <li>
                <Link href="/products" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
                  Ketentuan Garansi Presisi 100%
                </Link>
              </li>
              <li>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                  Jam Operasional: Senin – Sabtu (08.00 – 18.00 WIB)
                </span>
              </li>
            </ul>
          </div>

          {/* Col 4: Trust & Payments */}
          <div>
            <h4 style={{ fontSize: '0.84rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-primary)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              Metode Pembayaran
            </h4>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.85rem', lineHeight: 1.5 }}>
              Pembayaran otomatis melalui virtual account bank, QRIS, serta transfer resmi perusahaan.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', fontSize: '0.75rem' }}>
              {['BCA VA', 'Mandiri VA', 'BRI VA', 'BNI VA', 'QRIS', 'Transfer Bank'].map((item) => (
                <span
                  key={item}
                  style={{
                    padding: '0.25rem 0.55rem',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-secondary)',
                    fontWeight: 500,
                  }}
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{
          borderTop: '1px solid var(--border-subtle)',
          paddingTop: '1.5rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          fontSize: '0.8rem',
          color: 'var(--text-muted)',
        }}>
          <div>
            &copy; {new Date().getFullYear()} PLAKATKU (PT Agung Citra Sukses Abadi). Seluruh hak cipta dilindungi.
          </div>
          <div>
            Workshop Pembuatan Plakat, Trophy &amp; Cinderamata Resmi
          </div>
        </div>
      </div>
    </footer>
  );
};
