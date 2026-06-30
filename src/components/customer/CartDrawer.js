'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { X, Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { useCart } from '@/lib/cart';
import { formatPrice } from '@/lib/constants';
import styles from './CartDrawer.module.css';

export default function CartDrawer({ isOpen, onClose }) {
  const { items, subtotal, updateQty, removeItem, itemCount } = useCart();

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  return (
    <>
      <div className={`${styles.overlay} ${isOpen ? styles.open : ''}`} onClick={onClose} />
      <div className={`${styles.drawer} ${isOpen ? styles.open : ''}`} role="dialog" aria-label="Shopping cart">
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <ShoppingBag size={20} className={styles.headerIcon} />
            <h2 className={styles.title}>Your Cart</h2>
            {itemCount > 0 && <span className={styles.count}>{itemCount}</span>}
          </div>
          <button id="cart-close-btn" className={styles.closeBtn} onClick={onClose} aria-label="Close cart">
            <X size={20} />
          </button>
        </div>

        {/* Items */}
        <div className={styles.body}>
          {items.length === 0 ? (
            <div className={styles.empty}>
              <div className={styles.emptyIcon}>🛒</div>
              <p className={styles.emptyTitle}>Your cart is empty</p>
              <p className={styles.emptyText}>Add some delicious meals to get started!</p>
              <button className="btn btn-primary" onClick={onClose}>Browse Menu</button>
            </div>
          ) : (
            <ul className={styles.itemList}>
              {items.map(item => (
                <li key={item.id} className={styles.item}>
                  <div className={styles.itemImg}>
                    {item.image ? (
                      <Image src={item.image} alt={item.name} fill style={{ objectFit: 'cover' }} />
                    ) : (
                      <div className={styles.imgPlaceholder}>{item.category === 'salads' ? '🥗' : item.category === 'drinks' ? '🥤' : '🍛'}</div>
                    )}
                  </div>
                  <div className={styles.itemInfo}>
                    <p className={styles.itemName}>{item.name}</p>
                    <p className={styles.itemPrice}>{formatPrice(item.price)}</p>
                    <div className={styles.qtyRow}>
                      <button
                        className={styles.qtyBtn}
                        onClick={() => item.qty === 1 ? removeItem(item.id) : updateQty(item.id, item.qty - 1)}
                        aria-label="Decrease quantity"
                      >
                        <Minus size={14} />
                      </button>
                      <span className={styles.qty}>{item.qty}</span>
                      <button
                        className={styles.qtyBtn}
                        onClick={() => updateQty(item.id, item.qty + 1)}
                        aria-label="Increase quantity"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                  <div className={styles.itemRight}>
                    <p className={styles.itemTotal}>{formatPrice(item.price * item.qty)}</p>
                    <button
                      className={styles.removeBtn}
                      onClick={() => removeItem(item.id)}
                      aria-label="Remove item"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className={styles.footer}>
            <div className={styles.subtotal}>
              <span>Subtotal</span>
              <span className={styles.subtotalAmount}>{formatPrice(subtotal)}</span>
            </div>
            <p className={styles.deliveryNote}>Delivery fee calculated at checkout</p>
            <Link href="/checkout" className="btn btn-primary" style={{ width: '100%' }} onClick={onClose} id="cart-checkout-btn">
              Proceed to Checkout
            </Link>
            <button className={`btn btn-ghost ${styles.continueBtn}`} onClick={onClose}>
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </>
  );
}
