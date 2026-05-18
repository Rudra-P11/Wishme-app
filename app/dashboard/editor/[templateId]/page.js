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
  const renderFrameRef = useRef(null);

  const [template, setTemplate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rendering, setRendering] = useState(false);
  const [toast, setToast] = useState('');

  // Editable fields
  const [userName, setUserName] = useState(session?.user?.name || 'Your Name');
  const [userPhoto, setUserPhoto] = useState(session?.user?.image || '');
  const [userPhotoFile, setUserPhotoFile] = useState(null);

  // Customization state
  const [showTextCustomizer, setShowTextCustomizer] = useState(false);
  const [showPhotoCustomizer, setShowPhotoCustomizer] = useState(false);

  // AI Generator state
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLanguage, setAiLanguage] = useState('English');
  const [aiMessage, setAiMessage] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const [customText, setCustomText] = useState({
    fontFamily: '',
    fontSizeScale: 1,
    offsetX: 0,
    offsetY: 0,
    color: '',
    shadow: true,
    glow: false,
  });

  const [customPhoto, setCustomPhoto] = useState({
    sizeScale: 1,
    offsetX: 0,
    offsetY: 0,
  });

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

  const [animationEffect, setAnimationEffect] = useState('none');
  const [isExporting, setIsExporting] = useState(false);
  const animationRef = useRef(null);
  const particlesRef = useRef([]);
  const bgImageRef = useRef(null);
  const photoImageRef = useRef(null);

  // Pre-load images
  useEffect(() => {
    if (template?.imageUrl) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => { bgImageRef.current = img; renderFrame(); };
      img.src = template.imageUrl;
    }
  }, [template]);

  useEffect(() => {
    if (userPhoto) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => { photoImageRef.current = img; renderFrame(); };
      img.src = userPhoto;
    } else {
      photoImageRef.current = null;
      renderFrame();
    }
  }, [userPhoto]);

  // Setup particles
  useEffect(() => {
    particlesRef.current = [];
    if (animationEffect === 'snow') {
      for (let i = 0; i < 150; i++) {
        particlesRef.current.push({
          x: Math.random() * 1080,
          y: Math.random() * 1080,
          r: Math.random() * 4 + 1,
          d: Math.random() * 100,
        });
      }
    } else if (animationEffect === 'confetti') {
      const colors = ['#f43f5e', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6'];
      for (let i = 0; i < 100; i++) {
        particlesRef.current.push({
          x: Math.random() * 1080,
          y: Math.random() * 1080 - 1080,
          r: Math.random() * 6 + 4,
          dx: Math.random() * 4 - 2,
          dy: Math.random() * 5 + 2,
          color: colors[Math.floor(Math.random() * colors.length)],
          tilt: Math.floor(Math.random() * 10) - 10,
          tiltAngleIncrement: (Math.random() * 0.07) + 0.05,
          tiltAngle: 0
        });
      }
    } else if (animationEffect === 'hearts') {
      for (let i = 0; i < 50; i++) {
        particlesRef.current.push({
          x: Math.random() * 1080,
          y: Math.random() * 1080 - 1080,
          r: Math.random() * 10 + 10,
          tiltAngle: Math.random() * Math.PI * 2
        });
      }
    } else if (animationEffect === 'rain') {
      for (let i = 0; i < 150; i++) {
        particlesRef.current.push({
          x: Math.random() * 1080,
          y: Math.random() * 1080 - 1080,
          r: Math.random() * 10 + 10,
          d: Math.random() * 2 - 1
        });
      }
    }
    
    // Start animation if effect is selected
    if (animationEffect !== 'none') {
      const loop = () => {
        if (renderFrameRef.current) renderFrameRef.current();
        animationRef.current = requestAnimationFrame(loop);
      };
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      loop();
    } else {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      renderFrame();
    }
    
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [animationEffect]);

  // Draw a single frame
  const renderFrame = useCallback(() => {
    if (!template || !canvasRef.current || !bgImageRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const config = template.overlayConfig || {};

    canvas.width = 1080;
    canvas.height = 1080;

    // 1. Draw Background
    ctx.drawImage(bgImageRef.current, 0, 0, 1080, 1080);

    // 2. Draw Photo
    if (photoImageRef.current) {
      const px = parseFloat(config.photoPosition?.x || 540) + customPhoto.offsetX;
      const py = parseFloat(config.photoPosition?.y || 700) + customPhoto.offsetY;
      const baseSize = parseFloat(config.photoSize || 150);
      const size = baseSize * customPhoto.sizeScale;
      const halfSize = size / 2;

      ctx.save();
      if (config.photoShape === 'square') {
        ctx.beginPath();
        ctx.rect(px - halfSize, py - halfSize, size, size);
        ctx.clip();
      } else {
        ctx.beginPath();
        ctx.arc(px, py, halfSize, 0, Math.PI * 2);
        ctx.clip();
      }
      ctx.drawImage(photoImageRef.current, px - halfSize, py - halfSize, size, size);
      ctx.restore();

      ctx.beginPath();
      if (config.photoShape === 'square') {
        ctx.rect(px - halfSize, py - halfSize, size, size);
      } else {
        ctx.arc(px, py, halfSize + 2, 0, Math.PI * 2);
      }
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.lineWidth = 3;
      ctx.stroke();
    }

    // 3. Draw Text
    const nx = parseFloat(config.namePosition?.x || 540) + customText.offsetX;
    const ny = parseFloat(config.namePosition?.y || 900) + customText.offsetY;
    const baseFontSize = parseFloat(config.nameFontSize || 36);
    const fontSize = baseFontSize * customText.fontSizeScale;
    const fontFamily = customText.fontFamily || config.nameFont || 'Outfit';
    const color = customText.color || config.nameColor || '#ffffff';

    ctx.save();
    ctx.font = `bold ${fontSize}px "${fontFamily}", sans-serif`;
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    if (customText.glow) {
      ctx.shadowColor = color;
      ctx.shadowBlur = 25;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
    } else if (customText.shadow) {
      ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
      ctx.shadowBlur = 12;
      ctx.shadowOffsetX = 3;
      ctx.shadowOffsetY = 3;
    }
    ctx.fillText(userName, nx, ny);
    // Draw twice for intense glow
    if (customText.glow) {
      ctx.fillText(userName, nx, ny);
    }
    ctx.restore();

    // 4. Draw Particles
    if (animationEffect === 'snow') {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.beginPath();
      for (let i = 0; i < particlesRef.current.length; i++) {
        const p = particlesRef.current[i];
        ctx.moveTo(p.x, p.y);
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2, true);
        p.y += Math.cos(p.d) + 1 + p.r / 2;
        p.x += Math.sin(p.d) * 2;
        if (p.x > 1080 + 5 || p.x < -5 || p.y > 1080) {
          particlesRef.current[i] = { x: Math.random() * 1080, y: -10, r: p.r, d: p.d };
        }
      }
      ctx.fill();
    } else if (animationEffect === 'confetti') {
      for (let i = 0; i < particlesRef.current.length; i++) {
        const p = particlesRef.current[i];
        ctx.beginPath();
        ctx.lineWidth = p.r;
        ctx.strokeStyle = p.color;
        ctx.moveTo(p.x + p.tilt + p.r, p.y);
        ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r);
        ctx.stroke();

        p.tiltAngle += p.tiltAngleIncrement;
        p.y += (Math.cos(p.tiltAngle) + 1 + p.r / 2) / 2;
        p.x += Math.sin(p.tiltAngle) * 2;

        if (p.x > 1080 + 5 || p.x < -5 || p.y > 1080) {
          particlesRef.current[i] = { ...p, x: Math.random() * 1080, y: -10, tiltAngle: 0 };
        }
      }
    } else if (animationEffect === 'hearts') {
      ctx.fillStyle = 'rgba(255, 105, 180, 0.8)';
      for (let i = 0; i < particlesRef.current.length; i++) {
        const p = particlesRef.current[i];
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.scale(p.r / 15, p.r / 15);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.bezierCurveTo(0, -3, -5, -15, -15, -15);
        ctx.bezierCurveTo(-30, -15, -30, 7.5, -30, 7.5);
        ctx.bezierCurveTo(-30, 20, -10, 31, 0, 40);
        ctx.bezierCurveTo(10, 31, 30, 20, 30, 7.5);
        ctx.bezierCurveTo(30, 7.5, 30, -15, 15, -15);
        ctx.bezierCurveTo(5, -15, 0, -3, 0, 0);
        ctx.fill();
        ctx.restore();

        p.y += (Math.cos(p.tiltAngle) + 1 + p.r / 2) / 2;
        p.x += Math.sin(p.tiltAngle) * 2;
        if (p.x > 1080 + 30 || p.x < -30 || p.y > 1080) {
          particlesRef.current[i] = { ...p, x: Math.random() * 1080, y: -40 };
        }
      }
    } else if (animationEffect === 'rain') {
      ctx.strokeStyle = 'rgba(174, 194, 224, 0.7)';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.beginPath();
      for (let i = 0; i < particlesRef.current.length; i++) {
        const p = particlesRef.current[i];
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x + p.d, p.y + p.r * 2);
        p.y += p.r * 2;
        p.x += p.d;
        if (p.y > 1080) {
          particlesRef.current[i] = { ...p, x: Math.random() * 1080, y: -20 };
        }
      }
      ctx.stroke();
    }

    // 5. Draw Watermark
    if (!session?.user?.isPremium) {
      ctx.save();
      ctx.font = '500 20px sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
      ctx.shadowBlur = 4;
      ctx.shadowOffsetY = 1;
      ctx.fillText('Made with wishme-app.vercel.app', 540, 1060);
      ctx.restore();
    }
  }, [template, userName, customText, customPhoto, animationEffect, session]);

  // Keep ref up to date
  useEffect(() => {
    renderFrameRef.current = renderFrame;
  }, [renderFrame]);

  // Re-render when states change (only when no animation is playing)
  useEffect(() => {
    if (animationEffect === 'none') {
      renderFrame();
    }
  }, [renderFrame, animationEffect]);

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

  // Export 5s video
  const handleExportVideo = () => {
    if (!canvasRef.current) return;
    setIsExporting(true);
    showToast('Recording video... Please wait 5 seconds 🎥');

    // Force animation on if it's off so there's actually a video
    const currentEffect = animationEffect;
    if (animationEffect === 'none') {
       setAnimationEffect('snow'); 
    }

    // Delay slightly to let effect start
    setTimeout(() => {
      const stream = canvasRef.current.captureStream(30); // 30 FPS
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
      const chunks = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = `wishme-${template?.title || 'video'}.webm`;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
        
        setIsExporting(false);
        showToast('Video downloaded! 🎉');
        if (currentEffect === 'none') {
          setAnimationEffect('none');
        }
      };

      mediaRecorder.start();
      setTimeout(() => {
        mediaRecorder.stop();
      }, 5000); // 5 seconds
    }, 100);
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
          text: `Check out this personalized card I made for you! ✨ Create your own for free at https://wishme-app.vercel.app`,
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

  const [activeTab, setActiveTab] = useState('text');

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
      {/* 1. Left Sidebar */}
      <div className={styles.sidebar}>
        <button className={`${styles.tabBtn} ${activeTab === 'text' ? styles.active : ''}`} onClick={() => setActiveTab('text')}>
          <span className={styles.tabIcon}>T</span>
          Text
        </button>
        <button className={`${styles.tabBtn} ${activeTab === 'photo' ? styles.active : ''}`} onClick={() => setActiveTab('photo')}>
          <span className={styles.tabIcon}>🖼️</span>
          Photo
        </button>
        <button className={`${styles.tabBtn} ${activeTab === 'effects' ? styles.active : ''}`} onClick={() => setActiveTab('effects')}>
          <span className={styles.tabIcon}>✨</span>
          Effects
        </button>
        <button className={`${styles.tabBtn} ${activeTab === 'ai' ? styles.active : ''}`} onClick={() => setActiveTab('ai')}>
          <span className={styles.tabIcon}>🤖</span>
          AI Writer
        </button>
      </div>

      {/* 2. Sliding Tool Panel */}
      <div className={styles.toolPanel}>
        <div className={styles.toolPanelHeader}>
          <h2>
            {activeTab === 'text' && 'Text Customization'}
            {activeTab === 'photo' && 'Photo Adjustments'}
            {activeTab === 'effects' && 'Animations'}
            {activeTab === 'ai' && 'AI Message Generator'}
          </h2>
        </div>

        <div className={styles.toolPanelContent}>
          {/* TEXT TAB */}
          {activeTab === 'text' && (
            <>
              <div className={styles.controlGroup}>
                <label>Your Name</label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className={styles.controlInput}
                  placeholder="Enter your name"
                />
              </div>

              <div className={styles.controlGroup}>
                <label>Font Style</label>
                <div className={styles.fontGrid}>
                  {[
                    { name: 'Outfit', label: 'Modern' },
                    { name: 'Playfair Display', label: 'Elegant' },
                    { name: 'Caveat', label: 'Handwritten' },
                    { name: 'Tiro Devanagari Hindi', label: 'हिंदी' },
                  ].map(font => (
                    <button
                      key={font.name}
                      className={`${styles.fontBtn} ${customText.fontFamily === font.name ? styles.active : ''}`}
                      onClick={() => setCustomText(prev => ({ ...prev, fontFamily: font.name }))}
                      style={{ fontFamily: font.name }}
                    >
                      {font.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.controlGroup}>
                <label>Text Size</label>
                <input 
                  type="range" 
                  min="0.5" max="1.5" step="0.1" 
                  value={customText.fontSizeScale}
                  onChange={(e) => setCustomText(prev => ({ ...prev, fontSizeScale: parseFloat(e.target.value) }))}
                  className={styles.slider}
                />
              </div>

              <div className={styles.controlGroup}>
                <label>Color & Styling</label>
                <div className={styles.effectsRow}>
                  <input 
                    type="color" 
                    value={customText.color || template?.overlayConfig?.nameColor || '#ffffff'}
                    onChange={(e) => setCustomText(prev => ({ ...prev, color: e.target.value }))}
                    className={styles.colorPicker}
                  />
                  <button type="button"
                    className={`${styles.effectBtn} ${customText.shadow ? styles.active : ''}`}
                    onClick={() => setCustomText(prev => ({ ...prev, shadow: !prev.shadow, glow: false }))}
                  >
                    Shadow
                  </button>
                  <button type="button"
                    className={`${styles.effectBtn} ${customText.glow ? styles.active : ''}`}
                    onClick={() => setCustomText(prev => ({ ...prev, glow: !prev.glow, shadow: false }))}
                  >
                    Glow ✨
                  </button>
                </div>
              </div>

              <div className={styles.controlGroup}>
                <label>Position Nudge</label>
                <div className={styles.dpad}>
                  <button type="button" onClick={() => setCustomText(prev => ({ ...prev, offsetY: prev.offsetY - 10 }))}>↑</button>
                  <div>
                    <button type="button" onClick={() => setCustomText(prev => ({ ...prev, offsetX: prev.offsetX - 10 }))}>←</button>
                    <button type="button" onClick={() => setCustomText(prev => ({ ...prev, offsetX: prev.offsetX + 10 }))}>→</button>
                  </div>
                  <button type="button" onClick={() => setCustomText(prev => ({ ...prev, offsetY: prev.offsetY + 10 }))}>↓</button>
                </div>
              </div>
            </>
          )}

          {/* PHOTO TAB */}
          {activeTab === 'photo' && (
            <>
              <div className={styles.controlGroup} style={{ alignItems: 'center', marginBottom: '1rem' }}>
                {userPhoto ? (
                  <img src={userPhoto} alt="Profile" className={styles.photoPreview} />
                ) : (
                  <div className={styles.photoPlaceholder}>📷</div>
                )}
                <button onClick={() => fileInputRef.current?.click()} className={styles.uploadBtn} type="button">
                  {userPhoto ? 'Change Photo' : 'Upload Photo'}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  style={{ display: 'none' }}
                />
              </div>

              {userPhoto && (
                <>
                  <div className={styles.controlGroup}>
                    <label>Photo Size</label>
                    <input 
                      type="range" 
                      min="0.5" max="1.5" step="0.1" 
                      value={customPhoto.sizeScale}
                      onChange={(e) => setCustomPhoto(prev => ({ ...prev, sizeScale: parseFloat(e.target.value) }))}
                      className={styles.slider}
                    />
                  </div>
                  <div className={styles.controlGroup}>
                    <label>Position Nudge</label>
                    <div className={styles.dpad}>
                      <button type="button" onClick={() => setCustomPhoto(prev => ({ ...prev, offsetY: prev.offsetY - 10 }))}>↑</button>
                      <div>
                        <button type="button" onClick={() => setCustomPhoto(prev => ({ ...prev, offsetX: prev.offsetX - 10 }))}>←</button>
                        <button type="button" onClick={() => setCustomPhoto(prev => ({ ...prev, offsetX: prev.offsetX + 10 }))}>→</button>
                      </div>
                      <button type="button" onClick={() => setCustomPhoto(prev => ({ ...prev, offsetY: prev.offsetY + 10 }))}>↓</button>
                    </div>
                  </div>
                </>
              )}
            </>
          )}

          {/* EFFECTS TAB */}
          {activeTab === 'effects' && (
            <div className={styles.controlGroup}>
              <label>Select Animation Particle</label>
              <div className={styles.fontGrid}>
                <button type="button" className={`${styles.fontBtn} ${animationEffect === 'none' ? styles.active : ''}`} onClick={() => setAnimationEffect('none')}>None</button>
                <button type="button" className={`${styles.fontBtn} ${animationEffect === 'snow' ? styles.active : ''}`} onClick={() => setAnimationEffect('snow')}>❄️ Snow</button>
                <button type="button" className={`${styles.fontBtn} ${animationEffect === 'confetti' ? styles.active : ''}`} onClick={() => setAnimationEffect('confetti')}>🎉 Confetti</button>
                <button type="button" className={`${styles.fontBtn} ${animationEffect === 'hearts' ? styles.active : ''}`} onClick={() => setAnimationEffect('hearts')}>❤️ Hearts</button>
                <button type="button" className={`${styles.fontBtn} ${animationEffect === 'rain' ? styles.active : ''}`} onClick={() => setAnimationEffect('rain')}>🌧️ Rain</button>
              </div>
            </div>
          )}

          {/* AI TAB */}
          {activeTab === 'ai' && (
            <>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Generate a beautiful message to send along with your card on WhatsApp.</p>
              
              <div className={styles.controlGroup}>
                <label>Language</label>
                <select 
                  value={aiLanguage} 
                  onChange={(e) => setAiLanguage(e.target.value)}
                  className={styles.controlInput}
                >
                  <option value="English">English</option>
                  <option value="Hindi">Hindi</option>
                  <option value="Tamil">Tamil</option>
                  <option value="Telugu">Telugu</option>
                  <option value="Marathi">Marathi</option>
                  <option value="Bengali">Bengali</option>
                  <option value="Gujarati">Gujarati</option>
                </select>
              </div>

              <div className={styles.controlGroup}>
                <label>What's the occasion?</label>
                <input
                  type="text"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  className={styles.controlInput}
                  placeholder="e.g. funny 30th birthday wish for brother"
                />
              </div>

              <button
                onClick={async () => {
                  if (!aiPrompt) return;
                  setIsGenerating(true);
                  try {
                    const res = await fetch('/api/ai/generate-message', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ prompt: aiPrompt, language: aiLanguage, category: template?.category })
                    });
                    const data = await res.json();
                    if (data.message) {
                      setAiMessage(data.message);
                    } else {
                      setToast(data.error || 'Failed to generate');
                    }
                  } catch (err) {
                    setToast('Error generating message');
                  } finally {
                    setIsGenerating(false);
                  }
                }}
                disabled={isGenerating || !aiPrompt}
                className={styles.uploadBtn}
                style={{ background: 'var(--gradient-primary)', color: 'white', border: 'none', padding: '0.75rem' }}
                type="button"
              >
                {isGenerating ? '⏳ Generating...' : '✨ Generate AI Message'}
              </button>

              {aiMessage && (
                <div style={{ position: 'relative', marginTop: '1rem' }}>
                  <textarea 
                    readOnly 
                    value={aiMessage} 
                    className={styles.aiTextArea}
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(aiMessage);
                      setToast('Copied to clipboard!');
                      setTimeout(() => setToast(''), 3000);
                    }}
                    className={styles.copyBtn}
                    style={{ position: 'absolute', bottom: '12px', right: '12px', width: 'auto' }}
                    type="button"
                  >
                    📋 Copy
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* 3. Workspace Area */}
      <div className={styles.workspace}>
        <div className={styles.workspaceHeader}>
          <div className={styles.headerLeft}>
            <Link href="/dashboard" className={styles.backBtn}>
              ← Back
            </Link>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600, margin: 0, color: 'var(--text-primary)' }}>
              {template?.title}
            </h2>
          </div>
          <div className={styles.headerActions}>
            <button
              onClick={handleExportVideo}
              disabled={isExporting}
              className={styles.exportVideoBtn}
            >
              {isExporting ? '⏳ Recording...' : '🎥 Export Video'}
            </button>
            <button
              onClick={handleDownload}
              className={styles.downloadBtn}
            >
              ⬇️ Download
            </button>
            <button
              onClick={handleShare}
              className={styles.shareBtn}
            >
              🚀 Share Card
            </button>
          </div>
        </div>

        <div className={styles.canvasContainer}>
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
        </div>
      </div>

      {toast && <div className={styles.toast}>{toast}</div>}
    </div>
  );
}
