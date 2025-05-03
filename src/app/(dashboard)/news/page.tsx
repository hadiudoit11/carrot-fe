'use client'
import React, { useEffect, useState } from "react";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import NewsPrimary from "@/components/sub/news/news-primary";
import NewsSecondary from "@/components/sub/news/news-secondary";
import NewsTertiary from "@/components/sub/news/news-tertiary";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    if (status === 'loading') return; // Do nothing while loading
    
    setIsLoading(false);
    
    if (session?.error === 'RefreshAccessTokenError') {
      router.push('/user/login');
      return;
    }
    
    console.log(session?.error);
  }, [session, status, router]);

  if (status === 'loading' || isLoading) {
    return <div className="text-text-primary font-secondary">Loading...</div>;
  }

  return (
    <div className="bg-primary p-8 text-text-primary">
      <h1 className="text-3xl font-bold mb-6 font-primary">News & Updates</h1>
      
      <div className="mb-8 rounded-lg border-2 border-accent overflow-hidden shadow-accent-offset">
        <div className="p-4 bg-secondary">
          <h2 className="text-xl font-semibold text-primary font-primary">Featured News</h2>
        </div>
        <NewsPrimary/>
      </div>
      
      <div className="mb-8 rounded-lg border-2 border-accent overflow-hidden shadow-accent-offset">
        <div className="p-4 bg-secondary">
          <h2 className="text-xl font-semibold text-primary font-primary">Recent Articles</h2>
        </div>
        <NewsSecondary/>
      </div>
      
      <div className="rounded-lg border-2 border-accent overflow-hidden shadow-accent-offset">
        <div className="p-4 bg-secondary">
          <h2 className="text-xl font-semibold text-primary font-primary">Industry Updates</h2>
        </div>
        <NewsTertiary />
      </div>
    </div>
  );
}
