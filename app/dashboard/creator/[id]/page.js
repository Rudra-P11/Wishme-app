'use client';

import { Suspense } from 'react';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { use } from 'react';
import PremiumGate from '@/components/editor/PremiumGate';
import Link from 'next/link';
import styles from '../../dashboard.module.css';

function CreatorProfileContent({ id }) {
  const { data: session } = useSession();
  const router = useRouter();

  const [profile, setProfile] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPremiumGate, setShowPremiumGate] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, [id, session]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/user/${id}`);
      const data = await res.json();
      
      if (res.ok) {
        setProfile(data.profile);
        setTemplates(data.templates);

        // Check if current user is following
        if (session?.user?.id) {
          const userRes = await fetch(`/api/user/${session.user.id}`);
          const userData = await userRes.json();
          if (userData.profile?.following?.includes(id)) {
            setIsFollowing(true);
          }
        }
      } else {
        router.push('/dashboard/community');
      }
    } catch (err) {
      console.error('Failed to fetch profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFollowToggle = async () => {
    if (!session) {
      router.push('/login');
      return;
    }
    
    setFollowLoading(true);
    try {
      const res = await fetch('/api/user/follow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserId: id })
      });
      const data = await res.json();
      
      if (res.ok) {
        setIsFollowing(data.isFollowing);
        setProfile(prev => ({
          ...prev,
          followerCount: prev.followerCount + (data.isFollowing ? 1 : -1)
        }));
      }
    } catch (err) {
      console.error('Failed to toggle follow:', err);
    } finally {
      setFollowLoading(false);
    }
  };

  const handleTemplateClick = (template) => {
    if (template.isPremium && !session?.user?.isPremium) {
      setShowPremiumGate(true);
      return;
    }
    router.push(`/dashboard/editor/${template._id}`);
  };

  if (loading) {
    return (
      <div className={styles.dashboardHeader}>
        <h1>Loading Creator Profile...</h1>
        <div className={styles.spinner} style={{ marginTop: '2rem' }}></div>
      </div>
    );
  }

  if (!profile) return null;

  const isOwnProfile = session?.user?.id === profile.id;

  return (
    <>
      <div className={styles.dashboardHeader} style={{ textAlign: 'center', paddingBottom: '2rem', borderBottom: '1px solid var(--border-subtle)', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          {profile.image ? (
            <img 
              src={profile.image} 
              alt={profile.name} 
              style={{ 
                width: '120px', 
                height: '120px', 
                borderRadius: '50%', 
                objectFit: 'cover', 
                border: profile.isCreator ? '4px solid #3b82f6' : profile.isPremium ? '4px solid #f59e0b' : '4px solid var(--border-default)',
                padding: '4px',
                background: 'var(--bg-primary)'
              }} 
            />
          ) : (
            <div 
              style={{ 
                width: '120px', 
                height: '120px', 
                borderRadius: '50%', 
                background: 'var(--bg-secondary)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                fontSize: '3rem', 
                color: 'var(--text-secondary)',
                border: profile.isCreator ? '4px solid #3b82f6' : profile.isPremium ? '4px solid #f59e0b' : '4px solid var(--border-default)',
                padding: '4px'
              }}
            >
              <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                {profile.name?.charAt(0).toUpperCase()}
              </div>
            </div>
          )}
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', justifyContent: 'center' }}>
            <h1 style={{ margin: 0, fontSize: '2.5rem', fontWeight: '800', letterSpacing: '-0.5px' }}>{profile.name}</h1>
          </div>
          
          <div style={{ display: 'flex', gap: '2rem', color: 'var(--text-secondary)', marginTop: '0.5rem', fontSize: '1.1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}><strong style={{ color: 'var(--text-primary)', fontSize: '1.5rem' }}>{profile.followerCount}</strong> <span style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Followers</span></div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}><strong style={{ color: 'var(--text-primary)', fontSize: '1.5rem' }}>{profile.followingCount}</strong> <span style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Following</span></div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}><strong style={{ color: 'var(--text-primary)', fontSize: '1.5rem' }}>{templates.length}</strong> <span style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Templates</span></div>
          </div>

          {!isOwnProfile && (
            <button 
              onClick={handleFollowToggle}
              disabled={followLoading}
              onMouseEnter={(e) => { if(isFollowing) e.target.innerText = 'Unfollow' }}
              onMouseLeave={(e) => { if(isFollowing) e.target.innerText = 'Following' }}
              style={{
                marginTop: '1.5rem',
                padding: '10px 32px',
                borderRadius: '8px',
                border: isFollowing ? '1px solid var(--border-strong)' : 'none',
                background: isFollowing ? 'transparent' : 'var(--text-primary)',
                color: isFollowing ? 'var(--text-primary)' : 'var(--bg-primary)',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                opacity: followLoading ? 0.7 : 1,
                minWidth: '140px'
              }}
            >
              {followLoading ? '...' : isFollowing ? 'Following' : 'Follow'}
            </button>
          )}
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
        <h2 style={{ marginBottom: '2rem' }}>Templates by {profile.name}</h2>

        <div className={styles.templateGrid} style={{ textAlign: 'left' }}>
        {templates.length === 0 ? (
          <div className={styles.emptyState}>
            <h3>No templates yet</h3>
            <p>This creator hasn't published any templates.</p>
          </div>
        ) : (
          templates.map((template) => (
            <div key={template._id} className={styles.templateCard} onClick={() => handleTemplateClick(template)}>
              <div className={styles.templateImageWrap}>
                <img src={template.imageUrl} alt={template.title} className={styles.templateImage} loading="lazy" />
                <div className={styles.templateOverlay}>
                  <div className={styles.overlayBtn}>✨ Customize</div>
                </div>
                {template.isPremium ? (
                  <span className={styles.premiumBadge}>PRO</span>
                ) : (
                  <span className={styles.freeBadge}>Free</span>
                )}
              </div>
              <div className={styles.templateInfo}>
                <div className={styles.templateTitle}>{template.title}</div>
                <div className={styles.templateCategory}>{template.category}</div>
              </div>
            </div>
          ))
        )}
      </div>
      </div>

      {showPremiumGate && (
        <PremiumGate
          onClose={() => setShowPremiumGate(false)}
          onUpgrade={() => window.location.reload()}
        />
      )}
    </>
  );
}

export default function CreatorProfilePage({ params }) {
  const { id } = use(params);
  
  return (
    <div className={styles.dashboardPage}>
      <Suspense fallback={<div className={styles.dashboardHeader}><h1>Loading...</h1></div>}>
        <CreatorProfileContent id={id} />
      </Suspense>
    </div>
  );
}
