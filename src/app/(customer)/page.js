'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { collection, getDocs, query, where, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { CATEGORIES } from '@/lib/constants';
import MealCard from '@/components/customer/MealCard';
import CategoryIcon from '@/components/customer/CategoryIcon';
import { ChevronRight, Leaf, Clock, Shield, ArrowRight, Truck } from 'lucide-react';
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
  { name: 'Dinesh Karunarathne', location: 'Nugegoda', text: 'Best rice and curry delivery in Colombo. Tastes exactly like Amma\'s cooking!', rating: 5 },
  { name: 'Kavindi Silva', location: 'Maharagama', text: 'Finally healthy food that actually tastes amazing. The salads are so fresh!', rating: 5 },
];

export default function HomePage() {
  const [meals, setMeals] = useState(SAMPLE_MEALS);
  const [activeCategory, setActiveCategory] = useState('all');
  const [heroVisible, setHeroVisible] = useState(false);

  useEffect(() => {
    setHeroVisible(true);
    fetchFeaturedMeals();
  }, []);

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
            Homemade healthy meals crafted with fresh ingredients — salads, rice & curry, and more — delivered to your door.
          </p>
          <div className={styles.heroActions}>
            <Link href="/menu" className="btn btn-primary btn-lg" id="hero-order-btn">
              Order Now <ArrowRight size={18} />
            </Link>
            <Link href="/about" className={`btn btn-white btn-lg ${styles.btnOutlineHero}`} id="hero-about-btn">
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

      {/* ======================== FEATURES ======================== */}
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

      {/* ======================== CATEGORIES ======================== */}
      <section className={styles.categories}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <p className={styles.sectionEyebrow}>Explore</p>
            <h2 className="heading-xl">What We Offer</h2>
          </div>
          <div className={styles.categoryGrid}>
            {CATEGORIES.map(cat => (
              <Link
                key={cat.id}
                href={`/menu?cat=${cat.slug}`}
                className={styles.categoryCard}
                id={`category-${cat.id}`}
              >
                <span className={styles.catIcon}>
                  <CategoryIcon name={cat.icon} size={28} />
                </span>
                <span className={styles.catLabel}>{cat.label}</span>
                <ChevronRight size={16} className={styles.catArrow} />
              </Link>
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
            {CATEGORIES.map(cat => (
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
                {/* Emojis/Stars removed from ratings */}
                <div className={styles.ratingText}>
                  Rating: {t.rating}/5
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
              <Link href="/contact" className="btn btn-outline" style={{ borderColor: 'rgba(255,255,255,0.5)', color: 'white' }} id="cta-contact-btn">
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
