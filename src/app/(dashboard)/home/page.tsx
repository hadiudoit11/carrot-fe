// src/app/(dashboard)/home/page.tsx
"use client";

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

export default function HomePage() {
  const { data: session, status } = useSession();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient || status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Not Authenticated</h1>
          <p className="mt-2 text-gray-600">Please sign in to view this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Your page content */}
    </div>
  );
}