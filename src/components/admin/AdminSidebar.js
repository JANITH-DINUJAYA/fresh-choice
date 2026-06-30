'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { updateProfile, updatePassword } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import toast from 'react-hot-toast';
import {
  LayoutDashboard, UtensilsCrossed, ShoppingBag, Package,
  Users, UserCog, LogOut, Menu, X, ChevronRight, MessageSquare, UserCircle, Edit3, Loader2, Key
} from 'lucide-react';
import styles from './AdminSidebar.module.css';

const NAV = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingBag, perm: 'manage_orders' },
  { href: '/admin/meals', label: 'Meals', icon: UtensilsCrossed, perm: 'manage_meals' },
  { href: '/admin/inventory', label: 'Inventory', icon: Package, perm: 'view_inventory' },
  { href: '/admin/customers', label: 'Customers', icon: Users, perm: 'view_customers' },
  { href: '/admin/messages', label: 'Messages', icon: MessageSquare, perm: 'view_messages' },
  { href: '/admin/staff', label: 'Staff & Roles', icon: UserCog, perm: 'all_permissions' },
];

export default function AdminSidebar() {
  const { userProfile, signOut, refreshUserProfile, hasPermission } = useAuth();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Edit Profile States
  const [showEditModal, setShowEditModal] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (userProfile) {
      setName(userProfile.name || '');
      setPhone(userProfile.phone || '');
    }
  }, [userProfile, showEditModal]);

  const role = userProfile?.role || 'staff';
  const allowed = NAV.filter(n => {
    if (n.perm) {
      return hasPermission(n.perm);
    }
    // Dashboard: show if user has at least one valid admin panel permission
    const possiblePerms = ['manage_meals', 'manage_orders', 'view_inventory', 'view_customers', 'view_messages'];
    return possiblePerms.some(p => hasPermission(p)) || hasPermission('all_permissions');
  });

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Name cannot be empty');
      return;
    }

    setSaving(true);
    const toastId = toast.loading('Updating profile details...');

    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('No user is currently signed in');

      // 1. Update Firestore
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        name: name.trim(),
        phone: phone.trim(),
        updatedAt: new Date()
      });

      // 2. Update Firebase Auth Profile
      await updateProfile(currentUser, {
        displayName: name.trim()
      });

      // 3. Update Password if entered
      if (password) {
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters long');
        }
        await updatePassword(currentUser, password);
        setPassword('');
      }

      // 4. Refresh auth state
      await refreshUserProfile();

      toast.success('Profile details updated successfully!', { id: toastId });
      setShowEditModal(false);
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/requires-recent-login' || err.message?.includes('requires-recent-login')) {
        toast.error('For security reasons, changing your password requires a recent login. Please sign out, sign in again, and try updating your password.', { id: toastId, duration: 6000 });
      } else {
        toast.error(err.message || 'Failed to update profile details', { id: toastId });
      }
    } finally {
      setSaving(false);
    }
  };

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
          <button className={styles.editProfileBtn} onClick={() => setShowEditModal(true)} id="admin-edit-profile-btn">
            <Edit3 size={14} />
            Edit Profile Details
          </button>
          <button className={styles.signoutBtn} onClick={signOut} id="admin-signout-btn">
            <LogOut size={16} />
            Sign Out
          </button>
          <Link href="/" className={styles.viewSiteBtn} target="_blank" id="admin-view-site-btn">
            View Customer Site ↗
          </Link>
        </div>
      </aside>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHead}>
              <h2>Edit Profile Details</h2>
              <button className={styles.modalClose} onClick={() => setShowEditModal(false)}>×</button>
            </div>
            <form onSubmit={handleSaveProfile} className={styles.modalForm}>
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input
                  id="profile-name"
                  className="form-input"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Janith Dinujaya"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input
                  id="profile-phone"
                  className="form-input"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="e.g. +94 77 123 4567"
                />
              </div>
              <div className="form-group">
                <label className="form-label">New Password (leave empty to keep current)</label>
                <input
                  id="profile-password"
                  type="password"
                  className="form-input"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                />
              </div>
              <div className={styles.modalActions}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowEditModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving} id="profile-save-btn">
                  {saving ? <Loader2 className={styles.spin} size={15} /> : null}
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
