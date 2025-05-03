"use client";

import GoogleLogin from "@/app/user/social/GoogleLogin";
import FileUpload from "@/components/sub/file-upload";
import Navbar from "@/components/sub/navbars/navbar";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ProjectList from "@/components/projects/ProjectList";

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
    <div className="bg-bg-main p-8 text-text-primary">
      <h1 className="text-3xl font-bold mb-6 font-primary">Projects</h1>

      <div className="w-full rounded-lg bg-tertiary border-2 border-border-accent overflow-hidden shadow-accent-offset">
        <ProjectList />
      </div>
    </div>
  );
}
