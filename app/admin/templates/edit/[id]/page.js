'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { use } from 'react';
import Link from 'next/link';
import styles from '../../../admin.module.css';

export default function EditTemplatePage({ params }) {
  const { id } = use(params);
  const router = useRouter();
  const imageRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [placingMode, setPlacingMode] = useState(null);
  const [form, setForm] = useState({
    title: '', category: 'birthday', imageUrl: '', isPremium: false, isActive: true,
    overlayConfig: {
      namePosition: { x: 540, y: 900 }, nameFont: 'Outfit', nameFontSize: 36, nameColor: '#ffffff',
      photoPosition: { x: 540, y: 700 }, photoSize: 150, photoShape: 'circle',
    },
  });

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/templates/${id}`);
        const data = await res.json();
        if (data.template) {
          const t = data.template;
          setForm({ title: t.title||'', category: t.category||'birthday', imageUrl: t.imageUrl||'',
            isPremium: t.isPremium||false, isActive: t.isActive!==false,
            overlayConfig: t.overlayConfig || form.overlayConfig });
          setImagePreview(t.imageUrl || '');
        }
      } catch(e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith('overlay.')) {
      const key = name.split('.')[1];
      setForm(p => ({ ...p, overlayConfig: { ...p.overlayConfig, [key]: type==='number'?Number(value):value }}));
    } else { setForm(p => ({ ...p, [name]: type==='checkbox'?checked:value })); }
  };

  const handleCanvasClick = (e) => {
    if (!placingMode || !imageRef.current) return;
    const rect = imageRef.current.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 1080);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 1080);
    setForm(p => ({ ...p, overlayConfig: { ...p.overlayConfig,
      ...(placingMode==='photo' ? {photoPosition:{x,y}} : {namePosition:{x,y}}) }}));
    setPlacingMode(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const res = await fetch(`/api/templates/${id}`, { method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify(form) });
      if (res.ok) { setToast('Updated!'); setTimeout(()=>router.push('/admin/templates'),1000); }
      else { const d=await res.json(); setToast(`Error: ${d.error}`); }
    } catch(e) { setToast('Failed'); } finally { setSaving(false); }
  };

  const ms = (pos) => ({ left:`${(pos.x/1080)*100}%`, top:`${(pos.y/1080)*100}%` });

  if (loading) return <p style={{color:'var(--text-tertiary)',padding:'var(--space-8)'}}>Loading...</p>;
  return (
    <div>
      <div className={styles.pageHeader}><div><h1>Edit Template</h1></div></div>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}><label className={styles.formLabel}>Title *</label>
          <input type="text" name="title" value={form.title} onChange={handleChange} className={styles.formInput} required /></div>
        <div className={styles.formRow}>
          <div className={styles.formGroup}><label className={styles.formLabel}>Category</label>
            <select name="category" value={form.category} onChange={handleChange} className={styles.formSelect}>
              <option value="birthday">Birthday</option><option value="anniversary">Anniversary</option>
              <option value="festival">Festival</option><option value="general">General</option></select></div>
          <div className={styles.formGroup}><label className={styles.formLabel}>Options</label>
            <label className={styles.formCheckbox}><input type="checkbox" name="isPremium" checked={form.isPremium} onChange={handleChange}/> Premium</label>
            <label className={styles.formCheckbox} style={{marginTop:'4px'}}><input type="checkbox" name="isActive" checked={form.isActive} onChange={handleChange}/> Active</label></div>
        </div>
        <div className={styles.formGroup}><label className={styles.formLabel}>Image URL *</label>
          <input type="url" name="imageUrl" value={form.imageUrl} onChange={(e)=>{setForm(p=>({...p,imageUrl:e.target.value}));setImagePreview(e.target.value)}} className={styles.formInput} required /></div>
        {imagePreview && <div style={{marginTop:'var(--space-6)'}}>
          <h3>Overlay Configurator</h3>
          <div className={styles.configuratorWrap}>
            <div className={styles.configuratorCanvas} onClick={handleCanvasClick}>
              <img ref={imageRef} src={imagePreview} alt="Preview" onError={()=>setImagePreview('')}/>
              <div className={`${styles.configuratorMarker} ${styles.markerPhoto}`} style={ms(form.overlayConfig.photoPosition)}/>
              <div className={`${styles.configuratorMarker} ${styles.markerName}`} style={ms(form.overlayConfig.namePosition)}/>
            </div>
            <div className={styles.configuratorControls}>
              <button type="button" className={styles.actionBtn} onClick={()=>setPlacingMode(placingMode==='photo'?null:'photo')} style={{padding:'var(--space-3)'}}>
                📸 {placingMode==='photo'?'Click image...':'Set Photo'}</button>
              <button type="button" className={styles.actionBtn} onClick={()=>setPlacingMode(placingMode==='name'?null:'name')} style={{padding:'var(--space-3)'}}>
                ✏️ {placingMode==='name'?'Click image...':'Set Name'}</button>
              <div className={styles.formGroup}><label className={styles.formLabel}>Photo Size</label>
                <input type="number" name="overlay.photoSize" value={form.overlayConfig.photoSize} onChange={handleChange} className={styles.formInput} min="50" max="400"/></div>
              <div className={styles.formGroup}><label className={styles.formLabel}>Font Size</label>
                <input type="number" name="overlay.nameFontSize" value={form.overlayConfig.nameFontSize} onChange={handleChange} className={styles.formInput} min="16" max="80"/></div>
              <div className={styles.formGroup}><label className={styles.formLabel}>Name Color</label>
                <input type="color" name="overlay.nameColor" value={form.overlayConfig.nameColor} onChange={handleChange} style={{width:'100%',height:'40px',cursor:'pointer'}}/></div>
            </div>
          </div>
        </div>}
        <div className={styles.formActions}>
          <button type="submit" className={styles.submitBtn} disabled={saving}>{saving?'Saving...':'Update Template'}</button>
          <Link href="/admin/templates" className={styles.cancelBtn}>Cancel</Link></div>
      </form>
      {toast && <div className={styles.toast}>{toast}</div>}
    </div>
  );
}
