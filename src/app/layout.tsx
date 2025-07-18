'use client';

import { ReactNode } from 'react';
import { NextAuthProvider } from '@/providers/NextAuthProvider';
import './globals.css';
import { Open_Sans } from 'next/font/google';
import { ThemeProvider } from '@/components/ui/theme-provider';
import { availableThemes } from '@/config/themes';
import FluidCursorWrapper from '@/components/FluidCursorWrapper';

// Initialize Open Sans font
const openSans = Open_Sans({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-open-sans'
});

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning className={`h-full ${openSans.variable}`}>
      <body className="h-full bg-bg-main text-text-primary font-primary">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
          themes={availableThemes}
        >
          <NextAuthProvider>
            {children}
            <FluidCursorWrapper />
          </NextAuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
