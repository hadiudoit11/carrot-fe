'use client'
import { ReactNode } from 'react';
import { SessionProvider } from "next-auth/react";
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
      <body className='h-full'>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
