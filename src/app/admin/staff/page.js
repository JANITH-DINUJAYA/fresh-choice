'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, updateDoc, doc, serverTimestamp, query, where, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/auth';
import { USER_ROLES } from '@/lib/constants';
import toast from 'react-hot-toast';
import { Shield, UserPlus, ToggleLeft, ToggleRight, Lock, Check, X, ShieldAlert, Key } from 'lucide-react';
import styles from './page.module.css';

const SAMPLE_STAFF = [
  { id: 'u1', name: 'Janith Dinujaya', email: 'janith@freshchoice.lk', role: 'super_admin', isActive: true },
  { id: 'u2', name: 'Admin User', email: 'admin@freshchoice.lk', role: 'admin', isActive: true },
  { id: 'u3', name: 'Kitchen Staff 1', email: 'staff@freshchoice.lk', role: 'staff', isActive: true },
];

const PERMISSIONS_LIST = [
  { key: 'all_permissions', name: 'Root Super-Admin Access', desc: 'Allows complete control of all settings, including creating/editing staff.', superAdminOnly: false },
  { key: 'manage_meals', name: 'Manage Meals Catalog', desc: 'Allows adding, editing, and deleting items from the menu.', superAdminOnly: false },
  { key: 'manage_orders', name: 'Order Processing', desc: 'Allows modifying order status (Confirm, Prep, Ready, Deliver, Cancel).', superAdminOnly: false },
  { key: 'view_inventory', name: 'Daily Inventory Control', desc: 'Allows modifying active batch stocks and resetting counts.', superAdminOnly: false },
  { key: 'view_customers', name: 'View Customer LTV Logs', desc: 'Allows viewing customer contact logs and order stats. Not granted by default — super admin only.', superAdminOnly: true },
  { key: 'view_messages', name: 'Customer Messages Inbox', desc: 'Allows viewing and replying to customer contact messages. Not granted by default — super admin only.', superAdminOnly: true },
];

export default function AdminStaffPage() {
  const { userProfile, isSuperAdmin } = useAuth();
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'staff' });
  const [saving, setSaving] = useState(false);

  // Permission grant modal
  const [permTarget, setPermTarget] = useState(null);
  const [savingPerm, setSavingPerm] = useState(false);

  useEffect(() => { fetchStaff(); }, []);

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
    if (user.role === 'super_admin') { toast.error('Super Admin status cannot be changed'); return; }
    const nextVal = !user.isActive;
    try {
      await updateDoc(doc(db, 'users', user.id), { isActive: nextVal });
      toast.success('User status updated');
      setStaff(p => p.map(s => s.id === user.id ? { ...s, isActive: nextVal } : s));
    } catch {
      setStaff(p => p.map(s => s.id === user.id ? { ...s, isActive: nextVal } : s));
    }
  };

  const handleAddStaff = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) { toast.error('Please fill in all fields'); return; }
    if (userProfile?.role !== 'super_admin') { toast.error('Only Super Admin can create team members'); return; }
    setSaving(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create user');
      toast.success('Staff account created!');
      setStaff(p => [...p, { id: data.uid, name: form.name, email: form.email, role: form.role, isActive: true }]);
      setShowModal(false);
      setForm({ name: '', email: '', password: '', role: 'staff' });
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Failed to create user');
    } finally {
      setSaving(false);
    }
  };

  // Toggle a permission for a staff member (super admin only).
  // - Non-default perms: use extraPermissions (add/remove).
  // - Default role perms: use revokedPermissions (add/remove) to explicitly revoke or restore.
  const handleTogglePermission = async (staffId, permKey, member) => {
    if (!isSuperAdmin()) { toast.error('Only Super Admin can grant permissions'); return; }

    const roleDef = USER_ROLES.find(r => r.id === member.role);
    const isRoleDefault = member.role === 'super_admin' || (roleDef?.permissions?.includes(permKey) || false);
    const isRevoked = (member.revokedPermissions || []).includes(permKey);
    const isExtra = (member.extraPermissions || []).includes(permKey);
    // currently active = (default and not revoked) OR extra granted
    const currentlyActive = isRoleDefault ? !isRevoked : isExtra;

    setSavingPerm(true);
    try {
      let updatePayload;
      if (isRoleDefault) {
        // Toggle revoked state for a default permission
        updatePayload = { revokedPermissions: currentlyActive ? arrayUnion(permKey) : arrayRemove(permKey) };
      } else {
        // Toggle extra grant for a non-default permission
        updatePayload = { extraPermissions: currentlyActive ? arrayRemove(permKey) : arrayUnion(permKey) };
      }
      await updateDoc(doc(db, 'users', staffId), updatePayload);

      // Sync local state
      const updateMember = (s) => {
        if (s.id !== staffId) return s;
        if (isRoleDefault) {
          const revoked = s.revokedPermissions || [];
          return { ...s, revokedPermissions: currentlyActive ? [...revoked, permKey] : revoked.filter(x => x !== permKey) };
        } else {
          const extra = s.extraPermissions || [];
          return { ...s, extraPermissions: currentlyActive ? extra.filter(x => x !== permKey) : [...extra, permKey] };
        }
      };
      setStaff(p => p.map(updateMember));
      setPermTarget(prev => prev ? updateMember(prev) : prev);

      toast.success(currentlyActive ? 'Permission revoked' : 'Permission granted');
    } catch (err) {
      console.error(err);
      toast.error('Failed to update permission');
    } finally {
      setSavingPerm(false);
    }
  };

  const roleLabels = { super_admin: 'Super Admin', admin: 'Admin', staff: 'Staff' };
  const roleColors = { super_admin: '#f59e0b', admin: '#3b82f6', staff: '#22c55e' };

  // Effective permissions: (role defaults - revokedPermissions) + extraPermissions
  const checkRolePermission = (member, permKey) => {
    if (member.role === 'super_admin') {
      const isRevoked = (member.revokedPermissions || []).includes(permKey);
      return !isRevoked;
    }
    const roleDef = USER_ROLES.find(r => r.id === member.role);
    const roleHas = roleDef?.permissions?.includes(permKey) || false;
    const isRevoked = (member.revokedPermissions || []).includes(permKey);
    const extraHas = (member.extraPermissions || []).includes(permKey);
    return (roleHas && !isRevoked) || extraHas;
  };

  const SUPER_ADMIN_GRANTABLE = PERMISSIONS_LIST.filter(p => p.key !== 'all_permissions');

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
          <div className={styles.roleHeaderAlert}><Lock size={14} /> Only Super Admin can manage members</div>
        )}
      </div>

      {loading ? (
        <div className="loading-page" style={{ minHeight: '40vh' }}><div className="spinner" /></div>
      ) : (
        <div className={styles.mainGrid}>
          {/* Staff Table */}
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
                          <div className={styles.avatar}>{(user.name || '?')[0]}</div>
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
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                          <button
                            className={styles.toggleBtn}
                            onClick={() => handleToggleStatus(user)}
                            disabled={user.role === 'super_admin' || userProfile?.role !== 'super_admin'}
                            id={`toggle-status-${user.id}`}
                          >
                            {user.isActive ? <ToggleRight size={24} className={styles.toggleOn} /> : <ToggleLeft size={24} className={styles.toggleOff} />}
                          </button>
                          {userProfile?.role === 'super_admin' && user.role !== 'super_admin' && (
                            <button
                              className={styles.permBtn}
                              onClick={() => setPermTarget(user)}
                              title="Manage extra permissions"
                              id={`perms-${user.id}`}
                            >
                              <Key size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Permissions Matrix */}
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
                    <p className={styles.permName}>
                      {p.name}
                      {p.superAdminOnly && <span className={styles.grantBadge}>Super Admin Grant</span>}
                    </p>
                    <p className={styles.permDesc}>{p.desc}</p>
                  </div>
                  <div className={styles.matrixRoles}>
                    {USER_ROLES.map(role => {
                      const hasAccess = role.id === 'super_admin' || role.permissions?.includes(p.key);
                      return (
                        <div key={role.id} className={styles.matrixRoleCol} title={`${roleLabels[role.id]}: ${hasAccess ? 'Access Granted' : p.superAdminOnly ? 'Super Admin can grant individually' : 'Access Denied'}`}>
                          <span className={styles.roleInitial} style={{ color: roleColors[role.id] }}>{role.label[0]}</span>
                          <span className={hasAccess ? styles.matrixAccessTrue : (p.superAdminOnly ? styles.matrixAccessOpt : styles.matrixAccessFalse)}>
                            {hasAccess ? <Check size={14} /> : p.superAdminOnly ? <Key size={12} /> : <X size={12} />}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)', marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Key size={11} /> = Grantable individually by Super Admin
            </p>
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
                <select id="staff-role" className="form-input" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} style={{ color: 'white', background: 'rgba(255,255,255,0.07)' }}>
                  <option value="staff" style={{ background: '#1a1d26', color: 'white' }}>Staff (Orders & Inventory management)</option>
                  <option value="admin" style={{ background: '#1a1d26', color: 'white' }}>Admin (Meals, Orders & Inventory control)</option>
                  {isSuperAdmin() && <option value="super_admin" style={{ background: '#1a1d26', color: 'white' }}>Super Admin (All permissions)</option>}
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

      {/* Permission Grant Modal */}
      {permTarget && (
        <div className={styles.modalOverlay} onClick={() => setPermTarget(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHead}>
              <h2>Grant Permissions — {permTarget.name}</h2>
              <button className={styles.modalClose} onClick={() => setPermTarget(null)} aria-label="Close modal">×</button>
            </div>
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.5 }}>
                All permissions can be customized per team member. <span style={{ color: 'rgba(255,255,255,0.3)' }}>Permissions marked "Default" are part of their role but can still be revoked.</span>
              </p>
              {SUPER_ADMIN_GRANTABLE.map(perm => {
                const roleDef = USER_ROLES.find(r => r.id === permTarget.role);
                const isDefault = permTarget.role === 'super_admin' ||
                  (roleDef?.permissions?.includes(perm.key) || false);
                const isRevoked = (permTarget.revokedPermissions || []).includes(perm.key);
                const isExtra = (permTarget.extraPermissions || []).includes(perm.key);
                const granted = isDefault ? !isRevoked : isExtra;

                return (
                  <div key={perm.key} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '1rem', background: 'rgba(255,255,255,0.04)', borderRadius: '10px',
                    border: `1px solid ${granted ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.15)'}`,
                    transition: 'border-color 0.2s',
                  }}>
                    <div>
                      <p style={{ color: 'white', fontWeight: 600, fontSize: '0.875rem', marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {perm.name}
                        {isDefault && <span style={{ fontSize: '0.65rem', padding: '2px 6px', background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.45)', borderRadius: '4px', fontWeight: 600 }}>Default</span>}
                      </p>
                      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem' }}>{perm.desc}</p>
                    </div>
                    <button
                      onClick={() => handleTogglePermission(permTarget.id, perm.key, permTarget)}
                      disabled={savingPerm}
                      style={{
                        flexShrink: 0, marginLeft: '1rem',
                        padding: '0.375rem 0.875rem',
                        borderRadius: '20px',
                        border: 'none',
                        cursor: savingPerm ? 'not-allowed' : 'pointer',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        background: granted ? 'rgba(239,68,68,0.15)' : 'rgba(34,197,94,0.15)',
                        color: granted ? '#ef4444' : '#22c55e',
                        fontFamily: 'var(--font-sans)',
                        transition: 'all 0.2s',
                        opacity: savingPerm ? 0.5 : 1,
                      }}
                    >
                      {granted ? 'Revoke' : 'Grant'}
                    </button>
                  </div>
                );
              })}
              <div className={styles.modalActions} style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1rem', marginTop: '0.5rem' }}>
                <button className="btn btn-ghost" onClick={() => setPermTarget(null)}>Close Window</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
