'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Leaf } from 'lucide-react';
import styles from './page.module.css';

export default function LoginPage() {
  const { signInCustomer } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signInCustomer(email, password);
      toast.success('Welcome back!');
      router.push('/');
    } catch (err) {
      toast.error(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logoRow}>
          <div className={styles.logoIcon}><Leaf size={22} /></div>
          <span className={styles.logoText}>Fresh Choice</span>
        </div>
        <h1 className={styles.title}>Welcome Back</h1>
        <p className={styles.sub}>Sign in to your account to order fresh meals</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className="form-group">
            <label className="form-label" htmlFor="login-email">Email Address</label>
            <input id="login-email" type="email" className="form-input" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="login-password">Password</label>
            <div className={styles.pwWrap}>
              <input id="login-password" type={showPw ? 'text' : 'password'} className={`form-input ${styles.pwInput}`} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
              <button type="button" className={styles.eyeBtn} onClick={() => setShowPw(!showPw)} aria-label="Toggle password">
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <button type="submit" className={`btn btn-primary ${styles.submitBtn}`} disabled={loading} id="login-submit-btn">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className={styles.divider}><span>New to Fresh Choice?</span></div>
        <Link href="/signup" className={`btn btn-outline ${styles.signupBtn}`} id="login-signup-link">
          Create Account
        </Link>

        <p className={styles.adminNote}>
          Are you an admin? <Link href="/admin/login" className={styles.adminLink}>Admin Login →</Link>
        </p>
      </div>
    </div>
  );
}
