import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import styles from './Footer.module.css';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className={styles.footer}>
      <div className={styles.waveTop}>
        <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <path d="M0 60L48 50C96 40 192 20 288 15C384 10 480 20 576 27.5C672 35 768 40 864 37.5C960 35 1056 25 1152 20C1248 15 1344 15 1392 15L1440 15V60H1392C1344 60 1248 60 1152 60C1056 60 960 60 864 60C768 60 672 60 576 60C480 60 384 60 288 60C192 60 96 60 48 60H0V60Z" fill="#1a2e1a"/>
        </svg>
      </div>
      <div className={styles.main}>
        <div className="container">
          <div className={styles.grid}>
            {/* Brand */}
            <div className={styles.brand}>
              <Link href="/" className={styles.logo}>
                <Image src="/logo.png" alt="Fresh Choice" width={56} height={56} />
                <span>Fresh Choice</span>
              </Link>
              <p className={styles.tagline}>Freshly made, Simply better.</p>
              <p className={styles.desc}>
                Homemade healthy meals crafted with love and fresh ingredients, delivered to your door in Colombo.
              </p>
              <div className={styles.socials}>
                <a href="https://www.tiktok.com/@fresh.choice.sl" target="_blank" rel="noopener noreferrer" className={styles.socialBtn} aria-label="TikTok" id="footer-tiktok">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.28 8.28 0 0 0 4.84 1.55V6.79a4.85 4.85 0 0 1-1.07-.1z"/></svg>
                </a>
                <a href="#" className={styles.socialBtn} aria-label="Instagram" id="footer-instagram">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                </a>
                <a href="#" className={styles.socialBtn} aria-label="Facebook" id="footer-facebook">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                </a>
              </div>
            </div>

            {/* Links */}
            <div className={styles.linkGroup}>
              <h4 className={styles.groupTitle}>Quick Links</h4>
              <ul className={styles.links}>
                {[
                  { href: '/', label: 'Home' }, { href: '/menu', label: 'Menu' },
                  { href: '/about', label: 'About Us' }, { href: '/contact', label: 'Contact' },
                  { href: '/orders', label: 'Track Order' },
                ].map(l => (
                  <li key={l.href}><Link href={l.href} className={styles.link}>{l.label}</Link></li>
                ))}
              </ul>
            </div>

            {/* Categories */}
            <div className={styles.linkGroup}>
              <h4 className={styles.groupTitle}>Our Menu</h4>
              <ul className={styles.links}>
                {[
                  { href: '/menu?cat=salads', label: '🥗 Salads' },
                  { href: '/menu?cat=rice-curry', label: '🍛 Rice & Curry' },
                  { href: '/menu?cat=bowls', label: '🥙 Healthy Bowls' },
                  { href: '/menu?cat=drinks', label: '🥤 Drinks' },
                  { href: '/menu?cat=snacks', label: '🥪 Snacks' },
                ].map(l => (
                  <li key={l.href}><Link href={l.href} className={styles.link}>{l.label}</Link></li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div className={styles.linkGroup}>
              <h4 className={styles.groupTitle}>Contact Us</h4>
              <ul className={styles.contactList}>
                <li className={styles.contactItem}><MapPin size={15} /><span>Colombo, Sri Lanka</span></li>
                <li className={styles.contactItem}><Phone size={15} /><a href="tel:+94000000000">+94 000 000 000</a></li>
                <li className={styles.contactItem}><Mail size={15} /><a href="mailto:hello@freshchoice.lk">hello@freshchoice.lk</a></li>
                <li className={styles.contactItem}><Clock size={15} /><span>Mon–Sat, 9AM – 8PM</span></li>
              </ul>
            </div>
          </div>

          <div className={styles.bottom}>
            <p className={styles.copy}>© {currentYear} Fresh Choice. All rights reserved. Made with ❤️ in Sri Lanka.</p>
            <div className={styles.bottomLinks}>
              <Link href="/privacy" className={styles.bottomLink}>Privacy Policy</Link>
              <Link href="/terms" className={styles.bottomLink}>Terms of Service</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
