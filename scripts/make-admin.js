/**
 * Make a user an admin by email address.
 * Usage: node scripts/make-admin.js your-email@example.com
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env.local') });

const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  role: { type: String, default: 'user' },
  isPremium: { type: Boolean, default: false },
}, { timestamps: true });

const User = mongoose.model('User', UserSchema);

const email = process.argv[2];

if (!email) {
  console.log('❌ Usage: node scripts/make-admin.js <email>');
  console.log('   Example: node scripts/make-admin.js admin@wishme.com');
  process.exit(1);
}

async function makeAdmin() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);

    const user = await User.findOne({ email });
    if (!user) {
      console.log(`❌ No user found with email: ${email}`);
      console.log('\n📝 Available users:');
      const users = await User.find().select('name email role').lean();
      users.forEach(u => console.log(`   ${u.email} (${u.name || 'No name'}) — ${u.role}`));
      return;
    }

    user.role = 'admin';
    await user.save();

    console.log(`✅ ${user.name || user.email} is now an ADMIN!`);
    console.log(`\n🔗 Access the admin panel at: http://localhost:3000/admin`);

  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected');
  }
}

makeAdmin();
