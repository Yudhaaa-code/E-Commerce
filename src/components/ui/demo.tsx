'use client';

import React from 'react';
import { HeroSection } from '@/components/ui/hero-section-2';

export default function HeroSectionDemo() {
  return (
    <div className="w-full">
      <HeroSection
        logo={{
            url: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=200&auto=format&fit=crop",
            alt: "PLAKATKU Logo",
            text: "PLAKATKU"
        }}
        slogan="PREMIUM BESPOKE TROPHY & AWARDS"
        title={
          <>
            Kemewahan Apresiasi <br />
            <span className="text-primary font-serif italic">Bermutu Tinggi</span>
          </>
        }
        subtitle="Pusat pembuatan plakat akrilik, kristal 3D, kayu jati etsa kuningan, dan piala trophy kejuaraan dengan pengerjaan presisi dan box beludru mewah."
        callToAction={{
          text: "JELAJAHI KOLEKSI 2026 →",
          href: "#catalog-section",
        }}
        backgroundImage="https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=1200&auto=format&fit=crop"
        contactInfo={{
            website: "plakatku.com",
            phone: "+62 812-3456-7890",
            address: "SCBD Park Lt. 3, Jakarta",
        }}
      />
    </div>
  );
}
