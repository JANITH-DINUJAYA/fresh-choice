'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { CATEGORIES } from '@/lib/constants';
import MealCard from '@/components/customer/MealCard';
import CategoryIcon from '@/components/customer/CategoryIcon';
import { Search, SlidersHorizontal } from 'lucide-react';
import styles from './page.module.css';

const SAMPLE_MEALS = [
  { id: 's1', name: 'Garden Fresh Salad', price: 850, category: 'salads', description: 'Crisp greens, cherry tomatoes, cucumber', isAvailable: true, badge: 'Popular', rating: 4.8, portionSize: 'Regular' },
  { id: 's2', name: 'Sri Lankan Rice & Curry', price: 650, category: 'rice-curry', description: 'Fragrant rice with authentic curry', isAvailable: true, rating: 4.9, portionSize: 'Full' },
  { id: 's3', name: 'Protein Power Bowl', price: 950, category: 'bowls', description: 'Quinoa, grilled veggies, chickpeas', isAvailable: true, badge: 'New', portionSize: 'Regular' },
  { id: 's4', name: 'Green Detox Smoothie', price: 380, category: 'drinks', description: 'Spinach, banana, coconut water', isAvailable: true, portionSize: '350ml' },
  { id: 's5', name: 'Avocado Chicken Salad', price: 1100, category: 'salads', description: 'Grilled chicken, avocado, rocket', isAvailable: true, badge: 'Chef Pick', portionSize: 'Large' },
  { id: 's6', name: 'Veggie Wheat Wrap', price: 480, category: 'snacks', description: 'Hummus, roasted veg, feta', isAvailable: true, portionSize: 'Regular' },
  { id: 's7', name: 'Jackfruit Curry Bowl', price: 750, category: 'bowls', description: 'Spiced jackfruit, coconut milk, rice', isAvailable: true, portionSize: 'Regular' },
  { id: 's8', name: 'Mango Lassi', price: 320, category: 'drinks', description: 'Fresh mango, yogurt, cardamom', isAvailable: true, portionSize: '300ml' },
  { id: 's9', name: 'Lentil Soup & Bread', price: 420, category: 'snacks', description: 'Red lentil soup, crusty bread', isAvailable: false, portionSize: 'Regular' },
];

export default function MenuPage() {
  const [meals, setMeals] = useState([]);
  const [allCategories, setAllCategories] = useState(CATEGORIES);
  const [activeCategory, setActiveCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('default');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMeals();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const catSnap = await getDocs(collection(db, 'categories'));
      if (!catSnap.empty) {
        const customCats = catSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        const merged = [...CATEGORIES];
        for (const c of customCats) {
          if (!merged.find(m => m.id === c.id)) {
            merged.push(c);
          }
        }
        setAllCategories(merged);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMeals = async () => {
    try {
      const snap = await getDocs(collection(db, 'meals'));
      if (!snap.empty) {
        setMeals(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } else {
        // Only fall back to samples if Firestore has no meals
        setMeals(SAMPLE_MEALS);
      }
    } catch {
      setMeals(SAMPLE_MEALS);
    } finally { setLoading(false); }
  };

  const filtered = meals
    .filter(m => activeCategory === 'all' || m.category === activeCategory)
    .filter(m => !search || m.name.toLowerCase().includes(search.toLowerCase()) || m.description?.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return 0;
    });

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div className="container">
          <p className={styles.eyebrow}>Fresh Daily</p>
          <h1 className="heading-xl" style={{ color: 'white' }}>Our Menu</h1>
          <p className={styles.headerSub}>Fresh homemade meals, made each morning with love</p>
        </div>
      </div>

      <div className="container">
        {/* Search & Sort */}
        <div className={styles.toolbar}>
          <div className={styles.searchWrap}>
            <Search size={16} className={styles.searchIcon} />
            <input
              id="menu-search"
              type="text"
              placeholder="Search meals..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className={`form-input ${styles.searchInput}`}
            />
          </div>
          <div className={styles.sortWrap}>
            <SlidersHorizontal size={16} />
            <select
              id="menu-sort"
              className={`form-input form-select ${styles.sortSelect}`}
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
            >
              <option value="default">Sort: Default</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name">Name A–Z</option>
            </select>
          </div>
        </div>

        {/* Category Tabs */}
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeCategory === 'all' ? styles.active : ''}`}
            onClick={() => setActiveCategory('all')} id="tab-all"
          >All</button>
          {allCategories.map(c => (
            <button
              key={c.id}
              className={`${styles.tab} ${activeCategory === c.id ? styles.active : ''}`}
              onClick={() => setActiveCategory(c.id)}
              id={`tab-${c.id}`}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}
            >
              <CategoryIcon name={c.icon} size={15} /> <span>{c.label}</span>
            </button>
          ))}
        </div>

        {/* Results */}
        <div className={styles.results}>
          <p className={styles.count}>{filtered.length} item{filtered.length !== 1 ? 's' : ''}</p>
        </div>

        {loading ? (
          <div className="loading-page" style={{ minHeight: '40vh' }}>
            <div className="spinner" />
            <p>Loading meals...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className={styles.empty}>
            <span>🍽️</span>
            <p>No meals found. Try a different search or category.</p>
          </div>
        ) : (
          <div className={styles.grid}>
            {filtered.map(m => <MealCard key={m.id} meal={m} />)}
          </div>
        )}
      </div>
    </div>
  );
}
