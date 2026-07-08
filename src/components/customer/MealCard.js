'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, Clock } from 'lucide-react';
import { useCart } from '@/lib/cart';
import { formatPrice } from '@/lib/constants';
import toast from 'react-hot-toast';
import CategoryIcon from './CategoryIcon';
import styles from './MealCard.module.css';

const UNSPLASH_IMAGES = {
  salads: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80',
  'rice-curry': 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80',
  bowls: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
  drinks: 'https://images.unsplash.com/photo-1610970881699-44a5587caa9a?auto=format&fit=crop&w=800&q=80',
  snacks: 'https://images.unsplash.com/photo-1626700051175-6518c4793f4f?auto=format&fit=crop&w=800&q=80',
};

export default function MealCard({ meal }) {
  const { addItem } = useCart();

  const handleAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!meal.isAvailable || meal.stock === 0) return;
    addItem({
      id: meal.id,
      name: meal.name,
      price: meal.price,
      image: meal.images?.[0] || UNSPLASH_IMAGES[meal.category] || null,
      category: meal.category,
    });
    toast.success(`${meal.name} added to cart!`, { duration: 2000 });
  };

  const imageSrc = meal.imageUrl || UNSPLASH_IMAGES[meal.category] || '/logo.png';
  const isImgbb = imageSrc && imageSrc.includes('ibb.co');
  const isOutOfStock = !meal.isAvailable || meal.stock === 0;
  const isLowStock = meal.stock > 0 && meal.stock <= 10;

  return (
    <Link href={`/menu/${meal.id}`} className={styles.card} id={`meal-card-${meal.id}`}>
      {/* Image */}
      <div className={styles.imgWrapper}>
        <div className={styles.imageOverlay} />
        {isImgbb ? (
          // Use regular img for ImgBB uploaded images (avoids Next.js optimizer)
          <img
            src={imageSrc}
            alt={meal.name}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
            className={styles.mealImg}
          />
        ) : (
          <Image
            src={imageSrc}
            alt={meal.name}
            fill
            style={{ objectFit: 'cover' }}
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className={styles.mealImg}
          />
        )}
        
        {isOutOfStock ? (
          <div className={styles.soldOut}>Sold Out</div>
        ) : isLowStock ? (
          <div className={styles.lowStockBadge}>Only {meal.stock} Left!</div>
        ) : null}

        {meal.badge && !isOutOfStock && (
          <div className={styles.badge}>{meal.badge}</div>
        )}
        
        <button
          className={styles.addBtn}
          onClick={handleAdd}
          disabled={isOutOfStock}
          aria-label={`Add ${meal.name} to cart`}
          id={`add-to-cart-${meal.id}`}
        >
          <ShoppingCart size={16} />
          Add
        </button>
      </div>

      {/* Content */}
      <div className={styles.content}>
        <div className={styles.meta}>
          <span className={styles.category}>
            <CategoryIcon name={meal.category === 'rice-curry' ? 'utensils' : meal.category} size={12} />
            <span className={styles.categoryText}>{meal.category?.replace('-', ' ')}</span>
          </span>
          {meal.portionSize && (
            <span className={styles.portion}>
              <Clock size={11} /> {meal.portionSize}
            </span>
          )}
        </div>
        <h3 className={styles.name}>{meal.name}</h3>
        {meal.description && (
          <p className={styles.desc}>{meal.description}</p>
        )}
        <div className={styles.footer}>
          <span className={styles.price}>{formatPrice(meal.price)}</span>
          {meal.rating && (
            <span className={styles.rating}>
              {meal.rating}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
