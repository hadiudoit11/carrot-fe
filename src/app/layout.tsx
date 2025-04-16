import { ReactNode } from 'react';
import { NextAuthProvider } from '@/providers/NextAuthProvider';
import './globals.css';

interface RootLayoutProps {
  children: ReactNode;
}

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" className='h-full bg-white'>
      <body className='h-full bg-gray-100'>
        <NextAuthProvider>{children}</NextAuthProvider>
      </body>
    </html>
  );
}