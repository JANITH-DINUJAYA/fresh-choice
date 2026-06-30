'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, updateDoc, doc, serverTimestamp, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/auth';
import { USER_ROLES } from '@/lib/constants';
import toast from 'react-hot-toast';
import { Shield, UserPlus, Key, ToggleLeft, ToggleRight, Lock, Eye, EyeOff, Check, X, ShieldAlert } from 'lucide-react';
import styles from './page.module.css';

const SAMPLE_STAFF = [
  { id: 'u1', name: 'Janith Dinujaya', email: 'janith@freshchoice.lk', role: 'super_admin', isActive: true },
  { id: 'u2', name: 'Admin User', email: 'admin@freshchoice.lk', role: 'admin', isActive: true },
  { id: 'u3', name: 'Kitchen Staff 1', email: 'staff@freshchoice.lk', role: 'staff', isActive: true },
];

const PERMISSIONS_LIST = [
  { key: 'all_permissions', name: 'Root Super-Admin Access', desc: 'Allows complete control of all settings, including creating/editing staff.' },
  { key: 'manage_meals', name: 'Manage Meals Catalog', desc: 'Allows adding, editing, and deleting items from the menu.' },
  { key: 'manage_orders', name: 'Order Processing', desc: 'Allows modifying order status (Confirm, Prep, Ready, Deliver, Cancel).' },
  { key: 'view_inventory', name: 'Daily Inventory Control', desc: 'Allows modifying active batch stocks and resetting counts.' },
  { key: 'view_customers', name: 'View Customer LTV Logs', desc: 'Allows viewing customer contact logs and order stats.' },
];

export default function AdminStaffPage() {
  const { userProfile, isSuperAdmin } = useAuth();
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal / Add form states
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'staff' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const q = query(collection(db, 'users'), where('role', 'in', ['super_admin', 'admin', 'staff']));
      const snap = await getDocs(q);
      if (!snap.empty) {
        setStaff(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } else {
        setStaff(SAMPLE_STAFF);
      }
    } catch (err) {
      console.error(err);
      setStaff(SAMPLE_STAFF);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (user) => {
    if (user.role === 'super_admin') {
      toast.error('Super Admin status cannot be changed');
      return;
    }
    const nextVal = !user.isActive;
    try {
      await updateDoc(doc(db, 'users', user.id), { isActive: nextVal });
      toast.success(`User status updated`);
      setStaff(p => p.map(s => s.id === user.id ? { ...s, isActive: nextVal } : s));
    } catch {
      setStaff(p => p.map(s => s.id === user.id ? { ...s, isActive: nextVal } : s));
      toast.success(`Simulated user status update`);
    }
  };

  const handleAddStaff = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      toast.error('Please fill in all fields');
      return;
    }
    
    // Check if the current user profile is allowed to create staff
    const currentRole = userProfile?.role || 'staff';
    if (currentRole !== 'super_admin') {
      toast.error('Permission Denied: Only Super Admin can create team members');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create user');
      
      toast.success('Staff account created successfully!');
      setStaff(p => [...p, { id: data.uid, name: form.name, email: form.email, role: form.role, isActive: true }]);
      setShowModal(false);
      setForm({ name: '', email: '', password: '', role: 'staff' });
    } catch (err) {
      console.error(err);
      toast.error('Saved locally (Simulated creation)');
      setStaff(p => [...p, { id: `local-${Date.now()}`, name: form.name, email: form.email, role: form.role, isActive: true }]);
      setShowModal(false);
      setForm({ name: '', email: '', password: '', role: 'staff' });
    } finally {
      setSaving(false);
    }
  };

  const roleLabels = { super_admin: 'Super Admin', admin: 'Admin', staff: 'Staff' };
  const roleColors = { super_admin: '#f59e0b', admin: '#3b82f6', staff: '#22c55e' };

  // Helper to check if a role has a specific permission
  const checkRolePermission = (roleId, permissionKey) => {
    const roleDef = USER_ROLES.find(r => r.id === roleId);
    if (!roleDef) return false;
    if (roleDef.permissions.includes('all_permissions')) return true;
    return roleDef.permissions.includes(permissionKey);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Staff & Roles</h1>
          <p className={styles.sub}>Manage team accounts, permission policies, and system access.</p>
        </div>
        {userProfile?.role === 'super_admin' ? (
          <button className="btn btn-primary" onClick={() => setShowModal(true)} id="admin-add-staff">
            <UserPlus size={18} /> Add Team Member
          </button>
        ) : (
          <div className={styles.roleHeaderAlert}>
            <Lock size={14} /> Only Super Admin can manage members
          </div>
        )}
      </div>

      {loading ? (
        <div className="loading-page" style={{ minHeight: '40vh' }}><div className="spinner" /></div>
      ) : (
        <div className={styles.mainGrid}>
          {/* Left Block: Staff Records list */}
          <div className={styles.tableCard}>
            <h2 className={styles.sectionTitle}>Active Team Directory</h2>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {staff.map(user => (
                    <tr key={user.id} className={styles.row}>
                      <td>
                        <div className={styles.userCol}>
                          <div className={styles.avatar}>{user.name[0]}</div>
                          <span className={styles.name}>{user.name}</span>
                        </div>
                      </td>
                      <td>{user.email}</td>
                      <td>
                        <span className={styles.roleBadge} style={{ background: `${roleColors[user.role]}15`, color: roleColors[user.role] }}>
                          <Shield size={12} /> {roleLabels[user.role]}
                        </span>
                      </td>
                      <td>
                        <span className={`${styles.statusText} ${user.isActive ? styles.active : styles.inactive}`}>
                          {user.isActive ? 'Active' : 'Deactivated'}
                        </span>
                      </td>
                      <td>
                        <button
                          className={styles.toggleBtn}
                          onClick={() => handleToggleStatus(user)}
                          disabled={user.role === 'super_admin' || userProfile?.role !== 'super_admin'}
                          id={`toggle-status-${user.id}`}
                        >
                          {user.isActive ? <ToggleRight size={24} className={styles.toggleOn} /> : <ToggleLeft size={24} className={styles.toggleOff} />}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right Block: Permissions Matrix Widget (NEW FEATURE) */}
          <div className={styles.matrixWidget}>
            <div className={styles.matrixHead}>
              <Shield size={18} className={styles.shieldIcon} />
              <h3>Role Permissions Matrix</h3>
            </div>
            <p className={styles.matrixSub}>Review system access policies configured for each staff role.</p>

            <div className={styles.matrixContainer}>
              {PERMISSIONS_LIST.map(p => (
                <div key={p.key} className={styles.matrixRow}>
                  <div className={styles.permInfo}>
                    <p className={styles.permName}>{p.name}</p>
                    <p className={styles.permDesc}>{p.desc}</p>
                  </div>
                  
                  <div className={styles.matrixRoles}>
                    {USER_ROLES.map(role => {
                      const hasAccess = checkRolePermission(role.id, p.key);
                      return (
                        <div key={role.id} className={styles.matrixRoleCol} title={`${roleLabels[role.id]}: ${hasAccess ? 'Access Granted' : 'Access Denied'}`}>
                          <span className={styles.roleInitial} style={{ color: roleColors[role.id] }}>{role.label[0]}</span>
                          <span className={hasAccess ? styles.matrixAccessTrue : styles.matrixAccessFalse}>
                            {hasAccess ? <Check size={14} /> : <X size={12} />}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* Add Staff Modal */}
      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHead}>
              <h2>Add Team Member</h2>
              <button className={styles.modalClose} onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleAddStaff} className={styles.modalForm}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input id="staff-name" className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="John Doe" required />
              </div>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input id="staff-email" type="email" className="form-input" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="john@freshchoice.lk" required />
              </div>
              <div className="form-group">
                <label className="form-label">Temporary Password</label>
                <input id="staff-password" type="password" className="form-input" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Min. 6 characters" required />
              </div>
              <div className="form-group">
                <label className="form-label">Role</label>
                <select id="staff-role" className="form-input form-select" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                  <option value="staff">Staff (Orders & Inventory management)</option>
                  <option value="admin">Admin (Meals, Orders & Inventory control)</option>
                  {isSuperAdmin() && <option value="super_admin">Super Admin (All permissions)</option>}
                </select>
              </div>
              <div className={styles.modalActions}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving} id="staff-submit-btn">
                  {saving ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
