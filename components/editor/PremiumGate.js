'use client';

import { useState } from 'react';
import styles from './PremiumGate.module.css';

export default function PremiumGate({ onClose, onUpgrade }) {
  const [selectedPlan, setSelectedPlan] = useState('yearly');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleUpgrade = async () => {
    setLoading(true);
    // Mock: simulate API call to toggle premium
    try {
      const res = await fetch('/api/user/premium', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setSuccess(true);
        setTimeout(() => {
          onUpgrade?.();
          onClose();
        }, 1500);
      }
    } catch (err) {
      console.error('Upgrade failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose} id="premium-modal-overlay">
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <span className={styles.crownEmoji}>👑</span>
          <h2>Upgrade to <span className="gradient-text">Wishme Pro</span></h2>
          <p>Unlock all premium templates and features</p>
        </div>

        <div className={styles.modalBody}>
          {success && (
            <div className={styles.successMsg}>
              🎉 Congratulations! You&apos;re now a Pro member!
            </div>
          )}

          {/* Plan comparison */}
          <div className={styles.comparison}>
            <div className={styles.comparisonRow}>
              <div className={`${styles.comparisonFeature} ${styles.comparisonHeader}`}>Feature</div>
              <div className={`${styles.comparisonFree} ${styles.comparisonHeader}`}>Free</div>
              <div className={`${styles.comparisonPro} ${styles.comparisonHeader}`}>Pro</div>
            </div>
            <div className={styles.comparisonRow}>
              <div className={styles.comparisonFeature}>Basic templates</div>
              <div className={styles.comparisonFree}>✓</div>
              <div className={styles.comparisonPro}>✓</div>
            </div>
            <div className={styles.comparisonRow}>
              <div className={styles.comparisonFeature}>Premium templates</div>
              <div className={styles.comparisonFree}>✗</div>
              <div className={styles.comparisonPro}>✓</div>
            </div>
            <div className={styles.comparisonRow}>
              <div className={styles.comparisonFeature}>HD downloads</div>
              <div className={styles.comparisonFree}>✗</div>
              <div className={styles.comparisonPro}>✓</div>
            </div>
            <div className={styles.comparisonRow}>
              <div className={styles.comparisonFeature}>No watermarks</div>
              <div className={styles.comparisonFree}>✗</div>
              <div className={styles.comparisonPro}>✓</div>
            </div>
            <div className={styles.comparisonRow}>
              <div className={styles.comparisonFeature}>Priority support</div>
              <div className={styles.comparisonFree}>✗</div>
              <div className={styles.comparisonPro}>✓</div>
            </div>
          </div>

          {/* Plan selection */}
          <div className={styles.plans}>
            <div
              className={`${styles.plan} ${selectedPlan === 'monthly' ? styles.planActive : ''}`}
              onClick={() => setSelectedPlan('monthly')}
            >
              <div className={styles.planHeader}>
                <span className={styles.planName}>Monthly</span>
                <span className={styles.planPrice}>₹99 <span>/month</span></span>
              </div>
            </div>

            <div
              className={`${styles.plan} ${selectedPlan === 'yearly' ? styles.planActive : ''}`}
              onClick={() => setSelectedPlan('yearly')}
            >
              <span className={styles.popularTag}>Best Value</span>
              <div className={styles.planHeader}>
                <span className={styles.planName}>Yearly</span>
                <span className={styles.planPrice}>₹499 <span>/year</span></span>
              </div>
              <ul className={styles.planFeatures}>
                <li>Save 58% vs monthly</li>
                <li>All premium templates included</li>
              </ul>
            </div>
          </div>

          <button
            onClick={handleUpgrade}
            className={styles.upgradeBtn}
            disabled={loading || success}
            id="upgrade-button"
          >
            {loading ? (
              <span className={styles.spinner}></span>
            ) : success ? (
              '✅ Upgraded!'
            ) : (
              <>👑 Upgrade Now — {selectedPlan === 'monthly' ? '₹99/mo' : '₹499/yr'}</>
            )}
          </button>

          <button
            onClick={onClose}
            className={styles.closeBtn}
            id="premium-close-button"
          >
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  );
}
