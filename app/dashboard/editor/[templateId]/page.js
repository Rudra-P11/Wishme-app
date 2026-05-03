'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { use } from 'react';
import Link from 'next/link';
import styles from './editor.module.css';

export default function EditorPage({ params }) {
  const { templateId } = use(params);
  const { data: session } = useSession();
  const router = useRouter();
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  const [template, setTemplate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rendering, setRendering] = useState(false);
  const [toast, setToast] = useState('');

  // Editable fields
  const [userName, setUserName] = useState(session?.user?.name || 'Your Name');
  const [userPhoto, setUserPhoto] = useState(session?.user?.image || '');
  const [userPhotoFile, setUserPhotoFile] = useState(null);

  // Load template data
  useEffect(() => {
    async function loadTemplate() {
      try {
        const res = await fetch(`/api/templates/${templateId}`);
        const data = await res.json();
        if (data.template) {
          setTemplate(data.template);
        } else {
          router.push('/dashboard');
        }
      } catch (err) {
        console.error('Failed to load template:', err);
        router.push('/dashboard');
      } finally {
        setLoading(false);
      }
    }
    loadTemplate();
  }, [templateId, router]);

  // Update userName when session loads
  useEffect(() => {
    if (session?.user?.name) {
      setUserName(session.user.name);
    }
    if (session?.user?.image) {
      setUserPhoto(session.user.image);
    }
  }, [session]);

  // Render canvas whenever inputs change
  const renderCanvas = useCallback(() => {
    if (!template || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const config = template.overlayConfig || {};

    // Set canvas size
    canvas.width = 1080;
    canvas.height = 1080;

    setRendering(true);

    // Load background image
    const bgImage = new Image();
    bgImage.crossOrigin = 'anonymous';
    bgImage.onload = () => {
      // Draw background
      ctx.drawImage(bgImage, 0, 0, 1080, 1080);

      // Draw user photo if available
      const drawPhoto = () => {
        return new Promise((resolve) => {
          if (!userPhoto) {
            resolve();
            return;
          }

          const photoImg = new Image();
          photoImg.crossOrigin = 'anonymous';
          photoImg.onload = () => {
            const px = config.photoPosition?.x || 540;
            const py = config.photoPosition?.y || 700;
            const size = config.photoSize || 150;
            const halfSize = size / 2;

            ctx.save();

            // Draw circular clip
            if (config.photoShape === 'square') {
              ctx.beginPath();
              ctx.rect(px - halfSize, py - halfSize, size, size);
              ctx.clip();
            } else {
              ctx.beginPath();
              ctx.arc(px, py, halfSize, 0, Math.PI * 2);
              ctx.clip();
            }

            ctx.drawImage(photoImg, px - halfSize, py - halfSize, size, size);
            ctx.restore();

            // Draw border around photo
            ctx.beginPath();
            ctx.arc(px, py, halfSize + 2, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.lineWidth = 3;
            ctx.stroke();

            resolve();
          };
          photoImg.onerror = () => resolve();
          photoImg.src = userPhoto;
        });
      };

      // Draw name text
      const drawName = () => {
        const nx = config.namePosition?.x || 540;
        const ny = config.namePosition?.y || 900;
        const fontSize = config.nameFontSize || 36;
        const fontFamily = config.nameFont || 'Outfit';
        const color = config.nameColor || '#ffffff';

        ctx.save();
        ctx.font = `bold ${fontSize}px ${fontFamily}, sans-serif`;
        ctx.fillStyle = color;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Text shadow for readability
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 8;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 2;

        ctx.fillText(userName, nx, ny);
        ctx.restore();
      };

      drawPhoto().then(() => {
        drawName();
        setRendering(false);
      });
    };

    bgImage.onerror = () => {
      // Draw fallback
      ctx.fillStyle = '#1a1a24';
      ctx.fillRect(0, 0, 1080, 1080);
      ctx.fillStyle = '#a0a0b8';
      ctx.font = '24px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Failed to load template image', 540, 540);
      setRendering(false);
    };

    bgImage.src = template.imageUrl;
  }, [template, userName, userPhoto]);

  useEffect(() => {
    if (template) {
      renderCanvas();
    }
  }, [template, renderCanvas]);

  // Handle photo upload
  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setUserPhoto(event.target.result);
      setUserPhotoFile(file);
    };
    reader.readAsDataURL(file);
  };

  // Download merged image
  const handleDownload = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = `wishme-${template?.title || 'card'}.png`;
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
    showToast('Image downloaded! 🎉');
  };

  // Share using Web Share API
  const handleShare = async () => {
    if (!canvasRef.current) return;

    try {
      const blob = await new Promise((resolve) =>
        canvasRef.current.toBlob(resolve, 'image/png')
      );

      const file = new File([blob], `wishme-${template?.title || 'card'}.png`, {
        type: 'image/png',
      });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `${template?.title || 'Greeting Card'} - Wishme`,
          text: `Check out this personalized card made with Wishme!`,
        });
        showToast('Shared successfully! 🚀');
      } else {
        // Fallback to download
        handleDownload();
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        handleDownload();
      }
    }
  };

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(''), 3000);
  };

  if (loading) {
    return (
      <div className={styles.editorPage}>
        <div className={styles.canvasLoading}>
          <div className={styles.spinner}></div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.editorPage}>
      <div className={styles.editorHeader}>
        <Link href="/dashboard" className={styles.backBtn}>
          ← Back
        </Link>
        <h2 className={styles.editorTitle}>{template?.title}</h2>
      </div>

      <div className={styles.editorContent}>
        {/* Canvas Preview */}
        <div className={styles.canvasWrap}>
          {rendering && (
            <div className={styles.canvasLoading}>
              <div className={styles.spinner}></div>
            </div>
          )}
          <canvas
            ref={canvasRef}
            className={styles.canvas}
            id="greeting-canvas"
          />
        </div>

        {/* Controls */}
        <div className={styles.controls}>
          {/* Name editor */}
          <div className={styles.controlCard}>
            <h3>Your Name</h3>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className={styles.controlInput}
              placeholder="Enter your name"
              id="name-input"
            />
          </div>

          {/* Photo editor */}
          <div className={styles.controlCard}>
            <h3>Your Photo</h3>
            <div className={styles.photoUpload}>
              {userPhoto ? (
                <img
                  src={userPhoto}
                  alt="Profile"
                  className={styles.photoPreview}
                />
              ) : (
                <div className={styles.photoPlaceholder}>📷</div>
              )}
              <button
                onClick={() => fileInputRef.current?.click()}
                className={styles.uploadBtn}
                type="button"
              >
                {userPhoto ? 'Change Photo' : 'Upload Photo'}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className={styles.hiddenInput}
                id="photo-upload-input"
              />
            </div>
          </div>

          {/* Actions */}
          <div className={styles.actions}>
            <button
              onClick={handleShare}
              className={styles.shareBtn}
              id="share-button"
            >
              🚀 Share Card
            </button>
            <button
              onClick={handleDownload}
              className={styles.downloadBtn}
              id="download-button"
            >
              ⬇️ Download PNG
            </button>
          </div>
        </div>
      </div>

      {toast && <div className={styles.toast}>{toast}</div>}
    </div>
  );
}
