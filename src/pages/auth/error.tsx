'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

const AuthError = () => {
  const searchParams = useSearchParams();
  const error = searchParams?.get('error') ?? 'unknown';

  const errorMessage = error === 'RefreshAccessTokenError'
    ? 'Your session has expired. Please sign in again.'
    : 'An error occurred during authentication.';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Authentication Error
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {errorMessage}
          </p>
        </div>
        <div className="mt-5 text-center">
          <Link
            href="/user/login"
            className="font-medium text-orange-600 hover:text-orange-500"
          >
            Return to login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AuthError;
