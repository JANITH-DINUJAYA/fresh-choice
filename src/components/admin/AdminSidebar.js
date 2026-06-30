'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import {
  LayoutDashboard, UtensilsCrossed, ShoppingBag, Package,
  Users, UserCog, LogOut, Menu, X, ChevronRight,
} from 'lucide-react';
import styles from './AdminSidebar.module.css';

const NAV = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['super_admin', 'admin', 'staff'] },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingBag, roles: ['super_admin', 'admin', 'staff'] },
  { href: '/admin/meals', label: 'Meals', icon: UtensilsCrossed, roles: ['super_admin', 'admin'] },
  { href: '/admin/inventory', label: 'Inventory', icon: Package, roles: ['super_admin', 'admin', 'staff'] },
  { href: '/admin/customers', label: 'Customers', icon: Users, roles: ['super_admin', 'admin'] },
  { href: '/admin/staff', label: 'Staff & Roles', icon: UserCog, roles: ['super_admin', 'admin'] },
];

export default function AdminSidebar() {
  const { userProfile, signOut } = useAuth();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const role = userProfile?.role || 'staff';
  const allowed = NAV.filter(n => n.roles.includes(role));

  const roleLabels = { super_admin: 'Super Admin', admin: 'Admin', staff: 'Staff' };
  const roleColors = { super_admin: '#f59e0b', admin: '#3b82f6', staff: '#22c55e' };

  return (
    <>
      {/* Mobile Toggle */}
      <button className={styles.mobileToggle} onClick={() => setOpen(!open)} aria-label="Toggle sidebar" id="admin-sidebar-toggle">
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>

      {open && <div className={styles.overlay} onClick={() => setOpen(false)} />}

      <aside className={`${styles.sidebar} ${open ? styles.open : ''}`}>
        {/* Logo */}
        <div className={styles.logo}>
          <Image src="/logo.png" alt="Fresh Choice" width={40} height={40} style={{ borderRadius: '50%' }} />
          <div>
            <p className={styles.logoName}>Fresh Choice</p>
            <p className={styles.logoSub}>Admin Panel</p>
          </div>
        </div>

        {/* Role Badge */}
        <div className={styles.roleBadge} style={{ background: `${roleColors[role]}18`, color: roleColors[role], borderColor: `${roleColors[role]}30` }}>
          <span className={styles.roleDot} style={{ background: roleColors[role] }} />
          {roleLabels[role]}
        </div>

        {/* Navigation */}
        <nav className={styles.nav}>
          <p className={styles.navLabel}>Menu</p>
          {allowed.map(item => {
            const active = pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.navItem} ${active ? styles.active : ''}`}
                onClick={() => setOpen(false)}
                id={`admin-nav-${item.href.split('/').pop()}`}
              >
                <Icon size={18} />
                <span>{item.label}</span>
                {active && <ChevronRight size={14} className={styles.activeArrow} />}
              </Link>
            );
          })}
        </nav>

        {/* User & Signout */}
        <div className={styles.footer}>
          <div className={styles.userInfo}>
            <div className={styles.userAvatar}>{userProfile?.name?.[0] || 'A'}</div>
            <div className={styles.userMeta}>
              <p className={styles.userName}>{userProfile?.name || 'Admin'}</p>
              <p className={styles.userEmail}>{userProfile?.email}</p>
            </div>
          </div>
          <button className={styles.signoutBtn} onClick={signOut} id="admin-signout-btn">
            <LogOut size={16} />
            Sign Out
          </button>
          <Link href="/" className={styles.viewSiteBtn} target="_blank" id="admin-view-site-btn">
            View Customer Site ↗
          </Link>
        </div>
      </aside>
    </>
  );
}
