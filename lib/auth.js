import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import dbConnect from './db';
import User from '../models/User';

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
    Credentials({
      name: 'Email',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        name: { label: 'Name', type: 'text' },
        isRegister: { label: 'Register', type: 'text' },
      },
      async authorize(credentials) {
        await dbConnect();

        const { email, password, name, isRegister } = credentials;

        if (isRegister === 'true') {
          // Registration flow
          const existingUser = await User.findOne({ email });
          if (existingUser) {
            throw new Error('User already exists with this email');
          }

          const hashedPassword = await bcrypt.hash(password, 12);
          const newUser = await User.create({
            name: name || email.split('@')[0],
            email,
            password: hashedPassword,
            provider: 'email',
          });

          return {
            id: newUser._id.toString(),
            name: newUser.name,
            email: newUser.email,
            image: newUser.image,
            role: newUser.role,
            isPremium: newUser.isPremium || false,
          };
        } else {
          // Login flow
          const user = await User.findOne({ email }).select('+password');
          if (!user) {
            throw new Error('No user found with this email');
          }

          if (!user.password) {
            throw new Error('Please sign in with Google');
          }

          const isValid = await bcrypt.compare(password, user.password);
          if (!isValid) {
            throw new Error('Invalid password');
          }

          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            image: user.image,
            role: user.role,
            isPremium: user.isPremium || false,
          };
        }
      },
    }),
  ],
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        await dbConnect();
        const existingUser = await User.findOne({ email: user.email });

        if (!existingUser) {
          const newUser = await User.create({
            name: user.name,
            email: user.email,
            image: user.image || '',
            provider: 'google',
            profileComplete: true,
          });
          user.id = newUser._id.toString();
          user.role = newUser.role;
          user.isPremium = newUser.isPremium || false;
        } else {
          // Update existing user's image if they signed in with Google
          if (user.image && !existingUser.image) {
            existingUser.image = user.image;
            await existingUser.save();
          }
          user.id = existingUser._id.toString();
          user.role = existingUser.role;
          user.isPremium = existingUser.isPremium || false;
        }
      }
      return true;
    },
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id;
        token.role = user.role || 'user';
        token.isPremium = user.isPremium || false;
      }

      // Refresh isPremium and role from DB on every request
      // This ensures changes (upgrade/admin) reflect immediately
      if (token.id) {
        try {
          await dbConnect();
          const dbUser = await User.findById(token.id).select('isPremium role').lean();
          if (dbUser) {
            token.isPremium = dbUser.isPremium || false;
            token.role = dbUser.role || 'user';
          }
        } catch (e) {
          // Silently fail — keep existing token values
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.isPremium = token.isPremium || false;
      }
      return session;
    },
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.AUTH_SECRET,
});
