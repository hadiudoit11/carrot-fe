'use client'
import { ReactNode } from 'react';
import { SessionProvider, useSession } from "next-auth/react";
import './globals.css'; 
import { redirect } from 'next/navigation';

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
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
