'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from '../../admin.module.css';

export default function NewTemplatePage() {
  const router = useRouter();
  const imageRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [placingMode, setPlacingMode] = useState(null); // 'photo' | 'name' | null

  const [form, setForm] = useState({
    title: '',
    category: 'birthday',
    imageUrl: '',
    isPremium: false,
    isActive: true,
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
      const res = await fetch('/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        showToast('Template created successfully!');
        setTimeout(() => router.push('/admin/templates'), 1000);
      } else {
        const data = await res.json();
        showToast(`Error: ${data.error}`);
      }
    } catch (err) {
      showToast('Failed to create template');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  // Calculate marker positions as percentages for the preview
  const getMarkerStyle = (pos) => {
    if (!imagePreview) return { display: 'none' };
    return {
      left: `${(pos.x / 1080) * 100}%`,
      top: `${(pos.y / 1080) * 100}%`,
    };
  };

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1>Add New Template</h1>
          <p>Upload a template image and configure the overlay positions</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        {/* Basic info */}
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Template Title *</label>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            className={styles.formInput}
            placeholder="e.g., Colorful Birthday Balloons"
            required
          />
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Category *</label>
            <select name="category" value={form.category} onChange={handleChange} className={styles.formSelect}>
              <option value="birthday">🎂 Birthday</option>
              <option value="anniversary">💍 Anniversary</option>
              <option value="festival">🎆 Festival</option>
              <option value="general">🙏 General</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Type</label>
            <label className={styles.formCheckbox}>
              <input type="checkbox" name="isPremium" checked={form.isPremium} onChange={handleChange} />
              Premium Template (PRO)
            </label>
          </div>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Image URL *</label>
          <input
            type="url"
            name="imageUrl"
            value={form.imageUrl}
            onChange={handleImageUrl}
            className={styles.formInput}
            placeholder="https://res.cloudinary.com/... or paste any image URL"
            required
          />
        </div>

        {/* Overlay configurator */}
        {imagePreview && (
          <>
            <h3 style={{ marginTop: 'var(--space-6)', marginBottom: 'var(--space-2)' }}>
              Overlay Position Configurator
            </h3>
            <div className={styles.configuratorHint}>
              💡 Click &quot;Set Photo Position&quot; or &quot;Set Name Position&quot;, then click on the image
              where you want the user&apos;s photo or name to appear.
            </div>

            <div className={styles.configuratorWrap}>
              <div className={styles.configuratorCanvas} onClick={handleCanvasClick}>
                <img
                  ref={imageRef}
                  src={imagePreview}
                  alt="Template preview"
                  onError={() => setImagePreview('')}
                />
                {/* Photo marker */}
                <div
                  className={`${styles.configuratorMarker} ${styles.markerPhoto}`}
                  style={getMarkerStyle(form.overlayConfig.photoPosition)}
                  title="Photo position"
                />
                {/* Name marker */}
                <div
                  className={`${styles.configuratorMarker} ${styles.markerName}`}
                  style={getMarkerStyle(form.overlayConfig.namePosition)}
                  title="Name position"
                />
              </div>

              <div className={styles.configuratorControls}>
                <button
                  type="button"
                  className={`${styles.actionBtn} ${placingMode === 'photo' ? styles.sidebarLinkActive : ''}`}
                  onClick={() => setPlacingMode(placingMode === 'photo' ? null : 'photo')}
                  style={{ padding: 'var(--space-3) var(--space-4)' }}
                >
                  📸 {placingMode === 'photo' ? 'Click on image...' : 'Set Photo Position'}
                </button>

                <button
                  type="button"
                  className={`${styles.actionBtn} ${placingMode === 'name' ? styles.sidebarLinkActive : ''}`}
                  onClick={() => setPlacingMode(placingMode === 'name' ? null : 'name')}
                  style={{ padding: 'var(--space-3) var(--space-4)' }}
                >
                  ✏️ {placingMode === 'name' ? 'Click on image...' : 'Set Name Position'}
                </button>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Photo Size (px)</label>
                  <input
                    type="number"
                    name="overlay.photoSize"
                    value={form.overlayConfig.photoSize}
                    onChange={handleChange}
                    className={styles.formInput}
                    min="50"
                    max="400"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Name Font Size (px)</label>
                  <input
                    type="number"
                    name="overlay.nameFontSize"
                    value={form.overlayConfig.nameFontSize}
                    onChange={handleChange}
                    className={styles.formInput}
                    min="16"
                    max="80"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Name Color</label>
                  <input
                    type="color"
                    name="overlay.nameColor"
                    value={form.overlayConfig.nameColor}
                    onChange={handleChange}
                    style={{ width: '100%', height: '40px', cursor: 'pointer', borderRadius: 'var(--radius-lg)' }}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Photo Shape</label>
                  <select
                    name="overlay.photoShape"
                    value={form.overlayConfig.photoShape}
                    onChange={handleChange}
                    className={styles.formSelect}
                  >
                    <option value="circle">Circle</option>
                    <option value="square">Square</option>
                    <option value="rounded">Rounded</option>
                  </select>
                </div>

                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
                  <p>📸 Photo: ({form.overlayConfig.photoPosition.x}, {form.overlayConfig.photoPosition.y})</p>
                  <p>✏️ Name: ({form.overlayConfig.namePosition.x}, {form.overlayConfig.namePosition.y})</p>
                </div>
              </div>
            </div>
          </>
        )}

        <div className={styles.formActions}>
          <button type="submit" className={styles.submitBtn} disabled={loading} id="save-template-btn">
            {loading ? <span className={styles.spinner}></span> : 'Save Template'}
          </button>
          <Link href="/admin/templates" className={styles.cancelBtn}>
            Cancel
          </Link>
        </div>
      </form>

      {toast && <div className={styles.toast}>{toast}</div>}
    </div>
  );
}
