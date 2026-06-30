'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy, limit, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { formatPrice, formatDate, ORDER_STATUSES } from '@/lib/constants';
import { TrendingUp, ShoppingBag, Users, DollarSign, AlertCircle, Clock, AlertTriangle, ChevronRight, PackageOpen } from 'lucide-react';
import Link from 'next/link';
import styles from './page.module.css';

const SAMPLE_LOW_STOCK = [
  { id: 's3', name: 'Protein Power Bowl', stock: 3, category: 'bowls' },
  { id: 's2', name: 'Sri Lankan Rice & Curry', stock: 8, category: 'rice-curry' },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState({ totalOrders: 0, todayOrders: 0, revenue: 0, customers: 0, pending: 0 });
  const [recentOrders, setRecentOrders] = useState([]);
  const [lowStockMeals, setLowStockMeals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      // 1. Fetch Orders & Stats
      const ordersSnap = await getDocs(collection(db, 'orders'));
      const orders = ordersSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      const today = new Date().toISOString().split('T')[0];
      const todayOrders = orders.filter(o => {
        const d = o.createdAt?.toDate?.() || new Date(o.createdAt || 0);
        return d.toISOString().split('T')[0] === today;
      });
      const revenue = orders.filter(o => o.orderStatus === 'delivered').reduce((sum, o) => sum + (o.total || 0), 0);
      const pending = orders.filter(o => o.orderStatus === 'pending').length;
      
      // 2. Fetch Customers
      const customersSnap = await getDocs(query(collection(db, 'users'), where('role', '==', 'customer')));
      setStats({ totalOrders: orders.length, todayOrders: todayOrders.length, revenue, customers: customersSnap.size, pending });
      setRecentOrders(orders.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)).slice(0, 5));

      // 3. Fetch Meals with Low Stock
      const mealsSnap = await getDocs(collection(db, 'meals'));
      const meals = mealsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      const lowStock = meals.filter(m => m.stock !== undefined && m.stock <= 10);
      
      if (mealsSnap.empty) {
        setLowStockMeals(SAMPLE_LOW_STOCK);
      } else {
        setLowStockMeals(lowStock.sort((a, b) => (a.stock || 0) - (b.stock || 0)));
      }
    } catch (err) { 
      console.error(err);
      setLowStockMeals(SAMPLE_LOW_STOCK);
    } finally { 
      setLoading(false); 
    }
  };

  const STAT_CARDS = [
    { label: "Today's Orders", value: stats.todayOrders, icon: <Clock size={20} />, color: '#3b82f6' },
    { label: 'Total Orders', value: stats.totalOrders, icon: <ShoppingBag size={20} />, color: '#22c55e' },
    { label: 'Total Revenue', value: formatPrice(stats.revenue), icon: <DollarSign size={20} />, color: '#eab308' },
    { label: 'Customers', value: stats.customers, icon: <Users size={20} />, color: '#a855f7' },
  ];

  const getStatus = (key) => ORDER_STATUSES.find(s => s.key === key);

  return (
    <div className={styles.page}>
      {/* Dashboard Top Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Dashboard</h1>
          <p className={styles.sub}>Welcome back! Real-time stats and alerts for Fresh Choice.</p>
        </div>
        {stats.pending > 0 && (
          <div className={styles.alert}>
            <AlertCircle size={16} />
            {stats.pending} order{stats.pending > 1 ? 's' : ''} pending confirmation
          </div>
        )}
      </div>

      {/* KPI Cards Grid */}
      <div className={styles.statsGrid}>
        {STAT_CARDS.map((card, i) => (
          <div key={i} className={styles.statCard}>
            <div className={styles.statTop}>
              <div className={styles.statIcon} style={{ background: `${card.color}15`, color: card.color }}>{card.icon}</div>
              <TrendingUp size={14} className={styles.trendIcon} />
            </div>
            <p className={styles.statValue}>{loading ? '—' : card.value}</p>
            <p className={styles.statLabel}>{card.label}</p>
          </div>
        ))}
      </div>

      {/* Main Layout: Recent Orders + Sidebar widgets */}
      <div className={styles.layoutGrid}>
        
        {/* Left Column: Recent Orders */}
        <div className={styles.section} style={{ flex: 1.8 }}>
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>Recent Orders</h2>
            <Link href="/admin/orders" className={styles.viewAll}>View All Orders <ChevronRight size={14} /></Link>
          </div>
          
          {loading ? (
            <div className={styles.placeholderLoading}>Loading recent logs...</div>
          ) : (
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Total</th>
                    <th>Payment</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map(order => {
                    const st = getStatus(order.orderStatus);
                    return (
                      <tr key={order.id} className={styles.row}>
                        <td className={styles.orderId}>#{order.id.slice(-6).toUpperCase()}</td>
                        <td>{order.customerName}</td>
                        <td className={styles.amount}>{formatPrice(order.total)}</td>
                        <td><span className={styles.payTag}>{order.paymentMethod === 'cod' ? 'COD' : 'Bank'}</span></td>
                        <td>
                          <span className={styles.statusBadge} style={{ background: `${st?.color}15`, color: st?.color }}>
                            {st?.label}
                          </span>
                        </td>
                        <td className={styles.dateCell}>{formatDate(order.createdAt)}</td>
                      </tr>
                    );
                  })}
                  {recentOrders.length === 0 && (
                    <tr><td colSpan={6} className={styles.empty}>No orders registered today</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right Column: Low Stock Alerts Sidebar Widget */}
        <div className={styles.sidebarColumn}>
          <div className={styles.sidebarWidget}>
            <div className={styles.widgetHead}>
              <AlertTriangle size={18} className={styles.widgetAlertIcon} />
              <h3>Low Stock Alerts</h3>
            </div>
            
            <p className={styles.widgetSub}>Configured thresholds Alert when meals are under 10 units.</p>

            <div className={styles.widgetList}>
              {loading ? (
                <div className={styles.placeholderLoading}>Verifying stock...</div>
              ) : lowStockMeals.length === 0 ? (
                <div className={styles.widgetEmptyState}>
                  <PackageOpen size={24} />
                  <p>All stock levels are sufficient!</p>
                </div>
              ) : (
                lowStockMeals.map(meal => (
                  <div key={meal.id} className={styles.widgetItem}>
                    <div className={styles.widgetItemInfo}>
                      <p className={styles.widgetItemName}>{meal.name}</p>
                      <span className={styles.widgetItemCat}>{meal.category}</span>
                    </div>
                    <span className={styles.widgetStockBadge} style={{ color: meal.stock === 0 ? '#ef4444' : '#f59e0b', background: meal.stock === 0 ? 'rgba(239,68,68,0.12)' : 'rgba(245,158,11,0.12)' }}>
                      {meal.stock} Left
                    </span>
                  </div>
                ))
              )}
            </div>

            <Link href="/admin/inventory" className="btn btn-outline btn-sm" style={{ width: '100%', marginTop: '1rem', justifyContent: 'center' }}>
              Update Stock Levels
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
