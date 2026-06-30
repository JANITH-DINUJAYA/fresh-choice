'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useCart } from '@/lib/cart';
import { formatPrice } from '@/lib/constants';
import toast from 'react-hot-toast';
import { ArrowLeft, ShoppingCart, Clock, ShieldCheck, Heart, Share2, Sparkles } from 'lucide-react';
import styles from './page.module.css';

const SAMPLE_MEALS = {
  s1: { id: 's1', name: 'Garden Fresh Salad', price: 850, category: 'salads', description: 'A refreshing mix of seasonal organic greens, cherry tomatoes, crisp cucumber, shredded carrots, and red onions. Served with our chef\'s signature house lemon-vinaigrette dressing on the side.', ingredients: ['Organic Lettuce', 'Cherry Tomatoes', 'English Cucumber', 'Red Onions', 'Lemon-Vinaigrette'], portionSize: 'Regular (350g)', isAvailable: true, badge: 'Popular', rating: 4.8 },
  s2: { id: 's2', name: 'Sri Lankan Rice & Curry', price: 650, category: 'rice-curry', description: 'Fragrant red basmati rice served with three traditional vegetable curries, a flavorful dhal curry, crispy papadam, and coconut sambol. Cooked using stone-pressed coconut oil.', ingredients: ['Red Basmati Rice', 'Dhal Curry', 'Pol Sambol', 'Gotukola Mallum', 'Papadam'], portionSize: 'Full Plate', isAvailable: true, rating: 4.9 },
  s3: { id: 's3', name: 'Protein Power Bowl', price: 950, category: 'bowls', description: 'High-protein grain bowl packed with organic quinoa, roasted chickpeas, grilled seasonal vegetables, avocado slices, and a rich, creamy tahini dressing.', ingredients: ['Quinoa', 'Chickpeas', 'Avocado', 'Broccoli', 'Tahini Dressing'], portionSize: 'Regular (400g)', isAvailable: true, badge: 'New' },
  s4: { id: 's4', name: 'Green Detox Smoothie', price: 380, category: 'drinks', description: 'A nutrient-dense blend of organic baby spinach, ripe banana, crisp cucumber, fresh ginger root, lime juice, and pure coconut water. No added sugar.', ingredients: ['Spinach', 'Banana', 'Ginger', 'Coconut Water', 'Lime'], portionSize: '350ml Glass', isAvailable: true },
  s5: { id: 's5', name: 'Avocado Chicken Salad', price: 1100, category: 'salads', description: 'Tender grilled chicken breast strips tossed with ripe avocado slices, fresh baby rocket leaves, cucumber, walnuts, and a zesty lemon-herb dressing.', ingredients: ['Grilled Chicken', 'Avocado', 'Rocket Leaves', 'Walnuts', 'Lemon Vinaigrette'], portionSize: 'Large (420g)', isAvailable: true, badge: 'Chef Pick' },
  s6: { id: 's6', name: 'Veggie Whole Wheat Wrap', price: 480, category: 'snacks', description: 'Toasted whole wheat tortilla wrap filled with organic chickpea hummus, roasted bell peppers, zucchini, kalamata olives, and crumbled Greek feta cheese.', ingredients: ['Whole Wheat Tortilla', 'Hummus', 'Roasted Bell Peppers', 'Zucchini', 'Feta Cheese'], portionSize: 'Regular Size', isAvailable: true },
};

export default function MealDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { addItem } = useCart();
  const [meal, setMeal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    fetchMeal();
  }, [id]);

  const fetchMeal = async () => {
    try {
      const docRef = doc(db, 'meals', id);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        setMeal({ id: snap.id, ...snap.data() });
      } else if (SAMPLE_MEALS[id]) {
        setMeal(SAMPLE_MEALS[id]);
      }
    } catch (err) {
      console.error('Error fetching meal:', err);
      if (SAMPLE_MEALS[id]) setMeal(SAMPLE_MEALS[id]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!meal || !meal.isAvailable) return;
    for (let i = 0; i < qty; i++) {
      addItem({
        id: meal.id,
        name: meal.name,
        price: meal.price,
        image: meal.images?.[0] || null,
        category: meal.category,
      });
    }
    toast.success(`${qty} × ${meal.name} added to cart!`);
  };

  if (loading) {
    return (
      <div className="loading-page">
        <div className="spinner" />
        <p>Loading meal details...</p>
      </div>
    );
  }

  if (!meal) {
    return (
      <div className={styles.errorPage}>
        <h2>Meal Not Found</h2>
        <p>The meal you are looking for does not exist or has been removed.</p>
        <Link href="/menu" className="btn btn-primary">Back to Menu</Link>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className="container">
        <Link href="/menu" className={styles.backLink} id="meal-detail-back">
          <ArrowLeft size={16} /> Back to Menu
        </Link>

        <div className={styles.grid}>
          {/* Left: Image */}
          <div className={styles.imageSection}>
            <div className={styles.imageContainer}>
              {meal.images?.[0] ? (
                <Image
                  src={meal.images[0]}
                  alt={meal.name}
                  fill
                  style={{ objectFit: 'cover' }}
                  priority
                />
              ) : (
                <div className={styles.imagePlaceholder}>
                  {meal.category === 'salads' ? '🥗' : meal.category === 'rice-curry' ? '🍛' : '🥙'}
                </div>
              )}
              {meal.badge && <span className={styles.badge}>{meal.badge}</span>}
            </div>
          </div>

          {/* Right: Info */}
          <div className={styles.infoSection}>
            <p className={styles.category}>{meal.category?.replace('-', ' ')}</p>
            <h1 className={`heading-lg ${styles.name}`}>{meal.name}</h1>
            
            <div className={styles.meta}>
              {meal.rating && (
                <span className={styles.rating}>
                  ★ {meal.rating}
                </span>
              )}
              {meal.portionSize && (
                <span className={styles.metaItem}>
                  <Clock size={14} /> {meal.portionSize}
                </span>
              )}
            </div>

            <p className={styles.price}>{formatPrice(meal.price)}</p>

            <p className={styles.desc}>{meal.description}</p>

            {meal.ingredients && meal.ingredients.length > 0 && (
              <div className={styles.ingredientsSection}>
                <h3 className={styles.sectionTitle}>Key Ingredients</h3>
                <div className={styles.ingredientsList}>
                  {meal.ingredients.map((ing, index) => (
                    <span key={index} className={styles.ingredientTag}>{ing}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Quality assurances */}
            <div className={styles.assurances}>
              <div className={styles.assuranceItem}>
                <ShieldCheck size={16} className={styles.assuranceIcon} />
                <span>100% Hygienic & Homemade</span>
              </div>
              <div className={styles.assuranceItem}>
                <Sparkles size={16} className={styles.assuranceIcon} />
                <span>Freshly Prepared Today</span>
              </div>
            </div>

            {/* Actions */}
            {meal.isAvailable ? (
              <div className={styles.actionRow}>
                <div className={styles.qtySelector}>
                  <button className={styles.qtyBtn} onClick={() => setQty(q => Math.max(1, q - 1))} id="qty-dec">-</button>
                  <span className={styles.qtyValue}>{qty}</span>
                  <button className={styles.qtyBtn} onClick={() => setQty(q => q + 1)} id="qty-inc">+</button>
                </div>
                <button
                  className="btn btn-primary"
                  onClick={handleAddToCart}
                  style={{ flex: 1 }}
                  id="add-to-cart-detail"
                >
                  <ShoppingCart size={18} /> Add to Cart — {formatPrice(meal.price * qty)}
                </button>
              </div>
            ) : (
              <div className={styles.soldOut}>
                This meal is currently sold out for today. Please check back tomorrow!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
