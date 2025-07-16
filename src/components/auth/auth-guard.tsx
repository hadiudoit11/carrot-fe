"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, ReactNode } from "react";

interface AuthGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function AuthGuard({ children, fallback }: AuthGuardProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [hasCheckedSession, setHasCheckedSession] = useState(false);

  // Debug logging
  console.log('AuthGuard - Status:', status);
  console.log('AuthGuard - Session:', session);
  console.log('AuthGuard - Mounted:', mounted);

  // Ensure component is mounted on client
  useEffect(() => {
    console.log('AuthGuard - Setting mounted to true');
    setMounted(true);
  }, []);

  // Handle authentication redirects
  useEffect(() => {
    console.log('AuthGuard - useEffect triggered:', { 
      status, 
      session: !!session, 
      error: session?.error, 
      mounted,
      hasCheckedSession
    });
    
    // Don't do anything until mounted
    if (!mounted) {
      console.log('AuthGuard - Not mounted yet, waiting...');
      return;
    }
    
    // If still loading, wait
    if (status === 'loading') {
      console.log('AuthGuard - Still loading, waiting...');
      return;
    }
    
    // Mark that we've checked the session
    if (!hasCheckedSession) {
      setHasCheckedSession(true);
    }
    
    // If authenticated, we're good
    if (status === 'authenticated' && session) {
      console.log('AuthGuard - Authenticated successfully');
      return;
    }
    
    // If unauthenticated and we've checked the session, redirect to login
    if (status === 'unauthenticated' && hasCheckedSession) {
      console.log('AuthGuard - Unauthenticated, redirecting to login');
      router.push('/user/login');
      return;
    }
    
    if ((session as any)?.error === 'RefreshAccessTokenError') {
      console.log('AuthGuard - Refresh error, redirecting to login');
      router.push('/user/login');
      return;
    }
  }, [session, status, router, mounted, hasCheckedSession]);

  // Show loading state while session is loading or component is not mounted
  if (status === 'loading' || !mounted) {
    console.log('AuthGuard - Showing loading state:', { status, mounted });
    return fallback || (
      <div className="flex items-center justify-center h-96">
        <div className="text-muted-foreground animate-pulse">Loading...</div>
      </div>
    );
  }

  // If authenticated, render children
  if (session && status === 'authenticated') {
    console.log('AuthGuard - Rendering authenticated content');
    return <>{children}</>;
  }

  // If unauthenticated and we've checked the session, show loading while redirecting
  if (status === 'unauthenticated' && hasCheckedSession) {
    console.log('AuthGuard - Unauthenticated, showing loading while redirecting');
    return fallback || (
      <div className="flex items-center justify-center h-96">
        <div className="text-muted-foreground animate-pulse">Redirecting to login...</div>
      </div>
    );
  }

  // If we get here, we're still loading
  console.log('AuthGuard - Fallback loading state');
  return fallback || (
    <div className="flex items-center justify-center h-96">
      <div className="text-muted-foreground animate-pulse">Loading...</div>
    </div>
  );
} 