'use client';

import { useState, useEffect, useRef } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { CATEGORIES } from '@/lib/constants';
import { formatPrice } from '@/lib/constants';
import toast from 'react-hot-toast';
import { Plus, Edit2, Trash2, Search, Eye, EyeOff, Loader2, Image as ImageIcon, X, Tag, ChevronDown } from 'lucide-react';
import styles from './page.module.css';

const IMGBB_KEY = 'bbfda5a6eaea6c85b9c3125b4c8cc463';

export default function AdminMealsPage() {
  const [meals, setMeals] = useState([]);
  const [dbCategories, setDbCategories] = useState([]);
  const [allCategories, setAllCategories] = useState(CATEGORIES);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  // Meal modal states
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({
    name: '', price: '', category: '', portionSize: '',
    description: '', ingredientsRaw: '', badge: '', isAvailable: true,
  });
  const [saving, setSaving] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageUploading, setImageUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Category modal states
  const [showCatModal, setShowCatModal] = useState(false);
  const [catForm, setCatForm] = useState({ label: '', id: '' });
  const [editCatId, setEditCatId] = useState(null);
  const [savingCat, setSavingCat] = useState(false);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      // Fetch meals
      const mealsSnap = await getDocs(collection(db, 'meals'));
      const mealsData = mealsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      setMeals(mealsData);

      // Fetch custom categories
      const catSnap = await getDocs(collection(db, 'categories'));
      const customCats = catSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      setDbCategories(customCats);

      // Merge: built-in + custom, dedup by id
      const merged = [...CATEGORIES];
      for (const c of customCats) {
        if (!merged.find(m => m.id === c.id)) merged.push(c);
      }
      setAllCategories(merged);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditId(null);
    setForm({ name: '', price: '', category: allCategories[0]?.id || '', portionSize: '', description: '', ingredientsRaw: '', badge: '', isAvailable: true });
    setImageFile(null);
    setImagePreview(null);
    setShowModal(true);
  };

  const handleOpenEdit = (meal) => {
    setEditId(meal.id);
    setForm({
      name: meal.name || '',
      price: meal.price || '',
      category: meal.category || allCategories[0]?.id || '',
      portionSize: meal.portionSize || '',
      description: meal.description || '',
      ingredientsRaw: meal.ingredients ? meal.ingredients.join(', ') : '',
      badge: meal.badge || '',
      isAvailable: meal.isAvailable !== undefined ? meal.isAvailable : true,
    });
    setImageFile(null);
    setImagePreview(meal.imageUrl || null);
    setShowModal(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const uploadImageToImgbb = async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    const res = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_KEY}`, {
      method: 'POST',
      body: formData,
    });
    const data = await res.json();
    if (data?.data?.url) return data.data.url;
    throw new Error('imgbb upload failed');
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this meal?')) return;
    try {
      await deleteDoc(doc(db, 'meals', id));
      toast.success('Meal deleted');
      setMeals(p => p.filter(m => m.id !== id));
    } catch {
      toast.error('Failed to delete meal');
    }
  };

  const handleToggleAvailability = async (meal) => {
    const newVal = !meal.isAvailable;
    try {
      await updateDoc(doc(db, 'meals', meal.id), { isAvailable: newVal });
      setMeals(p => p.map(m => m.id === meal.id ? { ...m, isAvailable: newVal } : m));
      toast.success('Availability updated');
    } catch {
      setMeals(p => p.map(m => m.id === meal.id ? { ...m, isAvailable: newVal } : m));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price) { toast.error('Please fill in required fields'); return; }
    setSaving(true);

    let imageUrl = imagePreview && !imageFile ? imagePreview : null;

    try {
      if (imageFile) {
        setImageUploading(true);
        imageUrl = await uploadImageToImgbb(imageFile);
        setImageUploading(false);
      }

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
        imageUrl: imageUrl || null,
        updatedAt: serverTimestamp(),
      };

      if (editId) {
        await updateDoc(doc(db, 'meals', editId), mealData);
        toast.success('Meal updated');
        setMeals(p => p.map(m => m.id === editId ? { ...m, ...mealData } : m));
      } else {
        const ref = await addDoc(collection(db, 'meals'), { ...mealData, createdAt: serverTimestamp() });
        toast.success('Meal added');
        setMeals(p => [...p, { ...mealData, id: ref.id }]);
      }
      setShowModal(false);
    } catch (err) {
      console.error(err);
      toast.error('Error saving meal');
    } finally {
      setSaving(false);
      setImageUploading(false);
    }
  };

  // --- Category management ---
  const handleOpenAddCat = () => {
    setEditCatId(null);
    setCatForm({ label: '', id: '' });
    setShowCatModal(true);
  };

  const handleOpenEditCat = (cat) => {
    setEditCatId(cat.id);
    setCatForm({ label: cat.label, id: cat.id });
    setShowCatModal(true);
  };

  const handleDeleteCat = async (catId) => {
    // Only allow deleting custom (non-built-in) categories
    if (CATEGORIES.find(c => c.id === catId)) { toast.error('Cannot delete a built-in category'); return; }
    if (!confirm('Delete this category?')) return;
    try {
      await deleteDoc(doc(db, 'categories', catId));
      setDbCategories(p => p.filter(c => c.id !== catId));
      setAllCategories(p => p.filter(c => c.id !== catId));
      toast.success('Category deleted');
    } catch {
      toast.error('Failed to delete category');
    }
  };

  const handleSaveCat = async (e) => {
    e.preventDefault();
    if (!catForm.label) { toast.error('Category name required'); return; }
    setSavingCat(true);
    const slugId = editCatId || catForm.label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const catData = { label: catForm.label, id: slugId, icon: '', slug: slugId };
    try {
      await setDoc(doc(db, 'categories', slugId), catData);
      if (editCatId) {
        setDbCategories(p => p.map(c => c.id === editCatId ? catData : c));
        setAllCategories(p => p.map(c => c.id === editCatId ? catData : c));
        toast.success('Category updated');
      } else {
        setDbCategories(p => [...p, catData]);
        setAllCategories(p => [...p, catData]);
        toast.success('Category added');
      }
      setShowCatModal(false);
    } catch {
      toast.error('Failed to save category');
    } finally {
      setSavingCat(false);
    }
  };

  const filtered = meals
    .filter(m => activeCategory === 'all' || m.category === activeCategory)
    .filter(m => !search || m.name.toLowerCase().includes(search.toLowerCase()));

  const getCatLabel = (id) => allCategories.find(c => c.id === id)?.label || id;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Meal Management</h1>
          <p className={styles.sub}>Create and configure daily menu offerings.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-ghost" onClick={handleOpenAddCat} id="admin-add-category" style={{ color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.12)' }}>
            <Tag size={16} /> Manage Categories
          </button>
          <button className="btn btn-primary" onClick={handleOpenAdd} id="admin-add-meal">
            <Plus size={18} /> Add New Meal
          </button>
        </div>
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
          <button className={`${styles.tab} ${activeCategory === 'all' ? styles.active : ''}`} onClick={() => setActiveCategory('all')}>All</button>
          {allCategories.map(c => (
            <button
              key={c.id}
              className={`${styles.tab} ${activeCategory === c.id ? styles.active : ''}`}
              onClick={() => setActiveCategory(c.id)}
            >
              {c.label}
            </button>
          ))}
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
                  <th>Image</th>
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
                      <div className={styles.thumbCell}>
                        {meal.imageUrl ? (
                          <img src={meal.imageUrl} alt={meal.name} className={styles.thumbImg} />
                        ) : (
                          <div className={styles.thumbPlaceholder}><ImageIcon size={16} /></div>
                        )}
                      </div>
                    </td>
                    <td>
                      <div>
                        <p className={styles.mealName}>{meal.name}</p>
                        <p className={styles.mealDesc}>{meal.description}</p>
                      </div>
                    </td>
                    <td><span className={styles.catBadge}>{getCatLabel(meal.category)}</span></td>
                    <td className={styles.dimText}>{meal.portionSize || '—'}</td>
                    <td className={styles.priceCell}>{formatPrice(meal.price)}</td>
                    <td>
                      <button
                        className={`${styles.statusToggle} ${meal.isAvailable ? styles.available : styles.unavailable}`}
                        onClick={() => handleToggleAvailability(meal)}
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
                  <tr><td colSpan={8} className={styles.empty}>No meals found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add/Edit Meal Modal */}
      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal} style={{ maxWidth: '560px' }}>
            <div className={styles.modalHead}>
              <h2>{editId ? 'Edit Meal' : 'Add New Meal'}</h2>
              <button className={styles.modalClose} onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSave} className={styles.modalForm}>
              {/* Image Upload */}
              <div className={styles.imageUploadArea}>
                <p className={styles.imageUploadLabel}>Meal Photo</p>
                <div className={styles.imageUploadRow}>
                  {imagePreview ? (
                    <div className={styles.previewBox}>
                      <img src={imagePreview} alt="Preview" className={styles.previewImg} />
                      <button type="button" className={styles.removeImg} onClick={() => { setImageFile(null); setImagePreview(null); }}>
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <div className={styles.uploadPlaceholder} onClick={() => fileInputRef.current?.click()}>
                      <ImageIcon size={24} style={{ color: 'rgba(255,255,255,0.3)' }} />
                      <span>Click to upload image</span>
                      <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)' }}>Uploaded to ImgBB</span>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className={styles.hiddenFileInput}
                    id="meal-image-upload"
                  />
                  {!imagePreview && (
                    <button type="button" className={styles.uploadTrigger} onClick={() => fileInputRef.current?.click()}>
                      <Plus size={14} /> Choose Image
                    </button>
                  )}
                </div>
              </div>

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
                  <select id="modal-meal-category" className={`form-input ${styles.lightSelect}`} value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                    {allCategories.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
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
                <button type="submit" className="btn btn-primary" disabled={saving || imageUploading} id="modal-meal-save">
                  {(saving || imageUploading) ? <Loader2 className={styles.spin} size={16} /> : null}
                  {saving ? 'Saving...' : imageUploading ? 'Uploading Image...' : editId ? 'Save Changes' : 'Create Meal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Management Modal */}
      {showCatModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHead}>
              <h2>Manage Categories</h2>
              <button className={styles.modalClose} onClick={() => setShowCatModal(false)}>×</button>
            </div>
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Existing categories list */}
              <div>
                <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.75rem' }}>All Categories</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {allCategories.map(cat => {
                    const isBuiltIn = !!CATEGORIES.find(c => c.id === cat.id);
                    return (
                      <div key={cat.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.625rem 0.875rem', background: 'rgba(255,255,255,0.04)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <div>
                          <span style={{ color: 'white', fontWeight: 600, fontSize: '0.875rem' }}>{cat.label}</span>
                          <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.7rem', marginLeft: '0.5rem' }}>{cat.id}</span>
                          {isBuiltIn && <span style={{ marginLeft: '0.5rem', fontSize: '0.65rem', color: '#22c55e', background: 'rgba(34,197,94,0.1)', padding: '1px 6px', borderRadius: '4px' }}>built-in</span>}
                        </div>
                        {!isBuiltIn && (
                          <button className={`${styles.actionBtn} ${styles.delete}`} onClick={() => handleDeleteCat(cat.id)} title="Delete category"><Trash2 size={13} /></button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Add new category */}
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1.25rem' }}>
                <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.75rem' }}>Add New Category</p>
                <form onSubmit={handleSaveCat} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end' }}>
                  <div className="form-group" style={{ flex: 1, margin: 0 }}>
                    <input
                      className={`form-input ${styles.lightSelectInput}`}
                      value={catForm.label}
                      onChange={e => setCatForm({ label: e.target.value, id: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-') })}
                      placeholder="e.g. Wraps & Sandwiches"
                      required
                    />
                  </div>
                  <button type="submit" className="btn btn-primary" disabled={savingCat} style={{ flexShrink: 0 }}>
                    {savingCat ? <Loader2 size={15} className={styles.spin} /> : <Plus size={15} />} Add
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
