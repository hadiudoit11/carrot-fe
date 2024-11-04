'use client'
import React from "react";
import Layout from "@/app/(dashboard)/layout";
import OrgHome from "@/components/main/organization-home";
import CreateUser from "@/components/sub/users";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Snapshot from "@/components/sub/organization/snapshot-org";
import SiteMap from "@/components/sub/organization/mapshot";

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
    <div>
      <div className='bg-gray-100 p-8'>
        <Snapshot />
      </div>
      <div>
        <SiteMap />
      </div>
      <div className="bg-gray-100 p-8">
        <CreateUser />
      </div>
    </div>
  );
}
