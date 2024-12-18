
"use client";

import ArticlesGridList from "@/components/main/articles-list";
import ArticleCreateButton from "@/components/sub/articles/article-create";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ArticlesList() {
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
    <div className="p-8">
        <div>
            <ArticleCreateButton />
        </div>
        <div className="flex flex-col">
        <ArticlesGridList />
      </div>
    </div>
  );
}
