'use client';

import { useEffect, useState } from 'react';
import { collection, query, where, getDocs, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/auth';
import { ORDER_STATUSES, formatPrice, formatDate, BANK_DETAILS } from '@/lib/constants';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Clock, CheckCircle, Package, Truck, XCircle, ChevronRight, Upload, Loader2, ArrowRight, Clipboard, ShieldAlert, FileText } from 'lucide-react';
import styles from './page.module.css';

export default function OrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadingId, setUploadingId] = useState(null);
  const [copiedText, setCopiedText] = useState(false);

  useEffect(() => {
    if (user) fetchOrders();
    else if (!authLoading) setLoading(false);
  }, [user, authLoading]);

  const fetchOrders = async () => {
    try {
      // Use simple where query without orderBy to avoid needing composite index
      const q = query(collection(db, 'orders'), where('customerId', '==', user.uid));
      const snap = await getDocs(q);
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      // Sort client-side by createdAt descending
      data.sort((a, b) => {
        const aTime = a.createdAt?.toMillis?.() || 0;
        const bTime = b.createdAt?.toMillis?.() || 0;
        return bTime - aTime;
      });
      setOrders(data);
    } catch (err) {
      console.error('Orders fetch error:', err);
    } finally {
      setLoading(false);
    }
  };


  const handleCopyAccount = () => {
    navigator.clipboard.writeText(BANK_DETAILS.accountNumber);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const handleSlipUpload = async (e, orderId) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingId(orderId);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const res = await fetch('https://api.imgbb.com/1/upload?key=bbfda5a6eaea6c85b9c3125b4c8cc463', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data?.data?.url) {
        const url = data.data.url;
        await updateDoc(doc(db, 'orders', orderId), {
          paymentSlipUrl: url,
          paymentStatus: 'awaiting_verification',
          updatedAt: serverTimestamp(),
        });
        
        // Update local state
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, paymentSlipUrl: url, paymentStatus: 'awaiting_verification' } : o));
        
        toast.success('Slip receipt uploaded successfully!');
      } else {
        throw new Error('Upload failed');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to upload slip image. Please try again.');
    } finally {
      setUploadingId(null);
    }
  };

  const getStatus = (key) => ORDER_STATUSES.find(s => s.key === key) || ORDER_STATUSES[0];

  const getStatusIcon = (key, size = 16) => {
    switch (key) {
      case 'pending': return <Clock size={size} />;
      case 'confirmed': return <CheckCircle size={size} />;
      case 'preparing': return <Package size={size} style={{ transform: 'scale(1.1)' }} />;
      case 'ready': return <Package size={size} />;
      case 'delivered': return <Truck size={size} />;
      case 'cancelled': return <XCircle size={size} />;
      default: return <Clock size={size} />;
    }
  };

  if (!user && !authLoading) return (
    <div className={styles.authWall}>
      <ShieldAlert size={48} className={styles.authIcon} />
      <h2>Sign in to view your orders</h2>
      <p>Securely track your homemade meals orders and history.</p>
      <Link href="/login" className="btn btn-primary">Sign In</Link>
    </div>
  );

  return (
    <div className={styles.page}>
      <div className="container">
        <div className={styles.header}>
          <h1 className="heading-lg">My Orders</h1>
          <Link href="/menu" className="btn btn-primary btn-sm">Order Again</Link>
        </div>

        {loading ? (
          <div className="loading-page" style={{ minHeight: '40vh' }}><div className="spinner" /></div>
        ) : orders.length === 0 ? (
          <div className={styles.empty}>
            <Package size={48} className={styles.emptyIcon} />
            <h3>No orders yet</h3>
            <p>Your order history and progress tracker will appear here.</p>
            <Link href="/menu" className="btn btn-primary">Browse Menu</Link>
          </div>
        ) : (
          <div className={styles.list}>
            {orders.map(order => {
              const status = getStatus(order.orderStatus);
              return (
                <div key={order.id} className={styles.orderCard}>
                  {/* Card Top Details */}
                  <div className={styles.orderTop}>
                    <div>
                      <p className={styles.orderId}>Order #{order.id.slice(-8).toUpperCase()}</p>
                      <p className={styles.orderDate}>{formatDate(order.createdAt)}</p>
                    </div>
                    <span className={styles.statusBadge} style={{ background: `${status.color}15`, color: status.color }}>
                      {getStatusIcon(order.orderStatus, 14)}
                      <span>{status.label}</span>
                    </span>
                  </div>

                  {/* Stepper Timeline Tracker */}
                  <div className={styles.stepperContainer}>
                    <div className={styles.stepper}>
                      {ORDER_STATUSES.filter(s => s.key !== 'cancelled').map((step, idx, arr) => {
                        const currentStatusIdx = ORDER_STATUSES.findIndex(x => x.key === order.orderStatus);
                        const stepIdx = ORDER_STATUSES.findIndex(x => x.key === step.key);
                        const isDone = stepIdx <= currentStatusIdx && order.orderStatus !== 'cancelled';
                        const isCurrent = step.key === order.orderStatus;

                        return (
                          <div key={step.key} className={`${styles.stepWrapper} ${isDone ? styles.stepDone : ''} ${isCurrent ? styles.stepCurrent : ''}`}>
                            <div className={styles.stepCircle}>
                              {isDone ? '✓' : idx + 1}
                            </div>
                            <span className={styles.stepLabel}>{step.label}</span>
                            {idx < arr.length - 1 && (
                              <div className={`${styles.stepLine} ${isDone && (stepIdx < currentStatusIdx) ? styles.lineDone : ''}`} />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Bank Transfer Slip Upload Action Area */}
                  {order.paymentMethod === 'bank_transfer' && (
                    <div className={styles.bankStatusBox}>
                      <div className={styles.bankStatusHeader}>
                        <p><strong>Payment Status:</strong> {order.paymentStatus === 'paid' ? 'Verified ✓' : 'Awaiting Receipt Upload'}</p>
                      </div>
                      
                      {order.paymentStatus !== 'paid' && (
                        <div className={styles.bankGrid}>
                          {/* Account instructions */}
                          <div className={styles.bankDetailsBox}>
                            <p className={styles.bankTitle}>Transfer to commercial bank account:</p>
                            <p>Bank: {BANK_DETAILS.bankName}</p>
                            <p>Name: {BANK_DETAILS.accountName}</p>
                            <div className={styles.copyRow}>
                              <span>A/C: {BANK_DETAILS.accountNumber}</span>
                              <button className={styles.miniCopy} onClick={handleCopyAccount}>
                                {copiedText ? 'Copied' : 'Copy'}
                              </button>
                            </div>
                            <p>Branch: {BANK_DETAILS.branch}</p>
                          </div>

                          {/* Upload interaction */}
                          <div className={styles.slipUploadCol}>
                            {order.paymentSlipUrl ? (
                              <div className={styles.uploadedLinkBox}>
                                <FileText size={16} />
                                <a href={order.paymentSlipUrl} target="_blank" rel="noopener noreferrer" className={styles.viewSlipLink}>
                                  View Uploaded Receipt ↗
                                </a>
                              </div>
                            ) : (
                              <label className={styles.slipLabelButton}>
                                {uploadingId === order.id ? (
                                  <Loader2 size={14} className={styles.spin} />
                                ) : (
                                  <Upload size={14} />
                                )}
                                <span>{uploadingId === order.id ? 'Uploading...' : 'Upload Receipt Slip'}</span>
                                <input type="file" accept="image/*" onChange={(e) => handleSlipUpload(e, order.id)} disabled={uploadingId === order.id} className={styles.hiddenInput} />
                              </label>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Order Items Listing */}
                  <div className={styles.orderItems}>
                    {order.items?.map((item, i) => (
                      <span key={i} className={styles.itemTag}>
                        {item.name} <span className={styles.itemQty}>× {item.qty}</span>
                      </span>
                    ))}
                  </div>

                  {/* Total footer */}
                  <div className={styles.orderBottom}>
                    <span className={styles.paymentMethod}>
                      {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Bank Transfer'}
                    </span>
                    <span className={styles.total}>{formatPrice(order.total)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
