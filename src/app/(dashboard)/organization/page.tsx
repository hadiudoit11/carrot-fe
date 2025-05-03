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
import Mapshot from "@/components/sub/organization/mapshot";

// Import Mapshot component dynamically with SSR disabled
// const Mapshot = dynamic(
//   () => import('@/components/sub/organization/mapshot'),
//   { ssr: false } // This ensures the component only loads on the client side
// );

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Add state for the slideouts
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [selectedSiteId, setSelectedSiteId] = useState<string | null>(null);

  // Handle authentication and redirection
  useEffect(() => {
    if (status === 'loading') return; // Do nothing while loading
    
    setIsLoading(false);
    
    if (session?.error === 'RefreshAccessTokenError') {
      router.push('/user/login');
      return;
    }
    
    console.log(session?.error);
  }, [session, status, router]);

  // Handle client-side rendering
  useEffect(() => {
    setIsClient(true);
  }, []);

  if (status === 'loading' || isLoading) {
    return <div className="text-text-primary font-secondary">Loading...</div>;
  }

  if (!isClient) {
    return <div className="text-text-primary font-secondary">Loading...</div>;
  }

  return (
    <div className="text-text-primary font-secondary">
      <div className="bg-primary p-8">
        <h1 className="text-3xl font-bold mb-6 font-primary">Organization</h1>
        <div className="w-full rounded-lg overflow-hidden">
          <div className="relative z-10">
            <Snapshot />
          </div>
        </div>
      </div>
      <div className="p-8">
        <h2 className="text-2xl font-semibold mb-4 font-primary">Location Map</h2>
        <div className="w-full border-2 border-accent rounded-lg overflow-hidden shadow-accent-offset">
          <Mapshot />
        </div>
      </div>
      {/* Updated to use a grid layout */}
      <div className="bg-primary p-8 z-10 grid grid-cols-2 gap-4">
        <h2 className="text-2xl font-semibold mb-4 col-span-2 font-primary">Organization Details</h2>
        {/* First Column */}
        <div className="bg-secondary p-4 rounded-lg border-2 border-accent shadow-accent-offset">
          <h3 className="text-xl font-medium text-primary mb-3 font-primary">Sites</h3>
          <SiteList 
            isCreateOpen={isCreateOpen}
            setIsCreateOpen={setIsCreateOpen}
            isUpdateOpen={isUpdateOpen}
            setIsUpdateOpen={setIsUpdateOpen}
            selectedSiteId={selectedSiteId}
            setSelectedSiteId={setSelectedSiteId}
          />
        </div>
        {/* Second Column */}
        <div className="bg-tertiary p-4 rounded-lg border-2 border-accent shadow-accent-offset">
          <h3 className="text-xl font-medium text-text-light mb-3 font-primary">Organization Info</h3>
          <p className="text-text-secondary mb-4">
            Manage your organization details, users, and permissions from this dashboard.
          </p>
        </div>
      </div>
    </div>
  );
}
