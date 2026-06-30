'use client';

import { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { DELIVERY_ZONES } from '@/lib/constants';
import toast from 'react-hot-toast';
import { MapPin, Phone, Clock, Send, MessageCircle } from 'lucide-react';
import styles from './page.module.css';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, 'contactMessages'), { ...form, createdAt: serverTimestamp(), status: 'unread' });
      setSent(true);
      toast.success('Message sent! We\'ll reply within 24 hours.');
      setForm({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch {
      toast.error('Failed to send message. Please try WhatsApp directly.');
    } finally { setLoading(false); }
  };

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div className="container">
          <p className={styles.eyebrow}>Get in Touch</p>
          <h1 className="heading-xl" style={{ color: 'white' }}>Contact Us</h1>
          <p className={styles.headerSub}>We'd love to hear from you. Send us a message and we'll respond promptly.</p>
        </div>
      </div>

      <div className="container">
        <div className={styles.grid}>
          {/* Form */}
          <div className={styles.formSide}>
            <h2 className={styles.formTitle}>Send a Message</h2>
            {sent && (
              <div className={styles.successBanner}>
                ✅ Message sent! We'll get back to you within 24 hours.
              </div>
            )}
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.row}>
                <div className="form-group">
                  <label className="form-label">Your Name *</label>
                  <input id="contact-name" className="form-input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Full name" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input id="contact-phone" className="form-input" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+94 xxx xxx xxx" />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Email Address *</label>
                <input id="contact-email" type="email" className="form-input" value={form.email} onChange={e => set('email', e.target.value)} placeholder="your@email.com" required />
              </div>
              <div className="form-group">
                <label className="form-label">Subject</label>
                <select id="contact-subject" className="form-input form-select" value={form.subject} onChange={e => set('subject', e.target.value)}>
                  <option value="">Select a topic...</option>
                  <option>Order Enquiry</option>
                  <option>Menu / Meal Questions</option>
                  <option>Delivery & Zones</option>
                  <option>Payment Issues</option>
                  <option>Feedback</option>
                  <option>Other</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Message *</label>
                <textarea id="contact-message" className="form-input form-textarea" value={form.message} onChange={e => set('message', e.target.value)} placeholder="Tell us how we can help..." rows={5} required />
              </div>
              <button type="submit" className={`btn btn-primary btn-lg ${styles.submitBtn}`} disabled={loading} id="contact-submit-btn">
                <Send size={16} />
                {loading ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>

          {/* Info */}
          <div className={styles.infoSide}>
            <div className={styles.infoCard}>
              <h3 className={styles.infoTitle}>Contact Information</h3>
              <div className={styles.infoList}>
                <div className={styles.infoRow}>
                  <div className={styles.infoIcon}><MapPin size={18} /></div>
                  <div><p className={styles.infoLabel}>Location</p><p className={styles.infoVal}>Colombo, Sri Lanka</p></div>
                </div>
                <div className={styles.infoRow}>
                  <div className={styles.infoIcon}><Phone size={18} /></div>
                  <div><p className={styles.infoLabel}>Phone / WhatsApp</p><a href="tel:+94000000000" className={styles.infoVal}>+94 000 000 000</a></div>
                </div>
                <div className={styles.infoRow}>
                  <div className={styles.infoIcon}><Clock size={18} /></div>
                  <div><p className={styles.infoLabel}>Working Hours</p><p className={styles.infoVal}>Mon–Sat: 9:00 AM – 8:00 PM</p></div>
                </div>
              </div>

              <a href="https://wa.me/94000000000" target="_blank" rel="noopener noreferrer" className={`btn btn-primary ${styles.whatsappBtn}`} id="contact-whatsapp-btn">
                <MessageCircle size={18} />
                Chat on WhatsApp
              </a>

              <a href="https://www.tiktok.com/@fresh.choice.sl" target="_blank" rel="noopener noreferrer" className={styles.tiktokLink} id="contact-tiktok-btn">
                📱 Follow us on TikTok @fresh.choice.sl
              </a>
            </div>

            {/* Delivery Zones */}
            <div className={styles.zonesCard}>
              <h3 className={styles.infoTitle}>Delivery Zones</h3>
              {DELIVERY_ZONES.map(z => (
                <div key={z.id} className={styles.zoneRow}>
                  <div>
                    <p className={styles.zoneName}>{z.name}</p>
                    <p className={styles.zoneFree}>Free delivery above Rs. {z.freeAbove.toLocaleString()}</p>
                  </div>
                  <span className={styles.zoneFee}>Rs. {z.fee}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
