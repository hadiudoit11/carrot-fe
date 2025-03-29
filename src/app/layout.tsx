'use client'

import { SessionProvider } from 'next-auth/react';
import { useEffect, useState } from 'react';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <html lang="en">
      <body>
        <SessionProvider>
          {mounted ? children : null}
        </SessionProvider>
      </body>
    </html>
  );
}
