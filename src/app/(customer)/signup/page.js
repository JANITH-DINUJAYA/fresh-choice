'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import toast from 'react-hot-toast';
import { Eye, EyeOff, AlertCircle, UserPlus } from 'lucide-react';
import styles from '../login/page.module.css';

export default function SignupPage() {
  const { signUpCustomer } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const set = (k, v) => { setForm(p => ({ ...p, [k]: v })); setError(''); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.name.trim()) { setError('Please enter your full name'); return; }
    if (!form.email) { setError('Please enter your email address'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { setError('Please enter a valid email address'); return; }
    if (!form.phone.trim()) { setError('Please enter your phone number'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }

    setLoading(true);
    try {
      await signUpCustomer(form.email, form.password, form.name.trim(), form.phone.trim());
      toast.success('Account created! Welcome to Fresh Choice!');
      router.push('/');
    } catch (err) {
      const msg = err.code === 'auth/email-already-in-use'
        ? 'This email is already registered. Please sign in instead.'
        : err.code === 'auth/invalid-email'
        ? 'Please enter a valid email address.'
        : err.code === 'auth/weak-password'
        ? 'Password is too weak. Please use at least 6 characters.'
        : err.message || 'Signup failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        {/* Logo */}
        <div className={styles.logoRow}>
          <Image src="/logo.png" alt="Fresh Choice" width={48} height={48} className={styles.logoImg} />
          <span className={styles.logoText}>Fresh Choice</span>
        </div>

        <h1 className={styles.title}>Create Account</h1>
        <p className={styles.sub}>Join Fresh Choice for healthy homemade meals</p>

        {error && (
          <div className={styles.errorMsg} role="alert">
            <AlertCircle size={15} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="signup-name">Full Name *</label>
            <input
              id="signup-name"
              className={styles.input}
              value={form.name}
              onChange={e => set('name', e.target.value)}
              placeholder="Your full name"
              autoComplete="name"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="signup-email">Email Address *</label>
            <input
              id="signup-email"
              type="email"
              className={styles.input}
              value={form.email}
              onChange={e => set('email', e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="signup-phone">Phone Number *</label>
            <input
              id="signup-phone"
              type="tel"
              className={styles.input}
              value={form.phone}
              onChange={e => set('phone', e.target.value)}
              placeholder="+94 77 123 4567"
              autoComplete="tel"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="signup-password">Password *</label>
            <div className={styles.pwWrap}>
              <input
                id="signup-password"
                type={showPw ? 'text' : 'password'}
                className={`${styles.input} ${styles.pwInput}`}
                value={form.password}
                onChange={e => set('password', e.target.value)}
                placeholder="Min. 6 characters"
                autoComplete="new-password"
                required
              />
              <button type="button" className={styles.eyeBtn} onClick={() => setShowPw(!showPw)} aria-label="Toggle password">
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button type="submit" className={styles.submitBtn} disabled={loading} id="signup-submit-btn">
            {loading ? 'Creating Account…' : (
              <><UserPlus size={17} /> Create Account</>
            )}
          </button>
        </form>

        <p className={styles.termsNote}>
          By creating an account, you agree to our{' '}
          <Link href="/terms">Terms of Service</Link> and{' '}
          <Link href="/privacy">Privacy Policy</Link>.
        </p>

        <div className={styles.divider}><span>Already have an account?</span></div>
        <Link href="/login" className={styles.signupBtn} id="signup-login-link">
          Sign In
        </Link>
      </div>
    </div>
  );
}
