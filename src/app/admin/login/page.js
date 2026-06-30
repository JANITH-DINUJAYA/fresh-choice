'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Shield, Clock } from 'lucide-react';
import styles from './page.module.css';

function AdminLoginForm() {
  const { signInAdmin } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const idleLogout = searchParams.get('reason') === 'idle';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { profile } = await signInAdmin(email, password);
      toast.success(`Welcome back, ${profile.name}!`);
      router.push('/admin/dashboard');
    } catch (err) {
      toast.error(err.message || 'Admin login failed');
    } finally { setLoading(false); }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.iconWrap}><Shield size={28} /></div>
        <h1 className={styles.title}>Admin Portal</h1>
        <p className={styles.sub}>Fresh Choice Management System</p>

        {idleLogout && (
          <div className={styles.idleNotice}>
            <Clock size={14} />
            Session expired due to 15 minutes of inactivity. Please sign in again.
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className="form-group">
            <label className="form-label" style={{ color: 'rgba(255,255,255,0.7)' }}>Admin Email</label>
            <input id="admin-login-email" type="email" className={styles.input} value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@freshchoice.lk" autoComplete="email" required />
          </div>
          <div className="form-group">
            <label className="form-label" style={{ color: 'rgba(255,255,255,0.7)' }}>Password</label>
            <div className={styles.pwWrap}>
              <input id="admin-login-password" type={showPw ? 'text' : 'password'} className={`${styles.input} ${styles.pwInput}`} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" autoComplete="current-password" required />
              <button type="button" className={styles.eyeBtn} onClick={() => setShowPw(!showPw)} aria-label="Toggle password">
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <button type="submit" className={`btn btn-primary ${styles.submitBtn}`} disabled={loading} id="admin-login-submit">
            {loading ? 'Signing in...' : 'Sign In to Admin'}
          </button>
        </form>

        <a href="/" className={styles.backLink}>← Back to Customer Site</a>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={
      <div className="loading-page">
        <div className="spinner" />
      </div>
    }>
      <AdminLoginForm />
    </Suspense>
  );
}
