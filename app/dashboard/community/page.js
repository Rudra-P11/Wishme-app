'use client';

import { Suspense } from 'react';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import PremiumGate from '@/components/editor/PremiumGate';
import Link from 'next/link';
import styles from '../dashboard.module.css';

const CATEGORIES = [
  { id: 'all', label: '🎯 All', emoji: '🎯' },
  { id: 'birthday', label: '🎂 Birthday', emoji: '🎂' },
  { id: 'anniversary', label: '💍 Anniversary', emoji: '💍' },
  { id: 'festival', label: '🎆 Festivals', emoji: '🎆' },
  { id: 'love', label: '❤️ Love', emoji: '❤️' },
  { id: 'quote', label: '💬 Quotes', emoji: '💬' },
  { id: 'shayari', label: '🌹 Shayari', emoji: '🌹' },
  { id: 'general', label: '🙏 General', emoji: '🙏' },
];

function CommunityContent() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isGuest = searchParams.get('guest') === 'true';

  const [activeCategory, setActiveCategory] = useState(
    searchParams.get('category') || 'all'
  );
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPremiumGate, setShowPremiumGate] = useState(false);

  useEffect(() => {
    fetchTemplates();
  }, [activeCategory]);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (activeCategory !== 'all') {
        params.set('category', activeCategory);
      }
      params.set('isCommunity', 'true'); // Fetch community templates

      const res = await fetch(`/api/templates?${params.toString()}`);
      const data = await res.json();
      setTemplates(data.templates || []);
    } catch (err) {
      console.error('Failed to fetch templates:', err);
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (categoryId) => {
    setActiveCategory(categoryId);
    const params = new URLSearchParams(searchParams.toString());
    if (categoryId === 'all') {
      params.delete('category');
    } else {
      params.set('category', categoryId);
    }
    router.replace(`/dashboard/community?${params.toString()}`, { scroll: false });
  };

  const handleTemplateClick = (template) => {
    if (template.isPremium && !session?.user?.isPremium && !isGuest) {
      setShowPremiumGate(true);
      return;
    }
    router.push(`/dashboard/editor/${template._id}`);
  };

  const userName = session?.user?.name || 'Guest';
  const userImage = session?.user?.image || '';

  return (
    <>
      <div className={styles.dashboardHeader}>
        <h1>
          Creator <span className="gradient-text">Community</span> 🌍
        </h1>
        <p>Discover and customize beautiful templates created by our community designers.</p>
        
        {session?.user?.isCreator ? (
          <Link href="/dashboard/create" className={styles.createBtn} style={{ marginTop: '1rem', display: 'inline-block', padding: '10px 20px', background: 'var(--color-primary)', color: 'white', borderRadius: '20px', textDecoration: 'none', fontWeight: 'bold' }}>
            + Publish New Template
          </Link>
        ) : (
          <Link href="/dashboard/become-creator" className={styles.createBtn} style={{ marginTop: '1rem', display: 'inline-block', padding: '10px 20px', background: 'var(--bg-input)', color: 'var(--text-primary)', border: '1px solid var(--border-default)', borderRadius: '20px', textDecoration: 'none', fontWeight: 'bold' }}>
            🎨 Become a Creator
          </Link>
        )}
      </div>

      {/* Category Tabs */}
      <div className={styles.categoryTabs} id="category-tabs">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            className={`${styles.tabBtn} ${
              activeCategory === cat.id ? styles.tabBtnActive : ''
            }`}
            onClick={() => handleCategoryChange(cat.id)}
            id={`tab-${cat.id}`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Template Grid */}
      <div className={styles.templateGrid} id="template-grid">
        {loading
          ? Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className={styles.templateCard}>
                <div className={styles.skeleton}></div>
                <div className={styles.skeletonInfo}>
                  <div className={styles.skeletonLine}></div>
                  <div className={styles.skeletonLine}></div>
                </div>
              </div>
            ))
          : templates.length === 0
          ? (
            <div className={styles.emptyState}>
              <span className={styles.emptyEmoji}>🌍</span>
              <h3>No community templates yet</h3>
              <p>Be the first to publish a template to the world!</p>
            </div>
          )
          : templates.map((template) => (
              <div
                key={template._id}
                className={styles.templateCard}
                onClick={() => handleTemplateClick(template)}
                id={`template-${template._id}`}
              >
                <div className={styles.templateImageWrap}>
                  <img
                    src={template.imageUrl || template.thumbnailUrl}
                    alt={template.title}
                    className={styles.templateImage}
                    loading="lazy"
                  />

                  {/* Creator badge overlay */}
                  <div style={{ position: 'absolute', bottom: '8px', right: '8px', zIndex: 10 }}>
                    <Link href={`/dashboard/creator/${template.creatorId?._id || template.creatorId}`} onClick={(e) => e.stopPropagation()} style={{ background: 'rgba(0,0,0,0.6)', padding: '4px 10px', borderRadius: '12px', fontSize: '10px', color: 'white', backdropFilter: 'blur(4px)', textDecoration: 'none' }}>
                      By @{template.creatorId?.name || template.creatorName || 'unknown'} {template.creatorId?.followers ? ` • ${template.creatorId.followers.length} followers` : ''}
                    </Link>
                  </div>

                  {/* Hover overlay */}
                  <div className={styles.templateOverlay}>
                    <div className={styles.overlayBtn}>
                      ✨ Customize
                    </div>
                  </div>

                  {/* Badge */}
                  {template.isPremium ? (
                    <span className={styles.premiumBadge}>PRO</span>
                  ) : (
                    <span className={styles.freeBadge}>Free</span>
                  )}
                </div>

                <div className={styles.templateInfo}>
                  <div className={styles.templateTitle}>{template.title}</div>
                  <div className={styles.templateCategory}>
                    {template.category}
                  </div>
                </div>
              </div>
            ))}
      </div>

      {/* Premium Gate Modal */}
      {showPremiumGate && (
        <PremiumGate
          onClose={() => setShowPremiumGate(false)}
          onUpgrade={() => {
            window.location.reload();
          }}
        />
      )}
    </>
  );
}

export default function CommunityPage() {
  return (
    <div className={styles.dashboardPage}>
      <Suspense fallback={
        <div>
          <div className={styles.dashboardHeader}>
            <h1>Loading...</h1>
          </div>
          <div className={styles.templateGrid}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className={styles.templateCard}>
                <div className={styles.skeleton}></div>
                <div className={styles.skeletonInfo}>
                  <div className={styles.skeletonLine}></div>
                  <div className={styles.skeletonLine}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      }>
        <CommunityContent />
      </Suspense>
    </div>
  );
}
