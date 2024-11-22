"use client";

import Tiptap from "@/components/main/tip-tap";
import NavbarArticles from "@/components/sub/navbars/navbar-articles";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ArticlesCreate() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;
    if (session?.error === 'RefreshAccessTokenError') router.push('/user/login');
  }, [session, status, router]);

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col h-screen">
      <NavbarArticles />
      <div className="flex-1">
        <Tiptap />
      </div>
    </div>
  );
}
