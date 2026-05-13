'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import styles from './page.module.css';

export default function BecomeCreator() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const handleApply = async () => {
    setLoading(true);
    // Simulate email verification delay
    setTimeout(async () => {
      try {
        const res = await fetch('/api/user/creator', { method: 'POST' });
        if (res.ok) {
          await update(); // Refresh session
          setStep(2);
          setTimeout(() => {
            window.location.href = '/dashboard/create';
          }, 2000);
        } else {
          alert('Failed to apply. Please try again.');
          setLoading(false);
        }
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    }, 1500);
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        {step === 1 ? (
          <>
            <div className={styles.icon}>🎨</div>
            <h1 className={styles.title}>Join the Creator Community</h1>
            <p className={styles.description}>
              Publish your own templates, get discovered by millions, and start monetizing your designs today.
            </p>
            
            <div className={styles.benefits}>
              <div className={styles.benefit}>
                <span className={styles.check}>✓</span> Upload custom templates
              </div>
              <div className={styles.benefit}>
                <span className={styles.check}>✓</span> Set Free or PRO pricing
              </div>
              <div className={styles.benefit}>
                <span className={styles.check}>✓</span> Build your audience
              </div>
            </div>

            <button 
              className={styles.applyBtn} 
              onClick={handleApply}
              disabled={loading}
            >
              {loading ? 'Verifying Email...' : 'Verify Email & Apply'}
            </button>
            <p className={styles.hint}>By applying, you agree to our community guidelines.</p>
          </>
        ) : (
          <div className={styles.successState}>
            <div className={styles.icon}>🎉</div>
            <h1 className={styles.title}>You're Verified!</h1>
            <p className={styles.description}>
              Welcome to the Creator Hub. Redirecting you to the studio...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
