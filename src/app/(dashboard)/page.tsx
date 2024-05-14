
import * as React from 'react';

export const metadata = {
  title: 'Admin | Arkane',
  description: 'Your Docs but smarter',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
  icons: {
    icon: [
      {
        url: '/favicon/favicon.ico',
      },
      {
        url: '/favicon/favicon-16x16.png',
        size: '16x16',
        type: 'image/png',
      },
      {
        url: '/favicon/favicon-32x32.png',
        size: '32x32',
        type: 'image/png',
      },
    ],
    android: [
      {
        url: '/favicon/android-chrome-192x192.png',
        size: '192x192',
        type: 'image/png',
      },
      {
        url: '/favicon/android-chrome-512x512.png',
        size: '512x512',
        type: 'image/png',
      },
    ],
    apple: '/favicon/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
};

export default function Dashboard() {
  return (
    <>
      <h1 className='text-black'>hello world</h1>
    </>
  );
}
