'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';

export default function ThemeProvider({ children }) {
  return (
    <NextThemesProvider defaultTheme="dark" attribute="data-theme">
      {children}
    </NextThemesProvider>
  );
}
