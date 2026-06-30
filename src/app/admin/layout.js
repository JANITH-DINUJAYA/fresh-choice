'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import AdminSidebar from '@/components/admin/AdminSidebar';
import toast from 'react-hot-toast';
import styles from './layout.module.css';

const IDLE_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes
const WARN_BEFORE_MS = 60 * 1000;        // warn 1 minute before logout

export default function AdminLayout({ children }) {
  const { user, userProfile, loading, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const idleTimerRef = useRef(null);
  const warnTimerRef = useRef(null);
  const warnToastRef = useRef(null);

  const handleAutoLogout = useCallback(async () => {
    toast.dismiss(warnToastRef.current);
    await signOut();
    router.replace('/admin/login?reason=idle');
  }, [signOut, router]);

  const resetIdleTimer = useCallback(() => {
    if (pathname === '/admin/login') return;

    clearTimeout(idleTimerRef.current);
    clearTimeout(warnTimerRef.current);
    toast.dismiss(warnToastRef.current);

    // Show warning 1 min before auto-logout
    warnTimerRef.current = setTimeout(() => {
      warnToastRef.current = toast(
        '⚠️ You will be logged out in 1 minute due to inactivity.',
        { duration: 60000, icon: '⏰' }
      );
    }, IDLE_TIMEOUT_MS - WARN_BEFORE_MS);

    // Auto-logout after full idle period
    idleTimerRef.current = setTimeout(handleAutoLogout, IDLE_TIMEOUT_MS);
  }, [pathname, handleAutoLogout]);

  // Bind activity events
  useEffect(() => {
    if (pathname === '/admin/login' || !user) return;

    const EVENTS = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click'];
    EVENTS.forEach(e => window.addEventListener(e, resetIdleTimer, { passive: true }));
    resetIdleTimer(); // start timer immediately on mount

    return () => {
      EVENTS.forEach(e => window.removeEventListener(e, resetIdleTimer));
      clearTimeout(idleTimerRef.current);
      clearTimeout(warnTimerRef.current);
      toast.dismiss(warnToastRef.current);
    };
  }, [pathname, user, resetIdleTimer]);

  // Auth guard
  useEffect(() => {
    if (loading) return;
    if (pathname === '/admin/login') return;
    if (!user || !['super_admin', 'admin', 'staff'].includes(userProfile?.role)) {
      router.replace('/admin/login');
    }
  }, [user, userProfile, loading, pathname, router]);

  if (pathname === '/admin/login') return <>{children}</>;

  if (loading || !user) return (
    <div className="loading-page">
      <div className="spinner" />
      <p>Loading admin panel...</p>
    </div>
  );

  return (
    <div className={styles.shell}>
      <AdminSidebar />
      <main className={styles.main}>
        <div className={styles.content}>{children}</div>
      </main>
    </div>
  );
}
