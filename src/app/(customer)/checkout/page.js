'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { collection, addDoc, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useCart } from '@/lib/cart';
import { useAuth } from '@/lib/auth';
import { DELIVERY_ZONES, getDeliveryFee, PAYMENT_METHODS, BANK_DETAILS, formatPrice, getAvailableScheduleSlots } from '@/lib/constants';
import toast from 'react-hot-toast';
import { MapPin, CreditCard, Calendar, Copy, CheckCircle, Upload, Eye, ShieldAlert, Loader2, ArrowRight } from 'lucide-react';
import styles from './page.module.css';

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const { user, userProfile, loading: authLoading } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({
    name: '', phone: '',
    address: '', zone: 'zone1', notes: '',
    paymentMethod: 'cod', scheduleDate: '', scheduleTime: '',
    isScheduled: false,
  });

  const [loading, setLoading] = useState(false);
  const [placedOrderId, setPlacedOrderId] = useState(null);
  const [showBank, setShowBank] = useState(false);
  const [copied, setCopied] = useState(false);
  const [uploadingSlip, setUploadingSlip] = useState(false);
  const [slipUrl, setSlipUrl] = useState(null);

  // Sync profile details if available
  useEffect(() => {
    if (userProfile) {
      setForm(prev => ({
        ...prev,
        name: userProfile.name || '',
        phone: userProfile.phone || '',
      }));
    }
  }, [userProfile]);

  const deliveryFee = getDeliveryFee(form.zone, subtotal);
  const total = subtotal + deliveryFee;
  const slots = getAvailableScheduleSlots();
  const selectedZone = DELIVERY_ZONES.find(z => z.id === form.zone);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleCopy = () => {
    navigator.clipboard.writeText(BANK_DETAILS.accountNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSlipUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingSlip(true);
    const toastId = toast.loading('Uploading payment slip...');

    try {
      const formData = new FormData();
      formData.append('image', file);

      const res = await fetch('https://api.imgbb.com/1/upload?key=bbfda5a6eaea6c85b9c3125b4c8cc463', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data?.data?.url) {
        setSlipUrl(data.data.url);
        toast.success('Payment slip uploaded successfully!', { id: toastId });
        
        // If order is already created, update it
        if (placedOrderId) {
          await updateDoc(doc(db, 'orders', placedOrderId), {
            paymentSlipUrl: data.data.url,
            paymentStatus: 'awaiting_verification',
            updatedAt: serverTimestamp(),
          });
        }
      } else {
        throw new Error('Upload failed');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to upload image. Please try again.', { id: toastId });
    } finally {
      setUploadingSlip(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      toast.error('Please sign in to place an order.');
      router.push('/login?redirect=/checkout');
      return;
    }

    if (!form.name || !form.phone || !form.address) {
      toast.error('Please fill in all required fields');
      return;
    }
    if (items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        customerId: user.uid,
        customerName: form.name,
        phone: form.phone,
        address: form.address,
        deliveryZone: form.zone,
        notes: form.notes,
        items: items.map(i => ({ id: i.id, name: i.name, price: i.price, qty: i.qty, image: i.image || null })),
        subtotal,
        deliveryFee,
        total,
        paymentMethod: form.paymentMethod,
        paymentStatus: form.paymentMethod === 'cod' ? 'pending' : (slipUrl ? 'awaiting_verification' : 'pending'),
        paymentSlipUrl: slipUrl || null,
        orderStatus: 'pending',
        isScheduled: form.isScheduled,
        scheduledDate: form.isScheduled ? form.scheduleDate : null,
        scheduledTime: form.isScheduled ? form.scheduleTime : null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const ref = await addDoc(collection(db, 'orders'), orderData);
      setPlacedOrderId(ref.id);
      clearCart();

      if (form.paymentMethod === 'bank_transfer') {
        setShowBank(true);
      } else {
        router.push(`/orders?id=${ref.id}&new=1`);
      }
    } catch (err) {
      toast.error('Failed to place order. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 1. Auth Guard UI
  if (authLoading) {
    return (
      <div className="loading-page">
        <div className="spinner" />
        <p>Verifying session...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={styles.authGate}>
        <div className={styles.authGateCard}>
          <ShieldAlert size={48} className={styles.authGateIcon} />
          <h2>Checkout Locked</h2>
          <p>Please log in or create a Fresh Choice account to complete your purchase securely.</p>
          <div className={styles.authGateActions}>
            <Link href="/login?redirect=/checkout" className="btn btn-primary">
              Sign In to Order <ArrowRight size={16} />
            </Link>
            <Link href="/signup?redirect=/checkout" className="btn btn-outline">
              Create Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 2. Bank Confirmation Screen
  if (showBank) {
    return (
      <div className={styles.bankModal}>
        <div className={styles.bankCard}>
          <CheckCircle size={48} className={styles.bankCheck} />
          <h2>Order Placed Successfully!</h2>
          <p>Please complete your payment via Bank Transfer to confirm your meal preparation:</p>
          
          <div className={styles.bankDetails}>
            <div className={styles.bankRow}><span>Bank</span><strong>{BANK_DETAILS.bankName}</strong></div>
            <div className={styles.bankRow}><span>Account Name</span><strong>{BANK_DETAILS.accountName}</strong></div>
            <div className={styles.bankRow}>
              <span>Account No.</span>
              <div className={styles.acctRow}>
                <strong>{BANK_DETAILS.accountNumber}</strong>
                <button className={styles.copyBtn} onClick={handleCopy}>
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
            <div className={styles.bankRow}><span>Branch</span><strong>{BANK_DETAILS.branch}</strong></div>
            <div className={styles.bankRow}><span>Total Amount</span><strong className={styles.totalAmt}>{formatPrice(total)}</strong></div>
          </div>

          <div className={styles.slipUploadBox}>
            <h4>Upload Payment Slip</h4>
            <p>Upload a clear screenshot or photograph of your transaction receipt.</p>
            
            {slipUrl ? (
              <div className={styles.slipUploaded}>
                <CheckCircle size={16} /> <span>Receipt uploaded successfully!</span>
              </div>
            ) : (
              <label className={styles.fileInputLabel}>
                {uploadingSlip ? (
                  <Loader2 size={16} className={styles.spin} />
                ) : (
                  <Upload size={16} />
                )}
                <span>{uploadingSlip ? 'Uploading Slip...' : 'Choose Receipt Image'}</span>
                <input type="file" accept="image/*" onChange={handleSlipUpload} disabled={uploadingSlip} className={styles.hiddenInput} />
              </label>
            )}
          </div>

          <button className="btn btn-primary" onClick={() => router.push('/orders')} style={{ width: '100%' }}>
            View Order & Track Status
          </button>
        </div>
      </div>
    );
  }

  if (items.length === 0 && !loading) {
    return (
      <div className={styles.emptyPage}>
        <h2>Your cart is empty</h2>
        <Link href="/menu" className="btn btn-primary">Browse Menu</Link>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className="container">
        <h1 className={`heading-lg ${styles.title}`}>Checkout</h1>
        <form onSubmit={handleSubmit} className={styles.grid}>
          {/* Left Side: Form Details */}
          <div className={styles.formSide}>
            {/* Delivery Info */}
            <div className={styles.section}>
              <div className={styles.sectionHead}><MapPin size={18} /><h2>Delivery Details</h2></div>
              <div className={styles.formGrid}>
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input id="checkout-name" className="form-input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Your name" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone *</label>
                  <input id="checkout-phone" className="form-input" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+94 xxx xxx xxx" required />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Delivery Address *</label>
                <textarea id="checkout-address" className="form-input form-textarea" value={form.address} onChange={e => set('address', e.target.value)} placeholder="House/Apt number, Street, Area..." required rows={3} />
              </div>
              <div className="form-group">
                <label className="form-label">Delivery Zone *</label>
                <select id="checkout-zone" className="form-input form-select" value={form.zone} onChange={e => set('zone', e.target.value)}>
                  {DELIVERY_ZONES.map(z => (
                    <option key={z.id} value={z.id}>{z.name} — {z.freeAbove <= subtotal ? 'FREE' : formatPrice(z.fee)}</option>
                  ))}
                </select>
                {selectedZone && subtotal < selectedZone.freeAbove && (
                  <p className={styles.freeHint}>Add {formatPrice(selectedZone.freeAbove - subtotal)} more for free delivery!</p>
                )}
              </div>
              <div className="form-group">
                <label className="form-label">Special Notes</label>
                <textarea id="checkout-notes" className="form-input form-textarea" value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Allergies, spice level, door instructions..." rows={2} />
              </div>
            </div>

            {/* Schedule Timing */}
            <div className={styles.section}>
              <div className={styles.sectionHead}><Calendar size={18} /><h2>Delivery Time</h2></div>
              <div className={styles.scheduleToggle}>
                <button type="button" className={`${styles.scheduleBtn} ${!form.isScheduled ? styles.active : ''}`} onClick={() => set('isScheduled', false)}>🚀 Deliver ASAP</button>
                <button type="button" className={`${styles.scheduleBtn} ${form.isScheduled ? styles.active : ''}`} onClick={() => set('isScheduled', true)}>📅 Schedule Pre-order</button>
              </div>
              {form.isScheduled && (
                <div className="form-group" style={{ marginTop: '1rem' }}>
                  <label className="form-label">Choose Pre-Order Time Slot</label>
                  <select id="checkout-slot" className="form-input form-select" value={`${form.scheduleDate}|${form.scheduleTime}`}
                    onChange={e => { const [d, t] = e.target.value.split('|'); set('scheduleDate', d); set('scheduleTime', t); }}>
                    <option value="|">Select a slot...</option>
                    {slots.map(s => <option key={s.label} value={`${s.date}|${s.time}`}>{s.label}</option>)}
                  </select>
                </div>
              )}
            </div>

            {/* Payment Method */}
            <div className={styles.section}>
              <div className={styles.sectionHead}><CreditCard size={18} /><h2>Payment Method</h2></div>
              <div className={styles.paymentGrid}>
                {PAYMENT_METHODS.map(m => (
                  <button
                    key={m.id} type="button"
                    className={`${styles.payBtn} ${form.paymentMethod === m.id ? styles.payActive : ''} ${!m.active ? styles.payDisabled : ''}`}
                    onClick={() => m.active && set('paymentMethod', m.id)}
                    id={`pay-${m.id}`}
                  >
                    <span className={styles.payLabel}>{m.label}</span>
                    {m.comingSoon && <span className={styles.comingSoon}>Soon</span>}
                  </button>
                ))}
              </div>
              {form.paymentMethod === 'bank_transfer' && (
                <div className={styles.bankUploadSection}>
                  <p className={styles.bankNoteAlert}>💡 Uploading your transaction slip during checkout confirms your order instantly!</p>
                  
                  <div className={styles.checkoutSlipUploader}>
                    {slipUrl ? (
                      <div className={styles.checkoutSlipStatus}>
                        <CheckCircle size={16} /> <span>Slip receipt successfully selected!</span>
                      </div>
                    ) : (
                      <label className={styles.fileInputLabel}>
                        {uploadingSlip ? (
                          <Loader2 size={16} className={styles.spin} />
                        ) : (
                          <Upload size={16} />
                        )}
                        <span>{uploadingSlip ? 'Uploading Receipt...' : 'Attach Payment Receipt'}</span>
                        <input type="file" accept="image/*" onChange={handleSlipUpload} disabled={uploadingSlip} className={styles.hiddenInput} />
                      </label>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Side: Order Summary */}
          <div className={styles.summary}>
            <h3 className={styles.summaryTitle}>Order Summary</h3>
            <div className={styles.summaryItems}>
              {items.map(item => (
                <div key={item.id} className={styles.summaryItem}>
                  <span className={styles.itemName}>{item.name} × {item.qty}</span>
                  <span className={styles.itemAmt}>{formatPrice(item.price * item.qty)}</span>
                </div>
              ))}
            </div>
            <div className={styles.summaryDivider} />
            <div className={styles.summaryRow}><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
            <div className={styles.summaryRow}>
              <span>Delivery</span>
              <span style={{ color: deliveryFee === 0 ? '#22c55e' : 'inherit' }}>
                {deliveryFee === 0 ? 'FREE' : formatPrice(deliveryFee)}
              </span>
            </div>
            <div className={styles.summaryDivider} />
            <div className={`${styles.summaryRow} ${styles.totalRow}`}>
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
            <button type="submit" className={`btn btn-primary ${styles.placeBtn}`} disabled={loading} id="checkout-submit-btn">
              {loading ? 'Placing Order...' : `Place Order — ${formatPrice(total)}`}
            </button>
            <p className={styles.secureNote}>🔒 Secure Checkout</p>
          </div>
        </form>
      </div>
    </div>
  );
}
