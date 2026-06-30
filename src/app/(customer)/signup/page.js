'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Leaf } from 'lucide-react';
import styles from '../login/page.module.css';

export default function SignupPage() {
  const { signUpCustomer } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await signUpCustomer(form.email, form.password, form.name, form.phone);
      toast.success('Account created! Welcome to Fresh Choice!');
      router.push('/');
    } catch (err) {
      toast.error(err.message || 'Signup failed');
    } finally { setLoading(false); }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logoRow}>
          <div className={styles.logoIcon}><Leaf size={22} /></div>
          <span className={styles.logoText}>Fresh Choice</span>
        </div>
        <h1 className={styles.title}>Create Account</h1>
        <p className={styles.sub}>Join Fresh Choice for healthy homemade meals</p>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input id="signup-name" className="form-input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Your full name" required />
          </div>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input id="signup-email" type="email" className="form-input" value={form.email} onChange={e => set('email', e.target.value)} placeholder="you@example.com" required />
          </div>
          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input id="signup-phone" type="tel" className="form-input" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+94 xxx xxx xxx" required />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <div className={styles.pwWrap}>
              <input id="signup-password" type={showPw ? 'text' : 'password'} className={`form-input ${styles.pwInput}`} value={form.password} onChange={e => set('password', e.target.value)} placeholder="Min. 6 characters" required />
              <button type="button" className={styles.eyeBtn} onClick={() => setShowPw(!showPw)}>{showPw ? <EyeOff size={16} /> : <Eye size={16} />}</button>
            </div>
          </div>
          <button type="submit" className={`btn btn-primary ${styles.submitBtn}`} disabled={loading} id="signup-submit-btn">
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
        <div className={styles.divider}><span>Already have an account?</span></div>
        <Link href="/login" className={`btn btn-outline ${styles.signupBtn}`} id="signup-login-link">Sign In</Link>
      </div>
    </div>
  );
}
