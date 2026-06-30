'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ORDER_STATUSES, formatPrice, formatDate } from '@/lib/constants';
import toast from 'react-hot-toast';
import { Search, Eye, Filter, CheckCircle, Check, XCircle, Clock, Calendar, ShieldCheck, ChevronRight, FileText, Image as ImageIcon } from 'lucide-react';
import styles from './page.module.css';

const SAMPLE_ORDERS = [
  { id: 'o1', customerName: 'Asel Perera', phone: '0771234567', address: '12/4, Flower Road, Colombo 7', items: [{ name: 'Garden Fresh Salad', qty: 2, price: 850 }], subtotal: 1700, deliveryFee: 150, total: 1850, paymentMethod: 'cod', paymentStatus: 'pending', orderStatus: 'pending', createdAt: null, isScheduled: true, scheduledDate: '2026-07-01', scheduledTime: '12:00 PM' },
  { id: 'o2', customerName: 'Kavindi Silva', phone: '0719876543', address: '45, High Level Road, Maharagama', items: [{ name: 'Protein Power Bowl', qty: 1, price: 950 }, { name: 'Green Detox Smoothie', qty: 1, price: 380 }], subtotal: 1330, deliveryFee: 0, total: 1330, paymentMethod: 'bank_transfer', paymentStatus: 'awaiting_verification', orderStatus: 'confirmed', createdAt: null, paymentSlipUrl: 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?auto=format&fit=crop&w=400&q=80' },
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const snap = await getDocs(collection(db, 'orders'));
      if (!snap.empty) {
        setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } else {
        setOrders(SAMPLE_ORDERS);
      }
    } catch (err) {
      console.error(err);
      setOrders(SAMPLE_ORDERS);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, { orderStatus: newStatus, updatedAt: serverTimestamp() });
      toast.success(`Order status updated to ${newStatus}`);
      setOrders(p => p.map(o => o.id === orderId ? { ...o, orderStatus: newStatus } : o));
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(p => ({ ...p, orderStatus: newStatus }));
      }
    } catch {
      // Local fallback
      setOrders(p => p.map(o => o.id === orderId ? { ...o, orderStatus: newStatus } : o));
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(p => ({ ...p, orderStatus: newStatus }));
      }
      toast.success(`Status updated (simulated)`);
    }
  };

  const handleVerifyPayment = async (orderId) => {
    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, { paymentStatus: 'paid', updatedAt: serverTimestamp() });
      toast.success('Payment marked as Verified');
      setOrders(p => p.map(o => o.id === orderId ? { ...o, paymentStatus: 'paid' } : o));
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(p => ({ ...p, paymentStatus: 'paid' }));
      }
    } catch {
      setOrders(p => p.map(o => o.id === orderId ? { ...o, paymentStatus: 'paid' } : o));
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(p => ({ ...p, paymentStatus: 'paid' }));
      }
      toast.success('Payment verified (simulated)');
    }
  };

  const getStatus = (key) => ORDER_STATUSES.find(s => s.key === key) || ORDER_STATUSES[0];

  const getStatusIcon = (key) => {
    switch (key) {
      case 'pending': return <Clock size={14} />;
      case 'confirmed': return <CheckCircle size={14} />;
      case 'preparing': return <Clock size={14} />; // fallback
      case 'ready': return <ShieldCheck size={14} />;
      case 'delivered': return <CheckCircle size={14} />;
      case 'cancelled': return <XCircle size={14} />;
      default: return <Clock size={14} />;
    }
  };

  const filtered = orders
    .filter(o => activeTab === 'all' || o.orderStatus === activeTab)
    .filter(o => !search || o.customerName.toLowerCase().includes(search.toLowerCase()) || o.id.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Order Management</h1>
          <p className={styles.sub}>Track customer orders, status, and verify bank payments.</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.searchWrap}>
          <Search size={16} className={styles.searchIcon} />
          <input
            id="admin-search-orders"
            type="text"
            placeholder="Search orders by customer or ID..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className={`form-input ${styles.searchInput}`}
          />
        </div>
      </div>

      {/* Tabs (emojis removed, clean icons added) */}
      <div className={styles.tabs}>
        <button className={`${styles.tab} ${activeTab === 'all' ? styles.active : ''}`} onClick={() => setActiveTab('all')}>All Orders</button>
        {ORDER_STATUSES.map(s => (
          <button
            key={s.key}
            className={`${styles.tab} ${activeTab === s.key ? styles.active : ''}`}
            onClick={() => setActiveTab(s.key)}
            id={`tab-status-${s.key}`}
          >
            {getStatusIcon(s.key)}
            <span>{s.label}</span>
          </button>
        ))}
      </div>

      {/* Workspace split layout */}
      <div className={styles.workspace}>
        {loading ? (
          <div className="loading-page" style={{ minHeight: '40vh' }}><div className="spinner" /></div>
        ) : (
          <div className={styles.tableCard} style={{ flex: 1 }}>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Timing</th>
                    <th>Total</th>
                    <th>Payment</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(order => {
                    const st = getStatus(order.orderStatus);
                    return (
                      <tr key={order.id} className={`${styles.row} ${selectedOrder?.id === order.id ? styles.selectedRow : ''}`} onClick={() => setSelectedOrder(order)} style={{ cursor: 'pointer' }}>
                        <td className={styles.orderId}>#{order.id.slice(-6).toUpperCase()}</td>
                        <td>
                          <div>
                            <p className={styles.customerName}>{order.customerName}</p>
                            <p className={styles.phone}>{order.phone}</p>
                          </div>
                        </td>
                        <td>
                          {order.isScheduled ? (
                            <span className={styles.scheduleTag} title={`Scheduled: ${order.scheduledDate} ${order.scheduledTime}`}>
                              Pre-order
                            </span>
                          ) : (
                            <span className={styles.asapTag}>ASAP</span>
                          )}
                        </td>
                        <td className={styles.amount}>{formatPrice(order.total)}</td>
                        <td>
                          <div className={styles.payCol}>
                            <span className={styles.payMethod}>{order.paymentMethod === 'cod' ? 'COD' : 'Bank'}</span>
                            {order.paymentMethod === 'bank_transfer' && (
                              <span className={`${styles.payStatus} ${order.paymentStatus === 'paid' ? styles.paid : styles.unverified}`}>
                                {order.paymentStatus === 'paid' ? 'Paid' : 'Verify'}
                              </span>
                            )}
                          </div>
                        </td>
                        <td>
                          <span className={styles.statusBadge} style={{ background: `${st.color}15`, color: st.color }}>
                            {st.label}
                          </span>
                        </td>
                        <td>
                          <button className={styles.viewBtn} onClick={(e) => { e.stopPropagation(); setSelectedOrder(order); }} id={`view-order-${order.id}`}>
                            <Eye size={14} /> View
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {filtered.length === 0 && (
                    <tr><td colSpan={7} className={styles.empty}>No orders found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Selected Order Details Panel */}
        {selectedOrder && (
          <div className={styles.detailPanel}>
            <div className={styles.panelHead}>
              <h3>Order details #{selectedOrder.id.slice(-6).toUpperCase()}</h3>
              <button className={styles.panelClose} onClick={() => setSelectedOrder(null)}>×</button>
            </div>
            
            <div className={styles.panelBody}>
              
              {/* Stepper tracking inside details panel */}
              <div className={styles.stepperWidget}>
                <h4>Order Progress</h4>
                <div className={styles.adminStepper}>
                  {ORDER_STATUSES.filter(s => s.key !== 'cancelled').map((step, idx) => {
                    const currentIdx = ORDER_STATUSES.findIndex(x => x.key === selectedOrder.orderStatus);
                    const stepIdx = ORDER_STATUSES.findIndex(x => x.key === step.key);
                    const isDone = stepIdx <= currentIdx && selectedOrder.orderStatus !== 'cancelled';
                    return (
                      <div key={step.key} className={`${styles.adminStep} ${isDone ? styles.adminStepDone : ''}`}>
                        <div className={styles.adminStepDot}>{isDone ? '✓' : idx + 1}</div>
                        <span className={styles.adminStepLabel}>{step.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Customer Info */}
              <div className={styles.detailSection}>
                <h4>Customer Information</h4>
                <p><strong>Name:</strong> {selectedOrder.customerName}</p>
                <p><strong>Phone:</strong> {selectedOrder.phone}</p>
                <p><strong>Address:</strong> {selectedOrder.address}</p>
                {selectedOrder.notes && <p><strong>Notes:</strong> {selectedOrder.notes}</p>}
              </div>

              {/* Schedule */}
              <div className={styles.detailSection}>
                <h4>Delivery Schedule</h4>
                {selectedOrder.isScheduled ? (
                  <p>Scheduled: <strong>{selectedOrder.scheduledDate}</strong> at <strong>{selectedOrder.scheduledTime}</strong></p>
                ) : (
                  <p>🚀 ASAP Delivery (Prepare immediately)</p>
                )}
              </div>

              {/* Payment Verification slip receipt (NEW FEATURE) */}
              <div className={styles.detailSection}>
                <h4>Payment & Receipt Slip</h4>
                <p>Method: {selectedOrder.paymentMethod === 'cod' ? 'Cash on Delivery (COD)' : 'Bank Transfer'}</p>
                {selectedOrder.paymentMethod === 'bank_transfer' && (
                  <div className={styles.slipVerificationBlock}>
                    {selectedOrder.paymentSlipUrl ? (
                      <div className={styles.slipWrapper}>
                        <p className={styles.slipAlertText}>Uploaded transaction slip:</p>
                        <div className={styles.slipImageContainer}>
                          <img src={selectedOrder.paymentSlipUrl} alt="Transaction Receipt Slip" className={styles.slipImage} />
                        </div>
                        <a href={selectedOrder.paymentSlipUrl} target="_blank" rel="noopener noreferrer" className={styles.zoomBtn}>
                          <ImageIcon size={12} /> Open Full Receipt image ↗
                        </a>
                      </div>
                    ) : (
                      <p className={styles.slipWarning}>No receipt uploaded by customer yet.</p>
                    )}

                    <div className={styles.verifyRow} style={{ marginTop: '0.875rem' }}>
                      <span className={`${styles.payStatus} ${selectedOrder.paymentStatus === 'paid' ? styles.paid : styles.unverified}`}>
                        {selectedOrder.paymentStatus === 'paid' ? 'Payment Verified' : 'Awaiting verification'}
                      </span>
                      {selectedOrder.paymentStatus !== 'paid' && (
                        <button className="btn btn-primary btn-sm" onClick={() => handleVerifyPayment(selectedOrder.id)} id="verify-payment-btn">
                          <Check size={12} /> Verify Payment
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Order items */}
              <div className={styles.detailSection}>
                <h4>Order Items</h4>
                <ul className={styles.itemsList}>
                  {selectedOrder.items?.map((item, i) => (
                    <li key={i} className={styles.itemRow}>
                      <span>{item.name} × {item.qty}</span>
                      <span>{formatPrice(item.price * item.qty)}</span>
                    </li>
                  ))}
                </ul>
                <div className={styles.subtotalRow}>
                  <span>Subtotal</span><span>{formatPrice(selectedOrder.subtotal)}</span>
                </div>
                <div className={styles.subtotalRow}>
                  <span>Delivery</span><span>{formatPrice(selectedOrder.deliveryFee)}</span>
                </div>
                <div className={styles.totalRow}>
                  <span>Total</span><span>{formatPrice(selectedOrder.total)}</span>
                </div>
              </div>

              {/* Status workflows */}
              <div className={styles.workflowSection}>
                <h4>Update Order Status</h4>
                <div className={styles.workflowButtons}>
                  {selectedOrder.orderStatus === 'pending' && (
                    <button className="btn btn-primary" onClick={() => handleUpdateStatus(selectedOrder.id, 'confirmed')} id="btn-confirm">
                      Confirm Order
                    </button>
                  )}
                  {selectedOrder.orderStatus === 'confirmed' && (
                    <button className="btn btn-primary" onClick={() => handleUpdateStatus(selectedOrder.id, 'preparing')} id="btn-prepare">
                      Start Preparing
                    </button>
                  )}
                  {selectedOrder.orderStatus === 'preparing' && (
                    <button className="btn btn-primary" onClick={() => handleUpdateStatus(selectedOrder.id, 'ready')} id="btn-ready">
                      Mark Ready
                    </button>
                  )}
                  {selectedOrder.orderStatus === 'ready' && (
                    <button className="btn btn-primary" onClick={() => handleUpdateStatus(selectedOrder.id, 'delivered')} id="btn-deliver">
                      Mark Delivered
                    </button>
                  )}
                  {selectedOrder.orderStatus !== 'delivered' && selectedOrder.orderStatus !== 'cancelled' && (
                    <button className={`${styles.cancelBtn}`} onClick={() => handleUpdateStatus(selectedOrder.id, 'cancelled')} id="btn-cancel">
                      Cancel Order
                    </button>
                  )}
                </div>
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}
