"use client";

import HomeArticles from "@/components/main/dashboard-home";
import Tiptap from "@/components/main/tip-tap";
import NavbarArticles from "@/components/sub/navbars/navbar-articles";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";




export default function ArticlesCreate() {
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
    <div className="min-h-screen">
        
        <div><NavbarArticles /></div>
        <div className= "mt-8">
        <Tiptap />
        </div>
    </div>
  );
}
