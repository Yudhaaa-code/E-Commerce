'use client';

import React, { useState, useRef } from 'react';
import { X, CheckCircle2, ShieldCheck, Truck, CreditCard, QrCode, Building2, Banknote, ArrowRight, Loader2, Upload, FileImage, ImagePlus } from 'lucide-react';
import { CartItem, Order, User } from '@/types/ecommerce';
import { formatRupiah } from '@/lib/utils';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  discountAmount: number;
  onOrderSuccess: (order: Order) => void;
  currentUser: User | null;
  onProceedToPaymentGateway: (order: Order, snapToken: string) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  items,
  discountAmount,
  onOrderSuccess,
  currentUser,
  onProceedToPaymentGateway,
}) => {
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);

  // Form State
  const [name, setName] = useState(currentUser?.name || 'Budi Pratama');
  const [email, setEmail] = useState(currentUser?.email || 'budi.pratama@example.com');
  const [phone, setPhone] = useState(currentUser?.phone || '081298765432');
  const [address, setAddress] = useState(currentUser?.address || 'Jl. Senopati No. 88, Selong');
  const [city, setCity] = useState(currentUser?.city || 'Jakarta Selatan');
  const [courier, setCourier] = useState('JNE Regular (2-3 Hari)');
  const [paymentMethod, setPaymentMethod] = useState('BCA Virtual Account');
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState('');

  // Design file upload
  const [designFile, setDesignFile] = useState<File | null>(null);
  const [designPreview, setDesignPreview] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (file: File | null) => {
    if (!file) return;
    setDesignFile(file);
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => setDesignPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setDesignPreview(null);
    }
  };

  if (!isOpen) return null;

  const subtotal = items.reduce((acc, i) => acc + i.product.price * i.quantity, 0);
  const shippingFee = subtotal > 500000 ? 0 : 25000;
  const totalAmount = Math.max(0, subtotal - discountAmount + shippingFee);

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!name.trim() || !email.trim() || !address.trim() || !phone.trim()) {
      setFormError('Mohon lengkapi seluruh informasi pengiriman wajib.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        userId: currentUser?.id,
        customerName: name,
        customerEmail: email,
        customerPhone: phone,
        shippingAddress: address,
        shippingCity: city,
        shippingCourier: courier,
        paymentMethod: paymentMethod,
        subtotal,
        shippingFee,
        discountAmount,
        totalAmount,
        notes: notes + (designFile ? `\n\n[File Desain: ${designFile.name}]` : ''),
        items: items.map((item) => ({
          productId: item.product.id,
          productName: item.product.name,
          productImage: item.product.image,
          price: item.product.price,
          quantity: item.quantity,
          total: item.product.price * item.quantity,
        })),
      };

      const res = await fetch('/api/payment/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (json.success && json.order) {
        onProceedToPaymentGateway(json.order, json.snapToken);
      } else {
        setFormError(json.error || 'Terjadi kesalahan saat memproses Payment Gateway.');
      }
    } catch (err: any) {
      setFormError(err?.message || 'Gagal terhubung ke server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFinish = () => {
    setStep('form');
    onClose();
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
        zIndex: 110,
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
          maxWidth: '820px',
          maxHeight: '92vh',
          borderRadius: 'var(--radius-lg)',
          overflowY: 'auto',
          position: 'relative',
          padding: '2.25rem',
          backgroundColor: 'var(--bg-secondary)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="btn-icon"
          style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', zIndex: 10 }}
        >
          <X size={18} />
        </button>

        {step === 'form' ? (
          <div>
            <div style={{ marginBottom: '1.75rem' }}>
              <span className="badge badge-accent" style={{ marginBottom: '0.4rem' }}>
                Proses Checkout Aman
              </span>
              <h2 style={{ fontSize: '1.65rem', fontWeight: 700 }}>Penyelesaian Pesanan</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                Lengkapi alamat pengiriman dan pilih metode pembayaran resmi Anda
              </p>
            </div>

            {formError && (
              <div style={{
                background: 'rgba(244, 63, 94, 0.15)',
                border: '1px solid rgba(244, 63, 94, 0.3)',
                color: '#f43f5e',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.85rem',
                marginBottom: '1.25rem',
              }}>
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmitOrder}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '2rem',
              }}>
                {/* Left: Shipping Details */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Truck size={17} color="var(--accent-primary)" />
                    Alamat & Kontak Penerima
                  </h4>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                      Nama Lengkap *
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="input-control"
                      placeholder="e.g. Budi Santoso"
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                        Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="input-control"
                        placeholder="email@domain.com"
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                        Nomor HP / WA *
                      </label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="input-control"
                        placeholder="081234567890"
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                      Alamat Lengkap *
                    </label>
                    <textarea
                      required
                      rows={2}
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="input-control"
                      placeholder="Nama jalan, nomor rumah, RT/RW, kelurahan, kecamatan"
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                        Kota / Kabupaten
                      </label>
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="input-control"
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                        Pilihan Ekspedisi
                      </label>
                      <select
                        value={courier}
                        onChange={(e) => setCourier(e.target.value)}
                        className="input-control"
                        style={{ cursor: 'pointer' }}
                      >
                        <option value="JNE Regular (2-3 Hari)">JNE Regular (2-3 Hari)</option>
                        <option value="SiCepat BEST (1-2 Hari)">SiCepat BEST (1-2 Hari)</option>
                        <option value="GoSend Instant (2 Jam)">GoSend Instant (2 Jam)</option>
                      </select>
                    </div>
                  </div>

                  {/* Upload Desain Custom */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <ImagePlus size={14} color="var(--amber-accent)" />
                        Upload Desain Custom <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>(opsional)</span>
                      </span>
                    </label>

                    <div
                      onClick={() => fileInputRef.current?.click()}
                      onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                      onDragLeave={() => setIsDragOver(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsDragOver(false);
                        const file = e.dataTransfer.files?.[0];
                        if (file) handleFileChange(file);
                      }}
                      style={{
                        border: `2px dashed ${isDragOver ? 'var(--amber-accent)' : designFile ? 'var(--emerald-accent)' : 'var(--border-subtle)'}`,
                        borderRadius: 'var(--radius-md)',
                        padding: '1rem',
                        cursor: 'pointer',
                        background: isDragOver ? 'var(--amber-soft-bg)' : designFile ? 'rgba(16, 185, 129, 0.05)' : 'var(--bg-tertiary)',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.85rem',
                      }}
                    >
                      {designPreview ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={designPreview}
                          alt="Preview desain"
                          style={{ width: '56px', height: '56px', objectFit: 'cover', borderRadius: '6px', flexShrink: 0 }}
                        />
                      ) : (
                        <div style={{
                          width: '48px', height: '48px', borderRadius: '8px',
                          background: isDragOver ? 'var(--amber-accent)' : 'var(--bg-secondary)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                        }}>
                          <Upload size={20} color={isDragOver ? '#fff' : 'var(--text-muted)'} />
                        </div>
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        {designFile ? (
                          <>
                            <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--emerald-accent)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                              <FileImage size={13} />
                              {designFile.name}
                            </div>
                            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                              {(designFile.size / 1024).toFixed(0)} KB (klik untuk ganti file)
                            </div>
                          </>
                        ) : (
                          <>
                            <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                              Klik atau seret file desain ke sini
                            </div>
                            <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                              JPG, PNG, PDF, AI, CDR, SVG (Maks. 10 MB)
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,.pdf,.ai,.cdr,.svg,.eps"
                      style={{ display: 'none' }}
                      onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                    />
                  </div>

                  {/* Catatan Tambahan */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                      Catatan / Teks Kustom
                    </label>
                    <textarea
                      rows={2}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="input-control"
                      placeholder='Contoh: &quot;Terima kasih atas pengabdian Bapak selama 20 tahun&quot;, ukuran font besar, warna emas'
                    />
                  </div>
                </div>

                {/* Right: Payment & Summary */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <CreditCard size={17} color="var(--accent-primary)" />
                    Pilihan Pembayaran
                  </h4>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {[
                      { id: 'BCA Virtual Account', icon: Building2, desc: 'Verifikasi Otomatis 24 Jam' },
                      { id: 'Mandiri Virtual Account', icon: Building2, desc: 'Transfer via Livin by Mandiri' },
                      { id: 'QRIS (GoPay / ShopeePay / OVO)', icon: QrCode, desc: 'Pindai barcode langsung selesai' },
                      { id: 'Kartu Kredit / Debit Visa / Master', icon: CreditCard, desc: 'Mendukung Cicilan 0%' },
                      { id: 'COD (Bayar di Tempat)', icon: Banknote, desc: 'Bayar saat kurir sampai di rumah' },
                    ].map((method) => {
                      const Icon = method.icon;
                      const isSelected = paymentMethod === method.id;
                      return (
                        <div
                          key={method.id}
                          onClick={() => setPaymentMethod(method.id)}
                          style={{
                            padding: '0.75rem 1rem',
                            borderRadius: 'var(--radius-md)',
                            border: `1px solid ${isSelected ? 'var(--amber-accent)' : 'var(--border-subtle)'}`,
                            background: isSelected ? 'var(--amber-soft-bg)' : 'var(--bg-tertiary)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            transition: 'all var(--transition-fast)',
                          }}
                        >
                          <Icon size={18} color={isSelected ? 'var(--amber-accent)' : 'var(--text-muted)'} />
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                              {method.id}
                            </div>
                            <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                              {method.desc}
                            </div>
                          </div>
                          <input
                            type="radio"
                            name="paymentMethod"
                            checked={isSelected}
                            onChange={() => setPaymentMethod(method.id)}
                            style={{ accentColor: 'var(--accent-primary)' }}
                          />
                        </div>
                      );
                    })}
                  </div>

                  {/* Pricing Breakdown Summary */}
                  <div style={{
                    padding: '1rem',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-subtle)',
                    marginTop: '0.5rem',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                      <span>Total Barang ({items.reduce((a, b) => a + b.quantity, 0)} item)</span>
                      <span>{formatRupiah(subtotal)}</span>
                    </div>

                    {discountAmount > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#34d399', marginBottom: '0.35rem' }}>
                        <span>Potongan Kupon</span>
                        <span>-{formatRupiah(discountAmount)}</span>
                      </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                      <span>Ongkos Kirim</span>
                      <span>{shippingFee === 0 ? <strong style={{ color: '#34d399' }}>Gratis Ongkir</strong> : formatRupiah(shippingFee)}</span>
                    </div>

                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      borderTop: '1px solid var(--border-subtle)',
                      paddingTop: '0.5rem',
                      fontWeight: 700,
                      fontSize: '1.1rem',
                      color: 'var(--text-primary)',
                    }}>
                      <span>Total Pembayaran</span>
                      <span style={{ color: 'var(--accent-primary)', fontFamily: 'var(--font-display)' }}>
                        {formatRupiah(totalAmount)}
                      </span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn btn-primary"
                    style={{ height: '48px', width: '100%', fontSize: '1rem' }}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        <span>Menyimpan Pesanan ke Database...</span>
                      </>
                    ) : (
                      <>
                        <span>Konfirmasi & Bayar Sekarang</span>
                        <ArrowRight size={18} />
                      </>
                    )}
                  </button>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                    <ShieldCheck size={14} color="#34d399" />
                    <span>Enkripsi SSL 256-bit • Data transaksi terlindungi</span>
                  </div>
                </div>
              </div>
            </form>
          </div>
        ) : (
          /* Success Screen */
          <div style={{
            textAlign: 'center',
            padding: '2rem 1rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1.25rem',
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'rgba(16, 185, 129, 0.15)',
              color: '#10b981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 30px rgba(16, 185, 129, 0.3)',
            }}>
              <CheckCircle2 size={46} />
            </div>

            <div>
              <span className="badge badge-emerald" style={{ marginBottom: '0.5rem' }}>
                Transaksi Sukses Dibuat
              </span>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Terima Kasih Atas Pesanan Anda!</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem', maxWidth: '480px', margin: '0.5rem auto 0' }}>
                Pesanan Anda telah berhasil dicatat ke dalam database PostgreSQL dan sedang kami siapkan untuk pengiriman.
              </p>
            </div>

            {createdOrder && (
              <div className="glass-card" style={{
                width: '100%',
                maxWidth: '480px',
                padding: '1.25rem',
                textAlign: 'left',
                backgroundColor: 'var(--bg-tertiary)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Nomor Pesanan:</span>
                  <strong style={{ color: 'var(--accent-primary)', fontFamily: 'var(--font-display)' }}>
                    {createdOrder.orderNumber}
                  </strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Penerima:</span>
                  <strong>{createdOrder.customerName}</strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Metode Pembayaran:</span>
                  <span>{createdOrder.paymentMethod}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Ekspedisi:</span>
                  <span>{createdOrder.shippingCourier}</span>
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  paddingTop: '0.5rem',
                  borderTop: '1px solid var(--border-subtle)',
                  fontWeight: 700,
                  fontSize: '1rem',
                  color: 'var(--text-primary)',
                }}>
                  <span>Total Dibayar:</span>
                  <span style={{ color: '#34d399', fontFamily: 'var(--font-display)' }}>
                    {formatRupiah(createdOrder.totalAmount)}
                  </span>
                </div>
              </div>
            )}

            <button
              onClick={handleFinish}
              className="btn btn-primary"
              style={{ padding: '0.75rem 2rem', fontSize: '0.95rem', marginTop: '0.5rem' }}
            >
              Lanjutkan Belanja
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
