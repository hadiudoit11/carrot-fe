"use client";


import SettingsHeader from "@/components/main/settings-header";
import FileUpload from "@/components/sub/file-upload";
import Navbar from "@/components/sub/navbars/navbar";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

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
    <div className="bg-gray-100 p-8">
        <div className = "bg-white p-8 rounded-lg">
            <SettingsHeader />
        </div>
    </div>
  );
}
