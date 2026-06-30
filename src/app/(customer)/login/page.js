'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import toast from 'react-hot-toast';
import { Eye, EyeOff, AlertCircle, LogIn } from 'lucide-react';
import styles from './page.module.css';

export default function LoginPage() {
  const { signInCustomer } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email) { setError('Please enter your email address'); return; }
    if (!password) { setError('Please enter your password'); return; }

    setLoading(true);
    try {
      await signInCustomer(email, password);
      toast.success('Welcome back!');
      router.push('/');
    } catch (err) {
      const msg = err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password'
        ? 'Incorrect email or password. Please try again.'
        : err.code === 'auth/user-not-found'
        ? 'No account found with this email.'
        : err.code === 'auth/too-many-requests'
        ? 'Too many failed attempts. Please try again later.'
        : err.message || 'Login failed. Please try again.';
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

        <h1 className={styles.title}>Welcome Back</h1>
        <p className={styles.sub}>Sign in to your account to order fresh meals</p>

        {error && (
          <div className={styles.errorMsg} role="alert">
            <AlertCircle size={15} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="login-email">Email Address</label>
            <input
              id="login-email"
              type="email"
              className={styles.input}
              value={email}
              onChange={e => { setEmail(e.target.value); setError(''); }}
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="login-password">Password</label>
            <div className={styles.pwWrap}>
              <input
                id="login-password"
                type={showPw ? 'text' : 'password'}
                className={`${styles.input} ${styles.pwInput}`}
                value={password}
                onChange={e => { setPassword(e.target.value); setError(''); }}
                placeholder="••••••••"
                autoComplete="current-password"
                required
              />
              <button type="button" className={styles.eyeBtn} onClick={() => setShowPw(!showPw)} aria-label="Toggle password">
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button type="submit" className={styles.submitBtn} disabled={loading} id="login-submit-btn">
            {loading ? 'Signing In…' : (
              <><LogIn size={17} /> Sign In</>
            )}
          </button>
        </form>

        <div className={styles.divider}><span>New to Fresh Choice?</span></div>
        <Link href="/signup" className={styles.signupBtn} id="login-signup-link">
          Create an Account
        </Link>

        <p className={styles.adminNote}>
          Admin? <Link href="/admin/login" className={styles.adminLink}>Admin Portal →</Link>
        </p>
      </div>
    </div>
  );
}
