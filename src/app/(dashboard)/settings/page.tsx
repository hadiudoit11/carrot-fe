"use client";

import SettingsHeader from "@/components/main/settings-header";
import FileUpload from "@/components/sub/file-upload";
import Navbar from "@/components/sub/navbars/navbar";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

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
    <div className="bg-primary p-8 text-text-primary font-secondary">
        <h1 className="text-3xl font-bold mb-6 font-primary">Organization Settings</h1>
        <div className="bg-tertiary p-8 rounded-lg border-2 border-accent shadow-accent-offset">
            <SettingsHeader />
        </div>
    </div>
  );
}
