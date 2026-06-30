'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import AdminSidebar from '@/components/admin/AdminSidebar';
import styles from './layout.module.css';

export default function AdminLayout({ children }) {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

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
