'use client'
import React, { useEffect, useState } from "react";
import Layout from "@/app/(dashboard)/layout";
import OrgHome from "@/components/main/organization-home";
import CreateUser from "@/components/sub/users";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import dynamic from 'next/dynamic';
import Snapshot from "@/components/sub/organization/snapshot-org";
import SiteList from "@/components/sub/organization/site-list";

// Import Mapshot component dynamically with SSR disabled
const Mapshot = dynamic(
  () => import('@/components/sub/organization/mapshot'),
  { ssr: false } // This ensures the component only loads on the client side
);

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    if (status === 'loading') return; // Do nothing while loading
    if (session?.error === 'RefreshAccessTokenError') router.push('/user/login'); // Redirect if not authenticated
    console.log(session?.error)
  }, [session, status, router]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (status === 'loading') {
    return <div>Loading...</div>; // Display a loading state while fetching session
  }

  if (!isClient) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div className="bg-gray-100 p-8">
        <Snapshot />
      </div>
      <div className=''>
        <Mapshot />
      </div>
      {/* Updated to use a grid layout */}
      <div className="bg-gray-100 p-8 z-10 grid grid-cols-2 gap-4">
        {/* First Column */}
        <div className="bg-white p-4 rounded-lg shadow">
          <SiteList />
        </div>
        {/* Second Column */}
        <div className="bg-white p-4 rounded-lg shadow">
        
        </div>
      </div>
    </div>
  );
}
