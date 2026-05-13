'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useSession, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import styles from './Navbar.module.css';

export default function Navbar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  const isActive = (path) => pathname === path || pathname.startsWith(path + '/');

  return (
    <nav className={styles.navbar} id="main-navbar">
      <Link href="/" className={styles.logo}>
        <Image
          src="/logo.png"
          alt="Wishme Logo"
          width={36}
          height={36}
          className={styles.logoImage}
          priority
        />
        <span className={styles.logoText}>Wishme</span>
      </Link>

      <div className={styles.nav}>
        {status === 'authenticated' && session?.user && (
          <>
            <Link
              href="/dashboard"
              className={`${styles.navLink} ${isActive('/dashboard') && !isActive('/dashboard/community') ? styles.navLinkActive : ''}`}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
              </svg>
              <span>Templates</span>
            </Link>

            <Link
              href="/dashboard/community"
              className={`${styles.navLink} ${isActive('/dashboard/community') ? styles.navLinkActive : ''}`}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
              <span>Community</span>
            </Link>

            {session.user.role === 'admin' && (
              <Link
                href="/admin"
                className={`${styles.navLink} ${isActive('/admin') ? styles.navLinkActive : ''}`}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                <span>Admin</span>
                <span className={styles.adminBadge}>Admin</span>
              </Link>
            )}

            <div className={styles.userSection}>
              {session.user.image ? (
                <img
                  src={session.user.image}
                  alt={session.user.name || 'User'}
                  className={styles.avatar}
                />
              ) : (
                <div className={styles.avatarPlaceholder}>
                  {(session.user.name || 'U')[0].toUpperCase()}
                </div>
              )}
              <span className={styles.userName}>{session.user.name}</span>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className={styles.signOutBtn}
                id="sign-out-button"
              >
                Sign Out
              </button>
            </div>
          </>
        )}

        {status === 'unauthenticated' && (
          <Link href="/login" className={styles.loginBtn} id="login-button">
            Get Started
          </Link>
        )}
      </div>
    </nav>
  );
}
