'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import styles from './page.module.css';

export default function CreatorStudio() {
  const { data: session } = useSession();
  const router = useRouter();
  const imageRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [placingMode, setPlacingMode] = useState(null); // 'photo' | 'name' | null

  const [form, setForm] = useState({
    title: '',
    category: 'general',
    imageUrl: '',
    isPremium: false,
    overlayConfig: {
      namePosition: { x: 540, y: 900 },
      nameFont: 'Outfit',
      nameFontSize: 36,
      nameColor: '#ffffff',
      photoPosition: { x: 540, y: 700 },
      photoSize: 150,
      photoShape: 'circle',
    },
  });

  useEffect(() => {
    if (session?.user && !session.user.isCreator) {
      router.push('/dashboard/become-creator');
    }
  }, [session, router]);

  if (!session?.user?.isCreator) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith('overlay.')) {
      const key = name.split('.')[1];
      setForm((prev) => ({
        ...prev,
        overlayConfig: { ...prev.overlayConfig, [key]: type === 'number' ? Number(value) : value },
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      }));
    }
  };

  const handleImageUrl = (e) => {
    const url = e.target.value;
    setForm((prev) => ({ ...prev, imageUrl: url }));
    setImagePreview(url);
  };

  const handleCanvasClick = (e) => {
    if (!placingMode || !imageRef.current) return;

    const rect = imageRef.current.getBoundingClientRect();
    const scaleX = 1080 / rect.width;
    const scaleY = 1080 / rect.height;
    const x = Math.round((e.clientX - rect.left) * scaleX);
    const y = Math.round((e.clientY - rect.top) * scaleY);

    setForm((prev) => ({
      ...prev,
      overlayConfig: {
        ...prev.overlayConfig,
        ...(placingMode === 'photo'
          ? { photoPosition: { x, y } }
          : { namePosition: { x, y } }),
      },
    }));

    setPlacingMode(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/templates/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        showToast('Template published successfully! 🎉');
        setTimeout(() => router.push('/dashboard/community'), 1000);
      } else {
        const data = await res.json();
        showToast(`Error: ${data.error}`);
      }
    } catch (err) {
      showToast('Failed to publish template');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const getMarkerStyle = (pos) => {
    if (!imagePreview) return { display: 'none' };
    return {
      left: `${(pos.x / 1080) * 100}%`,
      top: `${(pos.y / 1080) * 100}%`,
    };
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Creator Studio 🎨</h1>
        <p>Upload and publish your own template to the Community.</p>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.card}>
          <div className={styles.formGroup}>
            <label>Template Title</label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              className={styles.input}
              placeholder="e.g., Pink Birthday Magic"
              required
            />
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Category</label>
              <select name="category" value={form.category} onChange={handleChange} className={styles.select}>
                <option value="birthday">🎂 Birthday</option>
                <option value="anniversary">💍 Anniversary</option>
                <option value="festival">🎆 Festival</option>
                <option value="love">❤️ Love</option>
                <option value="quote">💬 Quote</option>
                <option value="shayari">🌹 Shayari</option>
                <option value="joke">😂 Joke</option>
                <option value="general">🙏 General</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label>Pricing</label>
              <div className={styles.toggleWrap}>
                <input 
                  type="checkbox" 
                  name="isPremium" 
                  checked={form.isPremium} 
                  onChange={handleChange} 
                  id="premiumToggle"
                />
                <label htmlFor="premiumToggle">Make this PRO Template</label>
              </div>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>Image URL</label>
            <input
              type="url"
              name="imageUrl"
              value={form.imageUrl}
              onChange={handleImageUrl}
              className={styles.input}
              placeholder="Paste direct image link (1080x1080 recommended)"
              required
            />
          </div>
        </div>

        {imagePreview && (
          <div className={styles.card}>
            <h3>Visual Configurator</h3>
            <p className={styles.hint}>Click the buttons below, then click on the image to set where the user's details will appear.</p>
            
            <div className={styles.configWrap}>
              <div className={styles.canvasArea} onClick={handleCanvasClick}>
                <img
                  ref={imageRef}
                  src={imagePreview}
                  alt="Preview"
                  onError={() => setImagePreview('')}
                />
                <div
                  className={`${styles.marker} ${styles.markerPhoto}`}
                  style={getMarkerStyle(form.overlayConfig.photoPosition)}
                  title="Photo position"
                />
                <div
                  className={`${styles.marker} ${styles.markerName}`}
                  style={getMarkerStyle(form.overlayConfig.namePosition)}
                  title="Name position"
                />
              </div>

              <div className={styles.controls}>
                <button
                  type="button"
                  className={`${styles.actionBtn} ${placingMode === 'photo' ? styles.activeBtn : ''}`}
                  onClick={() => setPlacingMode(placingMode === 'photo' ? null : 'photo')}
                >
                  📸 {placingMode === 'photo' ? 'Click on image...' : 'Set Photo Position'}
                </button>
                <button
                  type="button"
                  className={`${styles.actionBtn} ${placingMode === 'name' ? styles.activeBtn : ''}`}
                  onClick={() => setPlacingMode(placingMode === 'name' ? null : 'name')}
                >
                  ✏️ {placingMode === 'name' ? 'Click on image...' : 'Set Name Position'}
                </button>

                <div className={styles.formGroup}>
                  <label>Name Color</label>
                  <input
                    type="color"
                    name="overlay.nameColor"
                    value={form.overlayConfig.nameColor}
                    onChange={handleChange}
                    className={styles.colorInput}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        <div className={styles.actions}>
          <Link href="/dashboard" className={styles.cancelBtn}>Cancel</Link>
          <button type="submit" className={styles.publishBtn} disabled={loading}>
            {loading ? 'Publishing...' : '🚀 Publish to Community'}
          </button>
        </div>
      </form>
      {toast && <div className={styles.toast}>{toast}</div>}
    </div>
  );
}
