'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { CATEGORIES, formatPrice } from '@/lib/constants';
import toast from 'react-hot-toast';
import { Plus, Edit2, Trash2, Search, SlidersHorizontal, Eye, EyeOff, Loader2, Sparkles } from 'lucide-react';
import styles from './page.module.css';

const SAMPLE_MEALS = [
  { id: 's1', name: 'Garden Fresh Salad', price: 850, category: 'salads', description: 'Crisp greens, cherry tomatoes, cucumber', isAvailable: true, badge: 'Popular', portionSize: 'Regular (350g)', ingredients: ['Lettuce', 'Tomatoes', 'Cucumber'] },
  { id: 's2', name: 'Sri Lankan Rice & Curry', price: 650, category: 'rice-curry', description: 'Fragrant rice with authentic curry', isAvailable: true, badge: '', portionSize: 'Full Plate', ingredients: ['Rice', 'Dhal', 'Pol Sambol'] },
  { id: 's3', name: 'Protein Power Bowl', price: 950, category: 'bowls', description: 'Quinoa, grilled veggies, chickpeas', isAvailable: true, badge: 'New', portionSize: 'Regular (400g)', ingredients: ['Quinoa', 'Chickpeas', 'Avocado'] },
  { id: 's4', name: 'Green Detox Smoothie', price: 380, category: 'drinks', description: 'Spinach, banana, coconut water', isAvailable: true, badge: '', portionSize: '350ml', ingredients: ['Spinach', 'Banana', 'Coconut Water'] },
];

export default function AdminMealsPage() {
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({
    name: '', price: '', category: 'salads', portionSize: '',
    description: '', ingredientsRaw: '', badge: '', isAvailable: true,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchMeals();
  }, []);

  const fetchMeals = async () => {
    try {
      const snap = await getDocs(collection(db, 'meals'));
      if (!snap.empty) {
        setMeals(snap.docs.map(d => ({ id: d.id, ...d.data() })));
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

  const handleOpenAdd = () => {
    setEditId(null);
    setForm({ name: '', price: '', category: 'salads', portionSize: '', description: '', ingredientsRaw: '', badge: '', isAvailable: true });
    setShowModal(true);
  };

  const handleOpenEdit = (meal) => {
    setEditId(meal.id);
    setForm({
      name: meal.name || '',
      price: meal.price || '',
      category: meal.category || 'salads',
      portionSize: meal.portionSize || '',
      description: meal.description || '',
      ingredientsRaw: meal.ingredients ? meal.ingredients.join(', ') : '',
      badge: meal.badge || '',
      isAvailable: meal.isAvailable !== undefined ? meal.isAvailable : true,
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this meal?')) return;
    try {
      await deleteDoc(doc(db, 'meals', id));
      toast.success('Meal deleted successfully');
      setMeals(p => p.filter(m => m.id !== id));
    } catch {
      toast.error('Failed to delete meal from Firestore');
      // For mock data
      setMeals(p => p.filter(m => m.id !== id));
    }
  };

  const handleToggleAvailability = async (meal) => {
    const newVal = !meal.isAvailable;
    try {
      await updateDoc(doc(db, 'meals', meal.id), { isAvailable: newVal });
      toast.success(`Availability updated`);
      setMeals(p => p.map(m => m.id === meal.id ? { ...m, isAvailable: newVal } : m));
    } catch {
      setMeals(p => p.map(m => m.id === meal.id ? { ...m, isAvailable: newVal } : m));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price) {
      toast.error('Please fill in required fields');
      return;
    }
    setSaving(true);

    const ingredients = form.ingredientsRaw
      ? form.ingredientsRaw.split(',').map(i => i.trim()).filter(Boolean)
      : [];

    const mealData = {
      name: form.name,
      price: Number(form.price),
      category: form.category,
      portionSize: form.portionSize,
      description: form.description,
      ingredients,
      badge: form.badge,
      isAvailable: form.isAvailable,
      updatedAt: serverTimestamp(),
    };

    try {
      if (editId) {
        await updateDoc(doc(db, 'meals', editId), mealData);
        toast.success('Meal updated successfully');
        setMeals(p => p.map(m => m.id === editId ? { ...m, ...mealData, id: editId } : m));
      } else {
        const ref = await addDoc(collection(db, 'meals'), { ...mealData, createdAt: serverTimestamp() });
        toast.success('Meal added successfully');
        setMeals(p => [{ ...mealData, id: ref.id }, ...p]);
      }
      setShowModal(false);
    } catch (err) {
      console.error(err);
      toast.error('Saved locally (Firestore error)');
      // Local fallback
      const tempId = editId || `local-${Date.now()}`;
      const mockResult = { ...mealData, id: tempId };
      if (editId) {
        setMeals(p => p.map(m => m.id === editId ? mockResult : m));
      } else {
        setMeals(p => [mockResult, ...p]);
      }
      setShowModal(false);
    } finally {
      setSaving(false);
    }
  };

  const filtered = meals
    .filter(m => activeCategory === 'all' || m.category === activeCategory)
    .filter(m => !search || m.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Meal Management</h1>
          <p className={styles.sub}>Create and configure daily menu offerings.</p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenAdd} id="admin-add-meal">
          <Plus size={18} /> Add New Meal
        </button>
      </div>

      {/* Filters & Search */}
      <div className={styles.toolbar}>
        <div className={styles.searchWrap}>
          <Search size={16} className={styles.searchIcon} />
          <input
            id="admin-search-meal"
            type="text"
            placeholder="Search menu..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className={`form-input ${styles.searchInput}`}
          />
        </div>
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeCategory === 'all' ? styles.active : ''}`}
            onClick={() => setActiveCategory('all')}
          >All</button>
          {CATEGORIES.map(c => (
            <button
              key={c.id}
              className={`${styles.tab} ${activeCategory === c.id ? styles.active : ''}`}
              onClick={() => setActiveCategory(c.id)}
            >
              {c.icon} {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Meals Table/List */}
      {loading ? (
        <div className="loading-page" style={{ minHeight: '40vh' }}><div className="spinner" /></div>
      ) : (
        <div className={styles.tableCard}>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Meal Name</th>
                  <th>Category</th>
                  <th>Portion</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th>Badge</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(meal => (
                  <tr key={meal.id} className={styles.row}>
                    <td>
                      <div>
                        <p className={styles.mealName}>{meal.name}</p>
                        <p className={styles.mealDesc}>{meal.description}</p>
                      </div>
                    </td>
                    <td><span className={styles.catBadge}>{meal.category}</span></td>
                    <td className={styles.dimText}>{meal.portionSize || '—'}</td>
                    <td className={styles.priceCell}>{formatPrice(meal.price)}</td>
                    <td>
                      <button
                        className={`${styles.statusToggle} ${meal.isAvailable ? styles.available : styles.unavailable}`}
                        onClick={() => handleToggleAvailability(meal)}
                        title="Toggle availability"
                        id={`toggle-avail-${meal.id}`}
                      >
                        {meal.isAvailable ? <Eye size={14} /> : <EyeOff size={14} />}
                        {meal.isAvailable ? 'Available' : 'Sold Out'}
                      </button>
                    </td>
                    <td>
                      {meal.badge ? <span className={styles.badgeTag}>{meal.badge}</span> : <span className={styles.dimText}>—</span>}
                    </td>
                    <td>
                      <div className={styles.actions}>
                        <button className={styles.actionBtn} onClick={() => handleOpenEdit(meal)} id={`edit-meal-${meal.id}`} title="Edit"><Edit2 size={14} /></button>
                        <button className={`${styles.actionBtn} ${styles.delete}`} onClick={() => handleDelete(meal.id)} id={`delete-meal-${meal.id}`} title="Delete"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={7} className={styles.empty}>No meals found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit/Add Modal */}
      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHead}>
              <h2>{editId ? 'Edit Meal' : 'Add New Meal'}</h2>
              <button className={styles.modalClose} onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSave} className={styles.modalForm}>
              <div className="form-group">
                <label className="form-label">Meal Name *</label>
                <input id="modal-meal-name" className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Garden Fresh Salad" required />
              </div>
              <div className={styles.formRow}>
                <div className="form-group">
                  <label className="form-label">Price (Rs.) *</label>
                  <input id="modal-meal-price" type="number" className="form-input" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} placeholder="850" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Category *</label>
                  <select id="modal-meal-category" className="form-input form-select" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                    {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                  </select>
                </div>
              </div>
              <div className={styles.formRow}>
                <div className="form-group">
                  <label className="form-label">Portion Size</label>
                  <input id="modal-meal-portion" className="form-input" value={form.portionSize} onChange={e => setForm({ ...form, portionSize: e.target.value })} placeholder="e.g. Regular (350g)" />
                </div>
                <div className="form-group">
                  <label className="form-label">Ribbon Badge</label>
                  <input id="modal-meal-badge" className="form-input" value={form.badge} onChange={e => setForm({ ...form, badge: e.target.value })} placeholder="e.g. Popular, New" />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea id="modal-meal-desc" className="form-input form-textarea" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Detailed meal description..." rows={2} />
              </div>
              <div className="form-group">
                <label className="form-label">Ingredients (Comma Separated)</label>
                <input id="modal-meal-ingredients" className="form-input" value={form.ingredientsRaw} onChange={e => setForm({ ...form, ingredientsRaw: e.target.value })} placeholder="Lettuce, Tomatoes, Cucumber" />
              </div>
              <div className={styles.toggleRow}>
                <label className={styles.checkboxLabel}>
                  <input id="modal-meal-avail" type="checkbox" checked={form.isAvailable} onChange={e => setForm({ ...form, isAvailable: e.target.checked })} />
                  <span>Mark as Available immediately</span>
                </label>
              </div>
              <div className={styles.modalActions}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving} id="modal-meal-save">
                  {saving ? <Loader2 className={styles.spin} size={16} /> : null}
                  {editId ? 'Save Changes' : 'Create Meal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
