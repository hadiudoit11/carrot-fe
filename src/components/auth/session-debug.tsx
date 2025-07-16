"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";

export function SessionDebug() {
  const { data: session, status } = useSession();

  useEffect(() => {
    console.log('SessionDebug - Status changed:', status);
    console.log('SessionDebug - Session data:', session);
  }, [session, status]);

  return (
    <div className="fixed top-4 right-4 bg-black text-white p-4 rounded text-xs z-50">
      <div>Status: {status}</div>
      <div>Session: {session ? 'Yes' : 'No'}</div>
      <div>Email: {session?.user?.email || 'N/A'}</div>
      <div>Org: {session?.user?.organization || 'N/A'}</div>
    </div>
  );
} 