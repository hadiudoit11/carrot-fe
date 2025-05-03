"use client";

import React, { useEffect, useState } from "react";
import HomeArticles from "@/components/main/dashboard-home";
import ArticleSnapshot from "@/components/sub/articles-snapshot";
import HomeFeed from "@/components/sub/feed";
import ProjectSummary from "@/components/sub/project-summary";
import Snapshot from "@/components/sub/snapshot";
import ColorExample from "@/components/ColorExample";
import FontExample from "@/components/FontExample";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return; // Do nothing while loading
    
    setIsLoading(false);
    
    // Handle all navigation in the effect
    if (!session) {
      router.push('/user/login');
      return;
    }
    
    if (session?.error === 'RefreshAccessTokenError') {
      router.push('/user/login');
      return;
    }
    
    if (!session?.user.organization) {
      router.push('/onboarding');
      return;
    }
    
    console.log(`home/page.tsx: ${session?.user.organization}`);
  }, [session, status, router]);

  // Show loading state while session is loading or while our effect is running
  if (status === 'loading' || isLoading) {
    return <div className="text-text-primary">Loading...</div>;
  }

  // The rest of the render logic only runs if we're authenticated
  // and not navigating away
  return (
    <div className="bg-main p-10 text-text-primary">
      <div className="w-full rounded-lg overflow-hidden p-2">
        <div className="relative z-10">
          <Snapshot />
        </div>
      </div>
      
      <div className="grid grid-cols-2 mt-8 gap-10">
        {/* HomeFeed with bottom-right primary blur effect */}
        <div className="w-full rounded-lg border-2 bg-bg-card border-border-accent overflow-hidden shadow-accent-offset radial-blur-br">
          <div className="relative z-10">
            <HomeFeed />
          </div>
        </div>
        
        {/* ColorExample with top-right secondary blur effect */}
        <div className="w-full bg-bg-card rounded-lg border-2 border-border-accent overflow-hidden shadow-accent-offset radial-blur-tr radial-blur-secondary-tr">
          <div className="relative z-10">
            <ColorExample />
          </div>
        </div>
      </div>

      {/* Font Example with bottom-left accent blur effect */}
      <div className="w-full mt-8 rounded-lg border-2 bg-bg-card border-border-accent overflow-hidden shadow-accent-offset radial-blur-bl radial-blur-accent-bl">
        <div className="relative z-10">
          <FontExample />
        </div>
      </div>
      
      {/* ProjectSummary with bottom-left accent blur effect */}
      <div className="w-full mt-8 rounded-lg border-2 bg-bg-card border-border-accent overflow-hidden shadow-accent-offset radial-blur-tl radial-blur-accent-tl">
        <div className="relative z-10">
          <ProjectSummary />
        </div>
      </div>
    </div>
  );
}