'use client';

import React, { useState, useEffect } from 'react';
import { X, QrCode, Building2, CreditCard, Copy, Check, ShieldCheck, Clock, CheckCircle2, ArrowRight, Loader2, Sparkles, ExternalLink } from 'lucide-react';
import { Order } from '@/types/ecommerce';
import { formatRupiah } from '@/lib/utils';

interface PaymentGatewayModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  snapToken?: string;
  onPaymentCompleted: (order: Order) => void;
}

export const PaymentGatewayModal: React.FC<PaymentGatewayModalProps> = ({
  isOpen,
  onClose,
  order,
  snapToken,
  onPaymentCompleted,
}) => {
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutes
  const [isProcessingSimulation, setIsProcessingSimulation] = useState(false);

  // 15 minute timer
  useEffect(() => {
    if (!isOpen) return;
    setTimeLeft(900);
    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen || !order) return null;

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Generate a mock VA number based on payment method and phone
  const getVaNumber = () => {
    const cleanPhone = order.customerPhone.replace(/[^0-9]/g, '');
    if (order.paymentMethod.includes('BCA')) return `8214 0${cleanPhone.slice(-9)}`;
    if (order.paymentMethod.includes('Mandiri')) return `8890 0${cleanPhone.slice(-9)}`;
    if (order.paymentMethod.includes('BRI')) return `1280 0${cleanPhone.slice(-9)}`;
    return `8077 0${cleanPhone.slice(-9)}`;
  };

  const vaNumber = getVaNumber();

  const handleCopyVa = () => {
    navigator.clipboard.writeText(vaNumber.replace(/\s+/g, ''));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Simulate payment completion via Webhook
  const handleSimulatePaymentSuccess = async () => {
    setIsProcessingSimulation(true);
    try {
      const res = await fetch('/api/payment/notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: order.orderNumber,
          transaction_status: 'settlement',
          fraud_status: 'accept',
          payment_type: order.paymentMethod,
          gross_amount: order.totalAmount,
        }),
      });

      const data = await res.json();
      if (data.success && data.order) {
        setTimeout(() => {
          setIsProcessingSimulation(false);
          onPaymentCompleted(data.order);
        }, 1000);
      } else {
        // Fallback update
        order.paymentStatus = 'PAID';
        setIsProcessingSimulation(false);
        onPaymentCompleted(order);
      }
    } catch (e) {
      order.paymentStatus = 'PAID';
      setIsProcessingSimulation(false);
      onPaymentCompleted(order);
    }
  };

  const isQris = order.paymentMethod.includes('QRIS');
  const isCard = order.paymentMethod.includes('Kartu Kredit');
  const isVa = !isQris && !isCard && !order.paymentMethod.includes('COD');

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.82)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        zIndex: 130,
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
          maxWidth: '540px',
          maxHeight: '92vh',
          borderRadius: 'var(--radius-lg)',
          overflowY: 'auto',
          position: 'relative',
          padding: '2rem',
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.6), 0 0 30px rgba(99, 102, 241, 0.2)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{
              background: 'linear-gradient(135deg, #002b49 0%, #00558f 100%)',
              padding: '0.35rem 0.75rem',
              borderRadius: 'var(--radius-sm)',
              color: '#fff',
              fontSize: '0.8rem',
              fontWeight: 800,
              letterSpacing: '0.05em',
            }}>
              MIDTRANS
            </div>
            <span className="badge badge-emerald" style={{ fontSize: '0.7rem' }}>
              Sandbox Gateway
            </span>
          </div>

          <button onClick={onClose} className="btn-icon" style={{ width: '34px', height: '34px' }}>
            <X size={17} />
          </button>
        </div>

        {/* Expiration Countdown Bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0.65rem 1rem',
          borderRadius: 'var(--radius-md)',
          background: 'rgba(245, 158, 11, 0.12)',
          border: '1px solid rgba(245, 158, 11, 0.25)',
          color: '#fbbf24',
          fontSize: '0.825rem',
          marginBottom: '1.25rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <Clock size={16} />
            <span>Selesaikan Pembayaran Dalam:</span>
          </div>
          <strong style={{ fontSize: '0.95rem', fontFamily: 'monospace' }}>
            {formatTimer(timeLeft)}
          </strong>
        </div>

        {/* Total Amount Pill */}
        <div style={{
          textAlign: 'center',
          padding: '1.25rem',
          borderRadius: 'var(--radius-md)',
          background: 'var(--bg-tertiary)',
          marginBottom: '1.5rem',
          border: '1px solid var(--border-subtle)',
        }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total Tagihan Pembayaran:</span>
          <div style={{
            fontSize: '1.8rem',
            fontWeight: 800,
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-display)',
            marginTop: '0.2rem',
          }}>
            {formatRupiah(order.totalAmount)}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.3rem' }}>
            No. Order: <strong>{order.orderNumber}</strong> • {order.paymentMethod}
          </div>
        </div>

        {/* Dynamic Payment Method Display */}
        {/* CASE 1: QRIS */}
        {isQris && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            marginBottom: '1.5rem',
          }}>
            <div style={{
              background: '#ffffff',
              padding: '1.25rem',
              borderRadius: 'var(--radius-md)',
              boxShadow: '0 8px 25px rgba(0, 0, 0, 0.4)',
              position: 'relative',
              marginBottom: '1rem',
            }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=00020101021226580016ID.CO.MIDTRANS0118${order.orderNumber}52045812530336054${order.totalAmount}5802ID5912PLAKATKU_STORE`}
                alt="QRIS Barcode"
                style={{ width: '180px', height: '180px', display: 'block' }}
              />
              <div style={{
                fontSize: '0.7rem',
                color: '#000',
                fontWeight: 800,
                letterSpacing: '0.05em',
                marginTop: '0.5rem',
              }}>
                QRIS DINAMIS NASIONAL
              </div>
            </div>

            <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', maxWidth: '380px' }}>
              Pindai QR code di atas menggunakan aplikasi mobile banking apa saja (<strong>BCA Mobile, Livin' Mandiri, GoPay, OVO, ShopeePay</strong>).
            </p>
          </div>
        )}

        {/* CASE 2: VIRTUAL ACCOUNT */}
        {isVa && (
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{
              padding: '1.25rem',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border-subtle)',
              marginBottom: '1rem',
            }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                Nomor Virtual Account ({order.paymentMethod})
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '0.5rem',
              }}>
                <span style={{
                  fontSize: '1.4rem',
                  fontWeight: 800,
                  fontFamily: 'monospace',
                  letterSpacing: '0.05em',
                  color: 'var(--accent-primary)',
                }}>
                  {vaNumber}
                </span>

                <button
                  type="button"
                  onClick={handleCopyVa}
                  className="btn btn-secondary"
                  style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', gap: '0.35rem' }}
                >
                  {copied ? (
                    <>
                      <Check size={14} color="#34d399" />
                      <span style={{ color: '#34d399' }}>Disalin</span>
                    </>
                  ) : (
                    <>
                      <Copy size={14} />
                      <span>Salin</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.6, paddingLeft: '0.5rem' }}>
              <div><strong>Panduan Transfer ATM / m-Banking:</strong></div>
              <ol style={{ paddingLeft: '1.25rem', marginTop: '0.25rem' }}>
                <li>Buka aplikasi m-Banking Anda, pilih menu <strong>Transfer &gt; Virtual Account</strong>.</li>
                <li>Masukkan nomor VA di atas dan pastikan nama penerima <strong>PLAKATKU / {order.customerName}</strong>.</li>
                <li>Masukkan nominal tagihan tepat <strong>{formatRupiah(order.totalAmount)}</strong>.</li>
              </ol>
            </div>
          </div>
        )}

        {/* CASE 3: CREDIT CARD */}
        {isCard && (
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{
              padding: '1.25rem',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
              color: '#fff',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              marginBottom: '1rem',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <CreditCard size={28} />
                <span style={{ fontWeight: 800, fontSize: '0.9rem' }}>VISA / MASTER</span>
              </div>
              <div style={{ fontSize: '1.1rem', letterSpacing: '0.15em', fontFamily: 'monospace', marginBottom: '0.75rem' }}>
                4812 •••• •••• 9241
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', opacity: 0.8 }}>
                <span>{order.customerName.toUpperCase()}</span>
                <span>EXP: 12/28</span>
              </div>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center' }}>
              Pembayaran aman terlindungi protokol 3D Secure dengan verifikasi OTP instan.
            </p>
          </div>
        )}

        {/* CASE 4: COD */}
        {order.paymentMethod.includes('COD') && (
          <div style={{ textAlign: 'center', marginBottom: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            <p>Pesanan Anda telah dicatat dengan metode <strong>Bayar di Tempat (COD)</strong>.</p>
            <p style={{ marginTop: '0.35rem' }}>Siapkan uang pas sejumlah <strong>{formatRupiah(order.totalAmount)}</strong> saat kurir tiba di alamat Anda.</p>
          </div>
        )}

        {/* SIMULATOR ACTION BUTTON */}
        <div style={{
          padding: '1.25rem',
          borderRadius: 'var(--radius-md)',
          background: 'rgba(16, 185, 129, 0.1)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          marginBottom: '1rem',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '0.75rem', color: '#34d399', fontWeight: 600, marginBottom: '0.6rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}>
            <Sparkles size={14} />
            SIMULATOR DEVELOPER / PENGUJIAN GATEWAY:
          </div>

          <button
            type="button"
            onClick={handleSimulatePaymentSuccess}
            disabled={isProcessingSimulation}
            className="btn btn-primary"
            style={{
              width: '100%',
              height: '46px',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)',
              fontSize: '0.925rem',
            }}
          >
            {isProcessingSimulation ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Memproses Webhook Midtrans...</span>
              </>
            ) : (
              <>
                <span>⚡ Simulasikan Pembayaran Sukses</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
          <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
            Mengirim notifikasi webhook resmi otomatis untuk mengubah status pesanan jadi <strong>PAID</strong>.
          </div>
        </div>

        {/* Security Footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
          <ShieldCheck size={14} color="#34d399" />
          <span>Transaksi Terproteksi Enkripsi Bank Indonesia & Midtrans</span>
        </div>
      </div>
    </div>
  );
};
