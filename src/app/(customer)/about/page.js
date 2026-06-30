import Image from 'next/image';
import { Heart, Users, Leaf, Award } from 'lucide-react';
import styles from './page.module.css';

export const metadata = { title: 'About Us — Fresh Choice', description: 'Learn about Fresh Choice, a homemade healthy meal service in Colombo, Sri Lanka.' };

export default function AboutPage() {
  return (
    <div className={styles.page}>
      {/* Hero */}
      <section className={styles.hero}>
        <div className="container">
          <p className={styles.eyebrow}>Our Story</p>
          <h1 className="heading-xl" style={{ color: 'white' }}>Food Made with <em style={{ color: 'var(--fc-green-300)', fontStyle: 'italic' }}>Heart</em></h1>
          <p className={styles.heroSub}>We believe healthy food should taste amazing. That's the Fresh Choice promise.</p>
        </div>
      </section>

      {/* Story */}
      <section className={styles.story}>
        <div className="container">
          <div className={styles.storyGrid}>
            <div className={styles.storyImg}>
              <div style={{ position: 'relative', width: '100%', height: '450px', borderRadius: 'var(--radius-xl)', overflow: 'hidden', boxShadow: 'var(--shadow-lg)' }}>
                <Image
                  src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=800&q=80"
                  alt="Fresh Choice Cooking Kitchen"
                  fill
                  style={{ objectFit: 'cover' }}
                />
              </div>
            </div>
            <div className={styles.storyContent}>
              <h2 className="heading-lg">How It All Began</h2>
              <p>Fresh Choice started as a passion for wholesome, honest food. Frustrated by the lack of truly healthy, homemade options available for delivery in Colombo, we decided to change that.</p>
              <p>What began as sharing recipes on TikTok quickly grew into a full-fledged meal service, driven by hundreds of customers who fell in love with the taste of real, homemade food.</p>
              <p>Every dish we prepare follows one simple rule: <strong>we only serve what we'd eat ourselves.</strong></p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className={styles.values}>
        <div className="container">
          <div className={styles.sectionHead}>
            <p className={styles.eyebrow}>What We Stand For</p>
            <h2 className="heading-lg">Our Values</h2>
          </div>
          <div className={styles.valuesGrid}>
            {[
              { icon: <Leaf size={28} />, title: 'Fresh First', desc: "Every ingredient is sourced fresh daily. No frozen shortcuts, no preservatives — just real food." },
              { icon: <Heart size={28} />, title: 'Made with Love', desc: "Cooking is an act of care. Every meal is prepared with the same attention we'd give food for our own family." },
              { icon: <Users size={28} />, title: 'Community Driven', desc: "Our menu evolves with your feedback. Your favourites stay, your suggestions inspire new dishes." },
              { icon: <Award size={28} />, title: 'Quality Guaranteed', desc: "If you're not happy, we're not happy. We stand behind every meal we deliver." },
            ].map((v, i) => (
              <div key={i} className={styles.valueCard}>
                <div className={styles.valueIcon}>{v.icon}</div>
                <h3 className={styles.valueTitle}>{v.title}</h3>
                <p className={styles.valueDesc}>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className={styles.statsSection}>
        <div className="container">
          <div className={styles.statsGrid}>
            {[
              { num: '500+', label: 'Happy Customers' },
              { num: '30+', label: 'Menu Items' },
              { num: '4.9★', label: 'Average Rating' },
              { num: '3', label: 'Delivery Zones' },
            ].map((s, i) => (
              <div key={i} className={styles.statCard}>
                <span className={styles.statNum}>{s.num}</span>
                <span className={styles.statLabel}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
