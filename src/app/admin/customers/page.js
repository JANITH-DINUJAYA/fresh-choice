'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { formatPrice, formatDate } from '@/lib/constants';
import { Search, Mail, Phone, Calendar, DollarSign, ShoppingBag } from 'lucide-react';
import styles from './page.module.css';

const SAMPLE_CUSTOMERS = [
  { id: 'c1', name: 'Asel Perera', email: 'asel@gmail.com', phone: '0771234567', totalSpent: 4200, orderCount: 3, lastOrderDate: '2026-06-29T12:00:00Z' },
  { id: 'c2', name: 'Kavindi Silva', email: 'kavindi@yahoo.com', phone: '0719876543', totalSpent: 1330, orderCount: 1, lastOrderDate: '2026-06-30T10:30:00Z' },
];

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const snap = await getDocs(query(collection(db, 'users'), where('role', '==', 'customer')));
      if (!snap.empty) {
        // Calculate LTV by matching with orders (simulated/aggregated or directly query)
        const custs = snap.docs.map(d => ({ id: d.id, ...d.data(), totalSpent: d.data().totalSpent || 0, orderCount: d.data().orderCount || 0 }));
        setCustomers(custs);
      } else {
        setCustomers(SAMPLE_CUSTOMERS);
      }
    } catch (err) {
      console.error(err);
      setCustomers(SAMPLE_CUSTOMERS);
    } finally {
      setLoading(false);
    }
  };

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search)
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
                        <div className={styles.avatar}>{c.name[0]}</div>
                        <div>
                          <p className={styles.name}>{c.name}</p>
                          <p className={styles.id}>ID: #{c.id.slice(-6).toUpperCase()}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className={styles.contactCol}>
                        <p className={styles.contactItem}><Mail size={12} /> {c.email}</p>
                        <p className={styles.contactItem}><Phone size={12} /> {c.phone}</p>
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
                {filtered.length === 0 && (
                  <tr><td colSpan={5} className={styles.empty}>No customers found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
