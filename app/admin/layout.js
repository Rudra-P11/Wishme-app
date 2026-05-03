'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './admin.module.css';

const NAV_ITEMS = [
  { href: '/admin', label: 'Dashboard', icon: '📊' },
  { href: '/admin/templates', label: 'Templates', icon: '🎨' },
  { href: '/admin/users', label: 'Users', icon: '👥' },
];

export default function AdminLayout({ children }) {
  const pathname = usePathname();

  return (
    <div className={styles.adminLayout}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <h2>⚙️ Admin</h2>
        </div>
        <nav className={styles.sidebarNav}>
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.href === '/admin'
                ? pathname === '/admin'
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.sidebarLink} ${isActive ? styles.sidebarLinkActive : ''}`}
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
          <Link href="/dashboard" className={styles.sidebarLink}>
            <span>←</span>
            Back to App
          </Link>
        </nav>
      </aside>
      <main className={styles.adminContent}>{children}</main>
    </div>
  );
}
