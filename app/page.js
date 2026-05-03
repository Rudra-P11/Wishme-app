import Link from 'next/link';
import styles from './page.module.css';

export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <section className={styles.hero} id="hero-section">
        <div className={styles.orb1}></div>
        <div className={styles.orb2}></div>
        <div className={styles.orb3}></div>

        <div className={styles.heroContent}>
          <div className={styles.badge}>
            ✨ <span>Create & Share Beautiful Wishes</span>
          </div>

          <h1 className={styles.heroTitle}>
            Make Every Wish{' '}
            <span className="gradient-text">Unforgettable</span>
          </h1>

          <p className={styles.heroDescription}>
            Choose from stunning templates, add your photo and name, and share
            personalized greeting cards with loved ones in seconds.
          </p>

          <div className={styles.heroCta}>
            <Link href="/login" className={styles.ctaPrimary} id="hero-cta-primary">
              Start Creating →
            </Link>
            <Link href="#features" className={styles.ctaSecondary} id="hero-cta-secondary">
              How It Works
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className={styles.features} id="features">
        <div className={styles.sectionHeader}>
          <h2>How <span className="gradient-text">Wishme</span> Works</h2>
          <p>Create personalized greeting cards in three simple steps</p>
        </div>

        <div className={styles.featureGrid}>
          <div className={styles.featureCard}>
            <div className={`${styles.featureIcon} ${styles.purple}`}>🎨</div>
            <h3>Pick a Template</h3>
            <p>
              Browse through beautiful templates organized by categories like
              Birthday, Anniversary, Festivals, and more.
            </p>
          </div>

          <div className={styles.featureCard}>
            <div className={`${styles.featureIcon} ${styles.pink}`}>📸</div>
            <h3>Personalize It</h3>
            <p>
              Your name and profile picture are automatically overlaid onto the
              template. See a live preview instantly.
            </p>
          </div>

          <div className={styles.featureCard}>
            <div className={`${styles.featureIcon} ${styles.amber}`}>🚀</div>
            <h3>Share Anywhere</h3>
            <p>
              With one tap, share your personalized card via WhatsApp, Instagram,
              Email, or download it directly.
            </p>
          </div>

          <div className={styles.featureCard}>
            <div className={`${styles.featureIcon} ${styles.cyan}`}>⭐</div>
            <h3>Premium Designs</h3>
            <p>
              Unlock exclusive premium templates with stunning designs that make
              your wishes truly stand out.
            </p>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className={styles.categories} id="categories">
        <div className={styles.sectionHeader}>
          <h2>Explore <span className="gradient-text">Categories</span></h2>
          <p>Find the perfect template for every occasion</p>
        </div>

        <div className={styles.categoryGrid}>
          <Link href="/dashboard?category=birthday" className={`${styles.categoryCard} ${styles.birthday}`}>
            <span className={styles.categoryEmoji}>🎂</span>
            <h3>Birthday</h3>
            <p>Fun & festive birthday wishes</p>
          </Link>

          <Link href="/dashboard?category=anniversary" className={`${styles.categoryCard} ${styles.anniversary}`}>
            <span className={styles.categoryEmoji}>💍</span>
            <h3>Anniversary</h3>
            <p>Celebrate love milestones</p>
          </Link>

          <Link href="/dashboard?category=festival" className={`${styles.categoryCard} ${styles.festival}`}>
            <span className={styles.categoryEmoji}>🎆</span>
            <h3>Festivals</h3>
            <p>Diwali, Eid, Christmas & more</p>
          </Link>

          <Link href="/dashboard?category=love" className={`${styles.categoryCard} ${styles.love}`}>
            <span className={styles.categoryEmoji}>❤️</span>
            <h3>Love</h3>
            <p>Express your love & affection</p>
          </Link>

          <Link href="/dashboard?category=quote" className={`${styles.categoryCard} ${styles.quote}`}>
            <span className={styles.categoryEmoji}>💬</span>
            <h3>Quotes</h3>
            <p>Inspirational & motivational</p>
          </Link>

          <Link href="/dashboard?category=shayari" className={`${styles.categoryCard} ${styles.shayari}`}>
            <span className={styles.categoryEmoji}>🌹</span>
            <h3>Shayari</h3>
            <p>Beautiful Hindi & Urdu poetry</p>
          </Link>

          <Link href="/dashboard?category=joke" className={`${styles.categoryCard} ${styles.joke}`}>
            <span className={styles.categoryEmoji}>😂</span>
            <h3>Jokes</h3>
            <p>Funny cards to make them smile</p>
          </Link>

          <Link href="/dashboard?category=general" className={`${styles.categoryCard} ${styles.general}`}>
            <span className={styles.categoryEmoji}>🙏</span>
            <h3>General Wishes</h3>
            <p>Thank you, congrats & best wishes</p>
          </Link>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaBox}>
          <h2>Ready to Create?</h2>
          <p>
            Join thousands of users making beautiful personalized greeting cards
            with Wishme.
          </p>
          <Link href="/login" className={styles.ctaPrimary} id="bottom-cta">
            Get Started — It&apos;s Free ✨
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <p>© 2026 Wishme. Built with ❤️ for beautiful wishes.</p>
      </footer>
    </>
  );
}
