"use client";

import HomeArticles from "@/components/main/dashboard-home";
import ArticleSnapshot from "@/components/sub/articles-snapshot";
import HomeFeed from "@/components/sub/feed";
import ProjectSummary from "@/components/sub/project-summary";
import Snapshot from "@/components/sub/snapshot";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  useEffect(() => {
    if (status === 'loading') return; // Do nothing while loading
    if (session?.error === 'RefreshAccessTokenError') router.push('/user/login'); // Redirect if not authenticated
    if (!session?.user.organization) router.push('/onboarding');
    console.log(`home/page.tsx line 19: ${session?.user.organization}`)
  }, [session, status, router]);

  if (status === 'loading') {
    return <div>Loading...</div>; // Display a loading state while fetching session
  }

  return (
    <div className = 'bg-gray-100 p-10'>
      <div className = 'pb-8'>
        <Snapshot/>
      </div>
      <div>
        <ArticleSnapshot />
      </div>
      <div className= "grid grid-cols-2 mt-8">
        <div className= "lg:mr-4">
          <HomeFeed/>
        </div>
        <div className= "lg:ml-4 bg-white rounded-lg">

        </div>
      </div>

      <div>
        <ProjectSummary />
      </div>
    </div>
  );
}
