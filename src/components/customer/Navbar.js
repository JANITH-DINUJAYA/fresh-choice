'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Menu, X, User, LogOut, ChevronDown, Phone, Shield } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useCart } from '@/lib/cart';
import CartDrawer from './CartDrawer';
import styles from './Navbar.module.css';

export default function Navbar() {
  const { user, userProfile, signOut } = useAuth();
  const { itemCount } = useCart();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClick = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const navLinks = [
    { href: '/menu', label: 'Menu' },
    { href: '/orders', label: 'Track Order' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' },
  ];

  return (
    <>
      {/* Top Banner Announcement Bar */}
      <div className={styles.topBar}>
        <div className="container">
          <div className={styles.topBarInner}>
            <div className={styles.topBarContact}>
              <Phone size={12} />
              <a href="tel:+94000000000">+94 000 000 000</a>
            </div>
            <p className={styles.topBarText}>
              Free delivery on Colombo City orders above Rs. 2,000!
            </p>
            <div className={styles.topBarSocials}>
              <a href="https://www.tiktok.com/@fresh.choice.sl" target="_blank" rel="noopener noreferrer" className={styles.topBarLink}>
                Follow us on TikTok
              </a>
            </div>
          </div>
        </div>
      </div>

      <nav className={`${styles.navbar} ${isScrolled ? styles.scrolled : ''}`}>
        <div className="container">
          <div className={styles.inner}>
            {/* Logo */}
            <Link href="/" className={styles.logo}>
              <div className={styles.logoImgWrap}>
                <Image src="/logo.png" alt="Fresh Choice Logo" width={42} height={42} priority className={styles.logoImg} />
              </div>
              <span className={styles.logoText}>Fresh Choice</span>
            </Link>

            {/* Desktop Nav */}
            <ul className={styles.navLinks}>
              {navLinks.map(link => (
                <li key={link.href}>
                  <Link href={link.href} className={styles.navLink}>{link.label}</Link>
                </li>
              ))}
            </ul>

            {/* Actions */}
            <div className={styles.actions}>
              {/* Cart */}
              <button
                id="navbar-cart-btn"
                className={styles.cartBtn}
                onClick={() => setCartOpen(true)}
                aria-label="Open cart"
              >
                <ShoppingCart size={20} />
                {itemCount > 0 && (
                  <span className={styles.cartBadge}>{itemCount}</span>
                )}
              </button>

              {/* User Dropdown */}
              {user ? (
                <div className={styles.userMenu} ref={userMenuRef}>
                  <button
                    id="navbar-user-btn"
                    className={styles.userBtn}
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                  >
                    <User size={18} />
                    <span className={styles.userNameText}>{userProfile?.name?.split(' ')[0] || 'Account'}</span>
                    <ChevronDown size={14} />
                  </button>
                  {userMenuOpen && (
                    <div className={styles.dropdown}>
                      <Link href="/orders" className={styles.dropdownItem} onClick={() => setUserMenuOpen(false)}>
                        My Orders
                      </Link>
                      {['super_admin', 'admin', 'staff'].includes(userProfile?.role) && (
                        <Link href="/admin/dashboard" className={styles.dropdownItem} onClick={() => setUserMenuOpen(false)}>
                          <Shield size={14} /> Admin Panel
                        </Link>
                      )}
                      <button
                        className={styles.dropdownItem}
                        onClick={async () => { await signOut(); setUserMenuOpen(false); }}
                      >
                        <LogOut size={14} />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link href="/login" className="btn btn-primary btn-sm" id="navbar-login-btn">
                  Sign In
                </Link>
              )}

              {/* Mobile Toggle */}
              <button
                id="navbar-mobile-toggle"
                className={styles.mobileToggle}
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label="Toggle menu"
              >
                {mobileOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className={`${styles.mobileMenu} ${mobileOpen ? styles.mobileOpen : ''}`}>
        <ul className={styles.mobileLinks}>
          {navLinks.map(link => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={styles.mobileLink}
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            </li>
          ))}
          {user ? (
            <>
              <li>
                <Link href="/orders" className={styles.mobileLink} onClick={() => setMobileOpen(false)}>
                  My Orders
                </Link>
              </li>
              {['super_admin', 'admin', 'staff'].includes(userProfile?.role) && (
                <li>
                  <Link href="/admin/dashboard" className={styles.mobileLink} onClick={() => setMobileOpen(false)}>
                    Admin Panel
                  </Link>
                </li>
              )}
              <li>
                <button
                  className={styles.mobileLinkBtn}
                  onClick={async () => { await signOut(); setMobileOpen(false); }}
                >
                  Sign Out
                </button>
              </li>
            </>
          ) : (
            <li>
              <Link href="/login" className="btn btn-primary btn-lg" onClick={() => setMobileOpen(false)}>
                Sign In
              </Link>
            </li>
          )}
        </ul>
      </div>
      {mobileOpen && <div className={styles.overlay} onClick={() => setMobileOpen(false)} />}

      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
