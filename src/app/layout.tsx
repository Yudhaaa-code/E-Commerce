import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';

export const metadata: Metadata = {
  title: 'PLAKATKU | Produsen Plakat, Trophy & Souvenir Eksklusif',
  description: 'Pusat pembuatan plakat akrilik, plakat kayu jati, kristal optik 3D, piala trophy turnamen, dan medali custom berkualitas premium di Indonesia. Pengerjaan cepat, presisi laser, dan bergaransi.',
  keywords: 'plakat akrilik, plakat kayu, plakat kristal, piala trophy, medali custom, souvenir kantor, plakatku, plakat penghargaan, plakat jakarta',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" data-theme="light">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <div id="google_translate_element" style={{ display: 'none' }} />
        <div className="ambient-glow ambient-glow-1" />
        <div className="ambient-glow ambient-glow-2" />
        {children}

        {/* Google Translate Integration */}
        <Script
          id="google-translate-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              function googleTranslateElementInit() {
                new google.translate.TranslateElement({
                  pageLanguage: 'id',
                  includedLanguages: 'id,en',
                  autoDisplay: false
                }, 'google_translate_element');
              }
            `,
          }}
        />
        <Script
          id="google-translate-script"
          strategy="afterInteractive"
          src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
        />
      </body>
    </html>
  );
}
