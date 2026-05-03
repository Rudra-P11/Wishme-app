import { Inter, Outfit } from 'next/font/google';
import './globals.css';
import AuthProvider from '@/components/providers/AuthProvider';
import Navbar from '@/components/layout/Navbar';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
});

const outfit = Outfit({
  variable: '--font-outfit',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata = {
  title: 'Wishme — Create Personalized Greeting Cards',
  description:
    'Create beautiful, personalized greeting cards with custom templates. Add your photo and name, then share with friends and family via WhatsApp, Instagram, and more.',
  keywords: ['greeting cards', 'wishes', 'birthday', 'festival', 'personalized cards'],
  openGraph: {
    title: 'Wishme — Create Personalized Greeting Cards',
    description: 'Create beautiful greeting cards with your photo and name. Share instantly.',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable}`}>
      <body>
        <AuthProvider>
          <Navbar />
          <main style={{ paddingTop: 'var(--navbar-height)' }}>{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
