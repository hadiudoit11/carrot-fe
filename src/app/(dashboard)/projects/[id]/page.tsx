"use client";


import GoogleLogin from "@/app/user/social/GoogleLogin";
import FileUpload from "@/components/sub/file-upload";
import Navbar from "@/components/sub/navbars/navbar";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import BoardList from "@/components/projects/BoardList";




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
    <div className="bg-gray-100">
        <div>
          <Navbar />
        </div>
        <div className="p-8 mt-8">
            <FileUpload />
        </div>
        <div className='bg-black'>
          <BoardList />
        </div>
    </div>
  );
}
