'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, updateDoc, doc, orderBy, query, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/auth';
import { formatDate } from '@/lib/constants';
import toast from 'react-hot-toast';
import { Mail, Search, Check, Clock, Tag, Eye, Lock } from 'lucide-react';
import styles from './page.module.css';

export default function AdminMessagesPage() {
  const { userProfile } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [selected, setSelected] = useState(null);

  // Access control: only super_admin or those with view_messages permission
  const hasAccess = userProfile?.role === 'super_admin' ||
    (userProfile?.extraPermissions || []).includes('view_messages');

  useEffect(() => {
    if (hasAccess) fetchMessages();
    else setLoading(false);
  }, [hasAccess]);

  const fetchMessages = async () => {
    try {
      const snap = await getDocs(collection(db, 'contactMessages'));
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      data.sort((a, b) => {
        const aT = a.createdAt?.toMillis?.() || 0;
        const bT = b.createdAt?.toMillis?.() || 0;
        return bT - aT;
      });
      setMessages(data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await updateDoc(doc(db, 'contactMessages', id), { status: 'read', readAt: serverTimestamp() });
      setMessages(p => p.map(m => m.id === id ? { ...m, status: 'read' } : m));
      if (selected?.id === id) setSelected(p => ({ ...p, status: 'read' }));
      toast.success('Marked as read');
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handleSelectMessage = async (msg) => {
    setSelected(msg);
    // Auto-mark as read when opened
    if (msg.status === 'unread') {
      await handleMarkRead(msg.id);
    }
  };

  const filtered = messages
    .filter(m => activeFilter === 'all' || m.status === activeFilter)
    .filter(m =>
      !search ||
      m.name?.toLowerCase().includes(search.toLowerCase()) ||
      m.email?.toLowerCase().includes(search.toLowerCase()) ||
      m.subject?.toLowerCase().includes(search.toLowerCase()) ||
      m.message?.toLowerCase().includes(search.toLowerCase())
    );

  const unreadCount = messages.filter(m => m.status === 'unread').length;

  if (!hasAccess) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '1rem', color: 'rgba(255,255,255,0.5)' }}>
        <Lock size={48} style={{ color: 'rgba(255,255,255,0.2)' }} />
        <h2 style={{ color: 'white', fontFamily: 'var(--font-serif)' }}>Access Restricted</h2>
        <p>This section requires the "Customer Messages" permission granted by the Super Admin.</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Customer Messages</h1>
          <p className={styles.sub}>
            Inbox from the contact form.
            {unreadCount > 0 && <span className={styles.unreadBadge}>{unreadCount} unread</span>}
          </p>
        </div>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.searchWrap}>
          <Search size={16} className={styles.searchIcon} />
          <input
            id="msg-search"
            type="text"
            placeholder="Search messages..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className={`form-input ${styles.searchInput}`}
          />
        </div>
        <div className={styles.tabs}>
          {['all', 'unread', 'read'].map(f => (
            <button key={f} className={`${styles.tab} ${activeFilter === f ? styles.active : ''}`} onClick={() => setActiveFilter(f)}>
              {f === 'all' ? 'All' : f === 'unread' ? 'Unread' : 'Read'}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="loading-page" style={{ minHeight: '40vh' }}><div className="spinner" /></div>
      ) : (
        <div className={styles.workspace}>
          {/* Message list */}
          <div className={styles.messageList}>
            {filtered.length === 0 ? (
              <div className={styles.empty}>
                <Mail size={40} style={{ color: 'rgba(255,255,255,0.15)' }} />
                <p>No messages found</p>
              </div>
            ) : filtered.map(msg => (
              <div
                key={msg.id}
                className={`${styles.messageItem} ${selected?.id === msg.id ? styles.selectedMsg : ''} ${msg.status === 'unread' ? styles.unreadMsg : ''}`}
                onClick={() => handleSelectMessage(msg)}
                id={`msg-${msg.id}`}
              >
                <div className={styles.msgAvatar}>{(msg.name || '?')[0]}</div>
                <div className={styles.msgMeta}>
                  <div className={styles.msgTop}>
                    <span className={styles.msgName}>{msg.name}</span>
                    <span className={styles.msgDate}>{formatDate(msg.createdAt)}</span>
                  </div>
                  <p className={styles.msgSubject}>{msg.subject || '(No subject)'}</p>
                  <p className={styles.msgPreview}>{msg.message}</p>
                </div>
                {msg.status === 'unread' && <div className={styles.unreadDot} />}
              </div>
            ))}
          </div>

          {/* Message detail */}
          {selected ? (
            <div className={styles.messageDetail}>
              <div className={styles.detailHeader}>
                <div>
                  <h3 className={styles.detailSubject}>{selected.subject || '(No subject)'}</h3>
                  <p className={styles.detailFrom}>{selected.name} — <a href={`mailto:${selected.email}`} className={styles.emailLink}>{selected.email}</a></p>
                  {selected.phone && <p className={styles.detailPhone}>{selected.phone}</p>}
                  <p className={styles.detailDate}>{formatDate(selected.createdAt)}</p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {selected.status === 'unread' && (
                    <button className={styles.readBtn} onClick={() => handleMarkRead(selected.id)}>
                      <Check size={14} /> Mark Read
                    </button>
                  )}
                  <span className={`${styles.statusTag} ${selected.status === 'unread' ? styles.tagUnread : styles.tagRead}`}>
                    {selected.status === 'unread' ? <Clock size={12} /> : <Check size={12} />}
                    {selected.status}
                  </span>
                </div>
              </div>
              <div className={styles.messageBody}>
                <p>{selected.message}</p>
              </div>
              <div className={styles.replyBar}>
                <a href={`mailto:${selected.email}?subject=Re: ${encodeURIComponent(selected.subject || 'Your message')}`} className="btn btn-primary btn-sm">
                  <Mail size={14} /> Reply via Email
                </a>
              </div>
            </div>
          ) : (
            <div className={styles.noSelection}>
              <Eye size={36} style={{ color: 'rgba(255,255,255,0.15)' }} />
              <p>Select a message to view</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
