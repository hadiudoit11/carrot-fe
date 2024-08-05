'use client'
import React from "react";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import NewsPrimary from "@/components/sub/news/news-primary";
import NewsSecondary from "@/components/sub/news/news-secondary";
import NewsTertiary from "@/components/sub/news/news-tertiary";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  useEffect(() => {
    if (status === 'loading') return; // Do nothing while loading
    if (session?.error === 'RefreshAccessTokenError') router.push('/user/login'); // Redirect if not authenticated
    console.log(session?.error)
  }, [session, status, router]);

  if (status === 'loading') {
    return <div>Loading...</div>; // Display a loading state while fetching session
  }

  return (
    <div>
      <div>
        <NewsPrimary/>
      </div>
      <div>
        <NewsSecondary/>
      </div>
      <div>
        <NewsTertiary />
      </div>
    </div>
  );
}
