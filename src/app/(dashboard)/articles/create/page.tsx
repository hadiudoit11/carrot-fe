"use client";

import HomeArticles from "@/components/main/dashboard-home";
import Tiptap from "@/components/main/tip-tap";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ArticlesCreate() {

  return (
    <div className="min-h-screen bg-gray-100 p-8">
        <Tiptap />
    </div>
  );
}
