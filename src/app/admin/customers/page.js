'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { formatPrice, formatDate } from '@/lib/constants';
import { Search, Mail, Phone, Calendar, DollarSign, ShoppingBag } from 'lucide-react';
import styles from './page.module.css';

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      // Fetch all customers
      const usersSnap = await getDocs(query(collection(db, 'users'), where('role', '==', 'customer')));
      const custs = usersSnap.docs.map(d => ({ id: d.id, ...d.data(), totalSpent: 0, orderCount: 0, lastOrderDate: null }));

      // Fetch all orders and compute stats per customer
      const ordersSnap = await getDocs(collection(db, 'orders'));
      const orders = ordersSnap.docs.map(d => ({ id: d.id, ...d.data() }));

      const statsMap = {};
      for (const order of orders) {
        const cid = order.customerId;
        if (!cid) continue;
        if (!statsMap[cid]) statsMap[cid] = { totalSpent: 0, orderCount: 0, lastOrderDate: null };
        statsMap[cid].totalSpent += order.total || 0;
        statsMap[cid].orderCount += 1;
        const orderTime = order.createdAt?.toMillis?.() || 0;
        const lastTime = statsMap[cid].lastOrderDate?.toMillis?.() || 0;
        if (orderTime > lastTime) statsMap[cid].lastOrderDate = order.createdAt;
      }

      // Merge stats into customers
      const enriched = custs.map(c => ({
        ...c,
        ...(statsMap[c.id] || {}),
      }));

      if (enriched.length > 0) {
        setCustomers(enriched);
      } else {
        setCustomers([]);
      }
    } catch (err) {
      console.error(err);
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  const filtered = customers.filter(c =>
    (c.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.email || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.phone || '').includes(search)
  );

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Customer Records</h1>
          <p className={styles.sub}>Track customer loyalty, order counts, and lifetime value.</p>
        </div>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.searchWrap}>
          <Search size={16} className={styles.searchIcon} />
          <input
            id="admin-search-customers"
            type="text"
            placeholder="Search customers..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className={`form-input ${styles.searchInput}`}
          />
        </div>
      </div>

      {loading ? (
        <div className="loading-page" style={{ minHeight: '40vh' }}><div className="spinner" /></div>
      ) : filtered.length === 0 ? (
        <div className={styles.tableCard}>
          <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', padding: '3rem' }}>
            {search ? 'No customers match your search.' : 'No customers found. They will appear once users sign up.'}
          </p>
        </div>
      ) : (
        <div className={styles.tableCard}>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Customer Info</th>
                  <th>Contact Details</th>
                  <th>Orders Count</th>
                  <th>Total Spent (LTV)</th>
                  <th>Last Order</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c.id} className={styles.row}>
                    <td>
                      <div className={styles.infoCol}>
                        <div className={styles.avatar}>{(c.name || '?')[0]}</div>
                        <div>
                          <p className={styles.name}>{c.name || '—'}</p>
                          <p className={styles.id}>ID: #{c.id.slice(-6).toUpperCase()}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className={styles.contactCol}>
                        <p className={styles.contactItem}><Mail size={12} /> {c.email}</p>
                        <p className={styles.contactItem}><Phone size={12} /> {c.phone || '—'}</p>
                      </div>
                    </td>
                    <td>
                      <span className={styles.orderBadge}>
                        <ShoppingBag size={12} /> {c.orderCount} order{c.orderCount !== 1 ? 's' : ''}
                      </span>
                    </td>
                    <td className={styles.spentCell}>
                      <span className={styles.spentAmount}>
                        <DollarSign size={12} /> {formatPrice(c.totalSpent)}
                      </span>
                    </td>
                    <td className={styles.dateCell}>
                      {c.lastOrderDate ? (
                        <span><Calendar size={12} /> {formatDate(c.lastOrderDate)}</span>
                      ) : (
                        <span className={styles.dimText}>No orders yet</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
