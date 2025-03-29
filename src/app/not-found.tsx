'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function NotFound() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        {isClient && (
          <>
            <h1 className="mt-6 text-3xl font-extrabold text-gray-900">
              404 - Page Not Found
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              The page you're looking for doesn't exist or has been moved.
            </p>
            <div className="mt-5">
              <Link
                href="/"
                className="font-medium text-orange-600 hover:text-orange-500"
              >
                Go back home
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
} 