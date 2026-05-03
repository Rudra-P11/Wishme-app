'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from '../admin.module.css';

export default function AdminTemplatesPage() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const res = await fetch('/api/templates?limit=100');
      const data = await res.json();
      setTemplates(data.templates || []);
    } catch (err) {
      console.error('Failed to fetch:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;

    try {
      const res = await fetch(`/api/templates/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setTemplates(templates.filter((t) => t._id !== id));
        showToast('Template deleted successfully');
      }
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1>Templates</h1>
          <p>Manage your greeting card templates</p>
        </div>
        <Link href="/admin/templates/new" className={styles.addBtn} id="add-template-btn">
          + Add Template
        </Link>
      </div>

      {loading ? (
        <p style={{ color: 'var(--text-tertiary)' }}>Loading templates...</p>
      ) : templates.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 'var(--space-16)', color: 'var(--text-tertiary)' }}>
          <p style={{ fontSize: '3rem', marginBottom: 'var(--space-4)' }}>🎨</p>
          <h3>No templates yet</h3>
          <p>Click &quot;Add Template&quot; to create your first template.</p>
        </div>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Image</th>
              <th>Title</th>
              <th>Category</th>
              <th>Type</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {templates.map((t) => (
              <tr key={t._id}>
                <td>
                  <img src={t.imageUrl} alt={t.title} className={styles.tableImage} />
                </td>
                <td style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{t.title}</td>
                <td style={{ textTransform: 'capitalize' }}>{t.category}</td>
                <td>
                  <span className={`${styles.badge} ${t.isPremium ? styles.badgePro : styles.badgeFree}`}>
                    {t.isPremium ? 'PRO' : 'Free'}
                  </span>
                </td>
                <td>
                  <span className={`${styles.badge} ${t.isActive !== false ? styles.badgeFree : styles.badgeUser}`}>
                    {t.isActive !== false ? 'Active' : 'Hidden'}
                  </span>
                </td>
                <td>
                  <div className={styles.actionGroup}>
                    <Link
                      href={`/admin/templates/edit/${t._id}`}
                      className={styles.actionBtn}
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(t._id, t.title)}
                      className={`${styles.actionBtn} ${styles.actionBtnDanger}`}
                    >
                      Delete
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
