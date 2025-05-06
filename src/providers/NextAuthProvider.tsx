'use client';

import { SessionProvider } from "next-auth/react";

export function NextAuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider 
      // Check session every 5 minutes to keep it fresh
      refetchInterval={5 * 60} 
      // Only refetch when the window is focused
      refetchOnWindowFocus={true}
      // Don't retry when offline
      refetchWhenOffline={false}
    >
      {children}
    </SessionProvider>
  );
}
