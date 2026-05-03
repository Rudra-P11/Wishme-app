'use client';
import { useState, useEffect } from 'react';
import styles from '../admin.module.css';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/admin/users');
        const data = await res.json();
        setUsers(data.users || []);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, []);

  const updateUser = async (userId, updates) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, updates }),
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(users.map(u => u._id === userId ? data.user : u));
        showToast('User updated');
      }
    } catch (e) { showToast('Update failed'); }
  };

  const toggleRole = (user) => {
    const newRole = user.role === 'admin' ? 'user' : 'admin';
    if (newRole === 'admin' && !confirm(`Make ${user.name || user.email} an admin?`)) return;
    updateUser(user._id, { role: newRole });
  };

  const togglePremium = (user) => {
    updateUser(user._id, { isPremium: !user.isPremium });
  };

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1>Users</h1>
          <p>Manage user roles and premium access</p>
        </div>
      </div>

      {loading ? (
        <p style={{ color: 'var(--text-tertiary)' }}>Loading users...</p>
      ) : users.length === 0 ? (
        <p style={{ color: 'var(--text-tertiary)', textAlign: 'center', padding: 'var(--space-16)' }}>
          No users registered yet.
        </p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Provider</th>
              <th>Role</th>
              <th>Premium</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id}>
                <td style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
                  {u.name || '—'}
                </td>
                <td>{u.email || '—'}</td>
                <td style={{ textTransform: 'capitalize' }}>{u.provider || '—'}</td>
                <td>
                  <span className={`${styles.badge} ${u.role === 'admin' ? styles.badgeAdmin : styles.badgeUser}`}>
                    {u.role || 'user'}
                  </span>
                </td>
                <td>
                  <span className={`${styles.badge} ${u.isPremium ? styles.badgePro : styles.badgeUser}`}>
                    {u.isPremium ? 'PRO' : 'Free'}
                  </span>
                </td>
                <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                <td>
                  <div className={styles.actionGroup}>
                    <button onClick={() => toggleRole(u)} className={styles.actionBtn}>
                      {u.role === 'admin' ? 'Remove Admin' : 'Make Admin'}
                    </button>
                    <button onClick={() => togglePremium(u)} className={styles.actionBtn}>
                      {u.isPremium ? 'Remove Pro' : 'Give Pro'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {toast && <div className={styles.toast}>{toast}</div>}
    </div>
  );
}
