/**
 * Seed script to populate the database with your custom templates.
 * Run: node scripts/seed.js
 *
 * Before running, make sure MONGODB_URI is set in .env.local
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load env
dotenv.config({ path: join(__dirname, '..', '.env.local') });

const TemplateSchema = new mongoose.Schema({
  title: String,
  category: String,
  imageUrl: String,
  thumbnailUrl: String,
  isPremium: Boolean,
  overlayConfig: {
    namePosition: { x: Number, y: Number },
    nameFont: String,
    nameFontSize: Number,
    nameColor: String,
    photoPosition: { x: Number, y: Number },
    photoSize: Number,
    photoShape: String,
  },
  sortOrder: Number,
  isActive: Boolean,
}, { timestamps: true });

const Template = mongoose.model('Template', TemplateSchema);

// ═══════════════════════════════════════════════════════
// Your custom templates from public/templates/
// Image URLs use /templates/ path (served by Next.js from public/)
// Overlay positions are tuned per template layout
// ═══════════════════════════════════════════════════════

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

const templates = [
  // ─── Birthday ────────────────────────────────────────
  {
    title: 'Elegant Gold Birthday',
    category: 'birthday',
    imageUrl: '/templates/birthday_01.png',
    isPremium: false,
    overlayConfig: {
      // This template: gold ribbon top-left, "Happy Birthday" center-left, gifts bottom-right
      // Best photo spot: bottom-left area (clear white space)
      // Best name spot: below the quote text
      namePosition: { x: 320, y: 920 },
      nameFont: 'Outfit',
      nameFontSize: 34,
      nameColor: '#1a365d', // dark navy to match the template text
      photoPosition: { x: 320, y: 780 },
      photoSize: 120,
      photoShape: 'circle',
    },
    sortOrder: 1,
    isActive: true,
  },
  {
    title: 'Colorful Balloon Birthday',
    category: 'birthday',
    imageUrl: '/templates/birthday_02.png',
    isPremium: false,
    overlayConfig: {
      // This template: bunting flags top, "Happy Birthday" center, balloons around
      // Best photo spot: below the quote text (center)
      // Best name spot: further below the photo
      namePosition: { x: 540, y: 920 },
      nameFont: 'Outfit',
      nameFontSize: 34,
      nameColor: '#333333', // dark gray to match template style
      photoPosition: { x: 540, y: 790 },
      photoSize: 120,
      photoShape: 'circle',
    },
    sortOrder: 2,
    isActive: true,
  },

  // ─── Anniversary ─────────────────────────────────────
  {
    title: 'Elegant Floral Anniversary',
    category: 'anniversary',
    imageUrl: '/templates/anniversary_01.png',
    isPremium: true,
    overlayConfig: {
      // This template: white roses top-left and bottom-right, gold border, text center
      // Best photo spot: below the quote text (center, inside the border)
      // Best name spot: just below the photo
      namePosition: { x: 540, y: 930 },
      nameFont: 'Outfit',
      nameFontSize: 32,
      nameColor: '#2d5016', // dark green to match floral theme
      photoPosition: { x: 540, y: 800 },
      photoSize: 120,
      photoShape: 'circle',
    },
    sortOrder: 1,
    isActive: true,
  },
  {
    title: 'Red Rose Anniversary',
    category: 'anniversary',
    imageUrl: '/templates/anniversary_02.png',
    isPremium: false,
    overlayConfig: {
      // This template: red flowers corners, "Happy Anniversary" center, pink watercolor bg
      // Best photo spot: below the quote text
      // Best name spot: below the photo
      namePosition: { x: 540, y: 920 },
      nameFont: 'Outfit',
      nameFontSize: 32,
      nameColor: '#5b1a2e', // deep maroon to match the template
      photoPosition: { x: 540, y: 790 },
      photoSize: 120,
      photoShape: 'circle',
    },
    sortOrder: 2,
    isActive: true,
  },

  // ─── Festivals ───────────────────────────────────────
  {
    title: 'Happy Diwali',
    category: 'festival',
    imageUrl: '/templates/festival_diwali.png',
    isPremium: false,
    overlayConfig: {
      // This template: ornate circle frame, "Happy Diwali" center, diyas at bottom
      // The text/quote area is inside the circle frame
      // Best photo+name spot: very bottom, below the diyas (outside frame)
      namePosition: { x: 540, y: 1020 },
      nameFont: 'Outfit',
      nameFontSize: 30,
      nameColor: '#8b4513', // brown to match warm template colors
      photoPosition: { x: 540, y: 200 },
      photoSize: 100,
      photoShape: 'circle',
    },
    sortOrder: 1,
    isActive: true,
  },
  {
    title: 'Happy Gudi Padwa',
    category: 'festival',
    imageUrl: '/templates/festival_gudipadwa.png',
    isPremium: true,
    overlayConfig: {
      // This template: gudi center, "Happy Gudi Padwa" bottom-left, flowers in corners
      // Large clear space below the gudi and above the text
      // Best photo spot: just above the wish text
      // Best name: at the very bottom
      namePosition: { x: 540, y: 1040 },
      nameFont: 'Outfit',
      nameFontSize: 28,
      nameColor: '#8b0000', // deep red to match template
      photoPosition: { x: 820, y: 870 },
      photoSize: 100,
      photoShape: 'circle',
    },
    sortOrder: 2,
    isActive: true,
  },
  {
    title: 'Happy Pongal',
    category: 'festival',
    imageUrl: '/templates/festival_pongal.png',
    isPremium: false,
    overlayConfig: {
      // This template: pot center-bottom, "Happy Pongal" center, dark red/gold bg
      // Cream area is inside the arch shape — text is there
      // Best photo+name: top area of the cream arch (above "FAUGET JEWELRY" text)
      namePosition: { x: 540, y: 180 },
      nameFont: 'Outfit',
      nameFontSize: 28,
      nameColor: '#5b1a1a', // dark red matching template
      photoPosition: { x: 540, y: 80 },
      photoSize: 90,
      photoShape: 'circle',
    },
    sortOrder: 3,
    isActive: true,
  },
];

async function seed() {
  try {
    console.log('🌱 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected!\n');

    console.log('🗑️  Clearing existing templates...');
    await Template.deleteMany({});

    console.log('📦 Inserting your custom templates...\n');
    await Template.insertMany(templates);

    console.log(`✅ Seeded ${templates.length} templates successfully!\n`);
    console.log('─────────────────────────────────────');
    console.log('  Summary:');
    console.log(`  🎂 Birthday:    ${templates.filter(t => t.category === 'birthday').length} templates`);
    console.log(`  💍 Anniversary: ${templates.filter(t => t.category === 'anniversary').length} templates`);
    console.log(`  🎆 Festival:    ${templates.filter(t => t.category === 'festival').length} templates`);
    console.log(`  ⭐ Premium:     ${templates.filter(t => t.isPremium).length}`);
    console.log(`  🆓 Free:        ${templates.filter(t => !t.isPremium).length}`);
    console.log('─────────────────────────────────────');
    console.log('\n🎉 Your templates are now live at /dashboard!');
    console.log('💡 You can fine-tune overlay positions via Admin Panel → Templates → Edit');

  } catch (err) {
    console.error('❌ Seed failed:', err);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

seed();
