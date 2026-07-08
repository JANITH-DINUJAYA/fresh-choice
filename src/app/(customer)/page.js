'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { collection, getDocs, query, where, limit, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { CATEGORIES } from '@/lib/constants';
import MealCard from '@/components/customer/MealCard';
import CategoryIcon from '@/components/customer/CategoryIcon';
import { Leaf, Clock, Shield, ArrowRight, Truck, Phone, Star, CheckCircle, Package } from 'lucide-react';
import styles from './page.module.css';

const SAMPLE_MEALS = [
  { id: 's1', name: 'Garden Fresh Salad', price: 850, category: 'salads', description: 'Crisp greens, cherry tomatoes, cucumber with house dressing', isAvailable: true, badge: 'Popular', rating: 4.8, stock: 15 },
  { id: 's2', name: 'Sri Lankan Rice & Curry', price: 650, category: 'rice-curry', description: 'Fragrant rice with authentic curry, dhal and papadam', isAvailable: true, rating: 4.9, stock: 8 },
  { id: 's3', name: 'Protein Power Bowl', price: 950, category: 'bowls', description: 'Quinoa, grilled veggies, chickpeas and tahini drizzle', isAvailable: true, badge: 'New', rating: 4.7, stock: 3 },
  { id: 's4', name: 'Green Detox Smoothie', price: 380, category: 'drinks', description: 'Spinach, banana, cucumber, ginger and coconut water', isAvailable: true, rating: 4.6, stock: 25 },
  { id: 's5', name: 'Avocado Chicken Salad', price: 1100, category: 'salads', description: 'Grilled chicken, avocado, rocket leaves, lemon vinaigrette', isAvailable: true, badge: 'Chef Pick', rating: 4.9, stock: 5 },
  { id: 's6', name: 'Veggie Whole Wheat Wrap', price: 480, category: 'snacks', description: 'Hummus, roasted veg, feta in a toasted wrap', isAvailable: true, rating: 4.5, stock: 12 },
];

const TESTIMONIALS = [
  { name: 'Asel Perera', location: 'Colombo 7', text: 'Fresh Choice changed my lunch routine completely! Everything tastes homemade because it is.', rating: 5 },
  { name: 'Dinesh Karunarathne', location: 'Nugegoda', text: "Best rice and curry delivery in Colombo. Tastes exactly like Amma's cooking!", rating: 5 },
  { name: 'Kavindi Silva', location: 'Maharagama', text: 'Finally healthy food that actually tastes amazing. The salads are so fresh!', rating: 5 },
];

const HOW_IT_WORKS = [
  { step: '01', icon: <Package size={28} />, title: 'Browse Menu', desc: 'Explore our fresh daily menu — made from scratch every morning.' },
  { step: '02', icon: <CheckCircle size={28} />, title: 'Place Order', desc: 'Pick your meals, choose delivery or schedule ahead, checkout in seconds.' },
  { step: '03', icon: <Clock size={28} />, title: 'We Prepare', desc: 'Your meal is cooked fresh right after your order — never pre-packaged.' },
  { step: '04', icon: <Truck size={28} />, title: 'Fast Delivery', desc: 'Hot and fresh to your door across Colombo, right on schedule.' },
];

export default function HomePage() {
  const [meals, setMeals] = useState(SAMPLE_MEALS);
  const [allCategories, setAllCategories] = useState(CATEGORIES);
  const [activeCategory, setActiveCategory] = useState('all');
  const [heroVisible, setHeroVisible] = useState(false);

  useEffect(() => {
    setHeroVisible(true);
    fetchFeaturedMeals();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const catSnap = await getDocs(collection(db, 'categories'));
      const customCats = catSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      // Let Firestore override built-ins so imageUrl and custom edits are preserved
      const firestoreMap = Object.fromEntries(customCats.map(c => [c.id, c]));
      const merged = CATEGORIES.map(b => firestoreMap[b.id] ? { ...b, ...firestoreMap[b.id] } : b);
      for (const c of customCats) {
        if (!merged.find(m => m.id === c.id)) merged.push(c);
      }
      setAllCategories(merged);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchFeaturedMeals = async () => {
    try {
      const q = query(collection(db, 'meals'), where('isAvailable', '==', true), limit(6));
      const snap = await getDocs(q);
      if (!snap.empty) {
        setMeals(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      }
    } catch {}
  };

  const filteredMeals = activeCategory === 'all'
    ? meals
    : meals.filter(m => m.category === activeCategory);

  return (
    <>
      {/* ======================== HERO ======================== */}
      <section className={styles.hero}>
        <div className={styles.heroBg}>
          <div className={styles.heroBgOverlay} />
          <Image
            src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1920&q=80"
            alt="Healthy Food Spread Background"
            fill
            priority
            style={{ objectFit: 'cover' }}
            className={styles.heroBgImg}
          />
        </div>

        <div className={`container ${styles.heroContent} ${heroVisible ? styles.heroVisible : ''}`}>
          <div className={styles.heroPill}>
            <Leaf size={12} /> Freshly Made Daily in Colombo
          </div>
          <h1 className={`heading-hero ${styles.heroTitle}`}>
            Eat Fresh.<br />
            <em>Live Better.</em>
          </h1>
          <p className={styles.heroSub}>
            Homemade healthy meals crafted with fresh ingredients — salads, rice &amp; curry, and more — delivered to your door.
          </p>
          <div className={styles.heroActions}>
            <Link href="/menu" className="btn btn-primary btn-lg" id="hero-order-btn">
              Order Now <ArrowRight size={18} />
            </Link>
            <Link href="/about" className={`btn btn-lg ${styles.btnOutlineHero}`} id="hero-about-btn">
              Our Story
            </Link>
          </div>

          <div className={styles.heroStats}>
            <div className={styles.stat}>
              <span className={styles.statNum}>500+</span>
              <span className={styles.statLabel}>Happy Customers</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.stat}>
              <span className={styles.statNum}>30+</span>
              <span className={styles.statLabel}>Fresh Meals</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.stat}>
              <span className={styles.statNum}>4.9</span>
              <span className={styles.statLabel}>Avg. Rating</span>
            </div>
          </div>
        </div>

        <div className={styles.scrollIndicator}>
          <span>Scroll</span>
          <div className={styles.scrollLine} />
        </div>
      </section>

      {/* ======================== FEATURES STRIP ======================== */}
      <section className={styles.features}>
        <div className="container">
          <div className={styles.featuresGrid}>
            {[
              { icon: <Leaf size={22} />, title: 'Fresh Ingredients', desc: 'Sourced fresh daily, no preservatives' },
              { icon: <Clock size={22} />, title: 'On-Time Delivery', desc: 'Delivered hot and fresh to your door' },
              { icon: <Shield size={22} />, title: 'Hygiene Assured', desc: 'Prepared in a clean, hygienic kitchen' },
              { icon: <Truck size={22} />, title: 'Zone Delivery', desc: 'Covering Colombo & suburbs' },
            ].map((f, i) => (
              <div key={i} className={styles.featureCard}>
                <div className={styles.featureIcon}>{f.icon}</div>
                <h3 className={styles.featureTitle}>{f.title}</h3>
                <p className={styles.featureDesc}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======================== CATEGORIES — PHOTO GRID ======================== */}
      <section className={styles.categories}>
        <div className={styles.catLayout}>
          {/* Left text column */}
          <div className={styles.catTextCol}>
            <p className={styles.sectionEyebrow}>Explore</p>
            <h2 className={styles.catHeading}>What We<br />Offer</h2>
            <p className={styles.catSubText}>Fresh, wholesome meals across categories — crafted daily with love in Colombo.</p>
            <Link href="/menu" className={styles.catViewAll} id="cat-view-gallery-btn">
              View Full Menu <ArrowRight size={14} />
            </Link>
          </div>

          {/* Right photo grid */}
          <div className={styles.catPhotoGrid}>
            {allCategories.slice(0, 8).map((cat) => (
              <Link
                key={cat.id}
                href={`/menu?cat=${cat.slug}`}
                className={styles.catPhotoTile}
                id={`category-${cat.id}`}
              >
                {cat.imageUrl ? (
                  <img
                    src={cat.imageUrl}
                    alt={cat.label}
                    className={styles.catTileImg}
                  />
                ) : (
                  <div className={styles.catTilePlaceholder}>
                    <div className={styles.catTilePlaceholderIcon}>
                      <CategoryIcon name={cat.icon} size={36} />
                    </div>
                  </div>
                )}
                <div className={styles.catTileOverlay} />
                <div className={styles.catTileText}>
                  <span className={styles.catTileName}>{cat.label}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ======================== HOW IT WORKS ======================== */}
      <section className={styles.howItWorks}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <p className={styles.sectionEyebrow}>Simple Process</p>
            <h2 className="heading-xl">How It Works</h2>
            <p className={styles.sectionSub}>From click to your door in 4 easy steps</p>
          </div>
          <div className={styles.stepsGrid}>
            {HOW_IT_WORKS.map((step, i) => (
              <div key={i} className={styles.stepCard}>
                <div className={styles.stepNum}>{step.step}</div>
                <div className={styles.stepIcon}>{step.icon}</div>
                <h3 className={styles.stepTitle}>{step.title}</h3>
                <p className={styles.stepDesc}>{step.desc}</p>
                {i < HOW_IT_WORKS.length - 1 && <div className={styles.stepConnector} />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======================== FEATURED MEALS ======================== */}
      <section className={styles.featured}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <p className={styles.sectionEyebrow}>Today's Menu</p>
            <h2 className="heading-xl">Bestsellers</h2>
            <p className={styles.sectionSub}>Made fresh every morning, limited quantities available</p>
          </div>

          {/* Category filter */}
          <div className={styles.filterRow}>
            <button
              className={`${styles.filterBtn} ${activeCategory === 'all' ? styles.active : ''}`}
              onClick={() => setActiveCategory('all')}
              id="filter-all"
            >
              All
            </button>
            {allCategories.map(cat => (
              <button
                key={cat.id}
                className={`${styles.filterBtn} ${activeCategory === cat.id ? styles.active : ''}`}
                onClick={() => setActiveCategory(cat.id)}
                id={`filter-${cat.id}`}
              >
                <CategoryIcon name={cat.icon} size={14} /> {cat.label}
              </button>
            ))}
          </div>

          <div className={styles.mealsGrid}>
            {filteredMeals.slice(0, 6).map(meal => (
              <MealCard key={meal.id} meal={meal} />
            ))}
          </div>

          <div className={styles.viewAll}>
            <Link href="/menu" className="btn btn-outline btn-lg" id="home-view-all-btn">
              View Full Menu <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* ======================== STATS BANNER ======================== */}
      <section className={styles.statsBanner}>
        <div className="container">
          <div className={styles.statsBannerGrid}>
            {[
              { num: '500+', label: 'Orders Delivered', icon: <Truck size={24} /> },
              { num: '4.9', label: 'Customer Rating', icon: <Star size={24} /> },
              { num: '100%', label: 'Homemade', icon: <Leaf size={24} /> },
              { num: '30+', label: 'Menu Items', icon: <Package size={24} /> },
            ].map((s, i) => (
              <div key={i} className={styles.statsBannerItem}>
                <div className={styles.statsBannerIcon}>{s.icon}</div>
                <span className={styles.statsBannerNum}>{s.num}</span>
                <span className={styles.statsBannerLabel}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======================== ABOUT TEASER ======================== */}
      <section className={styles.aboutTeaser}>
        <div className="container">
          <div className={styles.aboutGrid}>
            <div className={styles.aboutImgSide}>
              <div className={styles.aboutImgWrapper}>
                <Image
                  src="https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=800&q=80"
                  alt="Healthy food bowl prep"
                  fill
                  style={{ objectFit: 'cover' }}
                />
              </div>
              <div className={styles.aboutImgAccent}>
                <div className={styles.accentCard}>
                  <span className={styles.accentNum}>100%</span>
                  <span className={styles.accentLabel}>Homemade</span>
                </div>
              </div>
            </div>
            <div className={styles.aboutContent}>
              <p className={styles.sectionEyebrow}>Our Story</p>
              <h2 className="heading-xl">Food Made with Love, <em>Not Labels</em></h2>
              <p className={styles.aboutText}>
                Fresh Choice started as a passion project — bringing wholesome, honest food to busy people in Colombo.
                Every meal is prepared fresh each morning using locally sourced ingredients. No shortcuts, no preservatives.
              </p>
              <p className={styles.aboutText}>
                What began on TikTok as a small food venture has grown into a trusted homemade meal service loved by hundreds of families across Colombo.
              </p>
              <div className={styles.aboutBadges}>
                {['No Preservatives', 'Locally Sourced', 'Made Daily', 'Hygiene Certified'].map(b => (
                  <span key={b} className={styles.aboutBadge}><CheckCircle size={13} /> {b}</span>
                ))}
              </div>
              <Link href="/about" className="btn btn-primary" id="home-about-btn">
                Learn More <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ======================== TESTIMONIALS ======================== */}
      <section className={styles.testimonials}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <p className={`${styles.sectionEyebrow} ${styles.eyebrowLight}`}>Reviews</p>
            <h2 className={`heading-xl ${styles.testimonialTitle}`}>What Our Customers Say</h2>
          </div>
          <div className={styles.testimonialsGrid}>
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className={styles.testimonialCard}>
                <div className={styles.starRow}>
                  {Array.from({ length: t.rating }).map((_, s) => (
                    <Star key={s} size={14} fill="#d4b97a" color="#d4b97a" />
                  ))}
                </div>
                <p className={styles.testimonialText}>"{t.text}"</p>
                <div className={styles.testimonialAuthor}>
                  <div className={styles.authorAvatar}>{t.name[0]}</div>
                  <div>
                    <p className={styles.authorName}>{t.name}</p>
                    <p className={styles.authorLoc}>{t.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======================== CONTACT CTA ======================== */}
      <section className={styles.contactCta}>
        <div className="container">
          <div className={styles.contactCtaGrid}>
            <div className={styles.contactCtaText}>
              <p className={styles.sectionEyebrow}>Get In Touch</p>
              <h2 className="heading-lg">Have Questions?<br />We're Here to Help.</h2>
              <p className={styles.contactCtaSub}>Reach us on WhatsApp, TikTok or call us directly. We respond fast!</p>
            </div>
            <div className={styles.contactCtaActions}>
              <a href="tel:+94000000000" className="btn btn-primary btn-lg" id="cta-call-btn">
                <Phone size={18} /> Call Us
              </a>
              <Link href="/contact" className={`btn btn-outline btn-lg ${styles.contactBtnOutline}`} id="cta-contact-btn">
                Contact Page
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ======================== CTA BANNER ======================== */}
      <section className={styles.ctaBanner}>
        <div className="container">
          <div className={styles.ctaInner}>
            <div>
              <h2 className={`heading-lg ${styles.ctaTitle}`}>Ready to eat healthy today?</h2>
              <p className={styles.ctaSub}>Pre-schedule tomorrow's meal or order now for same-day delivery.</p>
            </div>
            <div className={styles.ctaActions}>
              <Link href="/menu" className="btn btn-white btn-lg" id="cta-order-btn">
                Order Now <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
