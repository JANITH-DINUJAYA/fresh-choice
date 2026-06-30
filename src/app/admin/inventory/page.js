'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { CATEGORIES } from '@/lib/constants';
import toast from 'react-hot-toast';
import { Package, Search, Save, AlertTriangle, RefreshCw } from 'lucide-react';
import styles from './page.module.css';

const SAMPLE_MEALS = [
  { id: 's1', name: 'Garden Fresh Salad', category: 'salads', stock: 15, isAvailable: true },
  { id: 's2', name: 'Sri Lankan Rice & Curry', category: 'rice-curry', stock: 8, isAvailable: true },
  { id: 's3', name: 'Protein Power Bowl', category: 'bowls', stock: 2, isAvailable: true },
  { id: 's4', name: 'Green Detox Smoothie', category: 'drinks', stock: 25, isAvailable: true },
];

export default function AdminInventoryPage() {
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [stockChanges, setStockChanges] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchMeals();
  }, []);

  const fetchMeals = async () => {
    try {
      const snap = await getDocs(collection(db, 'meals'));
      if (!snap.empty) {
        setMeals(snap.docs.map(d => ({ id: d.id, ...d.data(), stock: d.data().stock || 0 })));
      } else {
        setMeals(SAMPLE_MEALS);
      }
    } catch (err) {
      console.error(err);
      setMeals(SAMPLE_MEALS);
    } finally {
      setLoading(false);
    }
  };

  const handleStockChange = (id, val) => {
    const num = Math.max(0, parseInt(val) || 0);
    setStockChanges(p => ({ ...p, [id]: num }));
  };

  const handleSaveStock = async (mealId) => {
    const newStock = stockChanges[mealId];
    if (newStock === undefined) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, 'meals', mealId), { stock: newStock, updatedAt: serverTimestamp() });
      toast.success('Stock updated');
      setMeals(p => p.map(m => m.id === mealId ? { ...m, stock: newStock } : m));
      setStockChanges(p => {
        const copy = { ...p };
        delete copy[mealId];
        return copy;
      });
    } catch {
      setMeals(p => p.map(m => m.id === mealId ? { ...m, stock: newStock } : m));
      setStockChanges(p => {
        const copy = { ...p };
        delete copy[mealId];
        return copy;
      });
      toast.success('Stock updated locally');
    } finally {
      setSaving(false);
    }
  };

  const handleBulkReset = async () => {
    if (!confirm('This will reset stock for all meals to 0. Proceed?')) return;
    setSaving(true);
    try {
      for (const meal of meals) {
        await updateDoc(doc(db, 'meals', meal.id), { stock: 0 });
      }
      toast.success('All stock reset to 0');
      setMeals(p => p.map(m => ({ ...m, stock: 0 })));
      setStockChanges({});
    } catch {
      setMeals(p => p.map(m => ({ ...m, stock: 0 })));
      setStockChanges({});
      toast.success('Reset simulated locally');
    } finally {
      setSaving(false);
    }
  };

  const filtered = meals.filter(m => !search || m.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Daily Inventory</h1>
          <p className={styles.sub}>Manage prep batch availability and track ingredient stock.</p>
        </div>
        <button className="btn btn-outline" style={{ borderColor: 'rgba(239,68,68,0.4)', color: '#ef4444' }} onClick={handleBulkReset} disabled={saving} id="admin-bulk-reset">
          <RefreshCw size={14} /> Reset All Stock
        </button>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.searchWrap}>
          <Search size={16} className={styles.searchIcon} />
          <input
            id="admin-search-inventory"
            type="text"
            placeholder="Search meals..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className={`form-input ${styles.searchInput}`}
          />
        </div>
      </div>

      {loading ? (
        <div className="loading-page" style={{ minHeight: '40vh' }}><div className="spinner" /></div>
      ) : (
        <div className={styles.grid}>
          {filtered.map(meal => {
            const hasChange = stockChanges[meal.id] !== undefined;
            const currentStock = hasChange ? stockChanges[meal.id] : meal.stock;
            const lowStock = currentStock <= 3;
            return (
              <div key={meal.id} className={`${styles.card} ${lowStock ? styles.lowStockBorder : ''}`}>
                <div className={styles.cardTop}>
                  <span className={styles.cat}>{meal.category}</span>
                  {lowStock && (
                    <span className={styles.warningTag} title="Stock is running low!">
                      <AlertTriangle size={12} /> Low Stock
                    </span>
                  )}
                </div>
                <h3 className={styles.mealName}>{meal.name}</h3>
                <div className={styles.stockRow}>
                  <div className={styles.stockLabel}>
                    <p className={styles.stockNum} style={{ color: lowStock ? '#ef4444' : '#22c55e' }}>{currentStock}</p>
                    <p className={styles.stockSub}>Units Available</p>
                  </div>
                  <div className={styles.inputCol}>
                    <label className="form-label" style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>Update Stock</label>
                    <input
                      id={`stock-input-${meal.id}`}
                      type="number"
                      min="0"
                      value={hasChange ? stockChanges[meal.id] : meal.stock}
                      onChange={e => handleStockChange(meal.id, e.target.value)}
                      className={`form-input ${styles.stockInput}`}
                    />
                  </div>
                </div>
                {hasChange && (
                  <button className={`btn btn-primary ${styles.saveBtn}`} onClick={() => handleSaveStock(meal.id)} disabled={saving} id={`save-stock-${meal.id}`}>
                    <Save size={14} /> Save Change
                  </button>
                )}
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className={styles.empty}>No items found</div>
          )}
        </div>
      )}
    </div>
  );
}
