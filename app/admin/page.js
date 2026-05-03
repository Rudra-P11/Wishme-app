'use client';

import { useState, useEffect } from 'react';
import styles from './admin.module.css';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('/api/admin/stats');
        const data = await res.json();
        setStats(data);
      } catch (err) {
        console.error('Failed to fetch stats:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div>
        <div className={styles.pageHeader}>
          <div>
            <h1>Admin Dashboard</h1>
            <p>Loading stats...</p>
          </div>
        </div>
        <div className={styles.statsGrid}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className={styles.statCard}>
              <div className={styles.statLabel}>Loading...</div>
              <div className={styles.statValue}>—</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1>Admin Dashboard</h1>
          <p>Overview of your Wishme platform</p>
        </div>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Total Templates</div>
          <div className={`${styles.statValue} ${styles.purple}`}>
            {stats?.totalTemplates || 0}
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Total Users</div>
          <div className={`${styles.statValue} ${styles.pink}`}>
            {stats?.totalUsers || 0}
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Premium Users</div>
          <div className={`${styles.statValue} ${styles.amber}`}>
            {stats?.premiumUsers || 0}
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Premium Templates</div>
          <div className={`${styles.statValue} ${styles.cyan}`}>
            {stats?.premiumTemplates || 0}
          </div>
        </div>
      </div>

      {/* Recent templates */}
      {stats?.recentTemplates?.length > 0 && (
        <>
          <h3 style={{ marginBottom: 'var(--space-4)' }}>Recent Templates</h3>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Image</th>
                <th>Title</th>
                <th>Category</th>
                <th>Type</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentTemplates.map((t) => (
                <tr key={t._id}>
                  <td>
                    <img src={t.imageUrl} alt={t.title} className={styles.tableImage} />
                  </td>
                  <td>{t.title}</td>
                  <td style={{ textTransform: 'capitalize' }}>{t.category}</td>
                  <td>
                    <span className={`${styles.badge} ${t.isPremium ? styles.badgePro : styles.badgeFree}`}>
                      {t.isPremium ? 'PRO' : 'Free'}
                    </span>
                  </td>
                  <td>{new Date(t.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}
