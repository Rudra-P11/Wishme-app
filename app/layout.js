import { Inter, Outfit } from 'next/font/google';
import './globals.css';
import AuthProvider from '@/components/providers/AuthProvider';
import Navbar from '@/components/layout/Navbar';
import ThemeProvider from '@/components/providers/ThemeProvider';

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
    <html lang="en" className={`${inter.variable} ${outfit.variable}`} data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Caveat:wght@700&family=Comic+Neue:wght@700&family=Outfit:wght@700&family=Playfair+Display:wght@700&family=Tiro+Devanagari+Hindi:ital@0;1&family=Mukta:wght@700&display=swap" rel="stylesheet" />
      </head>
      <body>
        <ThemeProvider>
          <AuthProvider>
            <Navbar />
            <main style={{ paddingTop: 'var(--navbar-height)' }}>{children}</main>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
