'use client';

import { ReactNode } from 'react';
import { NextAuthProvider } from '@/providers/NextAuthProvider';
import './globals.css';
import { Open_Sans } from 'next/font/google';

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
    <html lang="en" className={`h-full ${openSans.variable}`}>
      <body className="h-full bg-bg-main text-text-primary font-primary">
        <NextAuthProvider>
          {children}
        </NextAuthProvider>
      </body>
    </html>
  );
}
